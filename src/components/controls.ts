/** Interactive controls: button, icon button, toggle, parameter slider. */
import type { ParamDef } from '../core/types.js';

export function button(label: string, onClick: () => void, opts: { primary?: boolean; title?: string } = {}): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = opts.primary ? 'la-btn la-btn--primary' : 'la-btn';
  b.textContent = label;
  if (opts.title) b.title = opts.title;
  b.addEventListener('click', onClick);
  return b;
}

export function iconButton(glyph: string, label: string, onClick: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = 'la-btn la-btn--icon';
  b.textContent = glyph;
  b.setAttribute('aria-label', label);
  b.title = label;
  b.addEventListener('click', onClick);
  return b;
}

export function toggle(label: string, checked: boolean, onChange: (v: boolean) => void): HTMLLabelElement {
  const wrap = document.createElement('label');
  wrap.className = 'la-toggle';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  const track = document.createElement('span');
  track.className = 'la-toggle__track';
  track.innerHTML = '<span class="la-toggle__thumb"></span>';
  const text = document.createElement('span');
  text.className = 'la-label';
  text.textContent = label;
  input.addEventListener('change', () => onChange(input.checked));
  wrap.append(input, track, text);
  return wrap;
}

export function paramSlider(def: ParamDef, onInput: (v: number) => void): HTMLDivElement {
  const wrap = document.createElement('div');
  wrap.className = 'la-slider';
  const row = document.createElement('div');
  row.className = 'la-slider__row';
  const label = document.createElement('span');
  label.className = 'la-label';
  label.textContent = def.label;
  const value = document.createElement('span');
  value.className = 'la-slider__value';
  const fmt = (v: number) => (def.step < 1 ? v.toFixed(decimals(def.step)) : String(Math.round(v)));
  value.textContent = fmt(def.value);
  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(def.min);
  input.max = String(def.max);
  input.step = String(def.step);
  input.value = String(def.value);
  input.setAttribute('aria-label', def.label);
  input.addEventListener('input', () => {
    const v = parseFloat(input.value);
    value.textContent = fmt(v);
    onInput(v);
  });
  row.append(label, value);
  wrap.append(row, input);
  return wrap;
}

function decimals(step: number): number {
  const s = String(step);
  return s.includes('.') ? Math.min(s.split('.')[1].length, 5) : 0;
}
