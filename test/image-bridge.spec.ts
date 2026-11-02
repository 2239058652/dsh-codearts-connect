import { afterEach, describe, expect, it, vi } from 'vitest'
import { bridgeImages, DEFAULT_IMAGE_BRIDGE_MODEL, type CodeArtsResolved } from '../src/upstream.ts'

const CREDENTIAL: CodeArtsResolved = {
  token: 'sts-token',
  accessKeyId: 'AKID',
  secretAccessKey: 'SK',
  securityToken: 'sts-token',
}

const IMAGE_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQoutAAAAABJRU5ErkJggg=='
/** 换一个 URL 避免命中上一个用例的进程内转述缓存。 */
const IMAGE_URL_B = `${IMAGE_URL}#b`
const IMAGE_URL_C = `${IMAGE_URL}#c`

function requestBody(url = IMAGE_URL): Record<string, unknown> {
  return {
    model: 'GLM-5.2',
    stream: true,
    messages: [{ role: 'user', content: [{ type: 'text', text: '看图' }, { type: 'image_url', image_url: { url } }] }],
  }
}

function captionResponse(text: string): Response {
  return new Response(JSON.stringify({
    choices: [{ message: { role: 'assistant', content: text } }],
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('图片转述', () => {
  it('把 image_url 换成文本描述，并用非流式请求调用视觉模型', async () => {
    const seen: { body?: string } = {}
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: { body?: BodyInit }) => {
      seen.body = String(init?.body ?? '')
      return captionResponse('一张黑色背景的截图')
    }))

    const result = await bridgeImages(CREDENTIAL, JSON.stringify(requestBody()), DEFAULT_IMAGE_BRIDGE_MODEL)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.images).toBe(1)
    expect(result.body).toContain('[图片内容] 一张黑色背景的截图')
    expect(result.body).not.toContain('"image_url"')
    expect(seen.body).toContain('"stream":false')
    expect(seen.body).toContain(DEFAULT_IMAGE_BRIDGE_MODEL)
    expect(seen.body).toContain(IMAGE_URL)
  })

  it('同一张图在缓存期内只转述一次', async () => {
    const fetchMock = vi.fn(async () => captionResponse('缓存里的描述'))
    vi.stubGlobal('fetch', fetchMock)

    const raw = JSON.stringify(requestBody(IMAGE_URL_B))
    await bridgeImages(CREDENTIAL, raw, DEFAULT_IMAGE_BRIDGE_MODEL)
    const second = await bridgeImages(CREDENTIAL, raw, DEFAULT_IMAGE_BRIDGE_MODEL)

    expect(second.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('没有图片时原样返回，不访问上游', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const raw = JSON.stringify({
      model: 'GLM-5.2',
      messages: [{ role: 'user', content: [{ type: 'text', text: '纯文本' }] }],
    })

    const result = await bridgeImages(CREDENTIAL, raw, DEFAULT_IMAGE_BRIDGE_MODEL)

    expect(result).toEqual({ ok: true, body: raw, images: 0 })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('转述失败时返回可读错误，不把原图硬发给纯文本模型', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('boom', { status: 500 })))

    const result = await bridgeImages(CREDENTIAL, JSON.stringify(requestBody(IMAGE_URL_C)), DEFAULT_IMAGE_BRIDGE_MODEL)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.message).toContain('图片转述失败')
  })
})