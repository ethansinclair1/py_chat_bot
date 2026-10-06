import type { Message, Settings } from './types'

const SYSTEM = `You are PyPal, a friendly Python tutor. Answer Python questions clearly and briefly. Use fenced code blocks marked python for code. If a question is not about programming, steer back to Python politely.`

interface ApiResponse {
  content?: { type: string; text?: string }[]
  error?: { message: string }
}

export async function askClaude(history: Message[], settings: Settings): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: settings.model,
      max_tokens: 1024,
      system: SYSTEM,
      messages: history.map(({ role, content }) => ({ role, content })),
    }),
  })

  const data: ApiResponse = await res.json()
  if (!res.ok) {
    throw new Error(data.error?.message ?? `Request failed (${res.status})`)
  }
  return (data.content ?? [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
}
