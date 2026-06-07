const KEY_MEDS     = 'remed_medicamentos';
const KEY_FARMACIAS= 'remed_farmacias';
const KEY_HISTORY  = 'remed_historico';
const KEY_SETTINGS = 'remed_settings';
const KEY_PERFIL   = 'remed_perfil';

const storage = {
  get:    (k)    => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set:    (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  remove: (k)    => { localStorage.removeItem(k); },

  meds:     () => storage.get(KEY_MEDS)      || [],
  farmacias:() => storage.get(KEY_FARMACIAS)  || [],
  history:  () => storage.get(KEY_HISTORY)    || [],
  settings: () => storage.get(KEY_SETTINGS)   || {},
  perfil:   () => storage.get(KEY_PERFIL)     || {},
};
