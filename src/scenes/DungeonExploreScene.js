/* =====================================================================
   DungeonExploreScene — Mini-map ภายในด่าน (เดินหาจุดแสตมป์)
   ---------------------------------------------------------------------
   ใช้งาน:
     scene.start('DungeonExploreScene', { dungeonId: 'd1', difficulty: 'easy' })
   ===================================================================== */

class DungeonExploreScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DungeonExploreScene' });
  }

  init(data) {
    data = data || {};
    this.dungeonId   = data.dungeonId   || 'd1';
    this.difficulty  = data.difficulty  || 'easy';
    this.dungeon     = DungeonData.get(this.dungeonId);
    this.returnScene = data.returnScene || 'HubVillageScene';
    this.returnData  = data.returnData  || null;

    /* reset transient state */
    this._completedPoints = {};
    this._nearbyPoint = null;
    this._modalOpen = false;
  }

  create() {
    if (!this.dungeon) {
      this.add.text(this.scale.width/2, this.scale.height/2,
        'ไม่พบข้อมูลด่าน ' + this.dungeonId, {
          fontFamily: NaSan.FONTS.HEADING, fontSize: '32px', color: '#FFFFFF',
        }).setOrigin(0.5);
      return;
    }

    if (this.dungeon._placeholder || !this.dungeon.subPoints || this.dungeon.subPoints.length === 0) {
      this._jumpToBoss();
      return;
    }

    this.WORLD_W = 1800;
    this.WORLD_H = 1200;
    this.physics.world.setBounds(0, 0, this.WORLD_W, this.WORLD_H);

    this._addBackground();
    this._addSubPoints();
    this._addPlayer();
    this._addCamera();
    this._addUI();
    this._addControls();
  }

  /* ==================================================================
     _pin — recursive helper: ทำให้ object และ descendants ทั้งหมด
     fixed กับกล้อง (scrollFactor=0) และ depth ตรงกัน
     ================================================================== */
  _pin(obj, depth) {
    if (!obj) return;
    if (typeof obj.setScrollFactor === 'function') obj.setScrollFactor(0);
    if (depth !== undefined && typeof obj.setDepth === 'function') obj.setDepth(depth);
    if (obj.list && Array.isArray(obj.list)) {
      obj.list.forEach(child => this._pin(child, depth));
    }
  }

  /* ==================================================================
     Background
     ================================================================== */
  _addBackground() {
    if (this.textures.exists(this.dungeon.background)) {
      const bg = this.add.image(this.WORLD_W/2, this.WORLD_H/2, this.dungeon.background);
      const scale = Math.max(this.WORLD_W / bg.width, this.WORLD_H / bg.height);
      bg.setScale(scale);
      bg.setAlpha(0.55);
    } else {
      const g = this.add.graphics();
      g.fillStyle(0x6BB13D);
      g.fillRect(0, 0, this.WORLD_W, this.WORLD_H);
    }

    const ov = this.add.graphics();
    ov.fillStyle(0x4D8729, 0.2);
    ov.fillRect(0, 0, this.WORLD_W, this.WORLD_H);

    for (let i = 0; i < 100; i++) {
      const x = Math.random() * this.WORLD_W;
      const y = Math.random() * this.WORLD_H;
      const dot = this.add.graphics();
      dot.fillStyle(Math.random() < 0.5 ? 0xF4B942 : 0xFFFFFF, 0.5);
      dot.fillCircle(x, y, 3 + Math.random() * 4);
    }

    /* ทาง */
    const path = this.add.graphics();
    path.lineStyle(40, 0xC9A66B, 0.6);
    const pts = this.dungeon.subPoints.map(p => ({ x: p.x, y: p.y }));
    if (pts.length >= 2) {
      path.beginPath();
      path.moveTo(pts[0].x, pts[0].y);
      pts.forEach(p => path.lineTo(p.x, p.y));
      path.strokePath();
    }
  }

  /* ==================================================================
     Sub-points
     ================================================================== */
  _addSubPoints() {
    this._pointObjs = [];
    this.dungeon.subPoints.forEach((p, idx) => {
      const c = this.add.container(p.x, p.y);

      const ring = this.add.graphics();
      ring.fillStyle(this.dungeon.color, 0.85);
      ring.fillCircle(0, 0, 50);
      ring.lineStyle(4, 0xFFFFFF, 0.9);
      ring.strokeCircle(0, 0, 50);
      c.add(ring);

      const numBg = this.add.graphics();
      numBg.fillStyle(0x000000, 0.7);
      numBg.fillCircle(-35, -35, 18);
      c.add(numBg);
      const numTxt = this.add.text(-35, -35, String(idx + 1), {
        fontFamily: NaSan.FONTS.HEADING, fontSize: '20px',
        color: '#FFFFFF', fontStyle: 'bold',
      }).setOrigin(0.5);
      c.add(numTxt);

      const icon = this.add.text(0, 0, p.emoji || '⭐', { fontSize: '40px' }).setOrigin(0.5);
      c.add(icon);

      const labelBg = this.add.graphics();
      labelBg.fillStyle(0x000000, 0.75);
      labelBg.fillRoundedRect(-90, 60, 180, 28, 6);
      c.add(labelBg);
      const labelTxt = this.add.text(0, 74, p.name, {
        fontFamily: NaSan.FONTS.BODY, fontSize: '14px',
        color: '#FFFFFF', fontStyle: 'bold',
      }).setOrigin(0.5);
      c.add(labelTxt);

      this.tweens.add({
        targets: ring, scale: 1.1,
        duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });

      c._meta = p;
      this._pointObjs.push(c);
    });
  }

  /* ==================================================================
     Player + Camera
     ================================================================== */
  _addPlayer() {
    const startX = this.dungeon.subPoints[0].x - 100;
    const startY = this.dungeon.subPoints[0].y + 100;
    let sprite;
    if (this.textures.exists('char_ngoh')) {
      sprite = this.add.image(0, 0, 'char_ngoh');
      const tex = this.textures.get('char_ngoh').getSourceImage();
      /* Sheet 2×2 — top-left pose, origin (0.24, 0.50) จัดให้ตัวละครตรงกับจุดเดิน */
      sprite.setCrop(tex.width * 0.05, tex.height * 0.03, tex.width * 0.42, tex.height * 0.47);
      sprite.setOrigin(0.24, 0.50);
      sprite.setScale(0.22);
    } else {
      sprite = this.add.text(0, 0, '🍎', { fontSize: '48px' }).setOrigin(0.5);
    }

    this.player = this.add.container(startX, startY, [sprite]);
    this.physics.add.existing(this.player);
    this.player.body.setSize(60, 60);
    this.player.body.setOffset(-30, -30);
    this.player.body.setCollideWorldBounds(true);
    this.player._sprite = sprite;
    this.PLAYER_SPEED = 240;

    /* ไม่ใช้เงา — ตัวละครกับ hitbox จะตรงกัน */
  }

  _addCamera() {
    this.cameras.main.setBounds(0, 0, this.WORLD_W, this.WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }

  /* ==================================================================
     UI overlay (top bar + exit + progress + nearby hint + boss button)
     ================================================================== */
  _addUI() {
    const barBg = this._topBarBg = this.add.graphics().setScrollFactor(0).setDepth(2000);
    barBg.fillStyle(0x000000, 0.6);
    barBg.fillRect(0, 0, this.scale.width, 56);

    const exitBtn = this._exitBtn = this.add.text(20, 28, '◄ ออก', {
      fontFamily: NaSan.FONTS.BODY, fontSize: '20px',
      color: '#FFFFFF', fontStyle: 'bold',
      backgroundColor: 'rgba(217,38,61,0.92)', padding: { x: 18, y: 10 },
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(2001)
      .setInteractive({ useHandCursor: true });
    exitBtn.on('pointerup', () => {
      if (typeof SoundManager !== 'undefined') SoundManager.play('click');
      this.scene.start('HubVillageScene', this.returnData || {});
    });

    this._dungeonTitle = this.add.text(this.scale.width / 2, 28,
      this.dungeon.emoji + '  ' + this.dungeon.name, {
        fontFamily: NaSan.FONTS.HEADING, fontSize: '20px',
        color: NaSan.CSS_COLORS.WARNING, fontStyle: 'bold',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

    this.progressTxt = this.add.text(this.scale.width - 20, 28, '', {
      fontFamily: NaSan.FONTS.MONO, fontSize: '17px',
      color: '#FFFFFF', fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.5)', padding: { x: 10, y: 4 },
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(2001);
    this._updateProgress();

    this.nearbyTxt = this.add.text(this.scale.width / 2, this.scale.height - 200, '', {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '20px',
      color: '#F4B942', fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.8)', padding: { x: 14, y: 8 },
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000).setVisible(false);

    /* ปุ่ม "ตรวจ" — ขยับเข้าด้านในเพื่อกดง่าย */
    this.enterBtn = this.add.container(this.scale.width - 150, this.scale.height - 170)
      .setScrollFactor(0).setDepth(2000).setVisible(false);
    const eBg = this.add.graphics();
    eBg.fillStyle(NaSan.COLORS.SUCCESS, 0.95);
    eBg.fillCircle(0, 0, 70);
    eBg.lineStyle(5, 0xFFFFFF);
    eBg.strokeCircle(0, 0, 70);
    const eTxt = this.add.text(0, 0, 'ตรวจ\n📍', {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '22px', color: '#FFFFFF',
      fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5);
    const eZone = this.add.zone(0, 0, 160, 160).setInteractive({ useHandCursor: true });
    eZone.on('pointerup', () => {
      if (this._nearbyPoint) {
        if (typeof SoundManager !== 'undefined') SoundManager.play('select');
        this._openPointModal(this._nearbyPoint);
      }
    });
    this.enterBtn.add([eBg, eTxt, eZone]);
    this._pin(this.enterBtn, 2000);

    /* ปุ่ม "เผชิญหน้าบอส!" — ขนาดใหญ่ขึ้นกดง่ายบนมือถือ */
    this.bossBtn = this.add.container(this.scale.width / 2, this.scale.height - 80)
      .setScrollFactor(0).setDepth(2000).setVisible(false);
    const bBg = this.add.graphics();
    bBg.fillStyle(NaSan.COLORS.DANGER);
    bBg.fillRoundedRect(-200, -34, 400, 68, 14);
    bBg.lineStyle(3, 0xFFFFFF);
    bBg.strokeRoundedRect(-200, -34, 400, 68, 14);
    const bTxt = this.add.text(0, 0, '⚔️  เผชิญหน้าบอส!  ⚔️', {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '24px', color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5);
    const bZone = this.add.zone(0, 0, 400, 80).setInteractive({ useHandCursor: true });
    bZone.on('pointerup', () => {
      if (typeof SoundManager !== 'undefined') SoundManager.play('select');
      this._jumpToBoss();
    });
    this.bossBtn.add([bBg, bTxt, bZone]);
    this._pin(this.bossBtn, 2000);
  }

  _updateProgress() {
    const done = Object.keys(this._completedPoints).length;
    const total = this.dungeon.subPoints.length;
    this.progressTxt.setText(`📍 ${done}/${total}`);
  }

  _addControls() {
    /* Joystick — ขยับเข้าด้านในกดง่ายขึ้น */
    this.stick = VirtualJoystick.create(this, {
      x: 180, y: this.scale.height - 180,
      baseRadius: 90, knobRadius: 42,
    });
    this.stick._base.setScrollFactor(0).setDepth(2000);
    this.stick._knob.setScrollFactor(0).setDepth(2001);
    this.stick._zone.setScrollFactor(0).setDepth(1999);

    this.keys = this.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D',
      upArr: 'UP', downArr: 'DOWN', leftArr: 'LEFT', rightArr: 'RIGHT',
      enter: 'E', space: 'SPACE',
    });
    this.keys.enter.on('down', () => {
      if (this._modalOpen) return;
      if (this._nearbyPoint) this._openPointModal(this._nearbyPoint);
    });
    this.keys.space.on('down', () => {
      if (this._modalOpen) return;
      if (this._nearbyPoint) this._openPointModal(this._nearbyPoint);
    });
  }

  /* ==================================================================
     Update loop
     ================================================================== */
  update() {
    if (!this.player || this._modalOpen) {
      if (this.player && this.player.body) this.player.body.setVelocity(0, 0);
      return;
    }

    let vx = 0, vy = 0;
    if (this.stick && this.stick.value.isActive) {
      vx += this.stick.value.x;
      vy += this.stick.value.y;
    }
    if (this.keys.left.isDown  || this.keys.leftArr.isDown)  vx -= 1;
    if (this.keys.right.isDown || this.keys.rightArr.isDown) vx += 1;
    if (this.keys.up.isDown    || this.keys.upArr.isDown)    vy -= 1;
    if (this.keys.down.isDown  || this.keys.downArr.isDown)  vy += 1;

    const mag = Math.sqrt(vx*vx + vy*vy);
    if (mag > 1) { vx /= mag; vy /= mag; }
    this.player.body.setVelocity(vx * this.PLAYER_SPEED, vy * this.PLAYER_SPEED);

    if (this.player._sprite && this.player._sprite.setFlipX) {
      if (vx < -0.1) this.player._sprite.setFlipX(true);
      else if (vx > 0.1) this.player._sprite.setFlipX(false);
    }

    this._checkNearby();
  }

  _checkNearby() {
    const INTERACT_DIST = 110;
    let nearest = null;
    let minDist = Infinity;

    this._pointObjs.forEach(c => {
      if (this._completedPoints[c._meta.id]) return;
      const dx = c.x - this.player.x;
      const dy = c.y - this.player.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < INTERACT_DIST && d < minDist) { nearest = c; minDist = d; }
    });

    if (nearest !== this._nearbyPoint) {
      this._nearbyPoint = nearest;
      if (nearest) {
        this.nearbyTxt
          .setText(`${nearest._meta.emoji}  ${nearest._meta.name}\n(กด E หรือกด "ตรวจ")`)
          .setVisible(true);
        this.enterBtn.setVisible(true);
      } else {
        this.nearbyTxt.setVisible(false);
        this.enterBtn.setVisible(false);
      }
    }
  }

  /* ==================================================================
     STORY MODAL (เปิดเมื่อ E ใกล้จุด)
     ================================================================== */

  /* ==================================================================
     Hide/Show world UI overlay (ใช้ตอนเปิด modal — ป้องกันข้อความซ้อน)
     ================================================================== */
  _hideWorldOverlay() {
    if (this._overlayHidden) return;
    this._overlayHidden = true;
    this._overlayItems = this._overlayItems || [];
    /* รวม UI element ที่ต้องซ่อน */
    const items = [
      this._topBarBg, this._exitBtn, this._dungeonTitle,
      this.progressTxt, this.nearbyTxt, this.enterBtn, this.bossBtn,
      this.stick && this.stick._base, this.stick && this.stick._knob,
    ];
    items.forEach(o => {
      if (o && o.setVisible) {
        if (o._wasVisible === undefined) o._wasVisible = o.visible;
        o.setVisible(false);
      }
    });
  }
  _showWorldOverlay() {
    if (!this._overlayHidden) return;
    this._overlayHidden = false;
    const items = [
      this._topBarBg, this._exitBtn, this._dungeonTitle,
      this.progressTxt, this.nearbyTxt, this.enterBtn, this.bossBtn,
      this.stick && this.stick._base, this.stick && this.stick._knob,
    ];
    items.forEach(o => {
      if (o && o.setVisible) {
        o.setVisible(o._wasVisible !== false);
      }
    });
    /* รี-check nearbyTxt visibility ตามสถานะปัจจุบัน */
    if (!this._nearbyPoint) {
      if (this.nearbyTxt) this.nearbyTxt.setVisible(false);
      if (this.enterBtn) this.enterBtn.setVisible(false);
    }
    /* bossBtn ต้องคงสภาพเดิม */
    const done = Object.keys(this._completedPoints).length;
    const total = this.dungeon.subPoints.length;
    if (this.bossBtn) this.bossBtn.setVisible(done >= total);
  }

  _openPointModal(pointContainer) {
    if (this._modalOpen) return;
    this._modalOpen = true;
    this._hideWorldOverlay();
    const meta = pointContainer._meta;

    const { width, height } = this.scale;
    const cx = width/2, cy = height/2;
    const boxW = Math.min(700, width - 60);
    const boxH = 480;
    const top = cy - boxH/2;

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.7);
    backdrop.fillRect(0, 0, width, height);

    const box = this.add.graphics();
    box.fillStyle(NaSan.COLORS.BACKGROUND);
    box.fillRoundedRect(cx - boxW/2, top, boxW, boxH, 20);
    box.lineStyle(4, this.dungeon.color);
    box.strokeRoundedRect(cx - boxW/2, top, boxW, boxH, 20);

    const headerBg = this.add.graphics();
    headerBg.fillStyle(this.dungeon.color);
    headerBg.fillRoundedRect(cx - boxW/2, top, boxW, 56,
      { tl: 20, tr: 20, bl: 0, br: 0 });

    const titleTxt = this.add.text(cx, top + 28,
      `${meta.emoji}  ${meta.name}`, {
        fontFamily: NaSan.FONTS.HEADING, fontSize: '24px',
        color: '#FFFFFF', fontStyle: 'bold',
      }).setOrigin(0.5);

    const storyTxt = this.add.text(cx, top + 80, meta.story, {
      fontFamily: NaSan.FONTS.BODY, fontSize: '16px',
      color: NaSan.CSS_COLORS.TEXT, align: 'left',
      lineSpacing: 6, wordWrap: { width: boxW - 50 },
    }).setOrigin(0.5, 0);

    const elements = [backdrop, box, headerBg, titleTxt, storyTxt];

    const continueBtn = UIButton.create(this, {
      x: cx, y: top + boxH - 45,
      width: 240, height: 52,
      text: 'ทำคำถาม →',
      bgColor: NaSan.COLORS.SUCCESS, fontSize: 20,
      onClick: () => {
        elements.forEach(o => o.destroy());
        continueBtn.destroy();
        this._openQuizModal(meta);
      },
    });

    /* PIN all */
    elements.forEach(o => this._pin(o, 5003));
    this._pin(continueBtn, 5003);
    /* backdrop ที่ depth ต่ำกว่า */
    backdrop.setDepth(5000);
    box.setDepth(5001);
    headerBg.setDepth(5002);
  }

  /* ==================================================================
     QUIZ MODAL (vertical stack layout — โจทย์-รูป-NumberPad)
     ================================================================== */
  _openQuizModal(meta) {
    this._modalOpen = true;
    this._hideWorldOverlay();
    const { width, height } = this.scale;
    const cx = width/2, cy = height/2;
    const quiz = meta.quiz;

    /* math mode ต้องใช้กล่องสูง — เลื่อนกลางขึ้น */
    const isMath = quiz.mode === 'math';
    const boxW = isMath ? 640 : 600;
    const boxH = isMath ? 660 : 480;
    const top = cy - boxH/2 + (isMath ? 20 : 0);  // เลื่อนลงนิดสำหรับ math

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.75);
    backdrop.fillRect(0, 0, width, height);

    const box = this.add.graphics();
    box.fillStyle(NaSan.COLORS.BACKGROUND);
    box.fillRoundedRect(cx - boxW/2, top, boxW, boxH, 20);
    box.lineStyle(4, NaSan.COLORS.WARNING);
    box.strokeRoundedRect(cx - boxW/2, top, boxW, boxH, 20);

    const headerBg = this.add.graphics();
    headerBg.fillStyle(NaSan.COLORS.WARNING);
    headerBg.fillRoundedRect(cx - boxW/2, top, boxW, 50,
      { tl: 20, tr: 20, bl: 0, br: 0 });

    const titleTxt = this.add.text(cx, top + 25, '🧠 ' + meta.name, {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '20px',
      color: NaSan.CSS_COLORS.TEXT, fontStyle: 'bold',
    }).setOrigin(0.5);

    /* === Question (เด่นชัด, อยู่บนสุดในกล่อง) === */
    const qBg = this.add.graphics();
    qBg.fillStyle(NaSan.COLORS.PRIMARY, 0.15);
    qBg.fillRoundedRect(cx - boxW/2 + 16, top + 64, boxW - 32, isMath ? 90 : 110, 10);

    const questionTxt = this.add.text(cx, top + 64 + (isMath ? 45 : 55), quiz.question, {
      fontFamily: NaSan.FONTS.BODY, fontSize: isMath ? '19px' : '20px',
      color: NaSan.CSS_COLORS.TEXT, fontStyle: 'bold',
      align: 'center', lineSpacing: 6,
      wordWrap: { width: boxW - 60 },
    }).setOrigin(0.5);

    const elements = [backdrop, box, headerBg, titleTxt, qBg, questionTxt];

    if (isMath) {
      this._renderMathQuiz(quiz, cx, top, boxW, boxH, elements, meta);
    } else if (quiz.mode === 'roleplay') {
      this._renderChoiceQuiz(quiz, cx, top, boxW, boxH, elements, meta, true);
    } else {
      this._renderChoiceQuiz(quiz, cx, top, boxW, boxH, elements, meta, false);
    }

    /* PIN ทั้งหมด (รวม children recursive) */
    elements.forEach(o => this._pin(o, 5003));
    backdrop.setDepth(5000);
    box.setDepth(5001);
    headerBg.setDepth(5002);
    qBg.setDepth(5002);
  }

  /* ==================================================================
     Choice Quiz (inline / roleplay) — แสดง A/B/C/D ปุ่ม
     ================================================================== */
  _renderChoiceQuiz(quiz, cx, top, boxW, boxH, elements, meta, isRoleplay) {
    /* คำถามมีกล่อง 110px tall → choices เริ่มที่ y = top + 200 */
    const startY = top + 220;
    quiz.choices.forEach((choice, idx) => {
      const btnY = startY + idx * 56;
      const btn = UIButton.create(this, {
        x: cx, y: btnY,
        width: boxW - 80, height: 48,
        text: `${String.fromCharCode(65 + idx)}. ${choice}`,
        bgColor: NaSan.COLORS.PRIMARY, fontSize: 16,
        onClick: () => {
          const correct = !isRoleplay && idx === quiz.correct;
          const followUp = isRoleplay ? (quiz.followUp ? quiz.followUp[idx] : null) : null;
          this._resolveQuiz(meta, correct || isRoleplay, quiz.explain, followUp, elements, [btn]);
        },
      });
      elements.push(btn);
    });
  }

  /* ==================================================================
     Math Quiz — vertical stack: คำถาม / สามเหลี่ยม / NumberPad
     ================================================================== */
  _renderMathQuiz(quiz, cx, top, boxW, boxH, elements, meta) {
    const tri = quiz.triangle;

    /* === Triangle (กลางจอ, ขนาด 110) ใต้คำถาม === */
    if (typeof TriangleRenderer !== 'undefined') {
      const triG = TriangleRenderer.draw(this, cx, top + 220, {
        a: tri.a, b: tri.b, c: tri.c, unknown: tri.unknown, size: 100,
      });
      elements.push(triG);
    }

    /* === NumberPad (กลางจอ, compact) ด้านล่าง === */
    /* keyW=58 keyH=48 gap=6 → dispW = 58*4 + 6*3 = 250; gridH = 48*4 + 6*3 + 64 + 16 = 288 */
    const pad = NumberPad.create(this, {
      x: cx, y: top + 350,
      maxDigits: 4,
      labelText: 'ตอบ',
      keyW: 58, keyH: 48, gap: 6,
      onSubmit: (val) => {
        const correct = QuestionGenerator.checkAnswer(val, quiz.correct);
        this._resolveQuiz(meta, correct, quiz.explain, null, elements, [pad]);
      },
    });
    elements.push(pad);
  }

  /* ==================================================================
     Resolve Quiz — แสดง ✓/✗
     - ถูก: เฉลย + เอฟเฟกต์ดาว/SFX correct
     - ผิด: ไม่เฉลย แค่ "ลองใหม่" + SFX wrong
     ================================================================== */
  _resolveQuiz(meta, success, explain, followUp, elements, extras) {
    elements.forEach(o => o && o.destroy && o.destroy());
    extras.forEach(o => o && o.destroy && o.destroy());

    const { width, height } = this.scale;
    const cx = width/2, cy = height/2;
    const color = success ? NaSan.COLORS.SUCCESS : NaSan.COLORS.DANGER;
    const icon = success ? '✓ ถูกต้อง!' : '✗ ลองอีกครั้ง';
    const boxW = Math.min(640, width - 60);
    const boxH = success ? 420 : 280;   /* ผิด: กล่องเล็กลง เพราะไม่มีเฉลย */
    const top = cy - boxH/2;

    /* SFX + Particle effects */
    if (typeof SoundManager !== 'undefined') {
      SoundManager.play(success ? 'correct' : 'wrong');
    }
    if (success) {
      this._spawnCelebrationParticles(cx, cy);
    } else {
      this.cameras.main.shake(220, 0.008);
    }

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.7);
    backdrop.fillRect(0, 0, width, height);

    const box = this.add.graphics();
    box.fillStyle(NaSan.COLORS.BACKGROUND);
    box.fillRoundedRect(cx - boxW/2, top, boxW, boxH, 20);
    box.lineStyle(4, color);
    box.strokeRoundedRect(cx - boxW/2, top, boxW, boxH, 20);

    const headerBg = this.add.graphics();
    headerBg.fillStyle(color);
    headerBg.fillRoundedRect(cx - boxW/2, top, boxW, 56,
      { tl: 20, tr: 20, bl: 0, br: 0 });

    const titleTxt = this.add.text(cx, top + 28, icon, {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '28px',
      color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5);

    const cleanupEls = [backdrop, box, headerBg, titleTxt];
    let closeBtn;

    if (success) {
      /* เฉลย: ใช้ followUp (roleplay) หรือ explain (math/inline) */
      const explainText = followUp || explain || '';
      const explainTxt = this.add.text(cx, top + 80, explainText, {
        fontFamily: NaSan.FONTS.MONO, fontSize: '16px',
        color: NaSan.CSS_COLORS.TEXT, align: 'left',
        lineSpacing: 7, wordWrap: { width: boxW - 50 },
      }).setOrigin(0.5, 0);
      cleanupEls.push(explainTxt);

      /* เอฟเฟกต์ฉลอง — ดาวลอยขึ้น */
      explainTxt.setAlpha(0);
      this.tweens.add({ targets: explainTxt, alpha: 1, duration: 400, delay: 200 });
    } else {
      /* ผิด — แสดงข้อความสั้นๆ ไม่บอกเฉลย */
      const hintTxt = this.add.text(cx, top + 90,
        'ลองอ่านโจทย์อีกครั้ง\nแล้วลองคิดใหม่นะ', {
        fontFamily: NaSan.FONTS.BODY, fontSize: '18px',
        color: NaSan.CSS_COLORS.TEXT, align: 'center',
        lineSpacing: 8,
      }).setOrigin(0.5, 0);
      cleanupEls.push(hintTxt);
    }

    const cleanup = () => {
      cleanupEls.forEach(o => o && o.destroy());
      if (closeBtn) closeBtn.destroy();
      this._modalOpen = false;
      this._showWorldOverlay();
      if (success) {
        this._markPointCompleted(meta);
      }
    };

    closeBtn = UIButton.create(this, {
      x: cx, y: top + boxH - 50,
      width: 220, height: 52,
      text: success ? 'ต่อไป →' : 'ลองใหม่',
      bgColor: success ? NaSan.COLORS.SUCCESS : NaSan.COLORS.PRIMARY,
      fontSize: 20,
      onClick: () => {
        cleanup();
        if (!success) {
          this.time.delayedCall(100, () => {
            const c = this._pointObjs.find(p => p._meta.id === meta.id);
            if (c) this._openPointModal(c);
          });
        }
      },
    });

    cleanupEls.forEach(o => this._pin(o, 5503));
    this._pin(closeBtn, 5503);
    backdrop.setDepth(5500);
    box.setDepth(5501);
    headerBg.setDepth(5502);
  }

  /* ==================================================================
     ดาวลอยขึ้นตอนตอบถูก
     ================================================================== */
  _spawnCelebrationParticles(cx, cy) {
    const icons = ['⭐', '✨', '💫', '🌟', '🎉'];
    for (let i = 0; i < 14; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r = 80 + Math.random() * 120;
      const x = cx + Math.cos(ang) * 20;
      const y = cy + Math.sin(ang) * 20;
      const targetX = cx + Math.cos(ang) * r;
      const targetY = cy + Math.sin(ang) * r - 50;
      const t = this.add.text(x, y, icons[Math.floor(Math.random() * icons.length)], {
        fontSize: (22 + Math.random() * 16) + 'px',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(6000);
      this.tweens.add({
        targets: t,
        x: targetX, y: targetY,
        alpha: 0, scale: { from: 0.6, to: 1.4 },
        duration: 1100 + Math.random() * 400,
        ease: 'Cubic.easeOut',
        delay: Math.random() * 200,
        onComplete: () => t.destroy(),
      });
    }
  }

  /* ==================================================================
     Mark sub-point completed
     ================================================================== */
  _markPointCompleted(meta) {
    this._completedPoints[meta.id] = true;
    const c = this._pointObjs.find(p => p._meta.id === meta.id);
    if (c) {
      c.list.forEach(o => { if (o.setAlpha) o.setAlpha(0.4); });
      const check = this.add.text(40, -40, '✓', {
        fontFamily: NaSan.FONTS.HEADING, fontSize: '40px',
        color: '#FFFFFF', stroke: '#2C7C2C', strokeThickness: 6,
      }).setOrigin(0.5);
      c.add(check);
    }
    this._updateProgress();
    this._showFloatingText('✓ ผ่านจุดนี้แล้ว!', NaSan.CSS_COLORS.SUCCESS);

    if (Object.keys(this._completedPoints).length >= this.dungeon.subPoints.length) {
      this.bossBtn.setVisible(true);
      this.tweens.add({
        targets: this.bossBtn, scale: 1.1,
        duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this._showFloatingText('🎉 ครบทุกจุดแล้ว! เผชิญหน้าบอสได้!', NaSan.CSS_COLORS.WARNING);
    }
  }

  _showFloatingText(text, color) {
    const t = this.add.text(this.scale.width/2, this.scale.height/2, text, {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '28px',
      color: color, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
    this.tweens.add({
      targets: t, y: this.scale.height/2 - 80, alpha: 0,
      duration: 1500, ease: 'Cubic.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  /* ==================================================================
     Boss
     ================================================================== */
  _jumpToBoss() {
    if (!this.dungeon.finalBoss) return;
    const fb = this.dungeon.finalBoss;
    PlaceholderFactory.BOSSES[fb.bossId] = PlaceholderFactory.BOSSES[fb.bossId] || {
      color: this.dungeon.color,
      emoji: this.dungeon.emoji,
      name: 'บอสประจำ ' + this.dungeon.name,
      hp: 3,
    };
    QuestionGenerator.BOSS_TO_TYPE[fb.bossId] = fb.questionType;

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(420, () => {
      this.scene.start('BattleScene', {
        bossId: fb.bossId,
        difficulty: fb.difficulty || this.difficulty,
        returnScene: 'HubVillageScene',
        returnData: Object.assign({}, this.returnData || {}, {
          dungeonId: this.dungeonId,
        }),
      });
    });
  }
}
