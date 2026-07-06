/*
 * Pipeline canvas — the hero's living system diagram.
 * A horizontal message bus with five stage nodes; packets flow
 * left → right. The node matching the section currently in view
 * lights up. loadTest() floods the bus; burst() sends a volley.
 */

const NODES = ['INTAKE', 'CLASSIFY', 'RETRIEVE', 'ORCHESTRATE', 'DISPATCH']
const SECTION_NODE = {
  intake: 0,
  profile: 1,
  log: 2,
  services: 3,
  stack: 3,
  dispatch: 4,
}

export function initPipeline(reducedMotion) {
  const canvas = document.getElementById('pipeline-canvas')
  const ctx = canvas.getContext('2d')

  let w = 0
  let h = 0
  let dpr = 1
  let packets = []
  let activeNode = 0
  let running = false
  let raf = 0
  let lastSpawn = 0
  let spawnEvery = 900
  let loadTestUntil = 0

  const css = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  function colors() {
    return {
      line: css('--line'),
      muted: css('--muted'),
      faint: css('--faint'),
      copper: css('--copper'),
      copperHi: css('--copper-hi'),
      bg: css('--bg0'),
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = rect.width
    h = rect.height
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw(performance.now())
  }

  function nodeX(i) {
    const pad = Math.min(70, w * 0.06)
    return pad + (i * (w - pad * 2)) / (NODES.length - 1)
  }
  const busY = () => h * 0.42

  function spawnPacket(fast) {
    packets.push({
      x: -10,
      speed: (fast ? 220 : 120) + Math.random() * 80,
      size: 3 + Math.random() * 2.5,
      wobble: Math.random() * Math.PI * 2,
    })
  }

  function draw(now) {
    const c = colors()
    ctx.clearRect(0, 0, w, h)
    const y = busY()

    // bus line
    ctx.strokeStyle = c.line
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()

    // packets
    for (const p of packets) {
      const glow = ctx.createRadialGradient(p.x, y, 0, p.x, y, p.size * 4)
      glow.addColorStop(0, c.copperHi)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.globalAlpha = 0.5
      ctx.fillRect(p.x - p.size * 4, y - p.size * 4, p.size * 8, p.size * 8)
      ctx.globalAlpha = 1
      ctx.fillStyle = c.copper
      const wob = Math.sin(p.wobble + p.x / 40) * 1.5
      ctx.fillRect(p.x - p.size / 2, y - p.size / 2 + wob, p.size * 1.8, p.size)
    }

    // nodes on top of packets
    for (let i = 0; i < NODES.length; i++) {
      const x = nodeX(i)
      const active = i === activeNode
      const s = active ? 7 : 5

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(Math.PI / 4)
      ctx.fillStyle = c.bg
      ctx.strokeStyle = active ? c.copper : c.muted
      ctx.lineWidth = active ? 2 : 1.2
      ctx.fillRect(-s, -s, s * 2, s * 2)
      ctx.strokeRect(-s, -s, s * 2, s * 2)
      ctx.restore()

      if (active) {
        ctx.save()
        ctx.strokeStyle = c.copper
        ctx.globalAlpha = 0.35 + 0.25 * Math.sin(now / 300)
        ctx.beginPath()
        ctx.arc(x, y, 14, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }

      ctx.font = `500 ${w < 640 ? 8 : 10}px 'IBM Plex Mono', monospace`
      ctx.textAlign = 'center'
      ctx.fillStyle = active ? c.copper : c.faint
      ctx.fillText(NODES[i], x, y + 34)
      ctx.fillStyle = c.faint
      ctx.font = `400 8px 'IBM Plex Mono', monospace`
      ctx.fillText(`0${i + 1}`, x, y - 22)
    }
  }

  let prev = 0
  function tick(now) {
    if (!running) return
    const dt = Math.min((now - prev) / 1000, 0.05)
    prev = now

    const flooding = now < loadTestUntil
    const interval = flooding ? 45 : spawnEvery
    if (now - lastSpawn > interval) {
      spawnPacket(flooding)
      lastSpawn = now
    }

    for (const p of packets) p.x += p.speed * dt
    packets = packets.filter((p) => p.x < w + 20)

    draw(now)
    raf = requestAnimationFrame(tick)
  }

  function start() {
    if (running || reducedMotion) return
    running = true
    prev = performance.now()
    raf = requestAnimationFrame(tick)
  }
  function stop() {
    running = false
    cancelAnimationFrame(raf)
  }

  resize()
  window.addEventListener('resize', resize)

  // only animate while the hero is on screen and the tab is visible
  const hero = document.getElementById('intake')
  const io = new IntersectionObserver(
    ([e]) => (e.isIntersecting ? start() : stop()),
    { threshold: 0.05 }
  )
  io.observe(hero)
  document.addEventListener('visibilitychange', () =>
    document.hidden ? stop() : start()
  )

  // light up the node for the section in view
  const sectionIo = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting && SECTION_NODE[e.target.id] !== undefined) {
          activeNode = SECTION_NODE[e.target.id]
          if (reducedMotion) draw(performance.now())
        }
      }
    },
    { rootMargin: '-40% 0px -40% 0px' }
  )
  for (const id of Object.keys(SECTION_NODE)) {
    const el = document.getElementById(id)
    if (el) sectionIo.observe(el)
  }

  // repaint on theme change (tokens change)
  new MutationObserver(() => draw(performance.now())).observe(
    document.documentElement,
    { attributes: true, attributeFilter: ['data-theme'] }
  )

  return {
    loadTest(ms = 4000) {
      if (reducedMotion) return
      loadTestUntil = performance.now() + ms
      spawnEvery = 900
    },
    burst(n = 6) {
      if (reducedMotion) return
      for (let i = 0; i < n; i++)
        setTimeout(() => spawnPacket(true), i * 90)
    },
  }
}
