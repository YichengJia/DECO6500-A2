import React, { useEffect, useMemo, useRef, useState } from "react";

// =============================================
// App.tsx — Single-file visual, animated ADHD helper
// - No external UI libs; pure React + inline <style> CSS
// - English-only comments (per user request)
// - Rich visuals: animated gradient, glass cards, SVG charts
// - Features: Focus Timer (Pomodoro), Tasks with progress,
//             Mood check-ins (sparkline), Breathing coach,
//             Distraction logger (bar viz), Visual day timeline,
//             Theme (Light/Dark/High-Contrast) + Reduce Motion
// - LocalStorage persistence for user data and settings
// =============================================

// ---------- Types ----------
interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  done: boolean;
  minutes: number; // estimate
}

interface MoodEntry {
  t: number; // timestamp
  mood: 1 | 2 | 3 | 4 | 5; // 1 low, 5 high
  energy: 1 | 2 | 3 | 4 | 5;
}

// ---------- Small utils ----------
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const formatMMSS = (sec: number) => {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

// ---------- Local storage hooks ----------
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

// ---------- Confetti (simple, no deps) ----------
function burstConfetti(root: HTMLElement, reduceMotion: boolean) {
  if (reduceMotion) return;
  const n = 36;
  for (let i = 0; i < n; i++) {
    const el = document.createElement("span");
    el.className = "confetti";
    const hue = Math.floor(360 * (i / n));
    el.style.setProperty("--hue", `${hue}`);
    el.style.left = `${50 + (Math.random() * 20 - 10)}%`;
    el.style.top = `50%`;
    root.appendChild(el);
    // schedule cleanup
    setTimeout(() => root.contains(el) && root.removeChild(el), 1400);
  }
}

// ---------- SVG Gauge ----------
function CircularProgress({
  progress, // 0..1
  size = 240,
  stroke = 14,
  palette = "var(--brand-400)"
}: {
  progress: number;
  size?: number;
  stroke?: number;
  palette?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * clamp(progress, 0, 1);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <defs>
        <linearGradient id="gauge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand-300)" />
          <stop offset="100%" stopColor="var(--brand-500)" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="var(--surface-3)"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={palette === "brand" ? "url(#gauge)" : palette}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${dash} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

// ---------- Sparkline (mood history) ----------
function Sparkline({ data, width = 220, height = 48, color = "var(--brand-400)" }: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const max = Math.max(1, ...data);
  const min = Math.min(0, ...data);
  const points = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * (width - 8) + 4;
    const y = height - 6 - ((v - min) / Math.max(1, max - min)) * (height - 12);
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        points={points.join(" ")}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------- BarViz (distraction counts by type) ----------
function BarViz({ series }: { series: { label: string; value: number }[] }) {
  const max = Math.max(1, ...series.map((s) => s.value));
  return (
    <div className="bars">
      {series.map((s) => (
        <div className="bar" key={s.label} aria-label={`${s.label} ${s.value}`}>
          <div className="barFill" style={{ height: `${(s.value / max) * 100}%` }} />
          <span className="barLabel">{s.label}</span>
          <span className="barValue">{s.value}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Breathing Coach ----------
function BreathingCoach({ enabled, reduceMotion }: { enabled: boolean; reduceMotion: boolean }) {
  if (!enabled) return null;
  return (
    <div className="card" role="region" aria-label="Breathing coach">
      <h3>Breathing Coach</h3>
      <p className="muted">Follow the circle: inhale → hold → exhale</p>
      <div className={`breathWrap ${reduceMotion ? "noMotion" : ""}`}>
        <div className="breathCircle" />
      </div>
      <div className="breathGuide">
        <span>Inhale 4s</span>
        <span>Hold 4s</span>
        <span>Exhale 4s</span>
      </div>
    </div>
  );
}

// ---------- Visual Day Timeline ----------
function Timeline({ blocks }: { blocks: { label: string; start: string; end: string; color: string }[] }) {
  // expects HH:MM 24h strings
  const toMins = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  const dayTotal = 24 * 60;
  return (
    <div className="timeline" role="list" aria-label="Today schedule timeline">
      {blocks.map((b) => {
        const l = (toMins(b.start) / dayTotal) * 100;
        const w = ((toMins(b.end) - toMins(b.start)) / dayTotal) * 100;
        return (
          <div className="timeBlock" style={{ left: `${l}%`, width: `${w}%`, background: b.color }} key={b.label} role="listitem">
            <span>{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Main App ----------
export default function App() {
  // Theme & UX settings
  const [theme, setTheme] = useLocalStorage<"light" | "dark" | "hc">("set.theme", "dark");
  const [reduceMotion, setReduceMotion] = useLocalStorage<boolean>("set.reduceMotion", false);

  // Tasks
  const [tasks, setTasks] = useLocalStorage<Task[]>("data.tasks", [
    { id: uid(), title: "Read A2 task sheet (10 min)", priority: "high", done: false, minutes: 10 },
    { id: uid(), title: "Plan Systemic Eval v1", priority: "medium", done: false, minutes: 25 },
    { id: uid(), title: "Refactor timer logic", priority: "low", done: false, minutes: 15 }
  ]);

  // Focus timer (Pomodoro-like)
  type Phase = "focus" | "short" | "long";
  const [phase, setPhase] = useLocalStorage<Phase>("timer.phase", "focus");
  const [lengths, setLengths] = useLocalStorage("timer.lengths", { focus: 25 * 60, short: 5 * 60, long: 15 * 60 });
  const [remaining, setRemaining] = useLocalStorage<number>("timer.remaining", lengths[phase]);
  const [running, setRunning] = useLocalStorage<boolean>("timer.running", false);
  const tickRef = useRef<number | null>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  // Mood + energy check-ins
  const [moods, setMoods] = useLocalStorage<MoodEntry[]>("data.moods", []);

  // Distraction logger
  const [distractions, setDistractions] = useLocalStorage<{ [k: string]: number }>("data.distractions", {
    phone: 0,
    chat: 0,
    snack: 0,
    noise: 0
  });

  // Timeline sample blocks
  const blocks = useMemo(() => [
    { label: "Class", start: "09:00", end: "10:30", color: "var(--brand-500)" },
    { label: "Focus", start: "11:00", end: "12:00", color: "var(--ok-500)" },
    { label: "Break", start: "12:00", end: "12:30", color: "var(--warn-500)" },
    { label: "Prototype", start: "13:00", end: "15:00", color: "var(--brand-400)" }
  ], []);

  // Persist remaining when phase changes
  useEffect(() => {
    if (remaining > lengths[phase]) setRemaining(lengths[phase]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, lengths]);

  // Timer loop
  useEffect(() => {
    if (!running) {
      if (tickRef.current) cancelAnimationFrame(tickRef.current);
      tickRef.current = null;
      return;
    }
    let last = performance.now();
    const loop = (t: number) => {
      const dt = t - last;
      if (dt >= 1000) {
        setRemaining((r) => {
          const next = r - Math.floor(dt / 1000);
          if (next <= 0) {
            // complete phase
            setRunning(false);
            setRemaining(0);
            // confetti burst
            if (confettiRef.current) burstConfetti(confettiRef.current, reduceMotion);
          }
          return Math.max(0, next);
        });
        last = t;
      }
      tickRef.current = requestAnimationFrame(loop);
    };
    tickRef.current = requestAnimationFrame(loop);
    return () => {
      if (tickRef.current) cancelAnimationFrame(tickRef.current);
      tickRef.current = null;
    };
  }, [running, reduceMotion, setRemaining]);

  // Derived
  const total = lengths[phase];
  const pct = total ? 1 - remaining / total : 0;
  const tasksDone = tasks.filter((t) => t.done).length;
  const tasksPct = tasks.length ? (tasksDone / tasks.length) : 0;

  // Handlers — Tasks
  function addTask(title: string) {
    if (!title.trim()) return;
    setTasks((prev) => [{ id: uid(), title, priority: "medium", done: false, minutes: 15 }, ...prev]);
  }
  function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }
  function delTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  // Handlers — Timer
  function switchPhase(next: Phase) {
    setPhase(next);
    setRemaining(lengths[next]);
    setRunning(false);
  }
  function resetTimer() {
    setRemaining(lengths[phase]);
    setRunning(false);
  }

  // Handlers — Mood
  function addMood(mood: MoodEntry["mood"], energy: MoodEntry["energy"]) {
    const entry: MoodEntry = { t: Date.now(), mood, energy };
    setMoods((prev) => [...prev.slice(-49), entry]); // keep last 50
  }

  // Handlers — Distractions
  function bump(label: keyof typeof distractions) {
    setDistractions((d) => ({ ...d, [label]: d[label] + 1 }));
  }

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="appRoot">
      {/* Global styles (self-contained) */}
      <style>{globalStyles}</style>
      <div className="bg" aria-hidden />

      <header className="topbar">
        <div className="brand">
          <span className="logo">⏳</span>
          <strong>ADHD Focus Studio</strong>
        </div>
        <div className="spacer" />
        <div className="toggles" role="group" aria-label="Display settings">
          <label className="chip">
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
            />
            <span>Reduce Motion</span>
          </label>
          <select
            aria-label="Theme"
            className="select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            title="Theme"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="hc">High Contrast</option>
          </select>
        </div>
      </header>

      <main className="grid">
        {/* Left: Focus Timer */}
        <section className="card focus" aria-label="Focus timer">
          <div className="phaseTabs" role="tablist" aria-label="Timer phases">
            {(["focus", "short", "long"] as Phase[]).map((p) => (
              <button
                key={p}
                role="tab"
                aria-selected={phase === p}
                className={`tab ${phase === p ? "active" : ""}`}
                onClick={() => switchPhase(p)}
              >
                {p === "focus" ? "Focus" : p === "short" ? "Short Break" : "Long Break"}
              </button>
            ))}
          </div>

          <div className="gaugeWrap" ref={confettiRef}>
            <CircularProgress progress={pct} size={260} stroke={16} palette="brand" />
            <div className="gaugeCenter">
              <div className="time" aria-live="polite">{formatMMSS(remaining)}</div>
              <div className="subtime">{phase === "focus" ? "Stay on one small task" : "Relax your eyes & shoulders"}</div>
              <div className="controls">
                <button className="btn primary" onClick={() => setRunning((r) => !r)}>
                  {running ? "Pause" : remaining === 0 ? "Start" : "Start"}
                </button>
                <button className="btn" onClick={resetTimer}>Reset</button>
              </div>
            </div>
          </div>

          <div className="lenControls">
            {(["focus", "short", "long"] as Phase[]).map((p) => (
              <label key={p} className="len">
                <span>{p === "focus" ? "Focus" : p === "short" ? "Short" : "Long"}</span>
                <input
                  type="range"
                  min={60}
                  max={60 * (p === "focus" ? 60 : 30)}
                  step={60}
                  value={lengths[p]}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    const next = { ...lengths, [p]: v };
                    setLengths(next);
                    if (phase === p) setRemaining(v);
                  }}
                />
                <em>{Math.round(lengths[p] / 60)} min</em>
              </label>
            ))}
          </div>
        </section>

        {/* Right: Tasks + Progress */}
        <section className="card tasks" aria-label="Tasks">
          <h3>Task Board</h3>
          <p className="muted">Keep it tiny: add 10–25 min tasks. Tap to complete.</p>
          <TaskComposer onAdd={addTask} />
          <div className="taskList" role="list">
            {tasks.map((t) => (
              <div className={`task ${t.done ? "done" : ""}`} key={t.id} role="listitem">
                <button className="chk" aria-label={t.done ? "Mark as not done" : "Mark as done"} onClick={() => toggleTask(t.id)}>
                  {t.done ? "✔" : "○"}
                </button>
                <div className="taskMain">
                  <div className="taskTitle">{t.title}</div>
                  <div className="taskMeta">
                    <span className={`pill ${t.priority}`}>{t.priority}</span>
                    <span className="pill ghost">{t.minutes} min</span>
                  </div>
                </div>
                <button className="del" aria-label="Delete" onClick={() => delTask(t.id)}>×</button>
              </div>
            ))}
          </div>
          <div className="progressBar" aria-label="Task progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(tasksPct * 100)}>
            <div className="progressFill" style={{ width: `${tasksPct * 100}%` }} />
          </div>
        </section>

        {/* Mood & Energy */}
        <section className="card" aria-label="Mood and energy">
          <h3>Mood & Energy Check‑in</h3>
          <div className="moodRow">
            <div className="moodBtns">
              {[1, 2, 3, 4, 5].map((m) => (
                <button key={m} className="face" onClick={() => addMood(m as 1|2|3|4|5, 3 as 1|2|3|4|5)} title={`Mood ${m}`}>
                  <span aria-hidden>{["😟","🙁","😐","🙂","😄"][m-1]}</span>
                </button>
              ))}
            </div>
            <div className="spark">
              <Sparkline data={moods.map((x) => x.mood)} />
              <div className="muted tiny">Last {moods.length} check‑ins</div>
            </div>
          </div>
        </section>

        {/* Distraction logger */}
        <section className="card" aria-label="Distraction logger">
          <h3>Distraction Logger</h3>
          <div className="chips">
            {Object.keys(distractions).map((k) => (
              <button key={k} className="chipBtn" onClick={() => bump(k as keyof typeof distractions)}>
                + {k}
              </button>
            ))}
          </div>
          <BarViz series={Object.entries(distractions).map(([label, value]) => ({ label, value }))} />
        </section>

        {/* Timeline & Breathing */}
        <section className="card" aria-label="Today plan">
          <h3>Today Timeline</h3>
          <Timeline blocks={blocks} />
          <BreathingCoach enabled={true} reduceMotion={reduceMotion} />
        </section>
      </main>

      <footer className="foot">
        <div className="muted tiny">Tip: Press <kbd>Space</kbd> to start/pause the timer.</div>
        <div className="spacer" />
        <div className="muted tiny">© 2025 ADHD Focus Studio</div>
      </footer>

      {/* Keyboard shortcut */}
      <Keybindings running={running} setRunning={setRunning} />
    </div>
  );
}

// ---------- Task Composer ----------
function TaskComposer({ onAdd }: { onAdd: (title: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(val);
        setVal("");
      }}
    >
      <input
        className="input"
        placeholder="Add small task…"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        aria-label="New task"
      />
      <button className="btn primary" type="submit">Add</button>
    </form>
  );
}

// ---------- Keybindings ----------
function Keybindings({ running, setRunning }: { running: boolean; setRunning: (f: (x: boolean) => boolean) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setRunning((r) => !r);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setRunning]);
  return null;
}

// ---------- Global CSS ----------
const globalStyles = `
:root {
  --bg-1: #0b1020; /* dark gradient base */
  --bg-2: #1a2240;
  --surface-1: rgba(255,255,255,.06);
  --surface-2: rgba(255,255,255,.12);
  --surface-3: rgba(255,255,255,.18);
  --text-1: #eef2ff;
  --text-2: #c6d0f7;
  --brand-300: #7aa2ff;
  --brand-400: #5183ff;
  --brand-500: #2f5bff;
  --ok-500: #22c55e;
  --warn-500: #f59e0b;
  --bad-500: #ef4444;
}
:root[data-theme="light"] {
  --bg-1: #f7f8fc;
  --bg-2: #e9ecfb;
  --surface-1: rgba(15,23,42,.06);
  --surface-2: rgba(15,23,42,.1);
  --surface-3: rgba(15,23,42,.16);
  --text-1: #0b1020;
  --text-2: #2b3356;
  --brand-300: #6b8cff;
  --brand-400: #3d6bff;
  --brand-500: #1d4fff;
}
:root[data-theme="hc"] {
  --bg-1: #000;
  --bg-2: #000;
  --surface-1: #111;
  --surface-2: #161616;
  --surface-3: #1c1c1c;
  --text-1: #fff;
  --text-2: #d6d6d6;
  --brand-300: #fff;
  --brand-400: #fff;
  --brand-500: #fff;
}
* { box-sizing: border-box; }
html, body, #root { height: 100%; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, Noto Sans, "Apple Color Emoji", "Segoe UI Emoji"; color: var(--text-1); background: var(--bg-1); }

.appRoot { isolation: isolate; min-height: 100%; position: relative; }
.bg { position: fixed; inset: 0; background:
  radial-gradient(60vw 60vw at 10% 10%, var(--brand-500)10%, transparent 60%),
  radial-gradient(50vw 50vw at 90% 20%, #0ea5e9 12%, transparent 60%),
  radial-gradient(40vw 40vw at 50% 90%, #22c55e 10%, transparent 60%),
  linear-gradient(180deg, var(--bg-1), var(--bg-2));
  filter: saturate(.9) hue-rotate(0deg);
  animation: hue 24s linear infinite;
  z-index: -1;
}
@keyframes hue { to { filter: saturate(1) hue-rotate(360deg); } }

.topbar { position: sticky; top: 0; display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: linear-gradient(180deg, rgba(0,0,0,.25), transparent); backdrop-filter: blur(8px); border-bottom: 1px solid var(--surface-2);
}
.brand { display: flex; align-items: center; gap: 10px; font-weight: 700; letter-spacing: .3px; }
.logo { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background: var(--surface-2); }
.spacer { flex: 1; }
.toggles { display: flex; align-items: center; gap: 10px; }
.select { appearance: none; background: var(--surface-1); color: var(--text-1); border: 1px solid var(--surface-2); border-radius: 10px; padding: 8px 12px; }
.chip { display: inline-flex; align-items: center; gap: 8px; background: var(--surface-1); border: 1px solid var(--surface-2); padding: 6px 10px; border-radius: 999px; cursor: pointer; }
.chip input { accent-color: var(--brand-500); }

.grid { display: grid; grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr); gap: 16px; padding: 18px; max-width: 1200px; margin: 0 auto; }
@media (max-width: 1000px) { .grid { grid-template-columns: 1fr; } }

.card { background: linear-gradient(180deg, var(--surface-1), transparent); border: 1px solid var(--surface-2); border-radius: 18px; padding: 16px; box-shadow: 0 30px 80px rgba(0,0,0,.18) inset, 0 8px 24px rgba(0,0,0,.25);
}
.card h3 { margin: 4px 0 8px; font-size: 18px; letter-spacing: .2px; }
.muted { color: var(--text-2); }
.tiny { font-size: 12px; }

/* Focus timer */
.focus { grid-row: span 2; display: grid; gap: 8px; align-content: start; }
.phaseTabs { display: inline-flex; gap: 6px; padding: 4px; border-radius: 12px; background: var(--surface-1); border: 1px solid var(--surface-2); }
.tab { border: 0; background: transparent; color: var(--text-2); padding: 8px 12px; border-radius: 8px; cursor: pointer; }
.tab.active { background: var(--surface-2); color: var(--text-1); }
.gaugeWrap { position: relative; display: grid; place-items: center; padding: 8px; }
.gaugeCenter { position: absolute; display: grid; place-items: center; gap: 6px; }
.time { font-size: 44px; font-weight: 700; letter-spacing: 1px; }
.subtime { font-size: 13px; color: var(--text-2); }
.controls { display: flex; gap: 8px; margin-top: 6px; }
.btn { border: 1px solid var(--surface-2); background: var(--surface-1); color: var(--text-1); padding: 8px 12px; border-radius: 12px; cursor: pointer; }
.btn.primary { background: linear-gradient(180deg, var(--brand-400), var(--brand-500)); border-color: transparent; color: white; }
.lenControls { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.len { display: grid; gap: 6px; background: var(--surface-1); border: 1px solid var(--surface-2); padding: 8px; border-radius: 12px; }
.len span { font-weight: 600; }
.len em { font-style: normal; color: var(--text-2); font-size: 12px; }

/* Tasks */
.tasks .taskList { display: grid; gap: 8px; margin-top: 8px; }
.task { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; padding: 8px; border-radius: 12px; background: var(--surface-1); border: 1px solid var(--surface-2); }
.task.done { opacity: .7; text-decoration: none; }
.taskTitle { font-weight: 600; }
.taskMeta { display: flex; gap: 6px; margin-top: 4px; }
.pill { padding: 2px 8px; border-radius: 999px; background: var(--surface-2); border: 1px solid var(--surface-3); font-size: 12px; text-transform: capitalize; }
.pill.ghost { background: transparent; }
.pill.high { background: color-mix(in oklab, var(--bad-500) 30%, transparent); border-color: var(--bad-500); }
.pill.medium { background: color-mix(in oklab, var(--warn-500) 30%, transparent); border-color: var(--warn-500); }
.pill.low { background: color-mix(in oklab, var(--ok-500) 30%, transparent); border-color: var(--ok-500); }
.chk { width: 28px; height: 28px; border-radius: 999px; border: 1px solid var(--surface-3); background: var(--surface-1); color: var(--text-1); cursor: pointer; }
.del { width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--surface-3); background: var(--surface-1); color: var(--text-1); cursor: pointer; }
.composer { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-top: 6px; }
.input { border: 1px solid var(--surface-2); background: var(--surface-1); color: var(--text-1); padding: 10px 12px; border-radius: 12px; }
.progressBar { height: 10px; background: var(--surface-1); border: 1px solid var(--surface-2); border-radius: 999px; overflow: hidden; margin-top: 12px; }
.progressFill { height: 100%; background: linear-gradient(90deg, var(--ok-500), var(--brand-500)); }

/* Mood */
.moodRow { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 12px; }
.moodBtns { display: flex; gap: 6px; }
.face { width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--surface-2); background: var(--surface-1); color: #fff; font-size: 20px; cursor: pointer; }
.spark { display: grid; justify-items: start; }

/* Bars */
.bars { display: grid; grid-auto-flow: column; gap: 10px; align-items: end; height: 120px; }
.bar { position: relative; width: 60px; height: 100%; background: var(--surface-1); border: 1px solid var(--surface-2); border-radius: 12px; display: grid; align-content: end; justify-items: center; overflow: hidden; }
.barFill { width: 100%; background: linear-gradient(180deg, var(--brand-400), var(--brand-500)); border-radius: 12px 12px 0 0; }
.barLabel { position: absolute; top: 6px; font-size: 12px; color: var(--text-2); text-transform: capitalize; }
.barValue { font-weight: 700; margin-bottom: 6px; }

/* Timeline */
.timeline { position: relative; height: 52px; border-radius: 14px; border: 1px solid var(--surface-2); background: var(--surface-1); overflow: clip; }
.timeBlock { position: absolute; top: 0; bottom: 0; display: grid; place-items: center start; padding-inline: 8px; color: #fff; font-size: 12px; font-weight: 700; mix-blend-mode: screen; }
.timeBlock span { text-shadow: 0 1px 4px rgba(0,0,0,.4); }

/* Breathing */
.breathWrap { display: grid; place-items: center; margin-top: 10px; }
.breathCircle { width: 120px; height: 120px; border-radius: 999px; border: 6px solid var(--brand-400); box-shadow: 0 0 40px color-mix(in oklab, var(--brand-500) 50%, transparent); animation: breathe 12s ease-in-out infinite; }
@keyframes breathe { 0%{ transform: scale(0.9);} 33%{ transform: scale(1.05);} 66%{ transform: scale(1.05);} 100%{ transform: scale(0.9);} }
.noMotion .breathCircle { animation: none; }
.breathGuide { display: flex; gap: 10px; justify-content: center; margin-top: 6px; color: var(--text-2); font-size: 12px; }

/* Confetti */
.confetti { position: absolute; width: 8px; height: 14px; background: hsl(var(--hue) 90% 60%); left: 50%; top: 50%; transform: translate(-50%, -50%) rotate(0); border-radius: 2px; animation: fall .9s ease-out forwards, spin .9s linear forwards; }
@keyframes fall { to { transform: translate(calc(-50% + (var(--sx,0px))), 220px) rotate(0); opacity: 0; } }
@keyframes spin { from { rotate: 0deg; } to { rotate: 360deg; } }

.foot { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-top: 1px solid var(--surface-2); background: linear-gradient(0deg, rgba(0,0,0,.25), transparent); }
kbd { background: var(--surface-1); border: 1px solid var(--surface-2); padding: 2px 6px; border-radius: 6px; }
`;
