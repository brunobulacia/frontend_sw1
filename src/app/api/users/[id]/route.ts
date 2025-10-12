import { NextResponse } from 'next/server'
import { nestServer } from '@/lib/axios/server'
import { normalizeError } from '@/lib/axios/normalizeError'
import { extractAuthToken } from '@/lib/auth/cookies'

export const runtime = 'nodejs'

// 👇 params ahora es Promise y lo esperamos
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  const token = extractAuthToken(req)
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const forwardedFor = req.headers.get('x-forwarded-for') ?? undefined
    const userAgent = req.headers.get('user-agent') ?? undefined
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
    if (forwardedFor) headers['x-forwarded-for'] = forwardedFor
    if (userAgent) headers['user-agent'] = userAgent
    const { data, status } = await nestServer.patch(`/users/${id}`, body, {
      headers,
    })
    return NextResponse.json(data, { status })
  } catch (e: any) {
    const { status, body } = normalizeError(e)
    return NextResponse.json(body, { status })
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const token = extractAuthToken(req)
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let payload: unknown = {}
  const contentLength = req.headers.get('content-length')
  if (contentLength && Number(contentLength) > 0) {
    try {
      payload = await req.json()
    } catch {
      payload = {}
    }
  }

  try {
    const forwardedFor = req.headers.get('x-forwarded-for') ?? undefined
    const userAgent = req.headers.get('user-agent') ?? undefined
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
    if (forwardedFor) headers['x-forwarded-for'] = forwardedFor
    if (userAgent) headers['user-agent'] = userAgent
    const { data, status } = await nestServer.post(
      `/users/${id}/send-reset-link`,
      payload,
      {
        headers,
      },
    )
    return NextResponse.json(data, { status })
  } catch (e: any) {
    const { status, body } = normalizeError(e)
    return NextResponse.json(body, { status })
  }
}
