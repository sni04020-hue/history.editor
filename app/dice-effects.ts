export const die = (sides = 6) => Math.floor(Math.random() * Math.max(1, sides)) + 1;

function playDiceSound() {
  try {
    const context = new AudioContext();
    const start = context.currentTime;
    [0, .08, .16, .25, .35, .47, .6].forEach((offset, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index % 2 ? "triangle" : "square";
      oscillator.frequency.setValueAtTime(115 + index * 19, start + offset);
      gain.gain.setValueAtTime(.0001, start + offset);
      gain.gain.exponentialRampToValueAtTime(.045, start + offset + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, start + offset + .055);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start + offset);
      oscillator.stop(start + offset + .06);
    });
    window.setTimeout(() => void context.close(), 900);
  } catch {
    // Sound is an enhancement; rolling still works when the browser blocks audio.
  }
}

export function animateDice(onFrame: () => void, onComplete: () => void) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reducedMotion ? 90 : 760;
  playDiceSound();
  onFrame();
  const timer = window.setInterval(onFrame, reducedMotion ? 90 : 68);
  window.setTimeout(() => {
    window.clearInterval(timer);
    onComplete();
  }, duration);
}
