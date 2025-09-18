import React, { useEffect, useMemo, useRef, useState } from "react";
import TextToSpeech from "./components/TextToSpeech";
import BionicReader from "./components/BionicReader";
import ReadingGuide from "./components/ReadingGuide";
import BackgroundNoise from "./components/BackgroundNoise";
import AccessibilityPanel from "./components/AccessibilityPanel";
import DocumentReader from "./components/DocumentReader";

// =============================================
// Enhanced App.tsx — ADHD/Attention Deficit Helper
// - Includes Text-to-Speech, Bionic Reading, Reading Guide
// - Background noise for focus, Accessibility controls
// - All original features preserved
// =============================================

// ---------- Types ----------
interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  done: boolean;
  minutes: number;
}

interface MoodEntry {
  t: number;
  mood: 1 | 2 | 3 | 4 | 5;
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

// ---------- Confetti ----------
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
    setTimeout(() => root.contains(el) && root.removeChild(el), 1400);
  }
}

// ---------- SVG Gauge ----------
function CircularProgress({
  progress,
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
  const c = Math.PI * r * 2;
  const offset = c - progress * c;

  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
      <circle
        cx={size/2}
        cy={size/2}
        r={r}
        fill="none"
        stroke={palette === "brand" ? "var(--brand-400)" : palette}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dashoffset 0.5s" }}
      />
    </svg>
  );
}

// ---------- Mood Chart ----------
function MoodSparkline({ moods }: { moods: MoodEntry[] }) {
  if (moods.length < 2) return <div className="muted tiny">Not enough data</div>;

  const w = 280, h = 60;
  const points = moods.slice(-20).map((m, i, arr) => ({
    x: (i / (arr.length - 1)) * (w - 20) + 10,
    y: h - 10 - ((m.mood - 1) / 4) * (h - 20)
  }));

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <svg width={w} height={h}>
      <path d={pathData} fill="none" stroke="var(--brand-400)" strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--brand-400)" />
      ))}
    </svg>
  );
}

