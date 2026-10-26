/* ============================================================
   PERSONAL COACH — APP LOGIC
   ============================================================ */

let STATE = applyStreakResets(loadState());

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  Object.keys(attrs).forEach(k => {
    if (k === "class") e.className = attrs[k];
    else if (k === "html") e.innerHTML = attrs[k];
    else e.setAttribute(k, attrs[k]);
  });
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (c === null || c === undefined) return;
    e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return e;
}

function save() { saveState(STATE); }

/* ---------- Toast + celebration ---------- */
let toastTimer = null;
function showToast(msg, ms = 3200) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), ms);
}

function celebrate(anchorEl, colors) {
  if (!anchorEl) return;
  const rect = anchorEl.getBoundingClientRect();
  const wrap = document.createElement("div");
  wrap.style.position = "fixed";
  wrap.style.left = "0"; wrap.style.top = "0"; wrap.style.pointerEvents = "none"; wrap.style.zIndex = "998";
  document.body.appendChild(wrap);
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  const palette = colors || ["#ff6a4d", "#ffc247", "#2fd98a", "#9b8cff"];
  for (let i = 0; i < 14; i++) {
    const dot = document.createElement("div");
    dot.className = "burst-dot";
    const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
    const dist = 40 + Math.random() * 45;
    dot.style.left = cx + "px"; dot.style.top = cy + "px";
    dot.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    dot.style.setProperty("--dy", Math.sin(angle) * dist + "px");
    dot.style.background = palette[i % palette.length];
    dot.style.animation = "burst-fly 0.7s cubic-bezier(.2,.9,.3,1) forwards";
    wrap.appendChild(dot);
  }
  setTimeout(() => wrap.remove(), 800);
}

function flashStat(elm) {
  if (!elm) return;
  elm.classList.remove("pop");
  void elm.offsetWidth;
  elm.classList.add("pop");
}

