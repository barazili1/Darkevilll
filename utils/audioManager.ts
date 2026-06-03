class AudioManager {
  private ctx: AudioContext | null = null;
  private flightOscillator: OscillatorNode | null = null;
  private flightGain: GainNode | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * High-fidelity, premium digital UI click
   * Faster sweep for a "glassy" tactile feel
   */
  public playClick() {
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(7000, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  /**
   * Distinctive double-pulse for copy success
   */
  public playCopy() {
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const playTone = (freq: number, start: number, length: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.1, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + length);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(start);
      osc.stop(start + length);
    };

    playTone(1200, now, 0.06);
    playTone(1600, now + 0.08, 0.08);
  }

  /**
   * Starts a soaring, rising engine/wind sound for flight
   */
  public startFlightSound() {
    this.resume();
    if (!this.ctx) return;
    this.stopFlightSound();

    const now = this.ctx.currentTime;
    this.flightOscillator = this.ctx.createOscillator();
    this.flightGain = this.ctx.createGain();

    this.flightOscillator.type = 'sawtooth';
    this.flightOscillator.frequency.setValueAtTime(60, now);
    this.flightOscillator.frequency.exponentialRampToValueAtTime(440, now + 5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 5);

    this.flightGain.gain.setValueAtTime(0, now);
    this.flightGain.gain.linearRampToValueAtTime(0.05, now + 0.5);

    this.flightOscillator.connect(filter);
    filter.connect(this.flightGain);
    this.flightGain.connect(this.ctx.destination);

    this.flightOscillator.start(now);
  }

  public stopFlightSound() {
    if (this.flightGain && this.flightOscillator && this.ctx) {
      const now = this.ctx.currentTime;
      this.flightGain.gain.cancelScheduledValues(now);
      this.flightGain.gain.setValueAtTime(this.flightGain.gain.value, now);
      this.flightGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      this.flightOscillator.stop(now + 0.15);
      this.flightOscillator = null;
      this.flightGain = null;
    }
  }

  public playCrash() {
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(100, now);
    sub.frequency.exponentialRampToValueAtTime(20, now + 0.4);
    subGain.gain.setValueAtTime(0.3, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(now);
    sub.stop(now + 0.4);

    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);
  }

  public playError() {
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    [440, 466].forEach(freq => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.setValueAtTime(0, now + 0.1);
      gain.gain.setValueAtTime(0.05, now + 0.2);
      gain.gain.setValueAtTime(0, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  public playSoftClick() { this.playClick(); }
  public playSuccess() { this.playClick(); }
  public playScan() { this.playClick(); }
  public playLaunch() { this.startFlightSound(); }
  public playResult() { this.stopFlightSound(); this.playCrash(); }
}

export const audioManager = new AudioManager();