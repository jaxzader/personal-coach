/* ============================================================
   PERSONAL COACH — STORAGE + DATE/STREAK HELPERS
   Everything persists to localStorage. No server, no accounts.
   ============================================================ */

const STORAGE_KEY = "personalCoachData_v1";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function offsetDateStr(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function yesterdayStr() { return offsetDateStr(todayStr(), -1); }

function formatDateHuman(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function defaultState() {
  return {
    habits: [],
    goals: { longTerm: "", shortTerm: "" },
    planner: { days: {} },
    health: { items: [], days: {}, itemStreaks: {}, fullStreak: { current: 0, longest: 0, lastFullDate: null } }
  };
}

function loadState() {
  let state;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state = raw ? JSON.parse(raw) : defaultState();
  } catch (e) {
    state = defaultState();
  }
  // merge in any missing top-level keys (forward-compatible with fresh installs)
  const def = defaultState();
  Object.keys(def).forEach(k => { if (!(k in state)) state[k] = def[k]; });
  return state;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* Runs once per load: for every habit, if the last check-in was
   before yesterday (i.e. a full day was missed with no check-in),
   the streak resets to zero. A last check-in of today or yesterday
   is left alone — yesterday just means "haven't checked in yet
   today," not a miss. */
function applyStreakResets(state) {
  const today = todayStr();
  const yesterday = yesterdayStr();
  let anyReset = false;
  state.habits.forEach(h => {
    if (h.lastCheckinDate && h.lastCheckinDate !== today && h.lastCheckinDate !== yesterday) {
      if (h.streak > 0) { h.justReset = true; anyReset = true; }
      h.streak = 0;
    }
  });
  if (anyReset) saveState(state);
  return state;
}

function checkInHabit(state, habitId) {
  const h = state.habits.find(x => x.id === habitId);
  if (!h) return state;
  const today = todayStr();
  if (h.lastCheckinDate === today) return state; // already checked in today
  h.streak = (h.streak || 0) + 1;
  h.longestStreak = Math.max(h.longestStreak || 0, h.streak);
  h.lastCheckinDate = today;
  h.checkins = h.checkins || {};
  h.checkins[today] = true;
  h.justReset = false;
  saveState(state);
  return state;
}

/* ---------- Backup / Restore ---------- */
function backupData(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `personal-coach-backup-${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function restoreData(file, onDone, onError) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (typeof parsed !== "object" || parsed === null) throw new Error("File isn't a valid backup (not a JSON object).");
      const def = defaultState();
      Object.keys(def).forEach(k => { if (!(k in parsed)) parsed[k] = def[k]; });
      saveState(parsed);
      onDone(parsed);
    } catch (e) {
      onError(e);
    }
  };
  reader.onerror = () => onError(new Error("Couldn't read that file."));
  reader.readAsText(file);
}

/* ---------- Clipboard ---------- */
function copyToClipboard(text, onDone) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => onDone(true)).catch(() => fallbackCopy(text, onDone));
  } else {
    fallbackCopy(text, onDone);
  }
}
function fallbackCopy(text, onDone) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
  document.body.removeChild(ta);
  onDone(ok);
}
