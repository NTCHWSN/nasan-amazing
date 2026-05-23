/* =====================================================================
   SoundManager — เสียง BGM + SFX แบบ WebAudio (synthesized)
   ---------------------------------------------------------------------
   ไม่ต้องโหลดไฟล์เพิ่ม! ใช้ WebAudio API สร้างเสียงในเบราเซอร์โดยตรง
   - BGM: ทำนองอุ่น ๆ คลอเบา ๆ (loop ภายในตัวเอง)
   - SFX: click / correct / wrong / victory / select / boss-defeat

   API:
     SoundManager.init()                — เริ่มต้น (เรียกครั้งเดียว)
     SoundManager.play('click'|'correct'|'wrong'|'victory'|'select'|'defeat')
     SoundManager.startBGM()            — เริ่มเล่นเพลง BGM
     SoundManager.stopBGM()             — หยุดเพลง
     SoundManager.setMuted(bool)        — เปิด/ปิดเสียงทั้งหมด
     SoundManager.toggleMute()          — สลับเสียง
     SoundManager.isMuted()
   ===================================================================== */

const SoundManager = {

  _ctx: null,
  _master: null,
  _bgmGain: null,
  _sfxGain: null,
  _bgmNodes: [],
  _bgmTimer: null,
  _muted: false,
  _bgmPlaying: false,

  init() {
    if (this._ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        console.warn('🔇 WebAudio ไม่รองรับ');
        return;
      }
      this._ctx = new AC();
      this._master = this._ctx.createGain();
      this._master.gain.value = 0.7;
      this._master.connect(this._ctx.destination);

      this._bgmGain = this._ctx.createGain();
      this._bgmGain.gain.value = 0.20;   // BGM เบา ๆ
      this._bgmGain.connect(this._master);

      this._sfxGain = this._ctx.createGain();
      this._sfxGain.gain.value = 0.55;
      this._sfxGain.connect(this._master);

      /* โหลด preference จาก localStorage */
      const m = localStorage.getItem('nasan_muted');
      this._muted = (m === '1');
      this._master.gain.value = this._muted ? 0 : 0.7;

      /* Resume context หลัง user gesture แรก */
      const resume = () => {
        if (this._ctx && this._ctx.state === 'suspended') this._ctx.resume();
      };
      document.addEventListener('pointerdown', resume, { once: false });
      document.addEventListener('keydown', resume, { once: false });

      console.log('✅ SoundManager พร้อม');
    } catch (e) {
      console.warn('🔇 SoundManager init failed:', e);
    }
  },

  /* ========== Helpers ========== */
  _now() { return this._ctx ? this._ctx.currentTime : 0; },

  _tone(freq, dur, type = 'sine', vol = 1, startOffset = 0, target = null) {
    if (!this._ctx) return null;
    const t0 = this._now() + startOffset;
    const osc = this._ctx.createOscillator();
    const g   = this._ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(target || this._sfxGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
    return { osc, gain: g };
  },

  /* ========== SFX ========== */
  play(name) {
    if (!this._ctx || this._muted) return;
    /* Resume context (browsers suspend until first user gesture) */
    if (this._ctx.state === 'suspended') this._ctx.resume();

    switch (name) {
      case 'click':
        this._tone(660, 0.05, 'square', 0.4);
        break;
      case 'select':
        this._tone(880, 0.06, 'triangle', 0.5);
        this._tone(1320, 0.06, 'triangle', 0.3, 0.04);
        break;
      case 'correct':
        /* arpeggio happy: C-E-G */
        this._tone(523, 0.10, 'sine', 0.5, 0.00);  // C5
        this._tone(659, 0.10, 'sine', 0.5, 0.10);  // E5
        this._tone(784, 0.18, 'sine', 0.5, 0.20);  // G5
        break;
      case 'wrong':
        /* dissonant descending */
        this._tone(220, 0.12, 'sawtooth', 0.35, 0.00);
        this._tone(180, 0.18, 'sawtooth', 0.35, 0.10);
        break;
      case 'victory':
        /* fanfare 5-note */
        this._tone(523, 0.12, 'triangle', 0.6, 0.00);
        this._tone(659, 0.12, 'triangle', 0.6, 0.12);
        this._tone(784, 0.12, 'triangle', 0.6, 0.24);
        this._tone(1047, 0.30, 'triangle', 0.6, 0.40);
        break;
      case 'defeat':
        /* boss explode */
        this._tone(110, 0.40, 'sawtooth', 0.5, 0.00);
        this._tone(82, 0.40, 'sawtooth', 0.5, 0.10);
        this._tone(55, 0.50, 'sine', 0.4, 0.20);
        break;
      case 'levelup':
        this._tone(659, 0.10, 'sine', 0.5, 0.00);
        this._tone(784, 0.10, 'sine', 0.5, 0.10);
        this._tone(988, 0.10, 'sine', 0.5, 0.20);
        this._tone(1319, 0.25, 'sine', 0.5, 0.30);
        break;
      default:
        this._tone(440, 0.08, 'sine', 0.5);
    }
  },

  /* ========== BGM ========== */
  startBGM() {
    if (!this._ctx || this._bgmPlaying) return;
    if (this._ctx.state === 'suspended') this._ctx.resume();
    this._bgmPlaying = true;

    /* ทำนองเบาๆ คลอ — C major pentatonic (กลิ่นไทย/folk เล็กน้อย)
       ใช้รูปแบบ I-V-vi-IV ที่ฟังสบาย */
    const NOTES = [
      /* freq, duration */
      [261.6, 0.5], [329.6, 0.5], [392.0, 0.5], [523.2, 0.5],
      [440.0, 0.5], [392.0, 0.5], [329.6, 0.5], [293.7, 0.5],
      [349.2, 0.5], [392.0, 0.5], [440.0, 0.5], [493.9, 0.5],
      [440.0, 0.5], [392.0, 0.5], [329.6, 0.5], [261.6, 0.5],
    ];
    let idx = 0;

    const playLoop = () => {
      if (!this._bgmPlaying) return;
      const [freq, dur] = NOTES[idx];
      const t0 = this._now();
      /* main note */
      const o1 = this._ctx.createOscillator();
      const g1 = this._ctx.createGain();
      o1.type = 'triangle';
      o1.frequency.setValueAtTime(freq, t0);
      g1.gain.setValueAtTime(0.0001, t0);
      g1.gain.linearRampToValueAtTime(0.4, t0 + 0.05);
      g1.gain.linearRampToValueAtTime(0.0001, t0 + dur - 0.05);
      o1.connect(g1);
      g1.connect(this._bgmGain);
      o1.start(t0);
      o1.stop(t0 + dur);

      /* harmonic */
      const o2 = this._ctx.createOscillator();
      const g2 = this._ctx.createGain();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(freq * 1.5, t0);
      g2.gain.setValueAtTime(0.0001, t0);
      g2.gain.linearRampToValueAtTime(0.15, t0 + 0.05);
      g2.gain.linearRampToValueAtTime(0.0001, t0 + dur - 0.05);
      o2.connect(g2);
      g2.connect(this._bgmGain);
      o2.start(t0);
      o2.stop(t0 + dur);

      this._bgmNodes.push(o1, o2);
      if (this._bgmNodes.length > 50) this._bgmNodes.splice(0, 30);

      idx = (idx + 1) % NOTES.length;
      this._bgmTimer = setTimeout(playLoop, dur * 1000);
    };
    playLoop();
  },

  stopBGM() {
    this._bgmPlaying = false;
    if (this._bgmTimer) { clearTimeout(this._bgmTimer); this._bgmTimer = null; }
    this._bgmNodes.forEach(n => { try { n.stop(); } catch(e){} });
    this._bgmNodes = [];
  },

  setMuted(b) {
    this._muted = !!b;
    if (this._master) this._master.gain.value = this._muted ? 0 : 0.7;
    try { localStorage.setItem('nasan_muted', this._muted ? '1' : '0'); } catch(e){}
  },

  toggleMute() {
    this.setMuted(!this._muted);
    return this._muted;
  },

  isMuted() { return this._muted; },
};

window.SoundManager = SoundManager;
