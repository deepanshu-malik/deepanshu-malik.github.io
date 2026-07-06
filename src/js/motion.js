/*
 * Motion layer — the three brand verbs:
 *   Stream: the H1 arrives token by token
 *   Settle: metrics tick up to their real values
 *   plus scroll reveals, smooth scroll, active nav link
 */

import Lenis from 'lenis'

export function initMotion(reducedMotion) {
  /* ——— Stream: type the headline ——— */
  const h1 = document.getElementById('h1-text')
  const caret = document.getElementById('h1-caret')
  if (!reducedMotion && h1) {
    const full = h1.textContent
    h1.textContent = ''
    let i = 0
    const type = () => {
      // arrive in small uneven chunks, like streamed tokens
      i += Math.random() < 0.3 ? 2 : 1
      h1.textContent = full.slice(0, i)
      if (i < full.length) {
        setTimeout(type, 34 + Math.random() * 46)
      } else if (caret) {
        setTimeout(() => (caret.style.display = 'none'), 3500)
      }
    }
    setTimeout(type, 350)
  } else if (caret) {
    caret.style.display = 'none'
  }

  /* ——— Settle: counters ——— */
  const ease = (t) => 1 - Math.pow(1 - t, 4)
  function settle(el) {
    const target = parseFloat(el.dataset.count)
    const decimals = parseInt(el.dataset.decimals || '0', 10)
    const suffix = el.dataset.suffix || ''
    if (reducedMotion) {
      el.textContent = target.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) + suffix
      return
    }
    const dur = 1400
    const t0 = performance.now()
    const step = (now) => {
      const t = Math.min((now - t0) / dur, 1)
      const val = target * ease(t)
      el.textContent =
        val.toLocaleString('en-IN', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) + suffix
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }
  const counterIo = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          settle(e.target)
          counterIo.unobserve(e.target)
        }
      }
    },
    { threshold: 0.6 }
  )
  document.querySelectorAll('[data-count]').forEach((el) => counterIo.observe(el))

  /* ——— Reveals ——— */
  const revealIo = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          revealIo.unobserve(e.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  )
  document.querySelectorAll('.reveal').forEach((el) => revealIo.observe(el))
  // export for late-rendered nodes (project cards)
  window.__observeReveal = (el) => revealIo.observe(el)

  /* ——— Smooth scroll ——— */
  let lenis = null
  if (!reducedMotion) {
    lenis = new Lenis({ lerp: 0.11 })
    const raf = (time) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: -70 })
    else document.querySelector(target)?.scrollIntoView()
  }
  window.__scrollTo = scrollTo
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault()
        scrollTo(id)
      }
    })
  })

  /* ——— Active nav link ——— */
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')]
  const byId = Object.fromEntries(
    links.map((a) => [a.getAttribute('href').slice(1), a])
  )
  const navIo = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting && byId[e.target.id]) {
          links.forEach((l) => l.classList.remove('is-active'))
          byId[e.target.id].classList.add('is-active')
        }
      }
    },
    { rootMargin: '-45% 0px -45% 0px' }
  )
  document
    .querySelectorAll('main section[id]')
    .forEach((s) => navIo.observe(s))
}
