/**
 * journey-lib — pure helpers + side-effecting utilities extracted from
 * JourneyTab so the component file is UI-only.
 */

export type StepStatus = "completed" | "in_progress" | "upcoming";

export function normalizeStatus(raw: string | null): StepStatus {
  if (raw === "completed") return "completed";
  if (raw === "in_progress") return "in_progress";
  return "upcoming";
}

export function statusBadgeText(status: string | null): string {
  switch (status) {
    case "completed":
      return "DONE";
    case "in_progress":
      return "IN PROGRESS";
    default:
      return "UPCOMING";
  }
}

// ── Web Audio Synth Chimes ───────────────────────────────────

export function playChime(type: "beep" | "success") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "beep") {
      // Radar beep (high-frequency ping)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "success") {
      // Ascending two-tone chime
      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.03, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      playNote(523.25, ctx.currentTime, 0.15); // C5
      playNote(783.99, ctx.currentTime + 0.1, 0.35); // G5
    }
  } catch {
    // Silently ignore browser audio permission blocks
  }
}

// Ensure keyframe animations exist in document head
export function ensureJourneyAnimations() {
  if (typeof document === "undefined") return;
  const id = "clipsos-journey-styles";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.innerHTML = `
    @keyframes ping-radar {
      0% { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(2.4); opacity: 0; }
    }
    @keyframes current-glow {
      0%, 100% { box-shadow: 0 0 8px 1px rgba(216, 180, 254, 0.2), inset 0 0 4px rgba(216, 180, 254, 0.1); }
      50% { box-shadow: 0 0 18px 4px rgba(216, 180, 254, 0.4), inset 0 0 8px rgba(216, 180, 254, 0.2); }
    }
    .current-step-glowing {
      animation: current-glow 2.5s infinite ease-in-out;
      border: 1px solid rgba(216, 180, 254, 0.4) !important;
    }
  `;
  document.head.appendChild(style);
}