function checkSvg() {
  return `<svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9.5 18L20 6" stroke="#1a1108" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/* ---------- Nav ---------- */
function initNav() {
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`section-${btn.dataset.section}`).classList.add("active");
    });
  });
}

function initTopBar() {
  document.getElementById("todayPill").textContent = formatDateHuman(todayStr());
  document.getElementById("backupBtn").addEventListener("click", () => {
    backupData(STATE);
    showToast("Backup downloaded ✓");
  });
  document.getElementById("restoreBtn").addEventListener("click", () => document.getElementById("restoreFile").click());
  document.getElementById("restoreFile").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    restoreData(file, (parsed) => {
      STATE = applyStreakResets(parsed);
      renderAll();
      showToast("Backup restored ✓");
    }, (err) => {
      showToast("Restore failed: " + err.message);
    });
    e.target.value = "";
  });
}

function copyBtnFlash(btn) {
  const original = btn.textContent;
  btn.textContent = "✓ Copied";
  btn.classList.add("copied");
  setTimeout(() => { btn.textContent = original; btn.classList.remove("copied"); }, 1800);
}

/* ============================================================
   SECTION: GOALS + DAILY PLANNER
   ============================================================ */
function initGoals() {
  const longEl = document.getElementById("goalLongTerm");
  const shortEl = document.getElementById("goalShortTerm");
  longEl.value = STATE.goals.longTerm || "";
  shortEl.value = STATE.goals.shortTerm || "";
  longEl.addEventListener("input", () => { STATE.goals.longTerm = longEl.value; save(); });
  shortEl.addEventListener("input", () => { STATE.goals.shortTerm = shortEl.value; save(); });

  document.getElementById("copyGoalsBtn").addEventListener("click", (e) => {
    const text = `Here are my goals.\n\nLONG-TERM:\n${STATE.goals.longTerm || "(not set)"}\n\nSHORT-TERM:\n${STATE.goals.shortTerm || "(not set)"}\n\nCan you help me break these down into a real, tailored step-by-step plan — concrete next actions, not generic advice?`;
    copyToClipboard(text, () => copyBtnFlash(e.currentTarget));
  });
}

function getDay(dateStr) {
  if (!STATE.planner.days[dateStr]) STATE.planner.days[dateStr] = { tasks: [] };
  return STATE.planner.days[dateStr];
}

function renderPlanner() {
  const day = getDay(todayStr());
  const tasks = day.tasks;
  const total = tasks.length;
  const doneCount = tasks.filter(t => t.done).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const statRow = document.getElementById("plannerStatRow");
  statRow.innerHTML = "";
  statRow.appendChild(statTile("Completed Today", `${doneCount}`, "plannerDoneStat"));
  statRow.appendChild(statTile("Remaining", `${total - doneCount}`));
  statRow.appendChild(statTile("Today's Progress", `${pct}%`));

  document.getElementById("plannerProgressFill").style.width = pct + "%";

  // focus task = first incomplete task
  const focusSlot = document.getElementById("focusTaskSlot");
  focusSlot.innerHTML = "";
  const incomplete = tasks.filter(t => !t.done);
  if (incomplete.length === 0) {
    if (total > 0) {
      focusSlot.appendChild(el("div", { class: "focus-empty" }, "🎉 Everything on today's list is done. Add another task, or call it a win."));
    } else {
      focusSlot.appendChild(el("div", { class: "focus-empty" }, "Nothing on the list yet — add your first task for today below."));
    }
  } else {
    focusSlot.appendChild(renderFocusTask(incomplete[0], tasks));
  }

  const listWrap = document.getElementById("taskListWrap");
  listWrap.innerHTML = "";
  if (incomplete.length > 1) {
    listWrap.appendChild(el("div", { class: "field-label", style: "margin-bottom:8px;" }, "Up Next"));
    incomplete.slice(1).forEach(t => listWrap.appendChild(renderTaskRow(t, tasks, false)));
  }
  const done = tasks.filter(t => t.done);
  if (done.length) {
    listWrap.appendChild(el("div", { class: "field-label", style: "margin:16px 0 8px;" }, `Done Today (${done.length})`));
    done.forEach(t => listWrap.appendChild(renderTaskRow(t, tasks, true)));
  }

  renderPlannerHistory();
}

function statTile(label, value, id) {
  const valEl = el("div", { class: "stat-value", ...(id ? { id } : {}) }, value);
  return el("div", { class: "stat-tile" }, [el("div", { class: "stat-label" }, label), valEl]);
}

function renderFocusTask(task, allTasks) {
  const card = el("div", { class: "focus-task-card" });
  const check = el("div", { class: "check big" }, el("span", { html: checkSvg() }));
  check.addEventListener("click", (e) => toggleTask(task, allTasks, e.currentTarget));
  const titleWrap = el("div", { class: "focus-task-title-wrap" }, [
    el("span", { class: "focus-tag" }, "FOCUS"),
    el("div", { class: "focus-task-title" }, task.text)
  ]);
  const head = el("div", { class: "focus-task-head" }, [check, titleWrap]);
  card.appendChild(head);

  const subWrap = el("div", { class: "subtask-list" });
  (task.subtasks || []).forEach(st => subWrap.appendChild(renderSubtask(st, task, allTasks)));
  card.appendChild(subWrap);

  const addSub = el("div", { class: "add-subtask-row" });
  const input = el("input", { type: "text", placeholder: "Add a sub-step..." });
  const btn = el("button", { class: "btn btn-ghost" }, "+");
  btn.addEventListener("click", () => {
    if (!input.value.trim()) return;
    task.subtasks = task.subtasks || [];
    task.subtasks.push({ id: uid(), text: input.value.trim(), done: false });
    save(); renderPlanner();
  });
  input.addEventListener("keydown", e => { if (e.key === "Enter") btn.click(); });
  addSub.appendChild(input); addSub.appendChild(btn);
  card.appendChild(addSub);

  return card;
}

function renderSubtask(st, parentTask, allTasks) {
  const check = el("div", { class: `check ${st.done ? "checked" : ""}` }, el("span", { html: checkSvg() }));
  check.addEventListener("click", (e) => {
    st.done = !st.done;
    if (st.done) { check.classList.add("pulse"); celebrate(e.currentTarget, ["#ffc247", "#ff6a4d"]); }
    save();
    renderPlanner();
  });
  return el("div", { class: "subtask-row" }, [check, el("span", { class: st.done ? "subtask-done" : "" }, st.text)]);
}

function renderTaskRow(task, allTasks, isDone) {
  const check = el("div", { class: `check ${task.done ? "checked" : ""}` }, el("span", { html: checkSvg() }));
  check.addEventListener("click", (e) => toggleTask(task, allTasks, e.currentTarget));
  const del = el("button", { class: "btn-danger-ghost" }, "✕");
  del.addEventListener("click", () => {
    const idx = allTasks.indexOf(task);
    if (idx > -1) allTasks.splice(idx, 1);
    save(); renderPlanner();
  });
  const subCount = (task.subtasks || []).length;
  const subDone = (task.subtasks || []).filter(s => s.done).length;
  const meta = subCount ? el("span", { class: "task-sub-meta" }, ` (${subDone}/${subCount} sub-steps)`) : null;
  return el("div", { class: `task-row ${isDone ? "task-row-done" : ""}` }, [
    check, el("span", { class: "task-row-text" }, [task.text, meta].filter(Boolean).length > 1 ? task.text : task.text), meta,
    del
  ]);
}

function toggleTask(task, allTasks, anchorEl) {
  task.done = !task.done;
  if (task.done) {
    task.subtasks = (task.subtasks || []).map(s => ({ ...s, done: true }));
    celebrate(anchorEl);
    const stat = document.getElementById("plannerDoneStat");
    save(); renderPlanner();
    flashStat(document.getElementById("plannerDoneStat"));
    const day = getDay(todayStr());
    if (day.tasks.length && day.tasks.every(t => t.done)) {
      showToast("🎉 Every task done for today. That's the whole list, cleared.");
    } else {
      showToast("Nice — task done.");
    }
  } else {
    save(); renderPlanner();
  }
}

function initPlannerAdd() {
  const input = document.getElementById("newTaskInput");
  const btn = document.getElementById("addTaskBtn");
  const add = () => {
    const val = input.value.trim();
    if (!val) return;
    getDay(todayStr()).tasks.push({ id: uid(), text: val, done: false, subtasks: [] });
    input.value = "";
    save(); renderPlanner();
  };
  btn.addEventListener("click", add);
  input.addEventListener("keydown", e => { if (e.key === "Enter") add(); });
}

function renderPlannerHistory() {
  const wrap = document.getElementById("plannerHistoryWrap");
  wrap.innerHTML = "";
  const dates = Object.keys(STATE.planner.days).filter(d => d !== todayStr()).sort().reverse().slice(0, 14);
  if (!dates.length) { wrap.appendChild(el("div", { class: "empty-hint" }, "No past days yet — history builds up as you go.")); return; }
  dates.forEach(d => {
    const day = STATE.planner.days[d];
    const total = day.tasks.length;
    const done = day.tasks.filter(t => t.done).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    wrap.appendChild(el("div", { class: "history-row" }, [
      el("span", { class: "history-date" }, formatDateHuman(d)),
      el("div", { class: "progress-track history-bar" }, el("div", { class: "progress-fill", style: `width:${pct}%;` })),
      el("span", { class: "history-frac" }, `${done}/${total}`)
    ]));
  });
}

/* ============================================================
   SECTION: HABIT BREAKER
   ============================================================ */
function initHabits() {
  const sel = document.getElementById("habitCategory");
  sel.innerHTML = "";
  HABIT_CATEGORIES.forEach(c => sel.appendChild(el("option", { value: c.id }, c.label)));
  sel.appendChild(el("option", { value: "other" }, "Other / Custom"));
  sel.addEventListener("change", () => {
    document.getElementById("habitCustomWrap").style.display = sel.value === "other" ? "block" : "none";
  });

  document.getElementById("addHabitBtn").addEventListener("click", () => {
    const name = document.getElementById("habitName").value.trim();
    if (!name) { showToast("Give the habit a name first."); return; }
    const categoryId = sel.value;
    const habit = {
      id: uid(), name, categoryId,
      description: document.getElementById("habitDescription").value.trim(),
      customDescription: categoryId === "other" ? document.getElementById("habitCustomDescription").value.trim() : "",
      frequency: document.getElementById("habitFrequency").value.trim(),
      streak: 0, longestStreak: 0, checkins: {}, lastCheckinDate: null, justReset: false
    };
    STATE.habits.unshift(habit);
    save();
    document.getElementById("habitName").value = "";
    document.getElementById("habitDescription").value = "";
    document.getElementById("habitFrequency").value = "";
    document.getElementById("habitCustomDescription").value = "";
    renderHabits();
    showToast(`"${name}" added. Day one starts now.`);
  });
}

function renderHabits() {
  const wrap = document.getElementById("habitListWrap");
  wrap.innerHTML = "";
  if (!STATE.habits.length) {
    wrap.appendChild(el("div", { class: "empty-hint" }, "No habits added yet — add one above to get the reference library and streak tracker."));
    return;
  }
  STATE.habits.forEach(h => wrap.appendChild(renderHabitCard(h)));
}

function renderHabitCard(h) {
  const cat = h.categoryId !== "other" ? findHabitCategory(h.categoryId) : null;
  const checkedToday = h.lastCheckinDate === todayStr();

  const card = el("div", { class: "card accent-edge habit-card" });

  const head = el("div", { class: "habit-card-head" }, [
    el("div", {}, [
      el("h3", { style: "margin-bottom:2px;" }, h.name),
      el("div", { class: "habit-meta" }, [cat ? cat.label : "Custom habit", h.frequency ? ` · currently ${h.frequency}` : ""].join(""))
    ]),
    el("button", { class: "btn-danger-ghost" }, "Remove habit")
  ]);
  head.querySelector("button").addEventListener("click", () => {
    STATE.habits = STATE.habits.filter(x => x.id !== h.id);
    save(); renderHabits();
  });
  card.appendChild(head);

  if (h.description) card.appendChild(el("p", { class: "habit-desc" }, h.description));

  if (h.justReset && h.streak === 0 && !checkedToday) {
    card.appendChild(el("div", { class: "reset-banner" }, "Streak reset — every day is a new chance to start again."));
  }

  const statRow = el("div", { class: "stat-row habit-stat-row" });
  statRow.appendChild(statTile("Current Streak", `${h.streak}`, `streak-${h.id}`));
  statRow.appendChild(statTile("Longest Streak", `${h.longestStreak}`));
  card.appendChild(statRow);

  const btn = el("button", { class: `btn ${checkedToday ? "btn-ghost" : "btn-primary"} checkin-btn` },
    checkedToday ? "✓ Stayed clean today" : "I stayed clean today");
  if (!checkedToday) {
    btn.addEventListener("click", (e) => {
      STATE = checkInHabit(STATE, h.id);
      celebrate(e.currentTarget, ["#ff6a4d", "#ffc247"]);
      showToast(`Day ${STATE.habits.find(x => x.id === h.id).streak} — keep going.`);
      renderHabits();
    });
  } else {
    btn.disabled = true;
  }
  card.appendChild(btn);

  // reference library or custom copy-for-claude
  if (cat) {
    card.appendChild(renderReferenceLibrary(cat));
  } else {
    const copyBtn = el("button", { class: "btn btn-copy", style: "margin-top:16px;" }, "📋 Copy for Claude");
    copyBtn.addEventListener("click", (e) => {
      const text = `Help me find proven techniques to quit "${h.name}", and explain the real negative effects of this habit.\n\nContext I've noted: ${h.customDescription || h.description || "(no additional context provided)"}\nCurrent frequency: ${h.frequency || "not specified"}`;
      copyToClipboard(text, () => copyBtnFlash(e.currentTarget));
    });
    card.appendChild(copyBtn);
  }

  return card;
}

