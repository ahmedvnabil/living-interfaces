/** Informational panels: badge, metadata, seed viewer, timeline, inspector. */

export type BadgeState = 'live' | 'paused' | 'error' | 'idle';

export function badge(text: string, state: BadgeState = 'idle'): HTMLSpanElement {
  const s = document.createElement('span');
  s.className = 'la-badge';
  setBadge(s, text, state);
  return s;
}

export function setBadge(el: HTMLSpanElement, text: string, state: BadgeState): void {
  el.textContent = text;
  // preserve any layout classes the host added (e.g. la-card__status)
  el.classList.add('la-badge');
  el.classList.remove('la-badge--live', 'la-badge--paused', 'la-badge--error');
  if (state !== 'idle') el.classList.add(`la-badge--${state}`);
}

export function metadataPanel(entries: Array<[string, string]>): HTMLDListElement {
  const dl = document.createElement('dl');
  dl.className = 'la-meta';
  update(dl, entries);
  return dl;
}

export function update(dl: HTMLDListElement, entries: Array<[string, string]>): void {
  dl.replaceChildren();
  for (const [k, v] of entries) {
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    dl.append(dt, dd);
  }
}

export function seedViewer(seed: number, onCopy?: () => void): HTMLSpanElement {
  const s = document.createElement('span');
  s.className = 'la-seed';
  const label = document.createElement('span');
  label.textContent = 'seed';
  label.className = 'la-label';
  const code = document.createElement('code');
  code.textContent = formatSeed(seed);
  code.title = 'Copy seed';
  code.addEventListener('click', () => {
    navigator.clipboard?.writeText(String(seed)).catch(() => undefined);
    onCopy?.();
  });
  s.append(label, code);
  return s;
}

export function setSeed(viewer: HTMLSpanElement, seed: number): void {
  const code = viewer.querySelector('code');
  if (code) code.textContent = formatSeed(seed);
}

export function formatSeed(seed: number): string {
  return '0x' + seed.toString(16).padStart(8, '0').toUpperCase();
}

export interface Timeline {
  el: HTMLDivElement;
  set(t: number, duration?: number): void;
}

export function timeline(): Timeline {
  const el = document.createElement('div');
  el.className = 'la-timeline';
  const track = document.createElement('div');
  track.className = 'la-timeline__track';
  const cursor = document.createElement('div');
  cursor.className = 'la-timeline__cursor';
  track.appendChild(cursor);
  const time = document.createElement('span');
  time.className = 'la-timeline__time';
  time.textContent = 'T+00:00';
  el.append(track, time);
  return {
    el,
    set(t: number, duration = 60) {
      const frac = (t % duration) / duration;
      cursor.style.left = `${(frac * 100).toFixed(2)}%`;
      const m = Math.floor(t / 60), s = Math.floor(t % 60);
      time.textContent = `T+${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },
  };
}

export function inspector(title: string, ...sections: HTMLElement[]): HTMLDivElement {
  const box = document.createElement('div');
  box.className = 'la-inspector';
  const head = document.createElement('div');
  head.className = 'la-inspector__head';
  const h = document.createElement('span');
  h.className = 'la-label';
  h.textContent = title;
  head.appendChild(h);
  const body = document.createElement('div');
  body.className = 'la-inspector__body';
  body.append(...sections);
  box.append(head, body);
  return box;
}
