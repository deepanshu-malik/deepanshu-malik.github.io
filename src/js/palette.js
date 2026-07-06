/*
 * Command palette — Ctrl/Cmd+K.
 */

export function initPalette({ pipeline, toggleTheme, toast }) {
  const palette = document.getElementById('palette')
  const input = document.getElementById('palette-input')
  const list = document.getElementById('palette-list')
  const items = [...list.querySelectorAll('li')]
  let active = 0

  function open() {
    palette.classList.add('is-open')
    input.value = ''
    filter('')
    input.focus()
  }
  function close() {
    palette.classList.remove('is-open')
  }
  const visible = () => items.filter((li) => !li.classList.contains('is-hidden'))

  function setActive(i) {
    const vis = visible()
    if (!vis.length) return
    active = ((i % vis.length) + vis.length) % vis.length
    items.forEach((li) => li.classList.remove('is-active'))
    vis[active].classList.add('is-active')
    vis[active].scrollIntoView({ block: 'nearest' })
  }

  function filter(q) {
    const needle = q.toLowerCase()
    items.forEach((li) =>
      li.classList.toggle('is-hidden', !li.textContent.toLowerCase().includes(needle))
    )
    setActive(0)
  }

  function exec(li) {
    const cmd = li.dataset.cmd
    close()
    if (cmd.startsWith('goto:')) window.__scrollTo(cmd.slice(5))
    else if (cmd === 'agent') window.__openAgent()
    else if (cmd === 'theme') toggleTheme()
    else if (cmd === 'resume') window.location.href = '/resume.html'
    else if (cmd === 'loadtest') {
      window.__scrollTo('#intake')
      pipeline.loadTest(4200)
      toast('⚠ load-test: flooding the pipeline for 4s')
    }
  }

  document.getElementById('palette-btn').addEventListener('click', open)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      palette.classList.contains('is-open') ? close() : open()
    }
    if (!palette.classList.contains('is-open')) return
    if (e.key === 'Escape') close()
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1) }
    else if (e.key === 'Enter') {
      const vis = visible()
      if (vis[active]) exec(vis[active])
    }
  })
  input.addEventListener('input', () => filter(input.value))
  palette.addEventListener('click', (e) => {
    if (e.target === palette) close()
    const li = e.target.closest('li[data-cmd]')
    if (li) exec(li)
  })
  items.forEach((li) =>
    li.addEventListener('mousemove', () => {
      const vis = visible()
      const i = vis.indexOf(li)
      if (i >= 0) setActive(i)
    })
  )
}
