import { useGameStore } from "../store/useGameStore";

let audioCtx: AudioContext | null = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx?.state === "suspended") {
    audioCtx.resume();
  }
}

export function playClickSound(
  isCritical: boolean = false,
  comboMultiplier: number = 1,
) {
  if (!useGameStore.getState().isSoundEnabled) return;
  initAudio();
  const ctx = audioCtx;
  if (!ctx) return;

  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = isCritical ? 3000 : 1000;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(isCritical ? 0.3 : 0.1, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start();

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = isCritical ? "square" : "sine";

  const baseFreq = isCritical ? 800 : 400;
  const targetFreq = baseFreq * Math.min(comboMultiplier, 3);

  oscillator.frequency.setValueAtTime(targetFreq, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

  gainNode.gain.setValueAtTime(isCritical ? 0.2 : 0.05, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.1);
}

export function playCatchSound() {
  if (!useGameStore.getState().isSoundEnabled) return;
  initAudio();
  const ctx = audioCtx;
  if (!ctx) return;

  const freqs = [440, 554, 659, 880];
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "triangle";
    osc.frequency.value = freq;

    const time = ctx.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.start(time);
    osc.stop(time + 0.1);
  });
}

export function playUpgradeSound() {
  if (!useGameStore.getState().isSoundEnabled) return;
  initAudio();
  const ctx = audioCtx;
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sine";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

export function playPrestigeSound() {
  if (!useGameStore.getState().isSoundEnabled) return;
  initAudio();
  const ctx = audioCtx;
  if (!ctx) return;

  const freqs = [440, 554, 659, 880, 1108, 1318];
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.value = freq;

    const time = ctx.currentTime + i * 0.15;
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    osc.start(time);
    osc.stop(time + 0.5);
  });
}

export function playBossWarningSound() {
  if (!useGameStore.getState().isSoundEnabled) return;
  initAudio();
  const ctx = audioCtx;
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sine";

  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.5);
  osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 1.0);
  osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 1.5);

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);

  osc.start();
  osc.stop(ctx.currentTime + 2.0);
}
