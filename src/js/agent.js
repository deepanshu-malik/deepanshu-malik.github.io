/*
 * Agent workspace — drawer UI over the real RAG backend.
 * Shows a visible tool-call trace per query, synced to the
 * actual SSE lifecycle (stage splits are estimated client-side
 * until the backend emits stage events).
 */

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://portfolio-backend-deepanshu-malik.koyeb.app/api'

const TRACE_STEPS = [
  'classify_intent(query)',
  'hybrid_retrieve(k=12)',
  'rerank(top=4)',
  'stream_response()',
]

/* minimal markdown: escape first, then transform */
function md(text) {
  let s = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const codeBlocks = []
  s = s.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    codeBlocks.push(`<pre><code>${code}</code></pre>`)
    return ' \u00a7CB' + (codeBlocks.length - 1) + '\u00a7 '
  })

  s = s
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

  // lists
  s = s.replace(/(^|\n)((?:[-*] .+(?:\n|$))+)/g, (_, pre, block) => {
    const items = block
      .trim()
      .split('\n')
      .map((l) => `<li>${l.replace(/^[-*] /, '')}</li>`)
      .join('')
    return `${pre}<ul>${items}</ul>`
  })

  // paragraphs
  s = s
    .split(/\n{2,}/)
    .map((chunk) =>
      /^<(h2|h3|ul|pre)/.test(chunk.trim())
        ? chunk
        : `<p>${chunk.trim().replace(/\n/g, '<br>')}</p>`
    )
    .join('')

  return s.replace(/ \u00a7CB(\d+)\u00a7 /g, (_, i) => codeBlocks[+i])
}

export function initAgent() {
  const drawer = document.getElementById('agent-drawer')
  const log = document.getElementById('agent-log')
  const form = document.getElementById('agent-form')
  const input = document.getElementById('agent-input')
  const dot = document.getElementById('agent-dot')
  const status = document.getElementById('agent-status')
  const defaultStatus = status.textContent

  const sessionId = `s_${Date.now()}`
  let busy = false
  let lastFocus = null

  function open() {
    lastFocus = document.activeElement
    drawer.classList.add('is-open')
    input.focus()
  }
  function close() {
    drawer.classList.remove('is-open')
    if (lastFocus) lastFocus.focus()
  }
  document.querySelectorAll('[data-open-agent]').forEach((b) => b.addEventListener('click', open))
  document.getElementById('agent-close').addEventListener('click', close)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) close()
  })
  window.__openAgent = open

  const scroll = () => (log.scrollTop = log.scrollHeight)

  function addUser(text) {
    const div = document.createElement('div')
    div.className = 'msg msg--user'
    div.textContent = text
    log.appendChild(div)
    scroll()
  }

  function addTrace() {
    const wrap = document.createElement('div')
    wrap.className = 'trace'
    const rows = TRACE_STEPS.map((name) => {
      const row = document.createElement('div')
      row.className = 'trace-step'
      row.innerHTML = `<span class="t-state">·</span><span class="t-name"></span><span class="t-ms"></span>`
      row.querySelector('.t-name').textContent = name
      wrap.appendChild(row)
      return row
    })
    log.appendChild(wrap)
    scroll()
    return {
      run(i) {
        rows[i].classList.add('is-running')
        rows[i].querySelector('.t-state').textContent = '◆'
      },
      done(i, ms) {
        rows[i].classList.remove('is-running')
        rows[i].classList.add('is-done')
        rows[i].querySelector('.t-state').textContent = '✓'
        if (ms != null) rows[i].querySelector('.t-ms').textContent = `${ms} ms`
      },
    }
  }

  function addAgentMsg() {
    const div = document.createElement('div')
    div.className = 'msg msg--agent'
    div.innerHTML = '<span class="caret"></span>'
    log.appendChild(div)
    scroll()
    return div
  }

  document.getElementById('quick-prompts').addEventListener('click', (e) => {
    const q = e.target.dataset?.q
    if (q && !busy) send(q)
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const text = input.value.trim()
    if (text && !busy) {
      input.value = ''
      send(text)
    }
  })

  async function send(message) {
    busy = true
    addUser(message)
    const trace = addTrace()
    const msgEl = addAgentMsg()
    const t0 = performance.now()
    trace.run(0)

    const coldTimer = setTimeout(() => {
      dot.classList.add('is-warming')
      status.textContent = 'cold start — waking the agent…'
    }, 4000)

    try {
      const res = await fetch(`${API_URL}/chat/v2/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, session_id: sessionId }),
      })
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      let buffer = ''
      let firstByte = 0

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        if (!firstByte) {
          firstByte = Math.round(performance.now() - t0)
          clearTimeout(coldTimer)
          dot.classList.remove('is-warming')
          status.textContent = defaultStatus
          // apportion the real time-to-first-byte across the stages
          trace.done(0, Math.round(firstByte * 0.3))
          trace.run(1)
          trace.done(1, Math.round(firstByte * 0.45))
          trace.run(2)
          trace.done(2, Math.round(firstByte * 0.25))
          trace.run(3)
        }
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            full += data
            msgEl.innerHTML = md(full) + '<span class="caret"></span>'
            scroll()
          }
        }
      }
      msgEl.innerHTML = md(full)
      trace.done(3, Math.round(performance.now() - t0 - firstByte))
    } catch (err) {
      msgEl.className = 'msg msg--error'
      msgEl.textContent = `✕ pipeline error — ${err.message}. The backend may be waking up; try again in a few seconds.`
    } finally {
      clearTimeout(coldTimer)
      dot.classList.remove('is-warming')
      status.textContent = defaultStatus
      busy = false
      scroll()
    }
  }
}