function renderReferenceLibrary(cat) {
  const wrap = el("div", { class: "reference-library" });
  wrap.appendChild(el("div", { class: "ref-title" }, "Techniques That Work"));
  const techGrid = el("div", { class: "technique-grid" });
  cat.techniques.forEach(t => {
    techGrid.appendChild(el("div", { class: "technique-item" }, [
      el("div", { class: "technique-name" }, t.name),
      el("div", { class: "technique-body" }, t.body)
    ]));
  });
  wrap.appendChild(techGrid);

  wrap.appendChild(el("div", { class: "ref-title", style: "margin-top:18px;" }, "Real Effects"));
  const effGrid = el("div", { class: "effects-grid" });
  const labels = { physical: "Physical", mental: "Mental", financial: "Financial", relational: "Relational" };
  Object.keys(labels).forEach(k => {
    effGrid.appendChild(el("div", { class: "effect-item" }, [
      el("div", { class: "effect-label" }, labels[k]),
      el("div", { class: "effect-body" }, cat.effects[k])
    ]));
  });
  wrap.appendChild(effGrid);
  return wrap;
}

/* ============================================================
   SECTION: DAILY HEALTH ACCOUNTABILITY
   ============================================================ */
function getHealthDay(dateStr) {
  if (!STATE.health.days[dateStr]) STATE.health.days[dateStr] = { checks: {} };
  return STATE.health.days[dateStr];
}

