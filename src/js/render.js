/*
 * Render project service-cards from /data/projects-data.json.
 */

export async function renderProjects() {
  const grid = document.getElementById('projects-grid')
  if (!grid) return
  try {
    const res = await fetch('/data/projects-data.json')
    const data = await res.json()
    grid.innerHTML = ''
    for (const p of data.projects) {
      const card = document.createElement('article')
      card.className = 'svc-card reveal'

      const metrics = (p.metrics || [])
        .map((m) => `<span class="svc-metric"><b></b> <span></span></span>`)
        .join('')

      card.innerHTML = `
        <div class="svc-status">
          <span class="chip"><span class="dot" aria-hidden="true"></span><span class="svc-status-label"></span></span>
        </div>
        <h3></h3>
        <p class="svc-desc"></p>
        <div class="svc-metrics">${metrics}</div>
        <div class="svc-tech"></div>
        <div class="svc-links"></div>
      `
      card.querySelector('.svc-status-label').textContent = p.status || 'production'
      card.querySelector('h3').textContent = p.title
      card.querySelector('.svc-desc').textContent = p.shortDesc

      const metricEls = card.querySelectorAll('.svc-metric')
      ;(p.metrics || []).forEach((m, i) => {
        metricEls[i].querySelector('b').textContent = m.v
        metricEls[i].querySelector('span:last-child').textContent = m.k
      })

      const tech = card.querySelector('.svc-tech')
      for (const t of p.tech.slice(0, 6)) {
        const s = document.createElement('span')
        s.textContent = t
        tech.appendChild(s)
      }

      const links = card.querySelector('.svc-links')
      if (p.github) {
        const a = document.createElement('a')
        a.href = p.github
        a.target = '_blank'
        a.rel = 'noopener'
        a.textContent = 'github ↗'
        links.appendChild(a)
      }
      if (p.live) {
        const a = document.createElement('a')
        a.href = '#'
        a.textContent = 'live — ask it ↗'
        a.addEventListener('click', (e) => {
          e.preventDefault()
          window.__openAgent()
        })
        links.appendChild(a)
      }
      if (!p.github && !p.live) {
        const s = document.createElement('a')
        s.href = '#dispatch'
        s.textContent = 'internal — ask me about it'
        links.appendChild(s)
      }

      grid.appendChild(card)
      if (window.__observeReveal) window.__observeReveal(card)
    }
  } catch {
    grid.innerHTML =
      '<p class="mono">could not load services — the log above tells the same story.</p>'
  }
}
