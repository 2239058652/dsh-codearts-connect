/**
 * 对话底部的「模型 + 积分」条，以及点开后的积分弹层。
 *
 * 这一条挂在 `conversation.composer.dock` 槽位上（与宿主 session-stats strip 同位）。
 * 只在当前 provider 是 codearts 时才渲染，别的 provider 下完全不出现，不抢别人的行。
 *
 * 第一段是 `Provider CodeArts · <模型名>`，模型名直接用目录里的 `name`
 * （`catalog.ts` 的 `modelDisplayName` 已经把倍率写进去了，如
 * `DeepSeek-V4.1-Flash-1017 · x0.18`），所以这一行自带倍率、不必另算。
 * 这段是**我们自己的**身份行：邻居插件（如 dsh-codebuddy-cli）对任何 provider
 * 都会画一行 `Provider <id> · Model <id>`，在 codearts 下那行只有模型 id、没有
 * 倍率；两边都开就会重复，所以优先我们这条，邻居那条应在它自己的设置里关掉。
 *
 * 那一行是个按钮：点开就是逐号明细（多账号下聚合数字本身没意义，得能看出是哪个号）。
 * 显隐由设置卡片「显示」页那两个开关管着，开关值随 `/status` 一起下发 —— 底部条本来
 * 就在轮询它，不必为两个布尔开一条新链路。代价是关掉开关最多要等一个轮询周期（60 秒）
 * 才看得见效果，这个延迟在设置卡片上写明了。
 *
 * 积分数据走插件自己的 `/api/codearts/status`（带 TTL 缓存，见 src/credits.ts），
 * 不会因为这条 dock 让上游多挨一次请求；弹层上那个「刷新积分」是唯一绕缓存的出口。
 */

import { useCallback, useEffect, useRef, useState, type ReactElement, type MouseEvent, type ReactNode, type ReactPortal } from 'react'
import { Button, Checkbox, StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CodeArtsDockFlags, CodeArtsWebStatus } from '../web-status.ts'
import { DOCK_SEGMENT_SEPARATOR } from './dock-line.ts'
import {
  ensureSuppressStyle,
  markForeignDockEntries,
  releaseDockEntries,
  type DockNode,
} from './dock-suppress.ts'

/** 与 src/adapter.ts 的 CODEARTS_PROVIDER 对齐 —— client 不能 import host 模块。 */
const CODEARTS_PROVIDER = 'codearts'
/**
 * 宿主的 composer 在 0.2.2 起是「docked」容器，slot 文档明确要求 fixed 浮层
 * portal 到 document.body；直接挂在 slot 里会被祖先的裁剪/containment 吃掉。
 * 客户端 bundle 是 CJS，`require('react-dom')` 由宿主模块加载器提供。
 */
const createPortal = (require('react-dom') as {
  createPortal: (children: ReactNode, container: Element | DocumentFragment) => ReactPortal
}).createPortal
const STATUS_PATH = '/api/codearts/status'
const QUEUE_PATH = '/api/codearts/queue'
/** POST { id } 手动指定优先账号；id 为空 = 自动轮转。 */
const PREFERENCE_PATH = '/api/codearts/account-preference'
/** POST { enabled } 图片转述开关。 */
const IMAGE_BRIDGE_PATH = '/api/codearts/image-bridge'
/** 轮询间隔：与缓存 TTL（60s）对齐，再短也只是反复命中缓存。 */
const REFRESH_INTERVAL_MS = 60_000
/** 排队位置变得快：官方客户端也是 5 秒一次；这是本机路由，打不疼上游。 */
const QUEUE_INTERVAL_MS = 5_000
/** 弹层宽度固定，好算它会不会顶出屏幕右边。 */
const PANEL_WIDTH = 360
/** 弹层与那一行之间的缝隙。 */
const PANEL_GAP = 8
/** 那一行在输入框下方，往上开才够空间；给弹层留的最小高度，不够就翻到下面。 */
const PANEL_MIN_ABOVE = 260

interface QueueEntry {
  model: string
  position: number
  length: number
}

interface ModelSelectionEntry {
  provider?: string
  model?: string
}
interface ModelSelection {
  next?: ModelSelectionEntry
  lastUsed?: ModelSelectionEntry
}

/** 弹层里的一行账号。`remain` 为 null 表示这个号这次没拿到数（原因看 error）。 */
interface CreditRow {
  id: string
  name: string
  remain: number | null
  expiring: number
  /** 这份快照的抓取时刻（上游返回时间，不是本机渲染时间）。 */
  fetchedAt?: number
  error?: string
}