function initHealth() {
  document.getElementById("addHealthItemBtn").addEventListener("click", addHealthItem);
  document.getElementById("newHealthItemInput").addEventListener("keydown", e => { if (e.key === "Enter") addHealthItem(); });
  checkHealthEndOfDay();
}

function addHealthItem() {
  const input = document.getElementById("newHealthItemInput");
  const val = input.value.trim();
  if (!val) return;
  STATE.health.items.push({ id: uid(), name: val });
  input.value = "";
  save(); renderHealth();
}

function checkHealthEndOfDay() {
  const lastTracked = STATE.health._lastSeenDate;
  const today = todayStr();
  if (lastTracked && lastTracked !== today && STATE.health.items.length) {
    const day = STATE.health.days[lastTracked];
    if (day) {
      const total = STATE.health.items.length;
      const done = STATE.health.items.filter(i => day.checks[i.id]).length;
      const missed = STATE.health.items.filter(i => !day.checks[i.id]).map(i => i.name);
      if (missed.length) {
        showToast(`Yesterday: ${done}/${total} done. Missed — ${missed.join(", ")}. That's just information for today, not a verdict.`, 6000);
      }
    }
  }
  STATE.health._lastSeenDate = today;
  save();
}

function renderHealth() {
  const today = todayStr();
  const day = getHealthDay(today);
  const items = STATE.health.items;
  const total = items.length;
  const doneCount = items.filter(i => day.checks[i.id]).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const statRow = document.getElementById("healthStatRow");
  statRow.innerHTML = "";
  statRow.appendChild(statTile("Today", `${pct}%`, "healthPctStat"));
  statRow.appendChild(statTile("Full-Day Streak", `${STATE.health.fullStreak.current}`));
  statRow.appendChild(statTile("Longest Streak", `${STATE.health.fullStreak.longest}`));
  document.getElementById("healthProgressFill").style.width = pct + "%";

  const listWrap = document.getElementById("healthChecklistWrap");
  listWrap.innerHTML = "";
  if (!items.length) {
    listWrap.appendChild(el("div", { class: "empty-hint" }, "Add your own checklist items below — water, vitamins, exercise, whatever matters to you."));
  }
  items.forEach(item => {
    const checked = !!day.checks[item.id];
    const streak = STATE.health.itemStreaks[item.id] || { current: 0, longest: 0 };
    const check = el("div", { class: `check big ${checked ? "checked" : ""}` }, el("span", { html: checkSvg() }));
    check.addEventListener("click", (e) => toggleHealthItem(item, e.currentTarget));
    const del = el("button", { class: "btn-danger-ghost" }, "✕");
    del.addEventListener("click", () => {
      STATE.health.items = STATE.health.items.filter(i => i.id !== item.id);
      delete STATE.health.itemStreaks[item.id];
      save(); renderHealth();
    });
    listWrap.appendChild(el("div", { class: "health-item-row" }, [
      check,
      el("span", { class: "health-item-name" }, item.name),
      el("span", { class: "health-item-streak" }, streak.current > 0 ? `🔥 ${streak.current}` : ""),
      del
    ]));
  });

  renderHealthHistory();
}

