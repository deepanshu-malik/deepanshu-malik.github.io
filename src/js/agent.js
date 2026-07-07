/*
 * Agent workspace — drawer UI over the real RAG backend.
 * The tool-call trace is driven by real `event: stage` SSE events
 * emitted by the pipeline, with true per-stage latencies.
 */

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://portfolio-backend-deepanshu-malik.koyeb.app/api'

/* minimal markdown: escape first, then transform */
function md(text) {
  let s = text
    // SSE framing drops newlines inside chunks; restore breaks before headings/bullets
    .replace(/([^\n])(#{2,3} )/g, '$1\n\n$2')
    .replace(/([^\n])(- \*\*)/g, '$1\n$2')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const codeBlocks = []
  s = s.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    codeBlocks.push(`<pre><code>${code}</code></pre>`)
    return ' §CB' + (codeBlocks.length - 1) + '§ '
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

  return s.replace(/ §CB(\d+)§ /g, (_, i) => codeBlocks[+i])
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

  /* trace rows are created from real backend stage events */
  function addTrace() {
    const wrap = document.createElement('div')
    wrap.className = 'trace'
    log.appendChild(wrap)
    const rows = new Map()

    function makeRow(stage) {
      const row = document.createElement('div')
      row.className = 'trace-step'
      row.innerHTML = `<span class="t-state">·</span><span class="t-name"></span><span class="t-ms"></span>`
      row.querySelector('.t-name').textContent = `${stage}()`
      wrap.appendChild(row)
      rows.set(stage, row)
      return row
    }

    return {
      onEvent(p) {
        if (!p || !p.stage) return
        const row = rows.get(p.stage) || makeRow(p.stage)
        if (p.status === 'start') {
          row.classList.add('is-running')
          row.querySelector('.t-state').textContent = '◆'
        } else {
          row.classList.remove('is-running')
          row.classList.add('is-done')
          row.querySelector('.t-state').textContent =
            p.status === 'blocked' ? '✕' : '✓'
          if (p.detail)
            row.querySelector('.t-name').textContent = `${p.stage}(${p.detail})`
          if (p.ms != null)
            row.querySelector('.t-ms').textContent = `${Math.round(p.ms)} ms`
        }
        scroll()
      },
      finish() {
        for (const row of rows.values()) {
          if (row.classList.contains('is-running')) {
            row.classList.remove('is-running')
            row.classList.add('is-done')
            row.querySelector('.t-state').textContent = '✓'
          }
        }
        if (rows.size === 0) wrap.remove()
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

    const coldTimer = setTimeout(() => {
      dot.classList.add('is-warming')
      status.textContent = 'cold start — waking the agent…'
    }, 4000)

    try {
      const res = await fetch(`${API_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, session_id: sessionId }),
      })
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      let buffer = ''
      let gotFirstByte = false
      let currentEvent = 'message'

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        if (!gotFirstByte) {
          gotFirstByte = true
          clearTimeout(coldTimer)
          dot.classList.remove('is-warming')
          status.textContent = defaultStatus
        }
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (currentEvent === 'stage') {
              try {
                trace.onEvent(JSON.parse(data))
              } catch {
                /* malformed stage event — ignore */
              }
            } else if (data !== '[DONE]') {
              full += data
              msgEl.innerHTML = md(full) + '<span class="caret"></span>'
              scroll()
            }
          } else if (line === '') {
            currentEvent = 'message'
          }
        }
      }
      msgEl.innerHTML = md(full)
      trace.finish()
    } catch (err) {
      trace.finish()
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
