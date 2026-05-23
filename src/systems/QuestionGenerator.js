/* =====================================================================
   QuestionGenerator — สมองคณิตของเกม
   ---------------------------------------------------------------------
   3 แบบโจทย์:
     - find_c   หา c จาก a,b   (บอส 1)
     - find_leg หา a หรือ b    (บอส 2)
     - converse บทกลับ (1/0)    (บอส 3)
     - mixed    สุ่ม 1 ใน 3    (บอสสุดท้าย)

   API:
     QuestionGenerator.forBoss(bossId, difficulty)
     QuestionGenerator.checkAnswer(userInput, correctAnswer)
     QuestionGenerator.resetHistory()
   ===================================================================== */

const QuestionGenerator = {

  TYPES: {
    FIND_C:   'find_c',
    FIND_LEG: 'find_leg',
    CONVERSE: 'converse',
    MIXED:    'mixed',
  },

  BOSS_TO_TYPE: {
    boss1_ghost: 'find_c',
    boss2_bat:   'find_leg',
    boss3_sand:  'converse',
    boss_final:  'mixed',
  },

  TYPE_LABELS: {
    find_c:   'หา c (ด้านตรงข้ามมุมฉาก)',
    find_leg: 'หา a หรือ b (ด้านประกอบมุมฉาก)',
    converse: 'บทกลับ (เป็นมุมฉากหรือไม่)',
    mixed:    'สลับกัน 3 แบบ',
  },

  _history: [],
  _MAX_HISTORY: 3,
  _queues: {},

  _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  _getNextTriple(triples, queueKey) {
    if (!this._queues[queueKey] || this._queues[queueKey].length === 0) {
      this._queues[queueKey] = this._shuffle(triples);
    }
    return this._queues[queueKey].shift();
  },

  forBoss(bossId, difficulty) {
    difficulty = difficulty || 'easy';
    const type = this.BOSS_TO_TYPE[bossId];
    if (!type) {
      console.warn('[QuestionGenerator] ไม่มี boss id: ' + bossId);
      return this.generate(this.TYPES.FIND_C, difficulty);
    }
    return this.generate(type, difficulty);
  },

  generate(type, difficulty) {
    difficulty = difficulty || 'easy';
    const diffData = NaSan.DIFFICULTY[difficulty.toUpperCase()];
    if (!diffData) throw new Error('ไม่รู้จัก difficulty: ' + difficulty);
    const triples = diffData.triples;

    let q, attempts = 0;
    do {
      q = this._buildOne(type, triples);
      attempts++;
    } while (this._isRecentlyUsed(q) && attempts < 10);

    this._addHistory(q);
    return q;
  },

  _buildOne(type, triples) {
    if (type === this.TYPES.MIXED) {
      const subs = [this.TYPES.FIND_C, this.TYPES.FIND_LEG, this.TYPES.CONVERSE];
      type = subs[Math.floor(Math.random() * subs.length)];
    }

    const [a, b, c] = triples[Math.floor(Math.random() * triples.length)];

    if (type === this.TYPES.FIND_C) {
      return {
        type: this.TYPES.FIND_C,
        triple: [a, b, c],
        triangle: { a, b, c, unknown: 'c' },
        display: 'สามเหลี่ยมมุมฉากมีด้านประกอบมุมฉาก ' + a + ' และ ' + b + ' หน่วย\nด้านตรงข้ามมุมฉากยาวเท่าใด?',
        shortDisplay: 'หา c | a=' + a + ', b=' + b,
        correctAnswer: c,
        hint: this._hintFindC(a, b, c),
        formula: 'c² = a² + b²',
      };
    }

    if (type === this.TYPES.FIND_LEG) {
      const findA = Math.random() < 0.5;
      const knownLeg     = findA ? b : a;
      const knownLegName = findA ? 'b' : 'a';
      const unknown      = findA ? 'a' : 'b';
      const unknownVal   = findA ? a : b;

      return {
        type: this.TYPES.FIND_LEG,
        triple: [a, b, c],
        triangle: { a, b, c, unknown },
        display: 'สามเหลี่ยมมุมฉากด้านตรงข้ามมุมฉากยาว ' + c + ' หน่วย\nอีกด้านยาว ' + knownLeg + ' หน่วย ด้านที่เหลือยาวเท่าใด?',
        shortDisplay: 'หา ' + unknown + ' | c=' + c + ', ' + knownLegName + '=' + knownLeg,
        correctAnswer: unknownVal,
        hint: this._hintFindLeg(c, knownLeg, knownLegName, unknown, unknownVal),
        formula: unknown + '² = c² − ' + knownLegName + '²',
      };
    }

    if (type === this.TYPES.CONVERSE) {
      const isTrue = Math.random() < 0.5;
      let sides;
      if (isTrue) {
        sides = [a, b, c];
      } else {
        const offsets = [1, 2, 3, -1, -2];
        const offset  = offsets[Math.floor(Math.random() * offsets.length)];
        sides = [a, b, Math.max(c + offset, b + 1)];
      }
      const [sa, sb, sc] = sides;
      const computed = sa * sa + sb * sb;
      const cSquared = sc * sc;

      return {
        type: this.TYPES.CONVERSE,
        triple: [a, b, c],
        triangle: { a: sa, b: sb, c: sc, unknown: null },
        display: 'สามเหลี่ยมมีด้านยาว ' + sa + ', ' + sb + ', ' + sc + ' หน่วย\nเป็นสามเหลี่ยมมุมฉากหรือไม่?  (1 = ใช่, 0 = ไม่ใช่)',
        shortDisplay: sa + ',' + sb + ',' + sc + ' → ' + (isTrue ? 'ใช่' : 'ไม่ใช่'),
        correctAnswer: isTrue ? 1 : 0,
        hint: this._hintConverse(sa, sb, sc, computed, cSquared, isTrue),
        formula: 'a² + b² = c² หรือไม่?',
      };
    }

    throw new Error('Unknown question type: ' + type);
  },

  _hintFindC(a, b, c) {
    return 'ใช้ทฤษฎีบทพีทาโกรัส:\n' +
           '  c² = a² + b²\n' +
           '  c² = ' + a + '² + ' + b + '²\n' +
           '  c² = ' + (a*a) + ' + ' + (b*b) + '\n' +
           '  c² = ' + (a*a + b*b) + '\n' +
           '  c  = √' + (a*a + b*b) + '\n' +
           '  c  = ' + c;
  },

  _hintFindLeg(c, knownLeg, knownName, unknown, unknownVal) {
    return 'ใช้ทฤษฎีบทพีทาโกรัส (จัดสมการใหม่):\n' +
           '  ' + unknown + '² = c² − ' + knownName + '²\n' +
           '  ' + unknown + '² = ' + c + '² − ' + knownLeg + '²\n' +
           '  ' + unknown + '² = ' + (c*c) + ' − ' + (knownLeg*knownLeg) + '\n' +
           '  ' + unknown + '² = ' + (c*c - knownLeg*knownLeg) + '\n' +
           '  ' + unknown + '  = √' + (c*c - knownLeg*knownLeg) + '\n' +
           '  ' + unknown + '  = ' + unknownVal;
  },

  _hintConverse(a, b, c, computed, cSquared, isTrue) {
    return 'ใช้บทกลับของทฤษฎีบทพีทาโกรัส:\n' +
           '  ถ้า a² + b² = c² ⇒ เป็นมุมฉาก\n' +
           '  ' + a + '² + ' + b + '² = ' + (a*a) + ' + ' + (b*b) + ' = ' + computed + '\n' +
           '  ' + c + '² = ' + cSquared + '\n' +
           (computed === cSquared
             ? '  ' + computed + ' = ' + cSquared + ' ✓ → เป็นมุมฉาก (ตอบ 1)'
             : '  ' + computed + ' ≠ ' + cSquared + ' ✗ → ไม่เป็นมุมฉาก (ตอบ 0)');
  },

  _isRecentlyUsed(q) {
    return this._history.some(h => h.shortDisplay === q.shortDisplay);
  },

  _addHistory(q) {
    this._history.push(q);
    if (this._history.length > this._MAX_HISTORY) this._history.shift();
  },

  resetHistory() { this._history = []; },

  checkAnswer(userInput, correctAnswer) {
    if (userInput === null || userInput === undefined || userInput === '') return false;
    const num = parseInt(String(userInput).trim(), 10);
    if (isNaN(num)) return false;
    return num === correctAnswer;
  },

  generateBatch(type, difficulty, count) {
    count = count || 10;
    this.resetHistory();
    const batch = [];
    for (let i = 0; i < count; i++) batch.push(this.generate(type, difficulty));
    return batch;
  },
};