/** 弹层挂在按钮上方还是下方 —— 上面放不下（会话滚到底、窗口很矮）就得往下翻。 */
interface Anchor {
  left: number
  top: number
  above: boolean
}

/**
 * 压掉同一行里**别的插件**条目时用的标记属性。
 *
 * 我们只能控制自己，压不了别人的注册 —— 但 `conversation.composer.dock` 是 list
 * 槽位，宿主把每条注册平铺成 `[data-composer-dock]` 的**直接子节点**，所以我们这条
 * 的 effect 能拿到兄弟节点。选中 codearts 模型期间给它们打上这个属性、由我们注入的
 * 一条 CSS 隐藏；切走或卸载时逐个摘掉，不留痕迹。
 *
 * 具体规则与「哪些不能碰」都在 `dock-suppress.ts` 里（那边能脱离 DOM 单测）。
 */


export interface CodeArtsCreditDockProps {
  /** 宿主注入的 projection 读取面；省略时 dock 不显示。 */
  useProjection?: (key: string) => unknown
  /** locale 翻译函数。 */
  t: (key: string, params?: Record<string, unknown>) => string
}

function readSelection(useProjection: ((key: string) => unknown) | undefined): ModelSelection | undefined {
  if (useProjection === undefined) return undefined
  try {
    return useProjection('modelSelection') as ModelSelection | undefined
  } catch {
    return undefined
  }
}

function currentOf(selection: ModelSelection | undefined): ModelSelectionEntry | undefined {
  return selection?.next ?? selection?.lastUsed
}

function isCodeArts(selection: ModelSelection | undefined): boolean {
  return currentOf(selection)?.provider === CODEARTS_PROVIDER
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(Math.round(value))
}

