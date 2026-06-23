import React, { useState, useEffect } from "react";

const PLAN = {
  Monday: {
    label: "Push + Legs",
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
  Tuesday: {
    label: "Pull + Accessories",
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
  Wednesday: {
    label: "Endurance Class",
    color: "from-green-500 to-teal-500",
    accent: "green",
    exercises: [],
  },
  Friday: {
    label: "Home Dumbbells",
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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Friday"];

const getTodayKey = () => {
  const d = new Date().toLocaleDateString("en-CA");
  return d;
};

const getWeekKey = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toLocaleDateString("en-CA");
};

export default function App() {
  const [activeDay, setActiveDay] = useState("Monday");
  const [view, setView] = useState("tracker"); // tracker | history
  const [weights, setWeights] = useState({});
  const [completed, setCompleted] = useState({});
  const [logs, setLogs] = useState({});
  const [sessionNote, setSessionNote] = useState("");
  const weekKey = getWeekKey();
  const todayKey = getTodayKey();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("workout-tracker") || "{}");
      setLogs(saved);
      if (saved[weekKey]?.[activeDay]) {
        setWeights(saved[weekKey][activeDay].weights || {});
        setCompleted(saved[weekKey][activeDay].completed || {});
        setSessionNote(saved[weekKey][activeDay].note || "");
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("workout-tracker") || "{}");
      if (saved[weekKey]?.[activeDay]) {
        setWeights(saved[weekKey][activeDay].weights || {});
        setCompleted(saved[weekKey][activeDay].completed || {});
        setSessionNote(saved[weekKey][activeDay].note || "");
      } else {
        setWeights({});
        setCompleted({});
        setSessionNote("");
      }
    } catch {
      setWeights({});
      setCompleted({});
      setSessionNote("");
    }
  }, [activeDay]);

  const save = (newWeights, newCompleted, newNote) => {
    try {
      const saved = JSON.parse(localStorage.getItem("workout-tracker") || "{}");
      if (!saved[weekKey]) saved[weekKey] = {};
      saved[weekKey][activeDay] = {
        weights: newWeights,
        completed: newCompleted,
        note: newNote,
        date: todayKey,
      };
      localStorage.setItem("workout-tracker", JSON.stringify(saved));
      setLogs(saved);
    } catch {}
  };

  const updateWeight = (name, val) => {
    const next = { ...weights, [name]: val };
    setWeights(next);
    save(next, completed, sessionNote);
  };

  const toggleComplete = (name) => {
    const next = { ...completed, [name]: !completed[name] };
    setCompleted(next);
    save(weights, next, sessionNote);
  };

  const updateNote = (val) => {
    setSessionNote(val);
    save(weights, completed, val);
  };

  const day = PLAN[activeDay];
  const exercises = day.exercises;
  const doneCount = exercises.filter(e => completed[e.name]).length;
  const progress = exercises.length > 0 ? Math.round((doneCount / exercises.length) * 100) : 0;

  const accentClasses = {
    orange: { ring: "ring-orange-400", check: "bg-orange-500", tag: "bg-orange-100 text-orange-700" },
    blue: { ring: "ring-blue-400", check: "bg-blue-500", tag: "bg-blue-100 text-blue-700" },
    green: { ring: "ring-green-400", check: "bg-green-500", tag: "bg-green-100 text-green-700" },
    purple: { ring: "ring-purple-400", check: "bg-purple-500", tag: "bg-purple-100 text-purple-700" },
  };
  const ac = accentClasses[day.accent];

  // History view
  const historyWeeks = Object.keys(logs).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Header */}
      <div className={`bg-gradient-to-r ${day.color} px-4 py-5`}>
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold tracking-tight">Scorched Gains 🔥</h1>
            <div className="flex gap-2">
              <button onClick={() => setView("tracker")} className={`text-xs px-3 py-1 rounded-full font-semibold ${view === "tracker" ? "bg-white text-gray-900" : "bg-white/20"}`}>Tracker</button>
              <button onClick={() => setView("history")} className={`text-xs px-3 py-1 rounded-full font-semibold ${view === "history" ? "bg-white text-gray-900" : "bg-white/20"}`}>History</button>
            </div>
          </div>
          <p className="text-white/80 text-sm">Bench: 185 → 225 lbs &nbsp;|&nbsp; Squat: 225 → 315 lbs</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4">
        {view === "tracker" ? (
          <>
            {/* Day selector */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {DAYS.map(d => (
                <button
                  key={d}
                  onClick={() => setActiveDay(d)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeDay === d ? `bg-gradient-to-r ${PLAN[d].color} text-white shadow-lg` : "bg-gray-800 text-gray-400"}`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Day header */}
            <div className="bg-gray-900 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="font-bold text-lg">{activeDay}</h2>
                  <p className="text-gray-400 text-sm">{day.label}</p>
                </div>
                {exercises.length > 0 && (
                  <span className="text-sm font-semibold text-gray-300">{doneCount}/{exercises.length} done</span>
                )}
              </div>
              {exercises.length > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${day.color} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Wednesday special */}
            {activeDay === "Wednesday" && (
              <div className="bg-gray-900 rounded-2xl p-5 text-center">
                <div className="text-4xl mb-2">🏃</div>
                <h3 className="font-bold text-lg mb-1">Endurance Class Day</h3>
                <p className="text-gray-400 text-sm">Your cardio anchor for the week. Show up, push hard, hydrate well.</p>
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Session note</p>
                  <textarea
                    className="w-full bg-gray-800 rounded-xl p-3 text-sm text-white resize-none outline-none"
                    rows={3}
                    placeholder="How was class today?"
                    value={sessionNote}
                    onChange={e => updateNote(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Exercise list */}
            {exercises.length > 0 && (
              <div className="space-y-3">
                {exercises.map((ex) => (
                  <div
                    key={ex.name}
                    className={`bg-gray-900 rounded-2xl p-4 transition-all ${completed[ex.name] ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleComplete(ex.name)}
                        className={`mt-0.5 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${completed[ex.name] ? `${ac.check} border-transparent` : "border-gray-600"}`}
                      >
                        {completed[ex.name] && <span className="text-white text-xs">✓</span>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-semibold text-sm ${completed[ex.name] ? "line-through text-gray-500" : ""}`}>{ex.name}</p>
                        </div>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ac.tag}`}>{ex.sets} sets</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ac.tag}`}>{ex.reps} reps</span>
                        </div>
                        {ex.notes && <p className="text-gray-500 text-xs mt-1">{ex.notes}</p>}
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Weight (lbs)"
                            value={weights[ex.name] || ""}
                            onChange={e => updateWeight(ex.name, e.target.value)}
                            className="bg-gray-800 text-white text-sm rounded-xl px-3 py-1.5 w-36 outline-none focus:ring-2 ring-gray-600"
                          />
                          <span className="text-gray-500 text-xs">lbs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Session note */}
                <div className="bg-gray-900 rounded-2xl p-4">
                  <p className="text-sm text-gray-400 mb-2">Session note</p>
                  <textarea
                    className="w-full bg-gray-800 rounded-xl p-3 text-sm text-white resize-none outline-none"
                    rows={3}
                    placeholder="How did this session feel? PRs? Anything to note..."
                    value={sessionNote}
                    onChange={e => updateNote(e.target.value)}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          /* History view */
          <div>
            <h2 className="font-bold text-lg mb-4">Session History</h2>
            {historyWeeks.length === 0 && (
              <div className="text-center text-gray-500 py-12">No sessions logged yet. Start tracking!</div>
            )}
            {historyWeeks.map(wk => (
              <div key={wk} className="mb-6">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-2">Week of {wk}</p>
                {Object.entries(logs[wk]).map(([day, data]) => {
                  const p = PLAN[day];
                  const exs = p.exercises;
                  const done = exs.filter(e => data.completed?.[e.name]).length;
                  return (
                    <div key={day} className="bg-gray-900 rounded-2xl p-4 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${p.color} text-white`}>{day}</span>
                          <span className="text-gray-400 text-xs ml-2">{p.label}</span>
                        </div>
                        {exs.length > 0 && <span className="text-xs text-gray-400">{done}/{exs.length} completed</span>}
                      </div>
                      {exs.filter(e => data.weights?.[e.name]).map(e => (
                        <div key={e.name} className="flex justify-between text-sm py-1 border-b border-gray-800 last:border-0">
                          <span className="text-gray-300">{e.name}</span>
                          <span className="font-semibold">{data.weights[e.name]} lbs</span>
                        </div>
                      ))}
                      {data.note && <p className="text-gray-500 text-xs mt-2 italic">"{data.note}"</p>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}