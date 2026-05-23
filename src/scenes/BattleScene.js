/* =====================================================================
   BattleScene — ฉากต่อสู้บอส (Boss Battle)
   ---------------------------------------------------------------------
   รับข้อมูลผ่าน scene.start('BattleScene', { bossId, difficulty, returnScene })

   Layout (1280×720):
   ┌────────────────────────────────────────────────────────────┐
   │  ◄ ออก     [HP บอส ❤❤❤❤❤]            ⏱ 60     [💡 Hint]    │  ← top bar
   ├────────────────────────────────────────────────────────────┤
   │                                                            │
   │     🦇 ค้างคาวฮีโร่หูเอียง                                  │  ← Boss (กลางบน)
   │       (image / placeholder)                                │
   │                                                            │
   │  ────────────────────────────────────────────────────────  │
   │   ┌──────────┐    "สามเหลี่ยมมุมฉาก a=8,b=15…"             │  ← โจทย์
   │   │ ▲triangle│    "ด้านตรงข้ามมุมฉากยาว ?"                  │
   │   │  ทีRender │                                            │
   │   └──────────┘                                             │
   │                                                            │
   ├────────────────────────────────────────────────────────────┤
   │  🍎 🌰 🐟  HP: ❤❤❤❤      ┌─ NumberPad ─┐                  │
   │                          │ 7 8 9 ⌫     │                  │
   │                          │ 4 5 6 C  ✓  │                  │
   │                          │ 1 2 3       │                  │
   │                          │   0         │                  │
   │                          └─────────────┘                  │
   └────────────────────────────────────────────────────────────┘

   Flow:
     init(data)  → keep bossId, difficulty, returnScene
     create()    → ทำ UI ทั้งหมด + สุ่มโจทย์แรก
     loadNextQuestion() → สุ่มโจทย์ใหม่ + reset timer
     onSubmit(v) → ตรวจคำตอบ
                  ถูก  → boss HP -1, ถ้า boss ตาย → win
                  ผิด  → party HP -1, ถ้า party ตาย → lose
     onTimerEnd  → นับเป็นผิด
     win()       → modal "ชนะ!" → กลับ returnScene
     lose()      → modal "แพ้!" → ปุ่มลองใหม่ / ออก
   ===================================================================== */

class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data = {}) {
    this.bossId       = data.bossId      || 'boss1_ghost';
    this.difficulty   = data.difficulty  || 'easy';
    this.returnScene  = data.returnScene || 'TitleScene';
    this.returnData   = data.returnData  || null;

    const diff = NaSan.DIFFICULTY[this.difficulty.toUpperCase()];
    this.bossHP    = diff ? diff.bossHP    : 3;
    this.partyHP   = diff ? diff.partyHP   : 4;
    this.timePerQ  = diff ? diff.timePerQuestion : 60;
    this.hintsLeft = diff ? diff.hintsPerDungeon : 1;
    this.showFormulaFlag = diff ? diff.showFormula : true;

