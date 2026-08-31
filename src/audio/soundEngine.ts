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
   * Continuous 60Hz fluorescent ballast hum + 120Hz hum + random subtle buzz
   */
  private startFluorescentHum() {
    if (!this.ctx || !this.masterGain) return;

    // 60Hz base
    this.humOsc1 = this.ctx.createOscillator();
    this.humOsc1.type = 'sawtooth';
    this.humOsc1.frequency.setValueAtTime(60, this.ctx.currentTime);

    // 120Hz harmonic
    this.humOsc2 = this.ctx.createOscillator();
    this.humOsc2.type = 'sine';
    this.humOsc2.frequency.setValueAtTime(120, this.ctx.currentTime);

    // Filter to give damp fluorescent tube character
    const humFilter = this.ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
    humFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.humOsc1.connect(humFilter);
    this.humOsc2.connect(humFilter);
    humFilter.connect(this.humGain);
    this.humGain.connect(this.masterGain);

    this.humOsc1.start();
    this.humOsc2.start();

    // Random electrical flicker schedule
    this.scheduleHumFlicker();
  }

  private scheduleHumFlicker() {
    if (!this.ctx || !this.humGain) return;
    const nextFlicker = 3000 + Math.random() * 7000;
    setTimeout(() => {
      if (this.ctx && this.humGain) {
        const now = this.ctx.currentTime;
        // Buzz drop
        this.humGain.gain.setTargetAtTime(0.01, now, 0.03);
        this.humGain.gain.setTargetAtTime(0.14, now + 0.08, 0.04);
        this.humGain.gain.setTargetAtTime(0.08, now + 0.18, 0.05);
        this.triggerSparkSound();
      }
      this.scheduleHumFlicker();
    }, nextFlicker);
  }

  public setAmbientHumIntensity(intensity: number) {
    if (!this.ctx || !this.humGain) return;
    const target = Math.max(0.02, Math.min(0.2, intensity * 0.12));
    this.humGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.3);
  }

  /**
   * Footsteps adapted for surface: carpet, water, wood/tile, concrete
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
    gain.gain.exponentialRampToValueAtTime(0.001, t + (theme === 'poolrooms' ? 0.25 : 0.12));
    gain.connect(this.masterGain);

    if (theme === 'poolrooms') {
      // Water splash: noise + liquid plop
      const bufferSize = this.ctx.sampleRate * 0.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.04));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(isSprinting ? 900 : 700, t);
      bandpass.Q.setValueAtTime(2.0, t);

      noise.connect(bandpass);
      bandpass.connect(gain);
      noise.start(t);
    } else {
      // Carpet / concrete thud
      const osc = this.ctx.createOscillator();
      osc.type = theme === 'hotel' ? 'triangle' : 'sine';
      const baseFreq = theme === 'tunnels' ? 95 : 65;
      osc.frequency.setValueAtTime(baseFreq + Math.random() * 10, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 0.1);

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
