/** Quiet, gesture-activated sound effects. No audio is created until toggle(). */
export function createAudio() {
  let context = null;
  let master = null;
  let noiseBuffer = null;
  let enabled = false;
  let desired = false;
  let disposed = false;
  let revision = 0;
  let melodyStep = 0;
  const voices = new Set();
  const lastPlayed = new Map();
  const pentatonic = [587.33, 698.46, 783.99, 880, 1046.5];

  function track(source, nodes) {
    voices.add(source);
    source.onended = () => {
      voices.delete(source);
      for (const node of nodes) node.disconnect();
      source.disconnect();
    };
    // A long pickup chain cannot create an unbounded number of voices.
    if (voices.size > 32) {
      try { voices.values().next().value.stop(); } catch { /* Already stopped. */ }
    }
  }

  function tone(frequency, duration = 0.3, volume = 0.22, delay = 0, endFrequency = frequency, type = 'sine') {
    const at = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, at);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), at + duration);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.009);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(gain);
    gain.connect(master);
    track(oscillator, [gain]);
    oscillator.start(at);
    oscillator.stop(at + duration + 0.025);
  }

  function pluck(frequency, delay = 0, volume = 0.2) {
    tone(frequency, 0.38, volume, delay);
    tone(frequency * 2, 0.14, volume * 0.17, delay, frequency * 2, 'triangle');
  }

  function air(duration, volume, fromFrequency, toFrequency) {
    const at = context.currentTime;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = noiseBuffer;
    filter.type = 'bandpass';
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(fromFrequency, at);
    filter.frequency.exponentialRampToValueAtTime(toFrequency, at + duration);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.022);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    track(source, [filter, gain]);
    source.start(at);
    source.stop(at + duration + 0.025);
  }

  async function toggle() {
    if (disposed) return false;
    desired = !desired;
    const change = ++revision;
    if (!desired) {
      enabled = false;
      if (master && context?.state !== 'closed') {
        master.gain.cancelScheduledValues(context.currentTime);
        master.gain.setTargetAtTime(0, context.currentTime, 0.015);
      }
      return false;
    }

    try {
      if (!context) {
        const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!AudioContextClass) {
          desired = false;
          return false;
        }
        context = new AudioContextClass();
        master = context.createGain();
        master.gain.value = 0;
        master.connect(context.destination);
        noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.6), context.sampleRate);
        const noise = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noise.length; i++) noise[i] = Math.random() * 2 - 1;
      }
      if (context.state !== 'running') await context.resume();
      if (disposed || change !== revision || !desired) return enabled;
      enabled = context.state === 'running';
      desired = enabled;
      if (enabled) {
        master.gain.cancelScheduledValues(context.currentTime);
        master.gain.setTargetAtTime(0.19, context.currentTime, 0.025);
      }
      return enabled;
    } catch {
      // Unsupported/blocked audio should never interrupt the game.
      if (change === revision) enabled = desired = false;
      return enabled;
    }
  }

  function play(event) {
    if (!enabled || disposed || context?.state !== 'running') return;
    const now = context.currentTime;
    if (now - (lastPlayed.get(event) ?? -Infinity) < 0.055) return;
    lastPlayed.set(event, now);
    try {
      switch (event) {
        case 'jump':
          air(0.19, 0.16, 480, 1800);
          tone(190, 0.16, 0.075, 0, 360);
          break;
        case 'land':
          tone(115, 0.14, 0.25, 0, 48);
          air(0.085, 0.11, 420, 150);
          break;
        case 'slide':
          air(0.29, 0.14, 1200, 300);
          break;
        case 'collect':
          pluck(pentatonic[melodyStep++ % pentatonic.length]);
          break;
        case 'clear':
          pluck(440, 0, 0.11);
          pluck(587.33, 0.075, 0.12);
          break;
        case 'collision':
          tone(155, 0.25, 0.3, 0, 38, 'triangle');
          air(0.23, 0.25, 1100, 100);
          break;
        case 'recall':
          pluck(587.33, 0, 0.16);
          pluck(783.99, 0.13, 0.14);
          pluck(880, 0.26, 0.12);
          break;
        case 'correct':
          pluck(587.33, 0, 0.2);
          pluck(783.99, 0.085, 0.19);
          pluck(1174.66, 0.17, 0.16);
          break;
        case 'wrong':
          tone(349.23, 0.22, 0.13);
          tone(293.66, 0.28, 0.13, 0.12);
          break;
        default:
          break;
      }
    } catch { /* A browser audio interruption is harmless to gameplay. */ }
  }

  function destroy() {
    disposed = true;
    enabled = desired = false;
    revision++;
    for (const source of voices) {
      try { source.stop(); } catch { /* Already stopped. */ }
    }
    voices.clear();
    lastPlayed.clear();
    if (context && context.state !== 'closed') context.close().catch(() => {});
    master?.disconnect();
    noiseBuffer = null;
  }

  return { get enabled() { return enabled; }, toggle, play, destroy };
}
