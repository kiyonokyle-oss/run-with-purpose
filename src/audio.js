/**
 * Gesture-activated game audio. The optional music bed is an original,
 * procedural choir-inspired texture rather than a recording or copied melody.
 * No audio graph is created until the player enables sound.
 */
export function createAudio() {
  let context = null;
  let master = null;
  let noiseBuffer = null;
  let musicBus = null;
  let musicSpace = null;
  let musicSpaceGain = null;
  let enabled = false;
  let desired = false;
  let disposed = false;
  // The ready screen is a valid listening state; only an explicit game pause
  // or game-over silences the bed until the next run.
  let musicPaused = false;
  let musicRunning = false;
  let musicTimer = null;
  let musicNextAt = 0;
  let musicStep = 0;
  let revision = 0;
  let melodyStep = 0;
  const voices = new Set();
  const musicVoices = new Set();
  const lastPlayed = new Map();
  const pentatonic = [587.33, 698.46, 783.99, 880, 1046.5];
  // A slow Dorian/modal cycle gives the bed a spacious, hymn-like lift while
  // keeping the composition original and free of a recognizable melody.
  const musicChords = [
    [146.83, 220, 261.63, 329.63], // Dm(add9)
    [116.54, 174.61, 220, 293.66], // Bbmaj7
    [130.81, 196, 293.66, 349.23], // Csus2
    [110, 164.81, 196, 293.66], // Am7
  ];
  const MUSIC_STEP_SECONDS = 8;
  const MUSIC_LOOKAHEAD_SECONDS = 14;

  function track(source, nodes, collection = voices) {
    collection.add(source);
    source.onended = () => {
      collection.delete(source);
      for (const node of nodes) node.disconnect();
      source.disconnect();
    };
    // A long pickup chain cannot create an unbounded number of voices.
    if (collection === voices && voices.size > 32) {
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

  function ensureMusicGraph() {
    if (musicBus || !context || !master) return;
    musicBus = context.createGain();
    musicBus.gain.value = 0;
    musicSpace = context.createDelay(1.6);
    musicSpace.delayTime.value = 0.74;
    musicSpaceGain = context.createGain();
    musicSpaceGain.gain.value = 0.16;
    musicBus.connect(master);
    musicBus.connect(musicSpace);
    musicSpace.connect(musicSpaceGain);
    musicSpaceGain.connect(master);
  }

  function scheduleMusicVoice(frequency, at, duration, voiceIndex) {
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const detune = voiceIndex % 2 === 0 ? -4 : 4;
    oscillator.type = voiceIndex === 0 ? 'sine' : 'triangle';
    oscillator.detune.setValueAtTime(detune, at);
    oscillator.frequency.setValueAtTime(frequency, at);
    filter.type = 'lowpass';
    filter.Q.value = 0.45;
    filter.frequency.setValueAtTime(1550 - voiceIndex * 120, at);
    const level = voiceIndex === 0 ? 0.042 : voiceIndex === 3 ? 0.025 : voiceIndex >= 4 ? 0.012 : 0.032;
    const attack = Math.min(2.7, duration * 0.36);
    const release = Math.min(2.9, duration * 0.4);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(level, at + attack);
    gain.gain.setValueAtTime(level * 0.92, at + duration - release);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(musicBus);
    track(oscillator, [filter, gain], musicVoices);
    oscillator.start(at);
    oscillator.stop(at + duration + 0.05);
  }

  function scheduleMusicChord(chord, at, duration) {
    chord.forEach((frequency, index) => scheduleMusicVoice(frequency, at, duration, index));
    // A high, quiet fifth opens at the end of each phrase, like a distant
    // vocal overtone, without turning the bed into a lead melody.
    scheduleMusicVoice(chord[2] * 2, at + duration * 0.27, duration * 0.66, 4);
  }

  function musicTick() {
    if (!musicRunning || !enabled || musicPaused || disposed) return;
    if (context?.state !== 'running') {
      musicRunning = false;
      return;
    }
    const now = context.currentTime;
    while (musicNextAt < now + MUSIC_LOOKAHEAD_SECONDS) {
      scheduleMusicChord(musicChords[musicStep % musicChords.length], musicNextAt, MUSIC_STEP_SECONDS + 0.6);
      musicNextAt += MUSIC_STEP_SECONDS;
      musicStep += 1;
    }
    musicTimer = setTimeout(musicTick, 1000);
  }

  function fadeMusic(level, timeConstant = 0.18) {
    if (!context || !musicBus || !musicSpaceGain || context.state === 'closed') return;
    const at = context.currentTime;
    musicBus.gain.cancelScheduledValues(at);
    musicBus.gain.setTargetAtTime(level, at, timeConstant);
    musicSpaceGain.gain.cancelScheduledValues(at);
    musicSpaceGain.gain.setTargetAtTime(level > 0 ? 0.16 : 0, at, timeConstant * 1.4);
  }

  function stopMusicVoices() {
    if (!context || context.state === 'closed') return;
    for (const source of musicVoices) {
      try { source.stop(context.currentTime + 0.04); } catch { /* Already stopped. */ }
    }
  }

  function stopMusic() {
    musicRunning = false;
    if (musicTimer !== null) {
      clearTimeout(musicTimer);
      musicTimer = null;
    }
    fadeMusic(0, 0.14);
    stopMusicVoices();
  }

  function startMusic() {
    if (!enabled || musicPaused || disposed || !context || context.state !== 'running') return;
    ensureMusicGraph();
    if (musicRunning) return;
    musicRunning = true;
    musicNextAt = context.currentTime + 0.08;
    fadeMusic(0.68, 1.8);
    musicTick();
  }

  async function toggle() {
    if (disposed) return false;
    desired = !desired;
    const change = ++revision;
    if (!desired) {
      enabled = false;
      stopMusic();
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
        ensureMusicGraph();
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
        startMusic();
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
    musicPaused = true;
    revision++;
    stopMusic();
    for (const source of voices) {
      try { source.stop(); } catch { /* Already stopped. */ }
    }
    voices.clear();
    musicVoices.clear();
    lastPlayed.clear();
    if (context && context.state !== 'closed') context.close().catch(() => {});
    master?.disconnect();
    musicBus?.disconnect();
    musicSpace?.disconnect();
    musicSpaceGain?.disconnect();
    noiseBuffer = null;
  }

  function pause() {
    musicPaused = true;
    if (enabled) stopMusic();
  }

  function resume() {
    musicPaused = false;
    if (!enabled || disposed) return;
    if (context?.state !== 'running') {
      context?.resume().then(startMusic).catch(() => {});
      return;
    }
    startMusic();
  }

  return { get enabled() { return enabled; }, toggle, play, pause, resume, destroy };
}
