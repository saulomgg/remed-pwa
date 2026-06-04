/* ══════════════════════════════════════════
   ReMed — storage.js
   ══════════════════════════════════════════ */

const KEY_USER     = 'remed_user';
const KEY_REG      = 'remed_cadastrado';
const KEY_MEDS     = 'remed_medicamentos';
const KEY_FARMACIAS= 'remed_farmacias';
const KEY_HISTORY  = 'remed_historico';
const KEY_SETTINGS = 'remed_settings';

const storage = {
  get:    (k)    => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set:    (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  remove: (k)    => { localStorage.removeItem(k); },

  isReg:    () => !!localStorage.getItem(KEY_REG),
  user:     () => storage.get(KEY_USER),
  meds:     () => storage.get(KEY_MEDS)     || [],
  farmacias:() => storage.get(KEY_FARMACIAS) || [],
  history:  () => storage.get(KEY_HISTORY)   || [],
  settings: () => storage.get(KEY_SETTINGS)  || {},
};
