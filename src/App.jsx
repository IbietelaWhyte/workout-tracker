import React, { useState, useEffect } from "react";

const PLAN = {
  "push-legs": {
    label: "Push + Legs",
    emoji: "🏋️",
    color: "from-orange-500 to-red-500",
    accent: "orange",
    exercises: [
      { name: "Barbell Back Squat", sets: 4, reps: "5", notes: "Start ~170–180 lbs" },
      { name: "Barbell Bench Press", sets: 4, reps: "5", notes: "Start ~140–150 lbs" },
      { name: "Overhead Press", sets: 3, reps: "6–8", notes: "Seated or standing" },
      { name: "Hip Thrust", sets: 3, reps: "10–12", notes: "Barbell or machine" },
      { name: "Cable Pull-Through", sets: 3, reps: "12–15", notes: "Hip hinge drill" },
      { name: "Tricep Rope Pushdowns", sets: 3, reps: "10–12", notes: "" },
    ],
  },
  pull: {
    label: "Pull + Accessories",
    emoji: "💪",
    color: "from-blue-500 to-indigo-500",
    accent: "blue",
    exercises: [
      { name: "Barbell Bent-Over Row", sets: 4, reps: "5–6", notes: "Heavy, brace core" },
      { name: "Pull-Ups / Lat Pulldown", sets: 3, reps: "6–8", notes: "" },
      { name: "Seated Cable Row", sets: 3, reps: "10–12", notes: "" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "8–10", notes: "Chest volume" },
      { name: "Leg Press", sets: 3, reps: "10–12", notes: "" },
      { name: "Leg Curl (machine)", sets: 3, reps: "10–12", notes: "" },
      { name: "DB Curl + Hammer Curl", sets: 3, reps: "10–12", notes: "Superset" },
    ],
  },
  endurance: {
    label: "Endurance Class",
    emoji: "🏃",
    color: "from-green-500 to-teal-500",
    accent: "green",
    exercises: [],
  },
  "home-db": {
    label: "Home Dumbbells",
    emoji: "🏠",
    color: "from-purple-500 to-pink-500",
    accent: "purple",
    exercises: [
      { name: "Dumbbell Floor Press", sets: 4, reps: "10–12", notes: "Bench sub at home" },
      { name: "Single-Arm DB Row", sets: 3, reps: "10–12/side", notes: "" },
      { name: "Arnold Press", sets: 3, reps: "10–12", notes: "" },
      { name: "Good Mornings", sets: 3, reps: "12", notes: "Light — neutral back" },
      { name: "Renegade Rows", sets: 3, reps: "8–10", notes: "Core + pull" },
      { name: "DB Romanian Deadlift", sets: 3, reps: "12", notes: "Optional — if back ok" },
    ],
  },
};

const WORKOUT_IDS = Object.keys(PLAN);
const DEFAULT_COLOR = "from-orange-500 to-red-500";

const ACCENT_CLASSES = {
  orange: { check: "bg-orange-500", tag: "bg-orange-100 text-orange-700" },
  blue: { check: "bg-blue-500", tag: "bg-blue-100 text-blue-700" },
  green: { check: "bg-green-500", tag: "bg-green-100 text-green-700" },
  purple: { check: "bg-purple-500", tag: "bg-purple-100 text-purple-700" },
};

const STORAGE_KEY = "workout-tracker-v2";
const LEGACY_STORAGE_KEY = "workout-tracker";
const LEGACY_DAY_MAP = {
  Monday: { workout: "push-legs", offset: 0 },
  Tuesday: { workout: "pull", offset: 1 },
  Wednesday: { workout: "endurance", offset: 2 },
  Friday: { workout: "home-db", offset: 4 },
};

// --- Date helpers (all local time, keys are YYYY-MM-DD) ---
const toKey = (date) => date.toLocaleDateString("en-CA");
const parseKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const getTodayKey = () => toKey(new Date());
const getWeekKey = (dateKey) => {
  const date = parseKey(dateKey);
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  return toKey(date);
};
const formatLong = (key) =>
  parseKey(key).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
const formatShort = (key) =>
  parseKey(key).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

// --- Storage ---
const migrateLegacy = () => {
  const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "{}");
  const migrated = {};
  for (const [weekKey, days] of Object.entries(legacy)) {
    for (const [dayName, data] of Object.entries(days || {})) {
      const mapping = LEGACY_DAY_MAP[dayName];
      if (!mapping) continue;
      const date = parseKey(weekKey);
      date.setDate(date.getDate() + mapping.offset);
      migrated[toKey(date)] = {
        workout: mapping.workout,
        weights: data?.weights || {},
        completed: data?.completed || {},
        note: data?.note || "",
      };
    }
  }
  return migrated;
};

