// Tools that hold the user's own content. It lives only in IndexedDB or small settings on the device.
// The app never reads or interprets what is written. Storage failures are silent.
import { t, tools, getTags } from '../data.js';
import { getSetting, setSetting } from '../settings.js';
import { put, getAll, remove, nowISO } from '../db.js';
import { doHandoff, handoffMessage } from '../handoff.js';
import { runContent, esc, toast } from './common.js';
import { go } from '../router.js';

const all = (store) => getAll(store).catch(() => []);
const save = (store, obj) => put(store, obj).catch(() => null);
const drop = (store, id) => remove(store, id).catch(() => null);

const LISTS = {
  'evidence-bank': { store: 'evidence', kind: 'evidence' },
  'repair-note': { store: 'evidence', kind: 'note' },
  'parking-lot': { store: 'parkingLot' },
  'appointment-prep': { store: 'prepPoints', toggle: true }
};

/** Add, list and remove short entries. */
export function runList(view, tool, mode, opener) {
  const cfg = LISTS[tool.id], c = (k) => t(`lists.${tool.id}.${k}`);
  runContent(view, tool, mode, opener, {
    intro: c('intro'),
    body: `<label class="field"><span>${esc(c('placeholder'))}</span><textarea id="txt" maxlength="2000"></textarea></label>
      <button class="primary" id="add">${esc(t('common.add'))}</button><div class="stack" id="items" style="margin-top:1rem"></div>`,
    mount(el) {
      const box = el.querySelector('#items');
      const draw = async () => {
        const items = (await all(cfg.store)).filter((x) => !cfg.kind || x.kind === cfg.kind)
          .sort((a, b) => (a.raised ? 1 : 0) - (b.raised ? 1 : 0) || b.ts.localeCompare(a.ts));
        box.innerHTML = items.length ? items.map((x) => `<div class="item ${x.raised ? 'done' : ''}"><span>${esc(x.text)}</span>
          ${cfg.toggle ? `<button data-raise="${x.id}" aria-pressed="${!!x.raised}">${esc(c('toggle'))}</button>` : ''}
          <button data-rm="${x.id}">${esc(t('common.remove'))}</button></div>`).join('') : `<p class="muted">${esc(c('empty'))}</p>`;
        box.querySelectorAll('[data-rm]').forEach((b) => b.onclick = async () => { await drop(cfg.store, +b.dataset.rm); draw(); });
        box.querySelectorAll('[data-raise]').forEach((b) => b.onclick = async () => {
          const it = items.find((x) => x.id === +b.dataset.raise); it.raised = !it.raised; await save(cfg.store, it); draw();
        });
      };
      el.querySelector('#add').onclick = async () => {
        const ta = el.querySelector('#txt'), text = ta.value.trim();
        if (!text) return;
        await save(cfg.store, { text, ts: nowISO(), ...(cfg.kind ? { kind: cfg.kind } : {}), ...(cfg.toggle ? { raised: false } : {}) });
        ta.value = '';
        if (tool.id === 'parking-lot') toast(c('added'));
        draw();
      };
      draw();
    }
  });
}

/** If-then plans. Plans can link to a tool, can be archived, and are never "failed". */
export function runPlans(view, tool, mode, opener) {
  const choices = tools().filter((x) => x.modes.includes('library') && x.run !== 'plans');
  const nameOf = (id) => tools().find((x) => x.id === id)?.name || '';
  runContent(view, tool, mode, opener, {
    title: t('plans.title'), intro: t('plans.intro'), body: '<div id="plans"></div>',
    mount(el) {
      const host = el.querySelector('#plans');
      const line = (p) => `${t('plans.if')} ${p.if || '…'}, ${t('plans.then')} ${p.then || nameOf(p.toolId) || '…'}`;
      const list = async () => {
        const plans = (await all('contingencies')).sort((a, b) => (b.ts || '').localeCompare(a.ts || ''));
        const row = (p, arch) => `<div class="item"><span>${esc(line(p))}</span>
          ${p.toolId && !arch ? `<button data-go="${p.toolId}">${esc(t('plans.start'))}</button>` : ''}
          <button data-arch="${p.id}">${esc(t(arch ? 'common.restore' : 'common.archive'))}</button></div>`;
        const live = plans.filter((p) => !p.archived), old = plans.filter((p) => p.archived);
        host.innerHTML = `<button id="new">${esc(t('common.new'))}</button>
          <div class="stack" style="margin-top:1rem">${live.length ? live.map((p) => row(p)).join('') : `<p class="muted">${esc(t('plans.empty'))}</p>`}</div>
          ${old.length ? `<details style="margin-top:1rem"><summary>${esc(t('common.archived'))}</summary><div class="stack">${old.map((p) => row(p, true)).join('')}</div></details>` : ''}`;
        host.querySelector('#new').onclick = form;
        host.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => go(`/tool/${b.dataset.go}/plan`));
        host.querySelectorAll('[data-arch]').forEach((b) => b.onclick = async () => {
          const p = plans.find((x) => x.id === +b.dataset.arch); p.archived = !p.archived; await save('contingencies', p); list();
        });
      };
      const form = () => {
        host.innerHTML = `<label class="field"><span>${esc(t('plans.if'))}</span><input type="text" id="if" list="trig" placeholder="${esc(t('plans.ifPlaceholder'))}">
          <datalist id="trig">${getTags().trigger.tags.filter((x) => x !== 'Not sure').map((x) => `<option value="${esc(x)}">`).join('')}</datalist></label>
          <label class="field"><span>${esc(t('plans.then'))}</span><input type="text" id="then" placeholder="${esc(t('plans.thenPlaceholder'))}"></label>
          <label class="field"><span>${esc(t('plans.tool'))}</span><select id="tool"><option value="">${esc(t('plans.noTool'))}</option>
          ${choices.map((x) => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></label>
          <div class="stack"><button class="primary" id="save">${esc(t('common.save'))}</button><button id="cancel">${esc(t('common.back'))}</button></div>`;
        host.querySelector('#cancel').onclick = list;
        host.querySelector('#save').onclick = async () => {
          const p = { if: host.querySelector('#if').value.trim(), then: host.querySelector('#then').value.trim(), toolId: host.querySelector('#tool').value || null, archived: false, ts: nowISO() };
          if (p.if || p.then || p.toolId) await save('contingencies', p);
          list();
        };
      };
      tool.startForm ? form() : list();
    }
  });
}

