import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/components.css'
import '../styles/sections.css'
import '../styles/agent.css'

import { initPipeline } from './pipeline.js'
import { initMotion } from './motion.js'
import { initAgent } from './agent.js'
import { initPalette } from './palette.js'
import { renderProjects } from './render.js'

document.documentElement.classList.add('js')

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ——— theme ——— */
const themeBtn = document.getElementById('theme-btn')
const storedTheme = localStorage.getItem('theme')
if (storedTheme) document.documentElement.dataset.theme = storedTheme

export function toggleTheme() {
  const root = document.documentElement
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const current = root.dataset.theme || (systemDark ? 'dark' : 'light')
  const next = current === 'dark' ? 'light' : 'dark'
  root.dataset.theme = next
  localStorage.setItem('theme', next)
}
themeBtn.addEventListener('click', toggleTheme)

/* ——— nav scrolled state ——— */
const nav = document.getElementById('site-nav')
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24)
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

/* ——— toast ——— */
const toastEl = document.getElementById('toast')
let toastTimer
export function toast(msg) {
  toastEl.textContent = msg
  toastEl.classList.add('is-on')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2600)
}

/* ——— dispatch animation on contact ——— */
document.getElementById('dispatch-email').addEventListener('click', () => {
  pipeline.burst(8)
  toast('✓ message dispatched · at-least-once delivery')
})

/* ——— seamless ticker loop ——— */
const ticker = document.getElementById('ticker-track')
ticker.innerHTML += ticker.innerHTML

/* ——— boot modules ——— */
const pipeline = initPipeline(reducedMotion)
initMotion(reducedMotion)
initAgent()
initPalette({ pipeline, toggleTheme, toast })
renderProjects()
