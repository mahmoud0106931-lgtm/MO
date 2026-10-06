/**
 * Lark Music Web Audio Engine with 5-Band Studio Equalizer & Real-time Visualizer
 */

export interface EQBands {
  bass: number;     // 60Hz
  lowMid: number;   // 250Hz
  mid: number;      // 1000Hz
  highMid: number;  // 4000Hz
  treble: number;   // 12000Hz
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private audioElement: HTMLAudioElement | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private isSynthPlaying = false;
  private synthInterval: number | null = null;
  private isMuted = false;
  private volume = 0.85;

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.smoothingTimeConstant = 0.8;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;

    // Create 5-band EQ
    const frequencies = [60, 250, 1000, 4000, 12000];
    const types: BiquadFilterType[] = ['lowshelf', 'peaking', 'peaking', 'peaking', 'highshelf'];

    this.eqFilters = frequencies.map((freq, i) => {
      const filter = this.ctx!.createBiquadFilter();
      filter.type = types[i];
      filter.frequency.value = freq;
      filter.gain.value = 0;
      return filter;
    });

    // Chain: Input -> EQ[0] -> EQ[1] -> EQ[2] -> EQ[3] -> EQ[4] -> MasterGain -> Analyser -> Destination
    let previousNode: AudioNode = this.eqFilters[0];
    for (let i = 1; i < this.eqFilters.length; i++) {
      previousNode.connect(this.eqFilters[i]);
      previousNode = this.eqFilters[i];
    }
    previousNode.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  public async resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public updateEQ(bands: EQBands, isEnabled: boolean) {
    if (!this.ctx || this.eqFilters.length < 5) return;
    const values = [bands.bass, bands.lowMid, bands.mid, bands.highMid, bands.treble];
    this.eqFilters.forEach((filter, index) => {
      const gainVal = isEnabled ? values[index] : 0;
      filter.gain.setTargetAtTime(gainVal, this.ctx!.currentTime, 0.05);
    });
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(64);
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Play rich harmonic ambient beats using Web Audio API synthesis
   */
  public startSynthMusic(tempo = 100) {
    this.resumeContext();
    if (this.isSynthPlaying) return;
    this.isSynthPlaying = true;

    // Harmonic chord progressions (Arabic Hijaz / Bayati / Romantic minor tonalities)
    const chords = [
      [220, 261.63, 329.63, 440],       // A minor
      [196, 246.94, 293.66, 392],       // G major
      [174.61, 220, 261.63, 349.23],    // F major
      [164.81, 207.65, 246.94, 329.63], // E dominant / Hijaz
    ];

    let chordStep = 0;
    const beatInterval = (60 / tempo) * 1000;

    const playChord = () => {
      if (!this.isSynthPlaying || !this.ctx || !this.eqFilters[0]) return;
      const currentChord = chords[chordStep % chords.length];
      chordStep++;

      const now = this.ctx.currentTime;
      // Pad oscillator
      currentChord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq * (idx === 0 ? 0.5 : 1), now);

        // Soft envelope
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.04 / (idx + 1), now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (beatInterval / 1000) * 1.8);

        osc.connect(gain);
        gain.connect(this.eqFilters[0]);

        osc.start(now);
        osc.stop(now + (beatInterval / 1000) * 1.9);
      });

      // Subtle warm bass kick & rim
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(110, now);
      kickOsc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

      kickGain.gain.setValueAtTime(0.12, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      kickOsc.connect(kickGain);
      kickGain.connect(this.eqFilters[0]);
      kickOsc.start(now);
      kickOsc.stop(now + 0.25);
    };

    playChord();
    this.synthInterval = window.setInterval(playChord, beatInterval * 2);
  }

  public stopSynthMusic() {
    this.isSynthPlaying = false;
    if (this.synthInterval !== null) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  /**
   * Connect custom HTML5 Audio (for uploaded audio files)
   */
  public attachAudioElement(audio: HTMLAudioElement) {
    this.resumeContext();
    if (!this.ctx || !this.eqFilters[0]) return;

    if (this.audioElement !== audio) {
      this.audioElement = audio;
      try {
        if (!this.mediaSource) {
          this.mediaSource = this.ctx.createMediaElementSource(audio);
          this.mediaSource.connect(this.eqFilters[0]);
        }
      } catch (e) {
        console.warn('MediaElementSource already attached', e);
      }
    }
  }
}

export const audioEngine = new AudioEngine();