// ---------- Distraction Viz ----------
function DistractionBars({ data }: { data: { [k: string]: number } }) {
  const max = Math.max(...Object.values(data), 1);

  return (
    <div className="bars">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="bar">
          <div className="barFill" style={{ height: `${(v / max) * 60}px` }}>
            <span>{v}</span>
          </div>
          <span className="barLabel">{k}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Breathing Coach ----------
function BreathingCoach({ enabled, reduceMotion }: { enabled: boolean; reduceMotion: boolean }) {
  if (!enabled) return null;

  return (
    <div className="breathing">
      <div className={`breathOuter ${reduceMotion ? "noMotion" : ""}`}>
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

// ---------- Timeline ----------
function Timeline({ blocks }: { blocks: { label: string; start: string; end: string; color: string }[] }) {
  const toMins = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  const dayTotal = 24 * 60;

  return (
    <div className="timeline" role="list">
      {blocks.map((b) => {
        const l = (toMins(b.start) / dayTotal) * 100;
        const w = ((toMins(b.end) - toMins(b.start)) / dayTotal) * 100;
        return (
          <div className="timeBlock" style={{ left: `${l}%`, width: `${w}%`, background: b.color }} key={b.label}>
            <span>{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Task Composer ----------
function TaskComposer({ onAdd }: { onAdd: (title: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <form className="composer" onSubmit={(e) => {
      e.preventDefault();
      onAdd(val);
      setVal("");
    }}>
      <input className="input" placeholder="Add small task…" value={val} onChange={(e) => setVal(e.target.value)} />
      <button className="btn primary" type="submit">Add</button>
    </form>
  );
}

// ---------- Keybindings ----------
function Keybindings({ running, setRunning }: { running: boolean; setRunning: (f: (x: boolean) => boolean) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        setRunning((r) => !r);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setRunning]);
  return null;
}

// ---------- Main App ----------
export default function App() {
  // Theme & UX settings
  const [theme, setTheme] = useLocalStorage<"light" | "dark" | "hc">("set.theme", "dark");
  const [reduceMotion, setReduceMotion] = useLocalStorage<boolean>("set.reduceMotion", false);

  // New Accessibility Features
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [fontSize, setFontSize] = useLocalStorage<"small" | "medium" | "large" | "xlarge">("set.fontSize", "medium");
  const [lineHeight, setLineHeight] = useLocalStorage<"normal" | "relaxed" | "loose">("set.lineHeight", "normal");
  const [showReadingGuide, setShowReadingGuide] = useLocalStorage<boolean>("set.readingGuide", false);
  const [bionicReadingEnabled, setBionicReadingEnabled] = useLocalStorage<boolean>("set.bionicReading", false);

  // Tasks
  const [tasks, setTasks] = useLocalStorage<Task[]>("data.tasks", [
    { id: uid(), title: "Read A2 task sheet (10 min)", priority: "high", done: false, minutes: 10 },
    { id: uid(), title: "Plan Systemic Eval v1", priority: "medium", done: false, minutes: 25 },
    { id: uid(), title: "Refactor timer logic", priority: "low", done: false, minutes: 15 }
  ]);

  // Focus timer
  type Phase = "focus" | "short" | "long";
  const [phase, setPhase] = useLocalStorage<Phase>("timer.phase", "focus");
  const [lengths, setLengths] = useLocalStorage("timer.lengths", { focus: 25 * 60, short: 5 * 60, long: 15 * 60 });
  const [remaining, setRemaining] = useLocalStorage<number>("timer.remaining", lengths[phase]);
  const [running, setRunning] = useLocalStorage<boolean>("timer.running", false);
  const tickRef = useRef<number | null>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  // Mood & distractions
  const [moods, setMoods] = useLocalStorage<MoodEntry[]>("data.moods", []);
  const [distractions, setDistractions] = useLocalStorage<{ [k: string]: number }>("data.distractions", {
    phone: 0, chat: 0, snack: 0, noise: 0
  });

  // Timer tick
  useEffect(() => {
    if (running && remaining > 0) {
      tickRef.current = window.setTimeout(() => {
        setRemaining((r) => Math.max(0, r - 1));
      }, 1000);
      return () => {
        if (tickRef.current) clearTimeout(tickRef.current);
      };
    } else if (running && remaining === 0) {
      setRunning(false);
      if (confettiRef.current && phase === "focus") {
        burstConfetti(confettiRef.current, reduceMotion);
      }
    }
  }, [running, remaining, phase, setRemaining, setRunning, reduceMotion]);

  const total = lengths[phase];
  const pct = total > 0 ? clamp(1 - remaining / total, 0, 1) : 0;
  const tasksPct = tasks.length ? tasks.filter((t) => t.done).length / tasks.length : 0;

  // Handlers
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

  function switchPhase(next: Phase) {
    setPhase(next);
    setRemaining(lengths[next]);
    setRunning(false);
  }

  function resetTimer() {
    setRemaining(lengths[phase]);
    setRunning(false);
  }

  function addMood(mood: MoodEntry["mood"], energy: MoodEntry["energy"]) {
    const entry: MoodEntry = { t: Date.now(), mood, energy };
    setMoods((prev) => [...prev.slice(-49), entry]);
  }

  function bump(label: keyof typeof distractions) {
    setDistractions((d) => ({ ...d, [label]: d[label] + 1 }));
  }

  // Apply settings to document
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.fontSize = fontSize;
    document.body.dataset.lineHeight = lineHeight;
    document.body.dataset.reduceMotion = String(reduceMotion);
  }, [theme, fontSize, lineHeight, reduceMotion]);

  return (
    <div className="appRoot">
      <style>{globalStyles}</style>
      <style>{accessibilityStyles}</style>
      <div className="bg" aria-hidden />

      {/* Accessibility Features */}
      {showReadingGuide && <ReadingGuide />}
      {bionicReadingEnabled && <style>{bionicStyles}</style>}

      <header className="topbar">
        <div className="brand">
          <span className="logo">🧠</span>
          <strong>Focus Assistant - SDG 4.5</strong>
        </div>
        <div className="spacer" />
        <div className="controls">
          <button
            className="btn icon"
            onClick={() => setShowAccessibility(!showAccessibility)}
            aria-label="Accessibility settings"
            title="Accessibility"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="4" r="2"/>
              <path d="M12 6v8m0 0l-3 3m3-3l3 3M5 12h14"/>
            </svg>
          </button>
          <TextToSpeech />
          <BackgroundNoise />
          <label className="chip">
            <input type="checkbox" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} />
            <span>Reduce Motion</span>
          </label>
          <select className="select" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="hc">High Contrast</option>
          </select>
        </div>
      </header>

      {/* Accessibility Panel */}
      {showAccessibility && (
        <AccessibilityPanel
          fontSize={fontSize}
          setFontSize={setFontSize}
          lineHeight={lineHeight}
          setLineHeight={setLineHeight}
          showReadingGuide={showReadingGuide}
          setShowReadingGuide={setShowReadingGuide}
          bionicReadingEnabled={bionicReadingEnabled}
          setBionicReadingEnabled={setBionicReadingEnabled}
          onClose={() => setShowAccessibility(false)}
        />
      )}

      <main className="grid">
        {/* Left: Focus Timer */}
        <section className="card focus">
          <div className="phaseTabs">
            {(["focus", "short", "long"] as Phase[]).map((p) => (
              <button
                key={p}
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
              <div className="time">{formatMMSS(remaining)}</div>
              <div className="subtime">{phase === "focus" ? "Stay on one small task" : "Relax your eyes"}</div>
              <div className="controls">
                <button className="btn primary" onClick={() => setRunning((r) => !r)}>
                  {running ? "Pause" : "Start"}
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

        {/* Right: Tasks */}
        <section className="card tasks">
          <h3>Task Board</h3>
          <p className="muted">Keep tasks small (10-25 min). Tap to complete.</p>
          <TaskComposer onAdd={addTask} />
          <div className="taskList">
            {tasks.map((t) => (
              <div className={`task ${t.done ? "done" : ""}`} key={t.id}>
                <button className="chk" onClick={() => toggleTask(t.id)}>
                  {t.done ? "✓" : "○"}
                </button>
                <div className={bionicReadingEnabled ? "bionic-text" : ""}>
                  <span className="taskTitle">{t.title}</span>
                  <span className="taskMeta">{t.priority} • {t.minutes} min</span>
                </div>
                <button className="del" onClick={() => delTask(t.id)}>×</button>
              </div>
            ))}
          </div>
          <div className="progress">
            <div className="progressBar" style={{ width: `${tasksPct * 100}%` }} />
          </div>
        </section>

        {/* Mood Tracker */}
        <section className="card mood">
          <h3>Mood Check-in</h3>
          <div className="moodButtons">
            <div className="moodRow">
              <span>Mood:</span>
              {[1, 2, 3, 4, 5].map((v) => (
                <button key={v} className="moodBtn" onClick={() => addMood(v as any, 3)}>
                  {["😞", "😕", "😐", "🙂", "😊"][v - 1]}
                </button>
              ))}
            </div>
          </div>
          <MoodSparkline moods={moods} />
        </section>

        {/* Distraction Logger */}
        <section className="card distractions">
          <h3>Distraction Logger</h3>
          <p className="muted">Track what pulls your focus</p>
          <div className="distButtons">
            {Object.keys(distractions).map((k) => (
              <button key={k} className="distBtn" onClick={() => bump(k as any)}>
                {k === "phone" ? "📱" : k === "chat" ? "💬" : k === "snack" ? "🍪" : "🔊"} {k}
              </button>
            ))}
          </div>
          <DistractionBars data={distractions} />
        </section>

        {/* Document Reader - Replaces Bionic Sample */}
        <section className="card document-section" style={{ gridColumn: 'span 2' }}>
          <h3>📚 Document Reader</h3>
          <p className="muted" style={{ marginBottom: '16px' }}>
            Upload PDFs, text files, or paste content for reading with Text-to-Speech and Bionic Reading
          </p>
          <DocumentReader />
        </section>

        {/* Breathing Coach */}
        <section className="card breathing-section">
          <h3>🧘 Mindful Breathing</h3>
          <p className="muted" style={{ marginBottom: '16px' }}>
            Practice 4-4-4 breathing to reduce stress and improve focus
          </p>
          <BreathingCoach enabled={true} reduceMotion={reduceMotion} />
        </section>
      </main>

      <footer className="foot">
        <div className="muted tiny">Tip: Press <kbd>Space</kbd> to start/pause timer</div>
        <div className="spacer" />
        <div className="muted tiny">© 2025 Focus Assistant - Supporting SDG 4.5</div>
      </footer>

      <Keybindings running={running} setRunning={setRunning} />
    </div>
  );
}

// ---------- Global Styles ----------
const globalStyles = `
:root {
  --bg-1: #0b1020;
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
  --surface-2: rgba(15,23,42,.12);
  --surface-3: rgba(15,23,42,.18);
  --text-1: #0f172a;
  --text-2: #475569;
}

:root[data-theme="hc"] {
  --bg-1: #000000;
  --bg-2: #0a0a0a;
  --surface-1: #1a1a1a;
  --surface-2: #2a2a2a;
  --surface-3: #3a3a3a;
  --text-1: #000000; /* Changed to black for better contrast on yellow */
  --text-2: #333333; /* Darker gray for better contrast */
  --brand-400: #ffff00;
  --brand-500: #ffff00;
  --ok-500: #008000; /* Darker green */
  --warn-500: #ff6600; /* Darker orange */
  --bad-500: #cc0000; /* Darker red */
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; 
  font-size: 16px; /* Base font size */
}
body { margin: 0; overflow-x: hidden; }

.appRoot { position: relative; min-height: 100vh; background: linear-gradient(180deg, var(--bg-1), var(--bg-2)); color: var(--text-1); }

.bg { position: fixed; inset: 0; background: radial-gradient(circle at 20% 50%, rgba(81,131,255,.15), transparent 70%), radial-gradient(circle at 80% 80%, rgba(255,131,81,.1), transparent 70%); pointer-events: none; }

.topbar { display: flex; align-items: center; padding: 16px 24px; background: var(--surface-1); backdrop-filter: blur(10px); border-bottom: 1px solid var(--surface-2); }
.brand { display: flex; align-items: center; gap: 8px; }
.logo { font-size: 24px; }
.spacer { flex: 1; }
.controls { display: flex; gap: 12px; align-items: center; }

.chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; background: var(--surface-2); border-radius: 20px; cursor: pointer; }
.select { background: var(--surface-2); border: 1px solid var(--surface-3); color: var(--text-1); padding: 6px 10px; border-radius: 8px; }

.grid { display: grid; grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr); gap: 16px; padding: 18px; max-width: 1200px; margin: 0 auto; }
@media (max-width: 1000px) { .grid { grid-template-columns: 1fr; } }

.card { background: linear-gradient(180deg, var(--surface-1), transparent); border: 1px solid var(--surface-2); border-radius: 18px; padding: 16px; box-shadow: 0 30px 80px rgba(0,0,0,.18) inset, 0 8px 24px rgba(0,0,0,.25); }
.card h3 { margin: 4px 0 8px; font-size: 18px; letter-spacing: .2px; }
.muted { color: var(--text-2); }
.tiny { font-size: 12px; }

.focus { grid-row: span 2; display: grid; gap: 8px; align-content: start; }
.phaseTabs { display: inline-flex; gap: 6px; padding: 4px; border-radius: 12px; background: var(--surface-1); border: 1px solid var(--surface-2); }
.tab { border: 0; background: transparent; color: var(--text-2); padding: 8px 12px; border-radius: 8px; cursor: pointer; }
.tab.active { background: var(--surface-2); color: var(--text-1); }
.gaugeWrap { position: relative; display: grid; place-items: center; padding: 8px; }
.gaugeCenter { position: absolute; display: grid; place-items: center; gap: 6px; }
.time { font-size: 44px; font-weight: 700; letter-spacing: 1px; }
.subtime { font-size: 13px; color: var(--text-2); }
.controls { display: flex; gap: 8px; margin-top: 6px; }
.btn { border: 1px solid var(--surface-2); background: var(--surface-1); color: var(--text-1); padding: 8px 12px; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
.btn:hover { background: var(--surface-2); }
.btn.primary { background: linear-gradient(180deg, var(--brand-400), var(--brand-500)); border-color: transparent; color: white; }
.btn.icon { padding: 8px; display: inline-flex; align-items: center; justify-content: center; }
.lenControls { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.len { display: grid; gap: 6px; background: var(--surface-1); border: 1px solid var(--surface-2); padding: 8px; border-radius: 12px; }
.len span { font-weight: 600; }
.len em { font-style: normal; color: var(--text-2); font-size: 12px; }

.tasks .taskList { display: grid; gap: 8px; margin-top: 8px; }
.task { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; padding: 8px; border: 1px solid var(--surface-2); border-radius: 10px; background: var(--surface-1); transition: all 0.2s; }
.task.done { opacity: 0.6; }
.task.done .taskTitle { text-decoration: line-through; }
.chk { width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--text-2); background: transparent; cursor: pointer; display: grid; place-items: center; color: var(--text-1); font-weight: bold; }
.taskTitle { display: block; }
.taskMeta { display: block; font-size: 12px; color: var(--text-2); margin-top: 2px; }
.del { background: transparent; border: 0; color: var(--text-2); font-size: 24px; cursor: pointer; width: 30px; height: 30px; }
.composer { display: flex; gap: 8px; margin-top: 12px; }
.input { flex: 1; padding: 8px; background: var(--surface-1); border: 1px solid var(--surface-2); border-radius: 8px; color: var(--text-1); }
.progress { height: 6px; background: var(--surface-2); border-radius: 3px; overflow: hidden; margin-top: 12px; }
.progressBar { height: 100%; background: var(--ok-500); transition: width 0.3s; }

.mood { display: grid; gap: 12px; }
.moodButtons { display: grid; gap: 8px; }
.moodRow { display: flex; align-items: center; gap: 8px; }
.moodBtn { width: 36px; height: 36px; border: 1px solid var(--surface-2); background: var(--surface-1); border-radius: 8px; cursor: pointer; font-size: 20px; }

.distractions { display: grid; gap: 12px; }
.distButtons { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.distBtn { padding: 8px; border: 1px solid var(--surface-2); background: var(--surface-1); border-radius: 8px; cursor: pointer; }
.bars { display: flex; gap: 16px; align-items: flex-end; height: 80px; margin-top: 12px; }
.bar { flex: 1; display: grid; gap: 4px; text-align: center; }
.barFill { background: var(--brand-400); border-radius: 4px 4px 0 0; display: grid; place-items: center; color: white; font-size: 12px; font-weight: 600; }
.barLabel { font-size: 11px; color: var(--text-2); }

.bionic { grid-column: span 2; }
@media (max-width: 1000px) { .bionic { grid-column: span 1; } }

.breathing-section { grid-column: span 2; }
@media (max-width: 1000px) { .breathing-section { grid-column: span 1; } }

.breathing { display: grid; place-items: center; gap: 12px; margin-top: 16px; }
.breathOuter { width: 80px; height: 80px; border-radius: 50%; background: var(--surface-2); display: grid; place-items: center; }
.breathCircle { width: 60px; height: 60px; border-radius: 50%; background: var(--brand-400); animation: breathe 12s infinite; }
.breathOuter.noMotion .breathCircle { animation: none; }
@keyframes breathe {
  0%, 100% { transform: scale(0.7); }
  33% { transform: scale(1); }
  66% { transform: scale(1); }
}
.breathGuide { display: flex; gap: 12px; font-size: 12px; color: var(--text-2); }

.foot { display: flex; align-items: center; padding: 16px 24px; border-top: 1px solid var(--surface-2); }

.confetti { position: absolute; width: 10px; height: 10px; background: hsl(var(--hue), 80%, 60%); animation: confetti 1.5s ease-out forwards; pointer-events: none; }
@keyframes confetti {
  to { transform: translateY(-200px) rotate(720deg); opacity: 0; }
}

kbd { background: var(--surface-2); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
`;

// ---------- Accessibility Styles ----------
const accessibilityStyles = `
/* Font size adjustments - apply to body for inheritance */
body[data-fontSize="small"] { font-size: 14px !important; }
body[data-fontSize="medium"] { font-size: 16px !important; }
body[data-fontSize="large"] { font-size: 18px !important; }
body[data-fontSize="xlarge"] { font-size: 20px !important; }

/* Line height adjustments */
body[data-lineHeight="normal"] * { line-height: 1.5 !important; }
body[data-lineHeight="relaxed"] * { line-height: 1.8 !important; }
body[data-lineHeight="loose"] * { line-height: 2.2 !important; }

/* Reduce motion - disable animations when enabled */
@media (prefers-reduced-motion: reduce), (prefers-reduced-motion: no-preference) {
  body[data-reduceMotion="true"] * {
    animation: none !important;
    transition: none !important;
  }
  
  body[data-reduceMotion="true"] .breathCircle {
    animation: none !important;
  }
  
  body[data-reduceMotion="true"] .confetti {
    display: none !important;
  }
  
  body[data-reduceMotion="true"] .progressBar {
    transition: none !important;
  }
}

/* High contrast mode improvements */
body[data-theme="hc"] .btn.primary {
  background: #000000 !important;
  color: #ffff00 !important;
  border: 2px solid #ffff00 !important;
}

body[data-theme="hc"] .task.done {
  opacity: 1 !important;
  background: #2a2a2a !important;
}

body[data-theme="hc"] .barFill {
  background: #ffff00 !important;
  color: #000000 !important;
}
`;

// ---------- Bionic Reading Styles ----------
const bionicStyles = `
.bionic-text {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.bionic-word {
  display: inline-block;
  margin-right: 0.2em;
}

.bionic-bold {
  font-weight: 700;
  color: var(--text-1);
}

.bionic-rest {
  font-weight: 400;
  opacity: 0.8;
}
`;