/** Pick a word for how it feels, or write one. Nothing is saved. */
export function runNameIt(view, tool, mode, opener) {
  runContent(view, tool, mode, opener, {
    intro: t('nameIt.intro'),
    body: `<div class="chips">${t('nameIt.words').map((w) => `<button data-w aria-pressed="false">${esc(w)}</button>`).join('')}</div>
      <label class="field" style="margin-top:1rem"><span>${esc(t('nameIt.own'))}</span><input type="text" id="own"></label>`,
    mount(el) {
      el.querySelectorAll('[data-w]').forEach((b) => b.onclick = () => {
        const on = b.getAttribute('aria-pressed') !== 'true';
        el.querySelectorAll('[data-w]').forEach((x) => x.setAttribute('aria-pressed', false));
        b.setAttribute('aria-pressed', on);
      });
    }
  });
}

/** Two boxes to lay out both sides. Nothing is saved. */
export function runProsCons(view, tool, mode, opener) {
  runContent(view, tool, mode, opener, {
    intro: t('pros.intro'),
    body: ['pros', 'cons'].map((k) => `<label class="field"><span>${esc(t('pros.' + k))}</span><textarea placeholder="${esc(t('pros.placeholder'))}"></textarea></label>`).join('')
  });
}

/** The handoff message as a library tool: the button opens the share sheet with no recipient. */
export function runHandoffTool(view, tool, mode, opener) {
  runContent(view, tool, mode, opener, {
    intro: t('handoffTool.intro'),
    body: `<button class="primary card big" id="send">${esc(handoffMessage())}</button>`,
    mount(el) { el.querySelector('#send').onclick = () => doHandoff(toast); }
  });
}

/** The user's own stims, kept on the device. Po offers a few ideas to start from. */
export function runStims(view, tool, mode, opener) {
  runContent(view, tool, mode, opener, {
    intro: t('stims.intro'),
    body: `<div class="stack" id="mine"></div>
      <label class="field" style="margin-top:1rem"><span>${esc(t('stims.placeholder'))}</span><input type="text" id="new"></label>
      <button id="add">${esc(t('common.add'))}</button>
      <h2>${esc(t('stims.ideas'))}</h2><div class="chips" id="ideas"></div>`,
    mount(el) {
      const draw = () => {
        const mine = getSetting('stims');
        el.querySelector('#mine').innerHTML = mine.length ? mine.map((s, i) => `<div class="item"><span>${esc(s)}</span><button data-rm="${i}">${esc(t('common.remove'))}</button></div>`).join('') : `<p class="muted">${esc(t('stims.empty'))}</p>`;
        el.querySelectorAll('[data-rm]').forEach((b) => b.onclick = () => { setSetting('stims', mine.filter((_, i) => i !== +b.dataset.rm)); draw(); });
        el.querySelector('#ideas').innerHTML = t('stims.examples').filter((x) => !mine.includes(x)).map((x) => `<button data-idea="${esc(x)}">${esc(x)}</button>`).join('');
        el.querySelectorAll('[data-idea]').forEach((b) => b.onclick = () => { setSetting('stims', [...getSetting('stims'), b.dataset.idea]); draw(); });
      };
      el.querySelector('#add').onclick = () => {
        const inp = el.querySelector('#new'), v = inp.value.trim();
        if (v) { setSetting('stims', [...getSetting('stims'), v]); inp.value = ''; draw(); }
      };
      draw();
    }
  });
}
