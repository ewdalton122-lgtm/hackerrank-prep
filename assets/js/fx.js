// Small visual effects for progress: confetti, floating XP, and a milestone dialog.
// Everything respects the "reduce motion" setting.

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function confetti(count = 90) {
  if (reduced()) return;
  const c = document.createElement('canvas');
  c.className = 'fx-confetti';
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  document.body.appendChild(c);
  const g = c.getContext('2d');
  const colors = ['#0b6bcb', '#1b96ff', '#3fd6c1', '#ffb75d', '#ff6f91', '#7f8de1', '#2e844a'];
  const ox = c.width / 2;
  const parts = Array.from({ length: count }, () => ({
    x: ox + (Math.random() - 0.5) * 120,
    y: c.height * 0.38,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 13 - 4,
    w: 6 + Math.random() * 6,
    h: 4 + Math.random() * 5,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.4,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  const t0 = performance.now();
  (function frame(now) {
    const t = now - t0;
    g.clearRect(0, 0, c.width, c.height);
    parts.forEach((p) => {
      p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      g.save();
      g.globalAlpha = Math.max(0, 1 - t / 2600);
      g.translate(p.x, p.y); g.rotate(p.r);
      g.fillStyle = p.color; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      g.restore();
    });
    if (t < 2600) requestAnimationFrame(frame); else c.remove();
  })(t0);
}

let popY = 0;
export function xpPop(text, kind = '') {
  const el = document.createElement('div');
  el.className = `xp-pop ${kind}`;
  el.textContent = text;
  el.style.bottom = `${28 + popY * 46}px`;
  popY++;
  document.body.appendChild(el);
  setTimeout(() => { el.remove(); popY = Math.max(0, popY - 1); }, 2600);
  return el;
}

let live = null, liveTotal = 0, liveTimer = null;
/** Small XP gains (a correct quiz answer) merge into one pop instead of stacking. */
export function xpGain(n) {
  liveTotal += n;
  if (!live || !live.isConnected) { live = null; live = xpPop(`+${liveTotal} XP`); }
  else { live.textContent = `+${liveTotal} XP`; live.style.animation = 'none'; void live.offsetWidth; live.style.animation = ''; }
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => { liveTotal = 0; live = null; }, 1800);
}

export function celebrate({ kicker = '', title, body = '', note = '', cta = 'Keep going' }) {
  document.getElementById('fx-modal')?.remove();
  const m = document.createElement('div');
  m.id = 'fx-modal';
  m.className = 'fx-modal';
  m.setAttribute('role', 'dialog');
  m.setAttribute('aria-modal', 'true');
  m.setAttribute('aria-labelledby', 'fx-title');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  m.innerHTML = `<div class="fx-card">
    ${kicker ? `<div class="fx-kicker">${esc(kicker)}</div>` : ''}
    <h2 id="fx-title">${esc(title)}</h2>
    <p>${esc(body)}</p>
    ${note ? `<p class="fx-note">${esc(note)}</p>` : ''}
    <button class="btn primary" type="button">${esc(cta)}</button></div>`;
  document.body.appendChild(m);
  const close = () => { m.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  m.addEventListener('click', (e) => { if (e.target === m) close(); });
  const btn = m.querySelector('button');
  btn.addEventListener('click', close);
  btn.focus();
  confetti(150);
}