    /* state */
    this.currentQ      = null;
    this.timerEvent    = null;
    this.timeLeft      = this.timePerQ;
    this.locked        = false;
  }

  create() {
    const { width, height } = this.scale;

    /* ───── พื้นหลัง (ตามบอส) ───── */
    this._addBackground(width, height);

    /* ───── Ambient particles เฉพาะแต่ละบอส ───── */
    this._addAmbientParticles(width, height);

    /* ───── Top bar ───── */
    this._addTopBar(width, height);

    /* ───── บอส (กลางบน) ───── */
    this._addBoss(width, height);

    /* ───── พื้นที่โจทย์ + สามเหลี่ยม ───── */
    this._addQuestionArea(width, height);

    /* ───── Party (ตัวเอก 3 คน + HP) ───── */
    this._addParty(width, height);

    /* ───── NumberPad ───── */
    this._addNumberPad(width, height);

    /* ───── โจทย์แรก ───── */
    QuestionGenerator.resetHistory();
    this.loadNextQuestion();
  }

  /* ===================================================================
     UI Builders
     =================================================================== */
  _addBackground(width, height) {
    /* legacy bosses (BattleTest scene) */
    const legacyMap = {
      boss1_ghost: 'bg_d1',
      boss2_bat:   'bg_d5',
      boss3_sand:  'bg_d8',
      boss_final:  'bg_d10',
    };
    /* boss_d1..boss_d10 → bg_d1..bg_d10 ตรง ๆ */
    let bgKey = legacyMap[this.bossId];
    if (!bgKey) {
      const match = (this.bossId || '').match(/^boss_d(\d+)$/);
      if (match) bgKey = 'bg_d' + match[1];
    }
    if (!bgKey) bgKey = 'bg_d1';

    let bg;
    if (this.textures.exists(bgKey)) {
      bg = this.add.image(width / 2, height / 2, bgKey);
      const scale = Math.max(width / bg.width, height / bg.height);
      bg.setScale(scale);
    } else {
      /* placeholder gradient */
      const g = this.add.graphics();
      g.fillStyle(0x2C5F8D);
      g.fillRect(0, 0, width, height);
    }
    /* Darken */
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, 0, width, height);
  }

  _addTopBar(width, height) {
    /* Top bar background */
    const barH = 60;
    const barBg = this.add.graphics();
    barBg.fillStyle(0x000000, 0.55);
    barBg.fillRect(0, 0, width, barH);

    /* ปุ่มออก (◄) — ใหญ่ขึ้นสำหรับมือถือ */
    const exitBtn = this.add.text(20, barH/2, '◄ ออก', {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '22px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: 'rgba(217, 38, 61, 0.92)',
      padding: { x: 18, y: 10 },
    }).setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true });
    exitBtn.on('pointerup', () => {
      if (typeof SoundManager !== 'undefined') SoundManager.play('click');
      this._confirmExit();
    });

    /* HP บอส (กลาง) */
    const bossMeta = PlaceholderFactory.BOSSES[this.bossId] || {};
    const bossName = bossMeta.name || 'Boss';
    this.bossNameTxt = this.add.text(width / 2, 14, bossName, {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '18px',
      color: NaSan.CSS_COLORS.WARNING,
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.bossHPContainer = this.add.container(width / 2, 40);
    this._renderBossHP();

    /* Timer (ขวา) */
    this.timerTxt = this.add.text(width - 200, barH/2, '⏱ 60', {
      fontFamily: NaSan.FONTS.MONO,
      fontSize: '22px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(1, 0.5);

    /* ปุ่ม Hint */
    this.hintBtn = this.add.text(width - 20, barH/2,
      `💡 Hint (${this.hintsLeft})`, {
        fontFamily: NaSan.FONTS.BODY,
        fontSize: '18px',
        color: '#FFFFFF',
        fontStyle: 'bold',
        backgroundColor: 'rgba(244, 185, 66, 0.9)',
        padding: { x: 10, y: 6 },
      }).setOrigin(1, 0.5)
       .setInteractive({ useHandCursor: true });
    this.hintBtn.on('pointerup', () => this._useHint());
    if (this.hintsLeft <= 0) this.hintBtn.setAlpha(0.4);
  }

  _renderBossHP() {
    this.bossHPContainer.removeAll(true);
    const maxHP = NaSan.DIFFICULTY[this.difficulty.toUpperCase()].bossHP;
    const heartSize = 22;
    const gap = 6;
    const totalW = maxHP * heartSize + (maxHP - 1) * gap;
    const startX = -totalW / 2 + heartSize/2;
    for (let i = 0; i < maxHP; i++) {
      const g = this.add.graphics();
      const filled = i < this.bossHP;
      PlaceholderFactory.drawHeart(g, startX + i * (heartSize + gap), 0, heartSize,
        filled ? NaSan.COLORS.DANGER : 0x444444);
      this.bossHPContainer.add(g);
    }
  }

  _addBoss(width, height) {
    const x = width / 2;
    const y = 230;

    this.bossSprite = PlaceholderFactory.getBossDisplay(this, x, y, this.bossId, {
      width: 200, height: 240, scale: 0.5,
    });

    /* เด้งขึ้นลงเบาๆ */
    this.tweens.add({
      targets: this.bossSprite,
      y: y - 10,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  _addQuestionArea(width, height) {
    /* แถบโจทย์ (พื้นหลังครีม) */
    const areaY = 360;
    const areaH = 170;
    const areaBg = this.add.graphics();
    areaBg.fillStyle(NaSan.COLORS.BACKGROUND, 0.95);
    areaBg.fillRoundedRect(20, areaY, width - 40, areaH, 16);
    areaBg.lineStyle(3, NaSan.COLORS.PRIMARY);
    areaBg.strokeRoundedRect(20, areaY, width - 40, areaH, 16);

    /* พื้นที่สามเหลี่ยม (ซ้าย) */
    this.triangleContainer = this.add.container(140, areaY + areaH/2);

    /* ข้อความโจทย์ (ขวาของสามเหลี่ยม) */
    this.questionTxt = this.add.text(290, areaY + 20, '', {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '22px',
      color: NaSan.CSS_COLORS.TEXT,
      lineSpacing: 6,
      wordWrap: { width: width - 320 },
    }).setOrigin(0, 0);

    /* สูตร (ถ้า easy โหมด) */
    this.formulaTxt = this.add.text(290, areaY + areaH - 16, '', {
      fontFamily: NaSan.FONTS.MONO,
      fontSize: '16px',
      color: NaSan.CSS_COLORS.PRIMARY,
      fontStyle: 'bold',
    }).setOrigin(0, 1);
  }

  _addParty(width, height) {
    /* พื้นที่ Party ซ้ายล่าง */
    const baseY = height - 100;
    const baseX = 60;

    /* ตัวเอก 3 คน (เล็ก ๆ) */
    const heroKeys = ['char_ngoh', 'char_durian', 'char_plameng'];
    heroKeys.forEach((key, i) => {
      if (!this.textures.exists(key)) {
        /* placeholder */
        const g = this.add.graphics();
        const colors = [0xD9263D, 0x6BB13D, 0x2C5F8D];
        g.fillStyle(colors[i]);
        g.fillCircle(baseX + i * 56, baseY, 22);
        this.add.text(baseX + i * 56, baseY,
          ['🍎','🌰','🐟'][i], { fontSize: '22px' }).setOrigin(0.5);
        return;
      }
      const sprite = this.add.image(baseX + i * 56, baseY, key);
      const tex = this.textures.get(key).getSourceImage();
      /* Sheet 2×2 — เอา top-left pose เท่านั้น */
      sprite.setCrop(tex.width * 0.05, tex.height * 0.03, tex.width * 0.42, tex.height * 0.47);
      sprite.setOrigin(0.5);
      sprite.setScale(0.16);
    });

    /* HP party */
    const hpLabel = this.add.text(baseX, baseY + 40, 'พรรค HP', {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 6, y: 2 },
    }).setOrigin(0);

    this.partyHPContainer = this.add.container(baseX, baseY + 70);
    this._renderPartyHP();
  }

  _renderPartyHP() {
    this.partyHPContainer.removeAll(true);
    const maxHP = NaSan.DIFFICULTY[this.difficulty.toUpperCase()].partyHP;
    const heartSize = 24;
    const gap = 6;
    for (let i = 0; i < maxHP; i++) {
      const g = this.add.graphics();
      const filled = i < this.partyHP;
      PlaceholderFactory.drawHeart(g, i * (heartSize + gap), 0, heartSize,
        filled ? NaSan.COLORS.SUCCESS : 0x444444);
      this.partyHPContainer.add(g);
    }
  }

  _addNumberPad(width, height) {
    const padX = width - 200;
    const padY = height - 360;
    this.numpad = NumberPad.create(this, {
      x: padX,
      y: padY,
      maxDigits: 4,
      labelText: 'คำตอบ',
      onSubmit: (val) => this._onSubmit(val),
    });
  }

  /* ===================================================================
     Game flow
     =================================================================== */
  loadNextQuestion() {
    this.locked = false;
    this.numpad.clear();
    this.numpad.setEnabled(true);

    this.currentQ = QuestionGenerator.forBoss(this.bossId, this.difficulty);

    /* แสดงข้อความ */
    this.questionTxt.setText(this.currentQ.display);

    /* สูตร — แสดงเฉพาะโหมด easy */
    if (this.showFormulaFlag) {
      this.formulaTxt.setText(`สูตร: ${this.currentQ.formula}`);
    } else {
      this.formulaTxt.setText('');
    }

    /* สามเหลี่ยม */
    this.triangleContainer.removeAll(true);
    if (typeof TriangleRenderer !== 'undefined') {
      const g = TriangleRenderer.draw(this, 0, 0, {
        a: this.currentQ.triangle.a,
        b: this.currentQ.triangle.b,
        c: this.currentQ.triangle.c,
        unknown: this.currentQ.triangle.unknown,
        size: 120,
      });
      this.triangleContainer.add(g);
    }

    /* เริ่ม timer */
    this._startTimer();
  }

  _startTimer() {
    if (this.timerEvent) this.timerEvent.remove();
    this.timeLeft = this.timePerQ;
    this._updateTimerText();
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timeLeft--;
        this._updateTimerText();
        if (this.timeLeft <= 0) {
          this.timerEvent.remove();
          this._onTimeUp();
        }
      },
    });
  }

  _updTimer() { this._updateTimerText(); }
  _updateTimerText() {
    const color = this.timeLeft <= 10 ? '#D9263D'
                : this.timeLeft <= 20 ? '#F4B942'
                : '#FFFFFF';
    this.timerTxt.setText(`⏱ ${this.timeLeft}`).setColor(color);
    if (this.timeLeft <= 10 && this.timeLeft > 0) {
      this.tweens.add({
        targets: this.timerTxt,
        scale: 1.15,
        duration: 100,
        yoyo: true,
      });
    }
  }

  _onSubmit(val) {
    if (this.locked) return;
    if (val === '' || val === null || val === undefined) {
      this.numpad.flashWrong();
      return;
    }

    const correct = QuestionGenerator.checkAnswer(val, this.currentQ.correctAnswer);
    this.locked = true;
    this.numpad.setEnabled(false);
    if (this.timerEvent) this.timerEvent.remove();

    if (correct) {
      this.numpad.flashCorrect();
      if (typeof SoundManager !== 'undefined') SoundManager.play('correct');
      this._onCorrect();
    } else {
      this.numpad.flashWrong();
      if (typeof SoundManager !== 'undefined') SoundManager.play('wrong');
      this._onWrong();
    }
  }

  _onCorrect() {
    /* บอส -1 HP */
    this.bossHP--;
    this._renderBossHP();
    this._showFloatingText('โจมตี! -1 HP', NaSan.CSS_COLORS.SUCCESS, this.bossSprite.x, this.bossSprite.y);
    this._shake(this.bossSprite, 6);

    if (this.bossHP <= 0) {
      if (typeof SoundManager !== 'undefined') SoundManager.play('defeat');
      this.time.delayedCall(1000, () => this._win());
    } else {
      this.time.delayedCall(1200, () => this.loadNextQuestion());
    }
  }

  _onWrong() {
    /* Party -1 HP */
    this.partyHP--;
    this._renderPartyHP();
    /* เย้ยจากบอส (สุ่ม) */
    if (typeof DialogueData !== 'undefined') {
      const taunt = DialogueData.randomTaunt(this.bossId);
      this._showBossTaunt(taunt);
    }
    this._showFloatingText(`ผิด! เฉลย: ${this.currentQ.correctAnswer}`,
      NaSan.CSS_COLORS.DANGER, this.scale.width / 2, this.scale.height / 2);

    if (this.partyHP <= 0) {
      this.time.delayedCall(1500, () => this._lose());
    } else {
      this.time.delayedCall(1800, () => this.loadNextQuestion());
    }
  }


  _addAmbientParticles(width, height) {
    /* legacy 4 บอส + 10 บอสใหม่ — เลือก particle theme ตามบรรยากาศของด่าน */
    const config = {
      /* legacy keys */
      boss1_ghost: { count: 16, mk: (x, y) => this._mkWaterDrop(x, y), spawn: 'top' },
      boss2_bat:   { count: 10, mk: (x, y) => this._mkBat(x, y),       spawn: 'side' },
      boss3_sand:  { count: 22, mk: (x, y) => this._mkSandGrain(x, y), spawn: 'left' },
      boss_final:  { count: 14, mk: (x, y) => this._mkSparkle(x, y),   spawn: 'random' },
      /* 10 ด่าน */
      boss_d1:  { count: 14, mk: (x, y) => this._mkSparkle(x, y),   spawn: 'random' },  // สวนเงาะ — ใบไม้/ผีเสื้อ
      boss_d2:  { count: 12, mk: (x, y) => this._mkSandGrain(x, y), spawn: 'left' },    // สะพาน — ฝุ่นถ่าน
      boss_d3:  { count: 14, mk: (x, y) => this._mkWaterDrop(x, y), spawn: 'top' },     // คลอง — หยดน้ำ
      boss_d4:  { count: 14, mk: (x, y) => this._mkSparkle(x, y),   spawn: 'random' },  // ศาล — ประกาย
      boss_d5:  { count: 10, mk: (x, y) => this._mkBat(x, y),       spawn: 'side' },    // ถ้ำ — ค้างคาว
      boss_d6:  { count: 18, mk: (x, y) => this._mkWaterDrop(x, y), spawn: 'top' },     // น้ำตก
      boss_d7:  { count: 22, mk: (x, y) => this._mkWaterDrop(x, y), spawn: 'top' },     // น้ำตกใหญ่
      boss_d8:  { count: 24, mk: (x, y) => this._mkSandGrain(x, y), spawn: 'left' },    // ทราย
      boss_d9:  { count: 14, mk: (x, y) => this._mkSparkle(x, y),   spawn: 'random' },  // ป่า — แสง
      boss_d10: { count: 18, mk: (x, y) => this._mkSparkle(x, y),   spawn: 'random' },  // final
    };
    const cfg = config[this.bossId];
    if (!cfg) return;

    for (let i = 0; i < cfg.count; i++) {
      this.time.delayedCall(i * 200, () => this._spawnParticle(cfg));
    }
    this._ambientTimer = this.time.addEvent({
      delay: 350,
      loop: true,
      callback: () => this._spawnParticle(cfg),
    });
  }

  _spawnParticle(cfg) {
    const { width, height } = this.scale;
    let x, y;
    switch (cfg.spawn) {
      case 'top':    x = Math.random() * width; y = -20; break;
      case 'side':   x = Math.random() < 0.5 ? -20 : width + 20;
                     y = 60 + Math.random() * (height - 200); break;
      case 'left':   x = -20; y = 100 + Math.random() * (height - 250); break;
      case 'random': x = Math.random() * width; y = Math.random() * height; break;
      default:       x = Math.random() * width; y = -20;
    }
    cfg.mk(x, y);
  }

  _mkWaterDrop(x, y) {
    const g = this.add.graphics();
    g.fillStyle(0x88C5E8, 0.7);
    g.fillCircle(0, 0, 3 + Math.random() * 2);
    g.fillStyle(0xFFFFFF, 0.5);
    g.fillCircle(-1, -1, 1.5);
    g.x = x; g.y = y;
    g.setDepth(50);
    this.tweens.add({
      targets: g,
      y: this.scale.height + 30,
      x: x + (Math.random() - 0.5) * 30,
      alpha: 0,
      duration: 1500 + Math.random() * 1000,
      onComplete: () => g.destroy(),
    });
  }

  _mkBat(x, y) {
    const t = this.add.text(x, y, '🦇', { fontSize: '20px' });
    t.setDepth(50).setAlpha(0.7);
    const goRight = x < 0;
    const endX = goRight ? this.scale.width + 30 : -30;
    this.tweens.add({
      targets: t,
      x: endX,
      y: y + (Math.random() - 0.5) * 100,
      duration: 2500 + Math.random() * 1500,
      onComplete: () => t.destroy(),
    });
    this.tweens.add({
      targets: t,
      scaleY: 0.6,
      duration: 150,
      yoyo: true,
      repeat: -1,
    });
  }

  _mkSandGrain(x, y) {
    const g = this.add.graphics();
    const color = [0xF4B942, 0xCC9966, 0xE0B070][Math.floor(Math.random() * 3)];
    g.fillStyle(color, 0.7);
    const r = 1 + Math.random() * 2;
    g.fillCircle(0, 0, r);
    g.x = x; g.y = y;
    g.setDepth(50);
    this.tweens.add({
      targets: g,
      x: this.scale.width + 30,
      y: y + (Math.random() - 0.5) * 200,
      alpha: 0,
      duration: 2500 + Math.random() * 1500,
      onComplete: () => g.destroy(),
    });
  }

  _mkSparkle(x, y) {
    const colors = ['✨', '⭐', '💫', '🪔'];
    const t = this.add.text(x, y, colors[Math.floor(Math.random() * colors.length)], {
      fontSize: (12 + Math.random() * 12) + 'px',
    }).setAlpha(0).setDepth(50);
    this.tweens.add({
      targets: t,
      alpha: { from: 0, to: 0.9 },
      scale: { from: 0.5, to: 1.2 },
      duration: 400,
      yoyo: true,
      hold: 500,
      onComplete: () => t.destroy(),
    });
  }

  _showBossTaunt(text) {
    if (!this.bossSprite) return;
    const bubbleY = this.bossSprite.y - 100;
    const bubbleX = this.bossSprite.x + 100;

    const txt = this.add.text(bubbleX, bubbleY, text, {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '16px',
      color: NaSan.CSS_COLORS.TEXT,
      fontStyle: 'bold',
      backgroundColor: 'rgba(255,255,255,0.95)',
      padding: { x: 12, y: 8 },
      wordWrap: { width: 280 },
    }).setOrigin(0, 0.5).setDepth(100).setAlpha(0);
    this.tweens.add({
      targets: txt,
      alpha: 1, y: bubbleY - 10,
      duration: 300, yoyo: true, hold: 1500,
      onComplete: () => txt.destroy(),
    });
  }

  _onTimeUp() {
    if (this.locked) return;
    this.locked = true;
    this.numpad.setEnabled(false);
    this._showFloatingText('หมดเวลา!', NaSan.CSS_COLORS.WARNING,
      this.scale.width / 2, this.scale.height / 2);
    this.partyHP--;
    this._renderPartyHP();
    if (this.partyHP <= 0) {
      this.time.delayedCall(1500, () => this._lose());
    } else {
      this.time.delayedCall(1800, () => this.loadNextQuestion());
    }
  }

  _useHint() {
    if (this.hintsLeft <= 0 || !this.currentQ || this.locked) return;
    this.hintsLeft--;
    this.hintBtn.setText(`💡 Hint (${this.hintsLeft})`);
    if (this.hintsLeft <= 0) this.hintBtn.setAlpha(0.4);

    this._showInfoModal('💡 คำใบ้', this.currentQ.hint);
  }

  /* ===================================================================
     Win / Lose
     =================================================================== */
  _win() {
    /* Mark dungeon completed via SaveManager (ใช้กับระบบ 10 ด่าน) */
    if (this.returnData && this.returnData.dungeonId && typeof SaveManager !== 'undefined') {
      SaveManager.markCompleted(this.returnData.dungeonId);
    }
    /* Mark boss defeated ใน returnData (ของเดิม) */
    if (this.returnData) {
      this.returnData.defeatedBosses = this.returnData.defeatedBosses || {};
      this.returnData.defeatedBosses[this.bossId] = true;
    }

    /* ตรวจว่าชนะครบ 10 บอสแล้วหรือยัง — ใช้ SaveManager (main flow) หรือ returnData (BattleTest) */
    let totalDefeated;
    if (typeof SaveManager !== 'undefined') {
      const sv = SaveManager.load();
      totalDefeated = Object.keys(sv.completedDungeons || {}).length;
    } else {
      totalDefeated = this.returnData && this.returnData.defeatedBosses
        ? Object.keys(this.returnData.defeatedBosses).length : 0;
    }
    const ALL_BOSSES = 10;
    const isFinalWin = totalDefeated >= ALL_BOSSES;

    const baseMsg = (typeof DialogueData !== 'undefined' ? DialogueData.forBoss(this.bossId).victory : '') +
      `\n\n(เอาชนะ ${PlaceholderFactory.BOSSES[this.bossId].name})\n+10 EXP  +1 ⭐`;

    const finalMsg = isFinalWin
      ? baseMsg + '\n\n🎊 คุณเอาชนะบอสครบทั้ง 10 แล้ว! 🎊\nกด "ดู Ending" เพื่อชมตอนจบ'
      : baseMsg;

    if (typeof SoundManager !== 'undefined') SoundManager.play(isFinalWin ? 'levelup' : 'victory');

    const buttons = isFinalWin
      ? [
          { label: 'ดู Ending', color: NaSan.COLORS.WARNING,
            onClick: () => this.scene.start('EndingScene', { difficulty: this.difficulty }) },
          { label: 'กลับ', color: NaSan.COLORS.SUCCESS,
            onClick: () => this.scene.start(this.returnScene, this.returnData || {}) },
        ]
      : [
          { label: 'กลับ', color: NaSan.COLORS.SUCCESS,
            onClick: () => this.scene.start(this.returnScene, this.returnData || {}) },
        ];

    this._showResultModal('🏆 ชนะ!', finalMsg, buttons);
  }

  _lose() {
    this._showResultModal('💔 แพ้แล้ว',
      `อย่ายอมแพ้!\nทฤษฎีบทพีทาโกรัส: c² = a² + b²\n\nลองอีกครั้งนะ!`,
      [
        { label: 'ลองใหม่', color: NaSan.COLORS.SUCCESS,
          onClick: () => this.scene.restart({ bossId: this.bossId, difficulty: this.difficulty, returnScene: this.returnScene, returnData: this.returnData }) },
        { label: 'ออก', color: NaSan.COLORS.DANGER,
          onClick: () => this.scene.start(this.returnScene, this.returnData || {}) },
      ]);
  }

  _confirmExit() {
    this._showResultModal('⚠️ ออกจากการต่อสู้?',
      'ความก้าวหน้าในการต่อสู้นี้จะหายไป\nแน่ใจหรือไม่?',
      [
        { label: 'ออก', color: NaSan.COLORS.DANGER,
          onClick: () => this.scene.start(this.returnScene, this.returnData || {}) },
        { label: 'สู้ต่อ', color: NaSan.COLORS.SUCCESS,
          onClick: () => {} },
      ]);
  }

  /* ===================================================================
     Modal helpers
     =================================================================== */
  _showFloatingText(text, color, x, y) {
    const t = this.add.text(x, y, text, {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '32px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: t,
      y: y - 80,
      alpha: 0,
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  _shake(target, intensity = 6) {
    const origX = target.x;
    this.tweens.add({
      targets: target,
      x: origX + intensity,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => { target.x = origX; },
    });
  }

  _showInfoModal(title, body) {
    const { width, height } = this.scale;
    const cx = width / 2, cy = height / 2;
    const boxW = Math.min(640, width - 60);
    const boxH = 380;

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.7);
    backdrop.fillRect(0, 0, width, height);
    backdrop.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains);

    const box = this.add.graphics();
    box.fillStyle(NaSan.COLORS.BACKGROUND);
    box.fillRoundedRect(cx - boxW/2, cy - boxH/2, boxW, boxH, 20);
    box.lineStyle(4, NaSan.COLORS.WARNING);
    box.strokeRoundedRect(cx - boxW/2, cy - boxH/2, boxW, boxH, 20);

    const headerBg = this.add.graphics();
    headerBg.fillStyle(NaSan.COLORS.WARNING);
    headerBg.fillRoundedRect(cx - boxW/2, cy - boxH/2, boxW, 56,
      { tl: 20, tr: 20, bl: 0, br: 0 });

    const titleText = this.add.text(cx, cy - boxH/2 + 28, title, {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '22px',
      color: NaSan.CSS_COLORS.TEXT,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const bodyText = this.add.text(cx, cy - 20, body, {
      fontFamily: NaSan.FONTS.MONO,
      fontSize: '16px',
      color: NaSan.CSS_COLORS.TEXT,
      align: 'left',
      lineSpacing: 6,
      wordWrap: { width: boxW - 40 },
    }).setOrigin(0.5);

    const cleanup = () => {
      [backdrop, box, headerBg, titleText, bodyText, closeBtn].forEach(o => o.destroy());
    };

    const closeBtn = UIButton.create(this, {
      x: cx, y: cy + boxH/2 - 40,
      width: 160, height: 46,
      text: 'เข้าใจแล้ว',
      bgColor: NaSan.COLORS.PRIMARY,
      fontSize: 18,
      onClick: cleanup,
    });

    backdrop.on('pointerup', cleanup);
  }

  _showResultModal(title, body, buttons) {
    const { width, height } = this.scale;
    const cx = width / 2, cy = height / 2;
    const boxW = Math.min(560, width - 60);
    const boxH = 360;

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.8);
    backdrop.fillRect(0, 0, width, height);

    const box = this.add.graphics();
    box.fillStyle(NaSan.COLORS.BACKGROUND);
    box.fillRoundedRect(cx - boxW/2, cy - boxH/2, boxW, boxH, 20);
    box.lineStyle(4, NaSan.COLORS.PRIMARY);
    box.strokeRoundedRect(cx - boxW/2, cy - boxH/2, boxW, boxH, 20);

    const headerBg = this.add.graphics();
    headerBg.fillStyle(NaSan.COLORS.PRIMARY);
    headerBg.fillRoundedRect(cx - boxW/2, cy - boxH/2, boxW, 60,
      { tl: 20, tr: 20, bl: 0, br: 0 });

    const titleText = this.add.text(cx, cy - boxH/2 + 30, title, {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '28px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const bodyText = this.add.text(cx, cy - 40, body, {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '18px',
      color: NaSan.CSS_COLORS.TEXT,
      align: 'center',
      lineSpacing: 8,
      wordWrap: { width: boxW - 40 },
    }).setOrigin(0.5);

    const btnObjs = [];
    const cleanup = () => {
      [backdrop, box, headerBg, titleText, bodyText, ...btnObjs].forEach(o => o.destroy());
    };

    /* Buttons แถวล่าง */
    const totalBtnW = buttons.length * 160 + (buttons.length - 1) * 16;
    let bx = cx - totalBtnW/2 + 80;
    buttons.forEach(b => {
      const btn = UIButton.create(this, {
        x: bx, y: cy + boxH/2 - 50,
        width: 160, height: 50,
        text: b.label,
        bgColor: b.color,
        fontSize: 20,
        onClick: () => { cleanup(); b.onClick(); },
      });
      btnObjs.push(btn);
      bx += 176;
    });
  }
}