const loadLogs = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    const migrated = migrateLegacy();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return {};
  }
};

const saveLogs = (logs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {}
};

const hasProgress = (session) =>
  !!session &&
  (Object.values(session.weights || {}).some((w) => w !== "" && w != null) ||
    Object.values(session.completed || {}).some(Boolean) ||
    !!session.note?.trim());

export default function App() {
  const [view, setView] = useState("tracker"); // tracker | history
  const [logs, setLogs] = useState(loadLogs);
  const [todayKey, setTodayKey] = useState(getTodayKey);

  // Keep "today" accurate if the app is left open past midnight.
  useEffect(() => {
    const refresh = () => setTodayKey(getTodayKey());
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const commit = (next) => {
    setLogs(next);
    saveLogs(next);
  };

  const session = logs[todayKey];
  const workout = session ? PLAN[session.workout] : null;

  const startWorkout = (id) =>
    commit({ ...logs, [todayKey]: { workout: id, weights: {}, completed: {}, note: "" } });

  const switchWorkout = () => {
    if (hasProgress(session) && !window.confirm("Switch workouts? Today's logged progress will be cleared.")) return;
    const next = { ...logs };
    delete next[todayKey];
    commit(next);
  };

  const updateSession = (patch) => commit({ ...logs, [todayKey]: { ...session, ...patch } });

  const weights = session?.weights || {};
  const completed = session?.completed || {};
  const sessionNote = session?.note || "";

  const updateWeight = (name, val) => updateSession({ weights: { ...weights, [name]: val } });
  const toggleComplete = (name) => updateSession({ completed: { ...completed, [name]: !completed[name] } });
  const updateNote = (val) => updateSession({ note: val });

  const exercises = workout?.exercises || [];
  const doneCount = exercises.filter((e) => completed[e.name]).length;
  const progress = exercises.length > 0 ? Math.round((doneCount / exercises.length) * 100) : 0;
  const ac = workout ? ACCENT_CLASSES[workout.accent] : null;

  // History: newest first, grouped by week (Monday start)
  const historyByWeek = Object.keys(logs)
    .filter((k) => PLAN[logs[k]?.workout])
    .sort((a, b) => b.localeCompare(a))
    .reduce((acc, dateKey) => {
      const wk = getWeekKey(dateKey);
      (acc[wk] ||= []).push(dateKey);
      return acc;
    }, {});
  const historyWeeks = Object.keys(historyByWeek).sort((a, b) => b.localeCompare(a));

  const noteBox = (placeholder) => (
    <textarea
      className="w-full bg-gray-800 rounded-xl p-3 text-sm text-white resize-none outline-none focus:ring-2 ring-gray-600"
      rows={3}
      placeholder={placeholder}
      value={sessionNote}
      onChange={(e) => updateNote(e.target.value)}
    />
  );

  const navButton = (key, label) => (
    <button
      onClick={() => setView(key)}
      className={`text-xs sm:text-sm px-4 py-2 rounded-full font-semibold transition-colors ${view === key ? "bg-white text-gray-900" : "bg-white/20 hover:bg-white/30"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Header */}
      <header className={`bg-gradient-to-r ${workout?.color || DEFAULT_COLOR} py-5 sm:py-7`}>
        <div className="max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight"> Gains 🔥</h1>
            <nav className="flex gap-2">
              {navButton("tracker", "Tracker")}
              {navButton("history", "History")}
            </nav>
          </div>
          <p className="text-white/80 text-sm sm:text-base">
            <span className="whitespace-nowrap">Bench: 185 → 225 lbs</span>
            <span className="mx-2">|</span>
            <span className="whitespace-nowrap">Squat: 225 → 315 lbs</span>
          </p>
        </div>
      </header>

      <main className="max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {view === "tracker" ? (
          !workout ? (
            /* Workout picker */
            <section>
              <p className="text-gray-400 text-sm uppercase tracking-widest font-semibold">Today</p>
              <h2 className="font-bold text-2xl sm:text-3xl mb-1">{formatLong(todayKey)}</h2>
              <p className="text-gray-400 mb-5">What are you training today?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {WORKOUT_IDS.map((id) => {
                  const w = PLAN[id];
                  return (
                    <button
                      key={id}
                      onClick={() => startWorkout(id)}
                      className={`bg-gradient-to-br ${w.color} rounded-2xl p-5 text-left shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 ring-white/70`}
                    >
                      <div className="text-3xl mb-3">{w.emoji}</div>
                      <p className="font-bold text-lg">{w.label}</p>
                      <p className="text-white/80 text-sm">
                        {w.exercises.length > 0 ? `${w.exercises.length} exercises` : "Class session"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : (
            <>
              {/* Session header */}
              <div className="bg-gray-900 rounded-2xl p-4 sm:p-5 mb-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h2 className="font-bold text-lg sm:text-xl">{formatLong(todayKey)}</h2>
                    <p className="text-gray-400 text-sm">{workout.emoji} {workout.label}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={switchWorkout}
                      className="text-xs font-semibold px-3 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700"
                    >
                      Switch workout
                    </button>
                    {exercises.length > 0 && (
                      <span className="text-sm font-semibold text-gray-300">{doneCount}/{exercises.length} done</span>
                    )}
                  </div>
                </div>
                {exercises.length > 0 && (
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${workout.color} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Class-style session (no exercise list) */}
              {exercises.length === 0 && (
                <div className="bg-gray-900 rounded-2xl p-5 sm:p-8 text-center max-w-2xl mx-auto">
                  <div className="text-4xl mb-2">{workout.emoji}</div>
                  <h3 className="font-bold text-lg mb-1">{workout.label} Day</h3>
                  <p className="text-gray-400 text-sm">Your cardio anchor for the week. Show up, push hard, hydrate well.</p>
                  <div className="mt-4 text-left">
                    <p className="text-sm text-gray-400 mb-2">Session note</p>
                    {noteBox("How was class today?")}
                  </div>
                </div>
              )}

              {/* Exercise list */}
              {exercises.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exercises.map((ex) => (
                    <div
                      key={ex.name}
                      className={`bg-gray-900 rounded-2xl p-4 transition-all ${completed[ex.name] ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleComplete(ex.name)}
                          aria-label={`Mark ${ex.name} ${completed[ex.name] ? "incomplete" : "complete"}`}
                          className={`mt-0.5 w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${completed[ex.name] ? `${ac.check} border-transparent` : "border-gray-600 hover:border-gray-400"}`}
                        >
                          {completed[ex.name] && <span className="text-white text-sm">✓</span>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm sm:text-base ${completed[ex.name] ? "line-through text-gray-500" : ""}`}>{ex.name}</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ac.tag}`}>{ex.sets} sets</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ac.tag}`}>{ex.reps} reps</span>
                          </div>
                          {ex.notes && <p className="text-gray-500 text-xs mt-1">{ex.notes}</p>}
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="number"
                              inputMode="decimal"
                              placeholder="Weight (lbs)"
                              value={weights[ex.name] || ""}
                              onChange={(e) => updateWeight(ex.name, e.target.value)}
                              className="bg-gray-800 text-white text-sm rounded-xl px-3 py-2 w-full sm:w-36 outline-none focus:ring-2 ring-gray-600"
                            />
                            <span className="text-gray-500 text-xs">lbs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Session note */}
                  <div className="bg-gray-900 rounded-2xl p-4 md:col-span-2">
                    <p className="text-sm text-gray-400 mb-2">Session note</p>
                    {noteBox("How did this session feel? PRs? Anything to note...")}
                  </div>
                </div>
              )}
            </>
          )
        ) : (
          /* History view */
          <section>
            <h2 className="font-bold text-lg sm:text-xl mb-4">Session History</h2>
            {historyWeeks.length === 0 && (
              <div className="text-center text-gray-500 py-12">No sessions logged yet. Start tracking!</div>
            )}
            {historyWeeks.map((wk) => (
              <div key={wk} className="mb-6">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-2">Week of {formatShort(wk)}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {historyByWeek[wk].map((dateKey) => {
                    const data = logs[dateKey];
                    const p = PLAN[data.workout];
                    const exs = p.exercises;
                    const done = exs.filter((e) => data.completed?.[e.name]).length;
                    return (
                      <div key={dateKey} className="bg-gray-900 rounded-2xl p-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${p.color} text-white`}>{formatShort(dateKey)}</span>
                            <span className="text-gray-400 text-xs">{p.label}</span>
                          </div>
                          {exs.length > 0 && <span className="text-xs text-gray-400 flex-shrink-0">{done}/{exs.length} completed</span>}
                        </div>
                        {exs.filter((e) => data.weights?.[e.name]).map((e) => (
                          <div key={e.name} className="flex justify-between gap-3 text-sm py-1 border-b border-gray-800 last:border-0">
                            <span className="text-gray-300 min-w-0">{e.name}</span>
                            <span className="font-semibold flex-shrink-0">{data.weights[e.name]} lbs</span>
                          </div>
                        ))}
                        {data.note && <p className="text-gray-500 text-xs mt-2 italic break-words">"{data.note}"</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
