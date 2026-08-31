/**
 * Liminal Space Procedural Web Audio Engine
 * Generates eerie 60Hz hum, spatial dread heartbeats, footsteps, entity shrieks, and environmental echoes.
 */

class LiminalSoundEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private humGain: GainNode | null = null;
  private humOsc1: OscillatorNode | null = null;
  private humOsc2: OscillatorNode | null = null;
  private humFilter: BiquadFilterNode | null = null;
  private currentTheme: string = 'backrooms';
  private ambientInterval: number | null = null;
  private heartbeatTimer: number | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.7;
  private muted: boolean = false;
  private lastFootstepTime = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.startFluorescentHum();
      this.isInitialized = true;
    } catch {
      // Browser audio restrictions fallback
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Continuous theme ambient soundscape (60Hz Backrooms hum, Poolrooms hydro-resonance, Mall muzak, Hospital telemetry, School bells)
   */
  private startFluorescentHum() {
    if (!this.ctx || !this.masterGain) return;

    // Base tone oscillator
    this.humOsc1 = this.ctx.createOscillator();
    this.humOsc1.type = 'sawtooth';
    this.humOsc1.frequency.setValueAtTime(60, this.ctx.currentTime);

    // Harmonic oscillator
    this.humOsc2 = this.ctx.createOscillator();
    this.humOsc2.type = 'sine';
    this.humOsc2.frequency.setValueAtTime(120, this.ctx.currentTime);

    // Filter to shape atmospheric acoustic character
    this.humFilter = this.ctx.createBiquadFilter();
    this.humFilter.type = 'lowpass';
    this.humFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
    this.humFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.humOsc1.connect(this.humFilter);
    this.humOsc2.connect(this.humFilter);
    this.humFilter.connect(this.humGain);
    this.humGain.connect(this.masterGain);

    this.humOsc1.start();
    this.humOsc2.start();

    this.scheduleHumFlicker();
  }

  private scheduleHumFlicker() {
    if (!this.ctx || !this.humGain) return;
    const nextFlicker = 3500 + Math.random() * 7000;
    setTimeout(() => {
      if (this.ctx && this.humGain && this.currentTheme === 'backrooms') {
        const now = this.ctx.currentTime;
        this.humGain.gain.setTargetAtTime(0.01, now, 0.03);
        this.humGain.gain.setTargetAtTime(0.14, now + 0.08, 0.04);
        this.humGain.gain.setTargetAtTime(0.08, now + 0.18, 0.05);
        this.triggerSparkSound();
      }
      this.scheduleHumFlicker();
    }, nextFlicker);
  }

  /**
   * Transforms the audio atmosphere when transitioning between liminal spaces
   */
  public setThemeAmbient(theme: string) {
    this.currentTheme = theme;
    if (!this.ctx || !this.humGain || !this.humOsc1 || !this.humOsc2 || !this.humFilter) return;

    const t = this.ctx.currentTime;

    // Clear previous theme's procedural interval
    if (this.ambientInterval !== null) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }

    if (theme === 'poolrooms') {
      // Deep resonant subterranean bathhouse drone
      this.humOsc1.type = 'sine';
      this.humOsc1.frequency.setTargetAtTime(46, t, 1.2);
      this.humOsc2.type = 'sine';
      this.humOsc2.frequency.setTargetAtTime(92, t, 1.2);
      this.humFilter.frequency.setTargetAtTime(120, t, 1.0);
      this.humGain.gain.setTargetAtTime(0.05, t, 1.0);

      // Periodic echoing water drips in cavernous tiled space
      this.ambientInterval = window.setInterval(() => {
        if (!this.muted) this.playEchoingWaterDrop();
      }, 4000 + Math.random() * 4500);
    } else if (theme === 'mall') {
      // Hollow 90s Mall Atrium AC hum & periodic distant muzak chords
      this.humOsc1.type = 'sine';
      this.humOsc1.frequency.setTargetAtTime(52, t, 1.2);
      this.humOsc2.type = 'triangle';
      this.humOsc2.frequency.setTargetAtTime(104, t, 1.2);
      this.humFilter.frequency.setTargetAtTime(140, t, 1.0);
      this.humGain.gain.setTargetAtTime(0.04, t, 1.0);

      // Eerie muffled 90s elevator synth muzak chord in distance
      this.ambientInterval = window.setInterval(() => {
        if (!this.muted) this.playMallMuzakChord();
      }, 8000 + Math.random() * 6000);
    } else if (theme === 'hospital') {
      // Quiet clinical ventilator hum & distant slow cardiac telemetry monitor
      this.humOsc1.type = 'sine';
      this.humOsc1.frequency.setTargetAtTime(48, t, 1.2);
      this.humOsc2.type = 'sine';
      this.humOsc2.frequency.setTargetAtTime(96, t, 1.2);
      this.humFilter.frequency.setTargetAtTime(110, t, 1.0);
      this.humGain.gain.setTargetAtTime(0.035, t, 1.0);

      // Distant rhythmic heart monitor beep every 3.2s
      this.ambientInterval = window.setInterval(() => {
        if (!this.muted) this.playAmbientMonitorBeep();
      }, 3200);
    } else if (theme === 'school') {
      // Infinite school hallway resonance & distant school bell
      this.humOsc1.type = 'sine';
      this.humOsc1.frequency.setTargetAtTime(58, t, 1.2);
      this.humOsc2.type = 'sine';
      this.humOsc2.frequency.setTargetAtTime(116, t, 1.2);
      this.humFilter.frequency.setTargetAtTime(150, t, 1.0);
      this.humGain.gain.setTargetAtTime(0.04, t, 1.0);

      // Distant mechanical school bell chime
      this.ambientInterval = window.setInterval(() => {
        if (!this.muted) this.playSchoolBellChime();
      }, 25000 + Math.random() * 10000);
    } else {
      // Default: Backrooms 60Hz buzzing ballast
      this.humOsc1.type = 'sawtooth';
      this.humOsc1.frequency.setTargetAtTime(60, t, 0.8);
      this.humOsc2.type = 'sine';
      this.humOsc2.frequency.setTargetAtTime(120, t, 0.8);
      this.humFilter.frequency.setTargetAtTime(180, t, 0.8);
      this.humGain.gain.setTargetAtTime(0.08, t, 0.8);
    }
  }

  /**
   * Procedural Water Droplet with Cavernous Reverb for Poolrooms
   */
  private playEchoingWaterDrop() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = 1200 + Math.random() * 500;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(500, t + 0.08);

    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  /**
   * Procedural Muffled 90s Elevator Muzak Chord for Abandoned Mall
   */
  private playMallMuzakChord() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    // 90s Nostalgic chords (e.g. Fmaj7 or Dm7)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [349.23, 440.00, 523.25, 659.25], // Fmaj7
      [293.66, 349.23, 440.00, 523.25], // Dm7
    ];
    const chord = chords[Math.floor(Math.random() * chords.length)];

    const chordGain = this.ctx.createGain();
    chordGain.gain.setValueAtTime(0.022, t);
    chordGain.gain.exponentialRampToValueAtTime(0.0001, t + 4.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, t); // Muffled through walls / PA speaker

    chordGain.connect(filter);
    filter.connect(this.masterGain);

    chord.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.connect(chordGain);
      osc.start(t);
      osc.stop(t + 4.3);
    });
  }

  /**
   * Procedural Distant Cardiac Telemetry Monitor Beep for Abandoned Hospital
   */
  private playAmbientMonitorBeep() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t); // Pure A5 monitor tone

    gain.gain.setValueAtTime(0.035, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Procedural Vintage Distant School Hallway Bell for Infinite School
   */
  private playSchoolBellChime() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const bellFrequencies = [587.33, 783.99]; // D5 and G5 dual bell chime

    bellFrequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const strikeTime = t + idx * 0.35;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, strikeTime);

      gain.gain.setValueAtTime(0.045, strikeTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 2.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(strikeTime);
      osc.stop(strikeTime + 2.5);
    });
  }

  public setAmbientHumIntensity(intensity: number) {
    if (!this.ctx || !this.humGain) return;
    const target = Math.max(0.02, Math.min(0.2, intensity * 0.12));
    this.humGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.3);
  }

  /**
   * Footsteps adapted for distinct liminal surfaces: damp carpet, shallow water, polished marble, waxed linoleum, hardwood
   */
  public playFootstep(theme: string, isSprinting: boolean, isCrouching: boolean) {
    if (!this.ctx || !this.masterGain) return;
    const now = performance.now();
    const interval = isSprinting ? 280 : isCrouching ? 650 : 450;
    if (now - this.lastFootstepTime < interval) return;
    this.lastFootstepTime = now;

    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const volumeMultiplier = isSprinting ? 0.35 : isCrouching ? 0.08 : 0.2;
    gain.gain.setValueAtTime(volumeMultiplier, t);
    gain.connect(this.masterGain);

    if (theme === 'poolrooms') {
      // Water splash: liquid plop + noise wash
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
      const bufferSize = this.ctx.sampleRate * 0.22;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.04));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(isSprinting ? 950 : 720, t);
      bandpass.Q.setValueAtTime(2.2, t);

      noise.connect(bandpass);
      bandpass.connect(gain);
      noise.start(t);
    } else if (theme === 'mall') {
      // Crisp polished marble tile click
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450 + Math.random() * 80, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.06);

      const highPop = this.ctx.createOscillator();
      highPop.type = 'sine';
      highPop.frequency.setValueAtTime(1400, t);
      highPop.frequency.exponentialRampToValueAtTime(300, t + 0.03);

      osc.connect(gain);
      highPop.connect(gain);
      osc.start(t);
      highPop.start(t);
      osc.stop(t + 0.09);
      highPop.stop(t + 0.04);
    } else if (theme === 'hospital') {
      // Squeaky rubber sole on high-gloss waxed hospital linoleum
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580 + (isSprinting ? 120 : 0), t);
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.07);

      osc.connect(gain);
      osc.start(t);
      osc.stop(t + 0.11);
    } else if (theme === 'school') {
      // Solid resonant wood floorboard thud
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110 + Math.random() * 20, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.11);

      osc.connect(gain);
      osc.start(t);
      osc.stop(t + 0.14);
    } else {
      // Backrooms: Damp yellow carpet soft squish-thud
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      const baseFreq = 62 + Math.random() * 8;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(28, t + 0.1);

      osc.connect(gain);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  }

  /**
   * Flashlight click
   */
  public playFlashlightClick(turnOn: boolean) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(turnOn ? 1800 : 1200, t);
    osc.frequency.exponentialRampToValueAtTime(turnOn ? 700 : 400, t + 0.04);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Heartbeat based on dread and entity proximity
   */
  public updateHeartbeat(dreadLevel: number, nearestEntityDist: number) {
    if (!this.ctx || !this.masterGain) return;

    // Start or adjust heartbeat if dread > 20 or entity < 6
    const urgency = Math.max(dreadLevel / 100, Math.max(0, (7 - nearestEntityDist) / 7));
    if (urgency > 0.15 && !this.heartbeatTimer) {
      const bpm = 60 + urgency * 90; // 60 to 150 bpm
      const intervalMs = (60 / bpm) * 1000;
      this.playHeartbeatThump(urgency);
      this.heartbeatTimer = window.setTimeout(() => {
        this.heartbeatTimer = null;
        this.updateHeartbeat(dreadLevel, nearestEntityDist);
      }, intervalMs);
    } else if (urgency <= 0.15 && this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private playHeartbeatThump(intensity: number) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Lub-dub double thump
    const playThump = (time: number, freq: number, vol: number) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.09);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.13);
    };

    playThump(t, 55, intensity);
    playThump(t + 0.12, 48, intensity * 0.75);
  }

  /**
   * Entity screech / static distortion when spotting player
   */
  public playEntityAlert(distance: number) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const proximity = Math.max(0.1, Math.min(1, (10 - distance) / 10));

    // Dissonant dual oscillator glide
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(240, t);
    osc1.frequency.linearRampToValueAtTime(680, t + 0.4);
    osc1.frequency.linearRampToValueAtTime(320, t + 0.8);

    osc2.frequency.setValueAtTime(248, t);
    osc2.frequency.linearRampToValueAtTime(695, t + 0.4);
    osc2.frequency.linearRampToValueAtTime(310, t + 0.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, t);
    filter.Q.setValueAtTime(4.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.3 * proximity, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.95);
    osc2.stop(t + 0.95);
  }

  /**
   * Item pickup sound
   */
  public playItemPickup() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(660, t + 0.06);
    osc.frequency.setValueAtTime(880, t + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  /**
   * Puzzle switch / button click
   */
  public playPuzzleClick() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.04);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Steam hiss / valve turn
   */
  public playValveTurn() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    // Heavy metallic clank + hiss
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * Eerie Rotary telephone ring (Stage 2 Hotel)
   */
  public playTelephoneRing() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(440, t);
    osc2.frequency.setValueAtTime(480, t);

    const tremolo = this.ctx.createOscillator();
    tremolo.type = 'square';
    tremolo.frequency.setValueAtTime(20, t); // 20Hz bell clapper

    const tremoloGain = this.ctx.createGain();
    tremoloGain.gain.setValueAtTime(0.5, t);
    tremolo.connect(tremoloGain.gain);

    const ringGain = this.ctx.createGain();
    ringGain.gain.setValueAtTime(0.18, t);
    ringGain.gain.setValueAtTime(0.18, t + 1.2);
    ringGain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

    osc1.connect(ringGain);
    osc2.connect(ringGain);
    ringGain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    tremolo.start(t);
    osc1.stop(t + 1.4);
    osc2.stop(t + 1.4);
    tremolo.stop(t + 1.4);
  }

  /**
   * Door unlocked / heavy blast door hum
   */
  public playDoorUnlocked() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, t);
    osc.frequency.linearRampToValueAtTime(160, t + 0.6);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 1.5);
  }

  /**
   * Spark / light pop sound
   */
  private triggerSparkSound() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.005));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1500, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  /**
   * Jumpscare / game over glitch
   */
  public playJumpscare() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Screeching distortion blast
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 1.5);
  }

  /**
   * Stage 1: Sonar Decoy / Water Ripple Splash Distraction
   */
  public playSonarDistraction() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // High bubble ping
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  /**
   * Stage 2: Power Grid Brownout Transformer Buzz Warning
   */
  public playTransformerBuzz() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Heavy 60Hz arcing buzz
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.setValueAtTime(180, t + 0.1);
    osc.frequency.setValueAtTime(55, t + 0.25);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 1.2);
  }

  /**
   * Stage 2: Mannequin Fast Wooden Footstep / Clatter
   */
  public playMannequinStep() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380 + Math.random() * 80, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.05);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  /**
   * Stage 3: Enraged Photophobic Orderly Shriek (when flashlight hits him!)
   */
  public playOrderlyShriek() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Dissonant dual glissando scream
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(420, t);
    osc1.frequency.linearRampToValueAtTime(980, t + 0.2);
    osc1.frequency.linearRampToValueAtTime(350, t + 0.8);

    osc2.frequency.setValueAtTime(435, t);
    osc2.frequency.linearRampToValueAtTime(1020, t + 0.2);
    osc2.frequency.linearRampToValueAtTime(340, t + 0.8);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.9);
    osc2.stop(t + 0.9);
  }

  /**
   * Stage 4: Vintage School PA Chime / Bell Sweep
   */
  public playBellRinging() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const notes = [659.25, 587.33, 523.25, 392.00]; // E5, D5, C5, G4 chime

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const chimeTime = t + idx * 0.45;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, chimeTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, chimeTime);
      gain.gain.exponentialRampToValueAtTime(0.001, chimeTime + 2.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(chimeTime);
      osc.stop(chimeTime + 2.6);
    });
  }

  /**
   * Stage 6: Ominous Whispers / Sanity Drain (Concierge Lantern Gaze)
   */
  public playWhispers() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(i * 0.05);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(450, t);
    bandpass.Q.setValueAtTime(6.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  /**
   * Stage 7: High-Pressure Steam Conduit Purge
   */
  public playSteamHiss() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 1.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, t);
    filter.Q.setValueAtTime(1.8, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  /**
   * Stage 8: Reality Glitch Tear / Dimensional Distortion
   */
  public playGlitchTear() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.2);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  /**
   * Stage 3: Hospital Cardiac Heart Monitor ECG Beep
   */
  public playHospitalHeartMonitorBeep(distance: number) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1020, t);
    osc.frequency.setValueAtTime(1020, t + 0.08);

    const gain = this.ctx.createGain();
    const vol = Math.max(0.04, Math.min(0.28, (9 - distance) / 9 * 0.28));
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  /**
   * Stage 5 & 6: Phone pickup click and receiver rustle
   */
  public playPhonePickup() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  /**
   * Stage 6: Grand Hotel Brass Elevator Ding (Translocation Cue)
   */
  public playElevatorDing() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(784, t); // G5 ding

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 2.2);
  }

  /**
   * Stage completion / daylight transition chime
   */
  public playVictoryChime() {
    if (!this.ctx || !this.masterGain) return;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C E G C E
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime + idx * 0.15;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 1.2);
    });
  }

  public destroy() {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.isInitialized = false;
  }
}

export const soundEngine = new LiminalSoundEngine();
