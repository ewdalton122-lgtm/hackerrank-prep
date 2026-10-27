export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const inline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
export const fmtMin = (m) => (m < 60 ? `${m} min` : `${+(m / 60).toFixed(1)} h`);

let toastTimer;
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

export function renderBlocks(blocks = []) {
  return blocks.map((b) => {
    switch (b.t) {
      case 'h': return `<h3>${inline(b.text)}</h3>`;
      case 'p': return `<p>${inline(b.text)}</p>`;
      case 'code': return `<pre class="code"><code>${esc(b.text)}</code></pre>`;
      case 'list': return `<ul>${b.items.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`;
      case 'table': return `<div class="scroll"><table class="res"><thead><tr>${b.head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      case 'analogy': return `<div class="callout analogy"><b>Finance lens</b><p>${inline(b.text)}</p></div>`;
      case 'tip': return `<div class="callout tip"><b>Tip</b><p>${inline(b.text)}</p></div>`;
      case 'warn': return `<div class="callout warn"><b>Watch out</b><p>${inline(b.text)}</p></div>`;
      default: return '';
    }
  }).join('');
}

export function feedback(kind, lead, steps = [], extra = '') {
  const list = steps.length ? `<ul>${steps.map((s) => `<li>${inline(s)}</li>`).join('')}</ul>` : '';
  const head = kind === 'bad' ? 'What to check' : '';
  return `<div class="fb ${kind}"><b class="lead">${inline(lead)}</b>${head && steps.length ? `<span class="muted small">${head}</span>` : ''}${list}${extra}</div>`;
}

export function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const ta = document.createElement('textarea');
  ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  return Promise.resolve();
}

/** Tab inserts four spaces inside a code textarea. */
export function enableTab(ta) {
  ta.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const s = ta.selectionStart, en = ta.selectionEnd;
    ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(en);
    ta.selectionStart = ta.selectionEnd = s + 4;
  });
}
