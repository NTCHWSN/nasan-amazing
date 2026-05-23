/* =====================================================================
   SaveManager — บันทึก/โหลดความก้าวหน้าใน localStorage
   ---------------------------------------------------------------------
   ข้อมูลที่เก็บ:
     {
       version: 1,
       currentDungeon: 1,         // ด่านสูงสุดที่ปลดล็อก (1-10)
       completedDungeons: { d1: true, ... },
       lastPlayed: timestamp,
       teacherMode: false,
       settings: { sound: true },
     }

   API:
     SaveManager.load()                          → save object
     SaveManager.save(data)                      → void
     SaveManager.markCompleted(dungeonId)        → void
     SaveManager.isUnlocked(dungeonId, n)        → boolean
     SaveManager.reset()                         → ลบทั้งหมด
     SaveManager.unlockAll()                     → teacher mode
   ===================================================================== */

const SaveManager = {
  KEY: 'nasanamazing_save_v1',

  _default() {
    return {
      version: 1,
      currentDungeon: 1,           // ด่านปัจจุบันที่ปลดล็อก (1 = ด่านแรกเสมอ)
      completedDungeons: {},       // { 'd1': true, 'd2': true, ... }
      lastPlayed: Date.now(),
      teacherMode: false,
      settings: { sound: true },
    };
  },

  load() {
    try {
      const raw = window.localStorage.getItem(this.KEY);
      if (!raw) return this._default();
      const data = JSON.parse(raw);
      /* migrate ถ้า schema เก่า */
      if (!data.completedDungeons) data.completedDungeons = {};
      if (typeof data.currentDungeon !== 'number') data.currentDungeon = 1;
      return data;
    } catch (e) {
      console.warn('[SaveManager] load failed:', e);
      return this._default();
    }
  },

  save(data) {
    try {
      data.lastPlayed = Date.now();
      window.localStorage.setItem(this.KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('[SaveManager] save failed:', e);
      return false;
    }
  },

  markCompleted(dungeonId) {
    const data = this.load();
    data.completedDungeons[dungeonId] = true;
    /* ปลดล็อกด่านถัดไป */
    const idx = parseInt(String(dungeonId).replace(/[^0-9]/g, ''), 10);
    if (!isNaN(idx) && idx + 1 > data.currentDungeon) {
      data.currentDungeon = idx + 1;
    }
    this.save(data);
    return data;
  },

  isCompleted(dungeonId) {
    return !!this.load().completedDungeons[dungeonId];
  },

  isUnlocked(dungeonId, n) {
    const data = this.load();
    if (data.teacherMode) return true;
    /* dungeonId มาในรูป 'd1', 'd2', ... */
    const idx = parseInt(String(dungeonId).replace(/[^0-9]/g, ''), 10);
    if (isNaN(idx)) return false;
    return idx <= data.currentDungeon;
  },

  reset() {
    try {
      window.localStorage.removeItem(this.KEY);
    } catch (e) {}
  },

  unlockAll() {
    const data = this.load();
    data.teacherMode = true;
    data.currentDungeon = 10;
    this.save(data);
    return data;
  },

  setTeacherMode(on) {
    const data = this.load();
    data.teacherMode = !!on;
    if (on) data.currentDungeon = 10;
    this.save(data);
    return data;
  },

  /* === Debug === */
  dump() {
    console.log('%c💾 SaveManager state:', 'color:#F4B942;font-weight:bold;', this.load());
  },
};
