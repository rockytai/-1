
export const AudioEngine = {
  ctx: null as AudioContext | null,
  init: function() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  playTone: function(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },
  playAttack: function() {
    this.init();
    this.playTone(600, 'sine', 0.1, 0.2); 
    setTimeout(() => this.playTone(800, 'sine', 0.1, 0.2), 50); 
    setTimeout(() => this.playTone(1200, 'square', 0.05, 0.1), 100); 
  },
  playDamage: function() {
    this.init();
    this.playTone(100, 'sawtooth', 0.2, 0.4); 
    setTimeout(() => this.playTone(80, 'sawtooth', 0.2, 0.4), 100);
  },
  playWin: function() {
    this.init();
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.3, 0.2), i * 150);
    });
  },
  playFail: function() {
    this.init();
    this.playTone(300, 'sawtooth', 0.4, 0.3);
    setTimeout(() => this.playTone(250, 'sawtooth', 0.4, 0.3), 300);
    setTimeout(() => this.playTone(200, 'sawtooth', 0.6, 0.3), 600);
  },
  playLevelUp: function() {
    this.init();
    // A rising arpeggio
    [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.1, 0.2), i * 80);
    });
    // Final chord
    setTimeout(() => {
        this.playTone(523.25, 'triangle', 0.3, 0.3);
        this.playTone(659.25, 'triangle', 0.3, 0.3);
        this.playTone(783.99, 'triangle', 0.3, 0.3);
        this.playTone(1046.50, 'triangle', 0.3, 0.3);
    }, 600);
  },
  speak: function(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN'));
    if (zhVoice) utterance.voice = zhVoice;
    utterance.lang = 'zh-CN';
    utterance.rate = 0.6;
    window.speechSynthesis.speak(utterance);
  }
};
