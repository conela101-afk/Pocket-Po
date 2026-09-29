// Opens the share sheet (or sms:) with the message and no recipient. No contact is ever stored.
import { getSetting } from './settings.js';
import { getDefaults, t } from './data.js';
import { markHandoff } from './db.js';

export const handoffMessage = () => getSetting('handoffMessage') || getDefaults().defaults.handoffMessage;

export async function doHandoff(toast) {
  const text = handoffMessage();
  markHandoff();
  if (navigator.share) {
    try { await navigator.share({ text }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (/Android|iPad|iPhone|iPod/.test(navigator.userAgent)) {
    location.href = `sms:${ios ? '&' : '?'}body=${encodeURIComponent(text)}`;
    return;
  }
  try { await navigator.clipboard.writeText(text); toast?.(t('handoff.copied')); } catch { toast?.(text); }
}