function toggleHealthItem(item, anchorEl) {
  const today = todayStr();
  const day = getHealthDay(today);
  const wasChecked = !!day.checks[item.id];
  day.checks[item.id] = !wasChecked;

  STATE.health.itemStreaks[item.id] = STATE.health.itemStreaks[item.id] || { current: 0, longest: 0 };
  const st = STATE.health.itemStreaks[item.id];
  if (!wasChecked) {
    st.current += 1;
    st.longest = Math.max(st.longest, st.current);
    celebrate(anchorEl, ["#2fd98a", "#ffc247"]);
  } else {
    st.current = Math.max(0, st.current - 1);
  }

  // full-day streak check
  const items = STATE.health.items;
  const allDone = items.length > 0 && items.every(i => day.checks[i.id]);
  if (allDone && STATE.health.fullStreak.lastFullDate !== today) {
    STATE.health.fullStreak.current += 1;
    STATE.health.fullStreak.longest = Math.max(STATE.health.fullStreak.longest, STATE.health.fullStreak.current);
    STATE.health.fullStreak.lastFullDate = today;
    save(); renderHealth();
    setTimeout(() => {
      celebrate(document.getElementById("healthProgressFill"), ["#2fd98a", "#ffc247", "#ff6a4d"]);
      showToast("🏆 Full board cleared today. That's the whole list — nice work.");
    }, 150);
    return;
  }
  if (!allDone && STATE.health.fullStreak.lastFullDate === today) {
    // unchecked something after completing the full day — back off the streak increment
    STATE.health.fullStreak.current = Math.max(0, STATE.health.fullStreak.current - 1);
    STATE.health.fullStreak.lastFullDate = null;
  }
  save(); renderHealth();
  flashStat(document.getElementById("healthPctStat"));
}

function renderHealthHistory() {
  const wrap = document.getElementById("healthHistoryWrap");
  wrap.innerHTML = "";
  const dates = Object.keys(STATE.health.days).filter(d => d !== todayStr()).sort().reverse().slice(0, 14);
  if (!dates.length) { wrap.appendChild(el("div", { class: "empty-hint" }, "No past days yet.")); return; }
  const items = STATE.health.items;
  dates.forEach(d => {
    const day = STATE.health.days[d];
    const total = items.length;
    const done = items.filter(i => day.checks[i.id]).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    wrap.appendChild(el("div", { class: "history-row" }, [
      el("span", { class: "history-date" }, formatDateHuman(d)),
      el("div", { class: "progress-track history-bar" }, el("div", { class: "progress-fill", style: `width:${pct}%;` })),
      el("span", { class: "history-frac" }, `${pct}%`)
    ]));
  });
}

/* ============================================================
   INIT
   ============================================================ */
function renderAll() {
  renderPlanner();
  renderHabits();
  renderHealth();
}

function init() {
  initNav();
  initTopBar();
  initGoals();
  initPlannerAdd();
  initHabits();
  initHealth();
  renderAll();
}

init();
