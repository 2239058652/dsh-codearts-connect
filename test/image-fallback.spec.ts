import { request as httpRequest } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CodeArtsAccountPool } from '../src/account-pool.ts'
import { setImageBridgeEnabled } from '../src/catalog.ts'
import { createCodeArtsShim, type CodeArtsShim } from '../src/shim.ts'

/**
 * 「原生优先、失败再转述」的行为：
 *  - 模型能收图时，原图直接成功，不产生 VL 请求；
 *  - 模型不收图时，首帧被拒后转述重发一次；
 *  - 同一模型 10 分钟内不再重复试原生，窗口过后再试。
 */

const TOKEN = 'token-a'
const BRIDGE_MODEL = 'Qwen3-VL-235B'
const NOT_MULTIMODAL_FRAME =
  'data: {"error_code":"InferHub.001001020.406","error_msg":"The request model is not multimodal"}\n\n'
const OK_CHUNKS = [
  'data: {"choices":[{"index":0,"delta":{"content":"收到图片描述"},"finish_reason":null}]}\n\n',
  'data: [DONE]\n\n',
]

let shim: CodeArtsShim | undefined
let port = 0
let bearer = ''
let pool: CodeArtsAccountPool
let modelId = ''
let imageSeq = 0

function nextModelId(): string {
  modelId = `GLM-5.2-fallback-test-${++imageSeq}`
  return modelId
}

function imageUrl(): string {
  return `data:image/png;base64,fallback-${imageSeq}`
}

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

interface SeenCall {
  model: string
  hasImage: boolean
  stream: boolean
  body: string
}

function stubUpstream(nativeAcceptsImage: boolean): { calls: SeenCall[] } {
  const calls: SeenCall[] = []
  vi.stubGlobal('fetch', vi.fn(async (_input: unknown, init?: { body?: BodyInit }) => {
    const body = String(init?.body ?? '')
    const parsed = JSON.parse(body) as { model?: string; stream?: boolean }
    const model = parsed.model ?? ''
    const hasImage = body.includes('"image_url"')
    calls.push({ model, hasImage, stream: parsed.stream === true, body })

    if (model === BRIDGE_MODEL) {
      return new Response(JSON.stringify({
        choices: [{ message: { role: 'assistant', content: '一张测试图片' } }],
      }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    if (hasImage && !nativeAcceptsImage) {
      return sseResponse([NOT_MULTIMODAL_FRAME])
    }
    return sseResponse(OK_CHUNKS)
  }))
  return { calls }
}

function imageRequestBody(model: string, url: string): string {
  return JSON.stringify({
    model,
    stream: true,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: '看图' },
        { type: 'image_url', image_url: { url } },
      ],
    }],
  })
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

async function start(nativeAcceptsImage: boolean): Promise<SeenCall[]> {
  setImageBridgeEnabled(true)
  const upstream = stubUpstream(nativeAcceptsImage)
  pool = new CodeArtsAccountPool([])
  const id = nextModelId()
  shim = createCodeArtsShim({
    store: {
      ids: async () => ['A'],
      resolve: async () => ({
        token: TOKEN,
        accessKeyId: 'AK',
        secretAccessKey: 'SK',
        securityToken: 'sts',
      }),
    } as never,
    catalog: {
      current: () => [{
        id,
        name: id,
        contextWindow: 128_000,
        maxTokens: 8_000,
        supportsImages: true,
        imageBridge: true,
      }],
    } as never,
    pool,
  })
  await shim.ready
  port = Number(new URL(shim.baseUrl()).port)
  bearer = shim.token()
  return upstream.calls
}

afterEach(async () => {
  setImageBridgeEnabled(false)
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  await shim?.close()
  shim = undefined
})

describe('图片原生优先 / 转述回退', () => {
  it('模型能收图时直接走原图，不调用视觉模型', async () => {
    const calls = await start(true)
    const res = await post(imageRequestBody(modelId, imageUrl()))

    expect(res.status).toBe(200)
    expect(res.text).toContain('收到图片描述')
    expect(calls).toHaveLength(1)
    expect(calls[0]).toMatchObject({ model: modelId, hasImage: true, stream: true })
  })

  it('首帧被判 not multimodal 时转述后重发，响应正常返回', async () => {
    const calls = await start(false)
    const res = await post(imageRequestBody(modelId, imageUrl()))

    expect(res.status).toBe(200)
    expect(res.text).toContain('收到图片描述')
    expect(calls).toHaveLength(3)
    // 第一次按原图发；第二次是 VL 转述；第三次是替换成文本后的重发。
    expect(calls[0]).toMatchObject({ model: modelId, hasImage: true, stream: true })
    expect(calls[1]).toMatchObject({ model: BRIDGE_MODEL, stream: false })
    expect(calls[2]).toMatchObject({ model: modelId, hasImage: false, stream: true })
    expect(calls[2]?.body).toContain('[图片内容] 一张测试图片')
    expect(calls[1]?.body).toContain('"stream":false')
  })

  it('10 分钟内同一模型不再重复试原生，窗口过后再试', async () => {
    const calls = await start(false)
    const firstNow = Date.now()
    const now = vi.spyOn(Date, 'now').mockReturnValue(firstNow)
    await post(imageRequestBody(modelId, imageUrl()))
    expect(calls.some(call => call.model === modelId && call.hasImage)).toBe(true)

    calls.length = 0
    await post(imageRequestBody(modelId, imageUrl()))
    // 负缓存命中：直接转述（命中转述缓存时连 VL 请求都省掉），然后重发文本。
    expect(calls.some(call => call.model === modelId && call.hasImage)).toBe(false)
    expect(calls.at(-1)).toMatchObject({ model: modelId, hasImage: false })

    calls.length = 0
    now.mockReturnValue(firstNow + 11 * 60 * 1000)
    await post(imageRequestBody(modelId, imageUrl()))
    // 窗口过期：重新按原图试一次，再回退转述。
    expect(calls.some(call => call.model === modelId && call.hasImage)).toBe(true)
    expect(calls.at(-1)).toMatchObject({ model: modelId, hasImage: false })
  })
})