function formatClock(ts: number | undefined): string {
  if (ts === undefined || !Number.isFinite(ts)) return ''
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

/** 账号名与设置卡片同一套取法：备注 > 用户名 > id。 */
function accountName(account: { id: string; label?: string; userName?: string }): string {
  return account.label?.trim() || account.userName?.trim() || account.id
}

/**
 * 逐号明细。
 *
 * 老后端只有聚合的一份 `credits`，那时单账号就退回它 —— 别因为后端没升级就把
 * 弹层弹成一句「没有数据」。
 */
function rowsOf(data: CodeArtsWebStatus): CreditRow[] {
  const byId = new Map((data.creditsByAccount ?? []).map(entry => [entry.id, entry]))
  return (data.accounts ?? []).map(account => {
    const entry = byId.get(account.id)
      ?? (byId.size === 0 && (data.accounts?.length ?? 0) === 1
        ? { id: account.id, credits: data.credits, creditsError: data.creditsError }
        : undefined)
    const snapshot = entry?.credits
    return {
      id: account.id,
      name: accountName(account),
      remain: snapshot?.credits.total.remain ?? null,
      expiring: snapshot?.credits.total.expiring ?? 0,
      ...snapshot?.credits.fetchedAt === undefined ? {} : { fetchedAt: snapshot.credits.fetchedAt },
      ...entry?.creditsError === undefined ? {} : { error: entry.creditsError },
    }
  })
}

/** 把弹层钉在按钮边上：优先往上开（那一行本来就在输入框下面），放不下就翻到下面。 */
function anchorOf(rect: DOMRect): Anchor {
  const above = rect.top > PANEL_MIN_ABOVE
  const width = Math.min(PANEL_WIDTH, window.innerWidth - 16)
  return {
    left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
    top: above ? rect.top - PANEL_GAP : rect.bottom + PANEL_GAP,
    above,
  }
}

export function CodeArtsCreditDock({ useProjection, t }: CodeArtsCreditDockProps): ReactElement | null {
  const selection = readSelection(useProjection)
  const active = isCodeArts(selection)
  const [remain, setRemain] = useState<number | null>(null)
  const [total, setTotal] = useState<number>(0)
  const [rows, setRows] = useState<CreditRow[]>([])
  const [flags, setFlags] = useState<CodeArtsDockFlags>({ credits: true, queue: true })
  /** 最近一次成功请求实际用的账号；由 /status 带回，用来解释是否发生了回退。 */
  const [lastAccount, setLastAccount] = useState<CodeArtsWebStatus['lastAccount']>(undefined)
  /** 手动指定的优先账号；空串 = 自动轮转。弹层里据此标出「当前使用」。 */
  const [preferredId, setPreferredId] = useState('')
  const [queued, setQueued] = useState<QueueEntry | null>(null)
  const [anchor, setAnchor] = useState<Anchor | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  /** 正在切换的账号 id；'__auto__' 表示切回自动轮转。 */
  const [switching, setSwitching] = useState<string | null>(null)
  const [switchError, setSwitchError] = useState<string | null>(null)
  /** 图片转述开关（由 /status 下发）。 */
  const [imageBridge, setImageBridge] = useState<CodeArtsWebStatus['imageBridge']>(undefined)
  const [bridgeSaving, setBridgeSaving] = useState(false)
  const [bridgeError, setBridgeError] = useState<string | null>(null)
  const mounted = useRef(true)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  /** 这一行的根节点 —— 它的 parentElement 就是宿主那条共享 flex 行。 */
  const rootRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const loadStatus = useCallback(async (force: boolean): Promise<void> => {
    try {
      const res = await fetch(force ? `${STATUS_PATH}?force=1` : STATUS_PATH, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      })
      if (!res.ok) return
      const data = (await res.json().catch(() => undefined)) as CodeArtsWebStatus | undefined
      if (data === undefined || !mounted.current) return
      setFlags(data.dock ?? { credits: true, queue: true })
      setRows(rowsOf(data))
      setPreferredId(data.preferredAccountId?.trim() ?? '')
      setLastAccount(data.lastAccount)
      setImageBridge(data.imageBridge)
      // 多账号时把各号余额加在一起：底部条只表达「这台机器上还能用多少」。
      const snapshots = (data.creditsByAccount ?? [])
        .map(entry => entry.credits)
        .filter((value): value is NonNullable<typeof value> => value !== undefined)
      const pool = snapshots.length > 0
        ? snapshots
        : data.credits === undefined ? [] : [data.credits]
      if (pool.length === 0) {
        setRemain(null)
        return
      }
      setRemain(Math.round(pool.reduce((sum, item) => sum + item.credits.total.remain, 0)))
      setTotal(Math.round(pool.reduce((sum, item) => sum + item.credits.total.total, 0)))
    } catch {
      // 积分是锦上添花，拉不到就别显示 —— 别在对话底部弹错误打扰用户。
    }
  }, [])

  useEffect(() => {
    if (!active) {
      setRemain(null)
      setRows([])
      setPreferredId('')
      setLastAccount(undefined)
      setImageBridge(undefined)
      setAnchor(null)
      return
    }
    let timer: number | undefined
    void loadStatus(false)
    timer = window.setInterval(() => void loadStatus(false), REFRESH_INTERVAL_MS)
    return () => {
      if (timer !== undefined) window.clearInterval(timer)
    }
  }, [active, loadStatus])

  // 排队只在等上游开流时有值；没有排队就保持安静，别在底部常驻一个「排队 0」。
  useEffect(() => {
    if (!active) {
      setQueued(null)
      return
    }
    let timer: number | undefined
    const refresh = async (): Promise<void> => {
      try {
        const res = await fetch(QUEUE_PATH, {
          headers: { Accept: 'application/json' },
          credentials: 'same-origin',
        })
        if (!res.ok) return
        const data = (await res.json().catch(() => undefined)) as { queue?: QueueEntry[] } | undefined
        if (mounted.current) setQueued(data?.queue?.[0] ?? null)
      } catch {
        // 排队信息是提示性的，拉不到就当没排队。
      }
    }
    void refresh()
    timer = window.setInterval(refresh, QUEUE_INTERVAL_MS)
    return () => {
      if (timer !== undefined) window.clearInterval(timer)
    }
  }, [active])

  const close = useCallback(() => setAnchor(null), [])

  // 弹层是 fixed 定位的，页面一滚、窗口一缩就会和那一行脱节 —— 直接关掉比跟着算便宜。
  useEffect(() => {
    if (anchor === null) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target as Node | null
      if (target === null) return
      if (panelRef.current?.contains(target) === true || triggerRef.current?.contains(target) === true) return
      close()
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [anchor, close])

  // 选中我们的模型时，把这一行里别人的条目压掉。
  //
  // 别人注册什么我们管不了，但宿主把每条注册平铺成 `[data-composer-dock]` 的直接子节点，
  // 所以「隐藏兄弟节点」是我们在自己这一条里能做到的事：给它们打标记 + 一条我们注入的
  // CSS。切走（active=false）或卸载时逐个摘掉标记，绝不留下别人的行永久消失。
  useEffect(() => {
    if (!active) return
    const self = rootRef.current
    // 宿主那行是 `<div data-composer-dock>`，里面先放一个 display:contents 的
    // `[data-slot="conversation.composer.dock"]` 锚点，所有插件的条目平铺在锚点下。
    const slot = self?.closest('[data-slot="conversation.composer.dock"]') ?? null
    if (self === null || slot === null) return
    const node = slot as unknown as DockNode
    const me = self as unknown as DockNode
    const marked = new Set<DockNode>()
    const sweep = (): void => {
      for (const found of markForeignDockEntries(node, me)) marked.add(found)
    }
    ensureSuppressStyle()
    sweep()
    // 邻居可能比我们晚挂载（或整条替换），盯着子节点增删再扫一遍。
    const observer = new MutationObserver(sweep)
    observer.observe(slot, { childList: true })
    return () => {
      observer.disconnect()
      releaseDockEntries(marked)
      marked.clear()
    }
  }, [active])

  if (!active) return null

  const showCredits = flags.credits && remain !== null
  const showQueue = flags.queue && queued !== null
  /** 指定账号还在已存列表里才算数（设置里可能残留已删除的 id）。 */
  const preferredRow = preferredId === '' ? undefined : rows.find(row => row.id === preferredId)
  const lastRow = lastAccount === undefined ? undefined : rows.find(row => row.id === lastAccount.accountId)
  const lastName = lastRow?.name ?? lastAccount?.accountId
  // 开关都关了（或没有数据）就整条不渲染，别再留一个空节点占位。
  if (!showCredits && !showQueue) return null

  // 底栏只留一个小图标：积分数字常驻会把这条**所有插件共用**的 composer dock 行
  // 撑宽，把宿主自己的金额/token 统计挤掉。模型名与倍率在模型选择器里已经看得到，
  // 弹层只保留积分明细与当前账号，不再重复一遍。
  //
  // 只有图标是可点击的；排队段（事件性文案）仍以纯文本跟在后面，只在等开流时出现。
  const queueTitle = queued === null
    ? undefined
    : t('queueDockTitle', { model: queued.model, position: queued.position, length: queued.length })
  const creditsTitle = showCredits
    ? t('creditsDockTitle', { remain: remain ?? 0, total })
    : undefined
  const fetchedAt = rows.reduce((latest, row) => Math.max(latest, row.fetchedAt ?? 0), 0)
  const lastUpdated = fetchedAt > 0 ? formatClock(fetchedAt) : ''

  const toggle = (event: MouseEvent<HTMLButtonElement>): void => {
    if (anchor !== null) {
      close()
      return
    }
    setAnchor(anchorOf(event.currentTarget.getBoundingClientRect()))
  }

  const forceRefresh = async (): Promise<void> => {
    setRefreshing(true)
    try {
      await loadStatus(true)
    } finally {
      setRefreshing(false)
    }
  }

  /** 弹层里点账号行直接切换优先账号；null = 恢复自动轮转。 */
  const chooseAccount = async (id: string | null): Promise<void> => {
    if (switching !== null) return
    setSwitching(id ?? '__auto__')
    setSwitchError(null)
    try {
      const res = await fetch(PREFERENCE_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: unknown; preferredAccountId?: unknown }
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : `HTTP ${res.status}`)
      }
      setPreferredId(typeof data.preferredAccountId === 'string' ? data.preferredAccountId : id ?? '')
    } catch (error: unknown) {
      setSwitchError(error instanceof Error ? error.message : String(error))
    } finally {
      setSwitching(null)
    }
  }

  /** 打开/关闭图片转述：服务端会同步改模型能力，DSH 随后允许或禁止贴图。 */
  const toggleImageBridge = async (enabled: boolean): Promise<void> => {
    if (imageBridge === undefined || !imageBridge.writable || bridgeSaving) return
    setBridgeSaving(true)
    setBridgeError(null)
    try {
      const res = await fetch(IMAGE_BRIDGE_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ enabled }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: unknown
        imageBridge?: CodeArtsWebStatus['imageBridge']
      }
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : `HTTP ${res.status}`)
      }
      if (data.imageBridge !== undefined) setImageBridge(data.imageBridge)
      else setImageBridge({ ...imageBridge, enabled })
    } catch (error: unknown) {
      setBridgeError(error instanceof Error ? error.message : String(error))
    } finally {
      setBridgeSaving(false)
    }
  }

  return (
    <div
      ref={rootRef}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        // 段间距交给 ` · ` 分隔符，不给 flex gap —— 有积分时这一行是
        // 「按钮 + 分隔符 + 纯文本」三个节点，gap 会在分隔符两侧各加一份空隙。
        gap: 0,
        color: 'var(--dsw-alias-label-tertiary)',
        fontSize: 'var(--dsh-content-font-size-secondary, 13px)',
        lineHeight: '18px',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        // 这一行是所有插件共用的 flex 行（[data-composer-dock]），别人写 width:100%
        // 就会来抢我们的份。max-content 是硬下限，flex-shrink:0 是双保险。
        flex: '0 0 auto',
        minWidth: 'max-content',
      }}
      title={[creditsTitle, queueTitle].filter(Boolean).join(DOCK_SEGMENT_SEPARATOR)}
    >
      {/*
        整条底栏只剩一个图标：数字与被挤掉的模型信息都收进弹层，把 composer dock
        的横向空间还给宿主的金额/token 统计。
        输入框那一坨是个表单，button 不写 type 默认 submit —— 点一下会把草稿当消息发出去。
      */}
      {showCredits && (
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={anchor !== null}
          aria-label={t('creditsDockPanelTitle')}
          title={[creditsTitle].filter(Boolean).join(DOCK_SEGMENT_SEPARATOR)}
          onClick={toggle}
          style={{
            all: 'unset',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
            boxSizing: 'border-box',
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: '0.5px solid var(--dsw-alias-border-l2)',
            background: 'var(--dsw-alias-bg-layer-3)',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <circle cx="6.2" cy="8" r="4.3" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="9.8" cy="8" r="4.3" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.45" />
          </svg>
        </button>
      )}
      {showQueue && (
        <>
          {showCredits && <span aria-hidden="true">{DOCK_SEGMENT_SEPARATOR}</span>}
          <span>{t('queueDock', { position: queued.position })}</span>
        </>
      )}
      {anchor !== null && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label={t('creditsDockPanelTitle')}
          style={{
            // fixed + createPortal 到 document.body：0.2.2 的 composer 是 docked 容器，
            // slot 文档明确要求 fixed 浮层 portal 出去，否则会被祖先的
            // containment/overflow 裁掉（只改 fixed 不够）。
            position: 'fixed',
            left: anchor.left,
            top: anchor.top,
            transform: anchor.above ? 'translateY(-100%)' : undefined,
            width: PANEL_WIDTH,
            maxWidth: 'calc(100vw - 16px)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: 12,
            boxSizing: 'border-box',
            borderRadius: 'var(--dsw-radius-lg, 10px)',
            border: '0.5px solid var(--dsw-alias-settings-card-stroke, rgba(127, 127, 127, 0.28))',
            background: 'var(--dsw-alias-settings-card-fill, rgba(32, 32, 32, 0.96))',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.28)',
            color: 'var(--dsw-alias-label-primary)',
            fontSize: 'var(--dsh-content-font-size-secondary, 13px)',
            lineHeight: '18px',
            whiteSpace: 'normal',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontWeight: 600 }}>{t('creditsDockPanelTitle')}</span>
            <Button variant="outline" size="sm" disabled={refreshing} onClick={() => void forceRefresh()}>
              {refreshing ? t('creditsDockRefreshing') : t('creditsDockRefresh')}
            </Button>
          </div>

          {/* 弹层只留积分与当前账号；模型名/倍率在模型选择器里已经有了。 */}
          <div style={{ color: 'var(--dsw-alias-label-secondary)', fontSize: 12 }}>
            {preferredRow !== undefined
              ? t('creditsDockCurrentAccount', { name: preferredRow.name })
              : t('creditsDockCurrentAuto')}
          </div>

          {lastAccount !== undefined && (
            <div
              style={{ color: 'var(--dsw-alias-label-tertiary)', fontSize: 12 }}
              title={lastAccount.reason}
            >
              {t('creditsDockLastAccount', { name: lastName ?? lastAccount.accountId })}
              {lastAccount.fallback ? ` · ${t('creditsDockFallback')}` : ''}
            </div>
          )}

          {imageBridge !== undefined && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Checkbox
                checked={imageBridge.enabled}
                disabled={!imageBridge.writable || bridgeSaving}
                onChange={on => void toggleImageBridge(on)}
                label={t('imageBridgeToggle', { model: imageBridge.model })}
              />
              {!imageBridge.writable && (
                <span style={{ color: 'var(--dsw-alias-label-tertiary)', fontSize: 11 }}>
                  {t('imageBridgeNotWritable')}
                </span>
              )}
              {bridgeError !== null && (
                <span style={{ color: 'var(--dsw-alias-state-error-primary)', fontSize: 11 }}>
                  {t('imageBridgeFailed', { message: bridgeError })}
                </span>
              )}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: '4px 12px',
              alignItems: 'center',
              borderTop: '0.5px solid var(--dsw-alias-border-l2, rgba(127, 127, 127, 0.22))',
              paddingTop: 8,
              color: 'var(--dsw-alias-label-tertiary)',
            }}
          >
            <span>{t('creditsDockColAccount')}</span>
            <span style={{ justifySelf: 'end' }}>{t('creditsDockColBalance')}</span>
            {rows.length === 0 && (
              <span style={{ gridColumn: '1 / -1' }}>{t('creditsDockEmpty')}</span>
            )}
            {rows.map(row => (
              <button
                key={row.id}
                type="button"
                disabled={switching !== null}
                title={t('creditsDockSwitchHint')}
                onClick={() => void chooseAccount(row.id)}
                style={{
                  gridColumn: '1 / -1',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  alignItems: 'center',
                  gap: '4px 12px',
                  width: '100%',
                  margin: 0,
                  padding: '2px 0',
                  border: 0,
                  borderRadius: 4,
                  background: preferredId === row.id ? 'var(--dsw-alias-bg-layer-3)' : 'transparent',
                  color: 'inherit',
                  font: 'inherit',
                  textAlign: 'left',
                  cursor: switching === null ? 'pointer' : 'wait',
                  opacity: switching !== null && switching !== row.id ? 0.6 : 1,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <StateDot state={row.remain === null ? 'warning' : 'done'} />
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--dsw-alias-label-primary)',
                    }}
                    title={row.error === undefined ? row.name : row.error}
                  >
                    {row.name}
                  </span>
                  {preferredId === row.id && (
                    <span
                      style={{
                        flex: 'none',
                        padding: '0 4px',
                        borderRadius: 4,
                        background: 'var(--dsw-alias-bg-layer-3)',
                        color: 'var(--dsw-alias-label-secondary)',
                        fontSize: 11,
                        lineHeight: '16px',
                      }}
                    >
                      {t('accountInUse')}
                    </span>
                  )}
                </span>
                <span style={{ justifySelf: 'end', fontVariantNumeric: 'tabular-nums' }}>
                  {row.remain === null ? '—' : formatNumber(row.remain)}
                </span>
              </button>
            ))}
          </div>

          {rows.length > 1 && (
            <p style={{ margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: 12 }}>
              {t('creditsDockSwitchHint')}
            </p>
          )}

          {preferredId !== '' && (
            <button
              type="button"
              disabled={switching !== null}
              onClick={() => void chooseAccount(null)}
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                margin: 0,
                padding: 0,
                border: 0,
                background: 'none',
                color: 'var(--dsw-alias-brand-text)',
                font: 'inherit',
                fontSize: 12,
                cursor: switching === null ? 'pointer' : 'wait',
              }}
            >
              {t('creditsDockAuto')}
            </button>
          )}

          {switchError !== null && (
            <p style={{ margin: 0, color: 'var(--dsw-alias-state-error-primary)', fontSize: 12 }}>
              {t('creditsDockSwitchFailed', { message: switchError })}
            </p>
          )}

          {rows
            .filter(row => row.expiring > 0)
            .map(row => (
              <p
                key={`${row.id}-expiring`}
                style={{
                  margin: 0,
                  color: 'var(--dsw-alias-state-warn-label, var(--dsw-alias-label-secondary))',
                }}
              >
                {t('creditsDockExpiring', {
                  account: row.name,
                  expiring: formatNumber(row.expiring),
                })}
              </p>
            ))}

          {lastUpdated !== '' && (
            <span style={{ color: 'var(--dsw-alias-label-tertiary)' }}>
              {t('creditsDockUpdated', { time: lastUpdated })}
            </span>
          )}
        </div>,
        document.body,
      )}
    </div>
  )
}
