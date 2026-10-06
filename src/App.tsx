import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { askClaude } from './claude'
import { localAnswer } from './knowledge'
import MessageBody from './MessageBody'
import type { Message, Settings } from './types'

const STORAGE_KEY = 'pypal-settings'
const DEFAULT_SETTINGS: Settings = { apiKey: '', model: 'claude-sonnet-4-5' }

const SUGGESTIONS = [
  'How do list comprehensions work?',
  'How do I read a file line by line?',
  'What is the difference between a tuple and a list?',
  'How do I handle errors?',
]

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    return
  }
}

const newId = () => Math.random().toString(36).slice(2)

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [showSettings, setShowSettings] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const online = settings.apiKey.trim().length > 0

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    const question = text.trim()
    if (!question || loading) return

    const userMessage: Message = { id: newId(), role: 'user', content: question }
    const history = [...messages, userMessage]
    setMessages(history)
    setInput('')
    setLoading(true)

    let reply: string
    try {
      reply = online ? await askClaude(history, settings) : localAnswer(question)
    } catch (err) {
      reply = `Something went wrong: ${err instanceof Error ? err.message : 'unknown error'}`
    }

    setMessages((prev) => [...prev, { id: newId(), role: 'assistant', content: reply }])
    setLoading(false)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    send(input)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const updateSettings = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    saveSettings(next)
  }

  return (
    <div className="app">
      <header>
        <div className="brand">
          <img src="./favicon.svg" alt="" width={28} height={28} />
          <h1>PyPal</h1>
          <span className={online ? 'badge on' : 'badge'}>{online ? 'Claude' : 'Offline'}</span>
        </div>
        <div className="actions">
          {messages.length > 0 && (
            <button type="button" className="ghost" onClick={() => setMessages([])}>
              Clear
            </button>
          )}
          <button type="button" className="ghost" onClick={() => setShowSettings((s) => !s)}>
            Settings
          </button>
        </div>
      </header>

      {showSettings && (
        <section className="settings">
          <label>
            API key
            <input
              type="password"
              placeholder="sk-ant-..."
              value={settings.apiKey}
              onChange={(e) => updateSettings({ apiKey: e.target.value })}
            />
          </label>
          <label>
            Model
            <input value={settings.model} onChange={(e) => updateSettings({ model: e.target.value })} />
          </label>
          <p className="hint">Your key stays in this browser and is sent only to Anthropic. Leave it empty to use the built-in answers.</p>
        </section>
      )}

      <main>
        {messages.length === 0 ? (
          <div className="empty">
            <h2>Ask me anything about Python</h2>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button type="button" key={s} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`msg ${m.role}`}>
              <div className="bubble">
                <MessageBody content={m.content} />
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="msg assistant">
            <div className="bubble typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </main>

      <form className="composer" onSubmit={onSubmit}>
        <textarea
          rows={1}
          placeholder="Ask a Python question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="submit" disabled={!input.trim() || loading}>
          Send
        </button>
      </form>
    </div>
  )
}
