import { request as httpRequest } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CodeArtsAccountPool } from '../src/account-pool.ts'
import { createCodeArtsShim, type CodeArtsShim } from '../src/shim.ts'

/**
 * IAM token 被上游提前作废时的兜底：强制续期一次，然后用同一个账号重试。
 * 不能换号 —— 换号也会撞同一个问题，还会白扣另一个号的积分。
 */

const TOKEN_OLD = 'iam-old'
const TOKEN_NEW = 'iam-new'
const IAM_FRAME =
  'data: {"error_code":"invalid_iam_token","error_msg":"invalid_iam_token"}\n\n'
const OK_CHUNKS = [
  'data: {"choices":[{"index":0,"delta":{"content":"续期成功"},"finish_reason":null}]}\n\n',
  'data: [DONE]\n\n',
]

let shim: CodeArtsShim | undefined
let port = 0
let bearer = ''
let forceRefreshCalls = 0
let seenTokens: string[] = []

function sseResponse(chunks: readonly string[]): Response {
  const encoder = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
  return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } })
}

function credential(token: string): { token: string; accessKeyId: string; secretAccessKey: string; securityToken: string } {
  return { token, accessKeyId: 'AK', secretAccessKey: 'SK', securityToken: token }
}

function post(body: string): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest({
      host: '127.0.0.1',
      port,
      method: 'POST',
      path: '/v1/chat/completions',
      headers: {
        host: `127.0.0.1:${port}`,
        authorization: `Bearer ${bearer}`,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      },
    }, res => {
      const parts: Buffer[] = []
      res.on('data', (chunk: Buffer) => parts.push(chunk))
      res.on('end', () => resolve({ status: res.statusCode ?? 0, text: Buffer.concat(parts).toString('utf8') }))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function start(refreshSucceeds: boolean): Promise<void> {
  forceRefreshCalls = 0
  seenTokens = []
  vi.stubGlobal('fetch', vi.fn(async (_url: unknown, init?: { headers?: unknown }) => {
    const token = ((init?.headers ?? {}) as Record<string, string>)['x-auth-token'] ?? ''
    seenTokens.push(token)
    return token === TOKEN_OLD ? sseResponse([IAM_FRAME]) : sseResponse(OK_CHUNKS)
  }))
  shim = createCodeArtsShim({
    store: {
      ids: async () => ['A'],
      resolve: async () => credential(TOKEN_OLD),
      forceRefresh: async (_id: string, seenToken?: string) => {
        forceRefreshCalls += 1
        expect(seenToken).toBe(TOKEN_OLD)
        return refreshSucceeds ? credential(TOKEN_NEW) : undefined
      },
    } as never,
    catalog: { current: () => [] } as never,
    pool: new CodeArtsAccountPool([]),
  })
  await shim.ready
  port = Number(new URL(shim.baseUrl()).port)
  bearer = shim.token()
}

afterEach(async () => {
  vi.unstubAllGlobals()
  await shim?.close()
  shim = undefined
})

const BODY = JSON.stringify({
  model: 'GLM-5.2',
  stream: true,
  messages: [{ role: 'user', content: 'hi' }],
})

describe('IAM 强制续期', () => {
  it('首帧报 invalid_iam_token 时续期一次并同号重试', async () => {
    await start(true)
    const res = await post(BODY)

    expect(res.status).toBe(200)
    expect(res.text).toContain('续期成功')
    expect(forceRefreshCalls).toBe(1)
    expect(seenTokens).toEqual([TOKEN_OLD, TOKEN_NEW])
  })

  it('续期失败时返回可读的 401，不无限重试', async () => {
    await start(false)
    const res = await post(BODY)

    expect(res.status).toBe(401)
    expect(res.text).toContain('重新登录')
    expect(forceRefreshCalls).toBe(1)
    expect(seenTokens).toEqual([TOKEN_OLD])
  })
})