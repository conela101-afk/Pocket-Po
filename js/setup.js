// First-run setup: four short steps, done once while regulated. Skippable, resumable, editable later.
import { t, getTool, getDefaults } from './data.js';
import { getSetting, setSetting } from './settings.js';
import { poHTML } from './po.js';
import { go } from './router.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const STEPS = 4;
const view = () => document.getElementById('view');

export function setup(stepArg) {
  const step = Math.min(STEPS, Math.max(1, +stepArg || getSetting('setupStep') || 1));
  setSetting('setupStep', step);
  const D = getDefaults();
  const chosen = () => getSetting('nowDefaults') || D.defaults.now;
  const cb = (key, label, hint = '') => `<label class="setting"><span>${esc(label)}${hint ? `<br><small class="muted">${esc(hint)}</small>` : ''}</span><input type="checkbox" data-k="${key}" ${getSetting(key) ? 'checked' : ''}></label>`;

  const bodies = {
    1: () => `<p>${esc(t('setup.s1.intro'))}</p>
      <div class="stack" id="picks">${D.nowChoices.map((id) => `<label class="setting card"><span>${esc(D.nowCards[id].label)}</span>
        <input type="checkbox" value="${id}" ${chosen().includes(id) ? 'checked' : ''}></label>`).join('')}</div>
      <p class="muted" id="limit" role="status"></p>`,
    2: () => `${cb('quiet', t('setup.s2.quiet'), t('setup.s2.quietHint'))}
      <label class="setting" style="align-items:flex-start;flex-direction:column"><span>${esc(t('setup.s2.handoff'))}<br><small class="muted">${esc(t('setup.s2.handoffHint'))}</small></span>
      <input type="text" id="hm" value="${esc(getSetting('handoffMessage') || D.defaults.handoffMessage)}"></label>`,
    3: () => `<p>${esc(t('setup.s3.intro'))}</p>
      <div class="stack">${['standard', 'clear', 'soft'].map((k) => `<button class="look" data-look="${k}" aria-pressed="${getSetting('poLook') === k}" style="height:auto;padding:.5rem 1rem">
        <span class="row"><span class="looks" data-po="${k}"><span class="swatch light">${poHTML('sit', 'sm')}</span><span class="swatch dark">${poHTML('sit', 'sm')}</span></span>
        <span>${esc(t('setup.s3.' + k))}</span></span></button>`).join('')}</div>
      <p class="muted">${esc(t('setup.s3.light'))} · ${esc(t('setup.s3.dark'))}</p>`,
    4: () => `<p>${esc(t('setup.s4.intro'))}</p>${cb('reduceMotion', t('settings.reduceMotion'))}${cb('sound', t('settings.sound'))}`
  };

  view().innerHTML = `
    <p class="muted">${esc(t('setup.step'))} ${step} ${esc(t('setup.of'))} ${STEPS}</p>
    <h1>${esc(t(`setup.s${step}.title`))}</h1>
    ${bodies[step]()}
    <div class="stopbar stack">
      <button class="primary" id="next">${esc(step === STEPS ? t('setup.done') : t('setup.next'))}</button>
      <div class="row">${step > 1 ? `<button class="grow" id="prev">${esc(t('setup.back'))}</button>` : ''}<button class="grow" id="skip">${esc(t('setup.skip'))}</button></div>
    </div>`;

  const v = view();
  v.querySelectorAll('input[data-k]').forEach((el) => el.onchange = () => setSetting(el.dataset.k, el.checked));
  v.querySelector('#hm')?.addEventListener('change', (e) => setSetting('handoffMessage', e.target.value.trim() || null));
  v.querySelectorAll('.look').forEach((b) => b.onclick = () => {
    setSetting('poLook', b.dataset.look);
    v.querySelectorAll('.look').forEach((x) => x.setAttribute('aria-pressed', x === b));
  });
  const picks = v.querySelector('#picks');
  if (picks) {
    const sync = () => {
      const boxes = [...picks.querySelectorAll('input')];
      const on = boxes.filter((b) => b.checked);
      boxes.forEach((b) => { b.disabled = !b.checked && on.length >= 3; });
      v.querySelector('#limit').textContent = on.length >= 3 ? t('setup.s1.limit') : '';
      setSetting('nowDefaults', on.length ? on.map((b) => b.value) : null);
    };
    picks.onchange = sync; sync();
  }
  v.querySelector('#prev')?.addEventListener('click', () => setup(step - 1));
  v.querySelector('#next').onclick = () => {
    if (step < STEPS) return setup(step + 1);
    setSetting('setupState', 'done'); go('/now');
  };
  v.querySelector('#skip').onclick = () => { setSetting('setupState', 'skipped'); go('/home'); };
}
