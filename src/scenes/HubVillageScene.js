/* =====================================================================
   HubVillageScene — แผนที่หมู่บ้านบ้านนาสาร (10 ด่าน + ล็อกลำดับ)
   ---------------------------------------------------------------------
   อ่านข้อมูลจาก DungeonData (10 ด่าน) + SaveManager (สถานะปลดล็อก)
   ป้ายล็อกจะมี 🔒 และคลิกไม่ได้
   ===================================================================== */

class HubVillageScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HubVillageScene' });
  }

  init(data) {
    data = data || {};
    this.heroKey    = data.heroKey    || 'char_ngoh';
    this.difficulty = data.difficulty || 'easy';
    this.spawnX     = data.spawnX     || null;
    this.spawnY     = data.spawnY     || null;
    this.justCompleted = data.dungeonId || null;
    /* reset transient state */
    this._entering = false;
    this._nearbyPortal = null;
  }


  /* ==================================================================
     _pin — recursive: ทำให้ container และ descendants ทั้งหมด fixed
     กับกล้อง (scrollFactor=0). แก้บั๊กกล้องเลื่อนแล้วปุ่มกดไม่ได้
     ================================================================== */
  _pin(obj, depth) {
    if (!obj) return;
    if (typeof obj.setScrollFactor === 'function') obj.setScrollFactor(0);
    if (depth !== undefined && typeof obj.setDepth === 'function') obj.setDepth(depth);
    if (obj.list && Array.isArray(obj.list)) {
      obj.list.forEach(child => this._pin(child, depth));
    }
  }

  create() {
    /* บันทึก: ถ้าเพิ่งผ่านด่านอะไรมา → SaveManager.markCompleted */
    if (this.justCompleted) {
      SaveManager.markCompleted(this.justCompleted);
    }

    this.save = SaveManager.load();

    /* World ใหญ่กว่าจอ — เผื่อ 10 ด่าน */
    this.WORLD_W = 2000;
    this.WORLD_H = 1500;
    this.physics.world.setBounds(0, 0, this.WORLD_W, this.WORLD_H);

    /* สเปกหมู่บ้าน (โรงเรียน + ทาง + 10 ป้าย) */
    this.SCHOOL_POS = { x: 1000, y: 750 };

    this._addBackground();
    this._addSchool();
    this._addPortals();
    this._addPlayer();
    this._addCamera();
    this._addUI();
    this._addControls();

    /* Welcome toast (ถ้าเพิ่งผ่านด่าน บอกว่าด่านถัดไปปลดล็อก) */
    this.time.delayedCall(300, () => {
      if (this.justCompleted) {
        this._toast('🎉 ผ่านด่านแล้ว! ด่านถัดไปปลดล็อก');
      } else if (Object.keys(this.save.completedDungeons).length === 0) {
        this._toast('👋 ยินดีต้อนรับสู่บ้านนาสาร — เริ่มที่ด่าน 1!');
      } else {
        this._toast(`💾 โหลดเกมแล้ว — ปลดล็อกถึงด่าน ${this.save.currentDungeon}`);
      }
    });
  }

  /* ==================================================================
     Background & School
     ================================================================== */
  _addBackground() {
    /* ใช้ bg_hub.png ที่ครูสร้าง — แผนที่หมู่บ้านเกาะนาสาร */
    if (this.textures.exists('bg_hub')) {
      const bg = this.add.image(this.WORLD_W / 2, this.WORLD_H / 2, 'bg_hub');
      const scale = Math.max(this.WORLD_W / bg.width, this.WORLD_H / bg.height);
      bg.setScale(scale);
    } else {
      /* fallback gradient */
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x8FCB68, 0x8FCB68, 0x6BB13D, 0x4D8729, 1);
      bg.fillRect(0, 0, this.WORLD_W, this.WORLD_H);
    }

    /* ทางคดเคี้ยวเชื่อมด่านเป็นลำดับ — วาดทับภาพแผนที่ */
    const portals = DungeonData.all();
    const allPts = [this.SCHOOL_POS].concat(portals.map(p => p.hubPos));
    const pathOuter = this.add.graphics();
    pathOuter.lineStyle(38, 0x000000, 0.35);
    pathOuter.beginPath();
    pathOuter.moveTo(allPts[0].x, allPts[0].y);
    allPts.forEach(p => pathOuter.lineTo(p.x, p.y));
    pathOuter.strokePath();

    const pathInner = this.add.graphics();
    pathInner.lineStyle(24, 0xFFE5A3, 0.85);
    pathInner.beginPath();
    pathInner.moveTo(allPts[0].x, allPts[0].y);
    allPts.forEach(p => pathInner.lineTo(p.x, p.y));
    pathInner.strokePath();

    /* dashed center line */
    const dash = this.add.graphics();
    dash.lineStyle(3, 0xFFFFFF, 0.7);
    for (let i = 0; i < allPts.length - 1; i++) {
      const a = allPts[i], b = allPts[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      const L = Math.hypot(dx, dy);
      const ux = dx / L, uy = dy / L;
      for (let d = 0; d < L; d += 30) {
        const x1 = a.x + ux * d;
        const y1 = a.y + uy * d;
        const x2 = a.x + ux * Math.min(d + 15, L);
        const y2 = a.y + uy * Math.min(d + 15, L);
        dash.lineBetween(x1, y1, x2, y2);
      }
    }
  }

  _addSchool() {
    const s = this.SCHOOL_POS;
    /* ใช้ start_game.png ที่ครูสร้าง */
    if (this.textures.exists('start_game')) {
      const img = this.add.image(s.x, s.y, 'start_game');
      const tex = this.textures.get('start_game').getSourceImage();
      const scale = Math.min(240 / tex.width, 240 / tex.height);
      img.setScale(scale).setOrigin(0.5, 0.65);
    } else {
      const g = this.add.graphics();
      g.fillStyle(0xE8DCC4);
      g.fillRoundedRect(s.x - 100, s.y - 70, 200, 140, 12);
      g.lineStyle(4, 0x8B5A2B);
      g.strokeRoundedRect(s.x - 100, s.y - 70, 200, 140, 12);
      g.fillStyle(0xC0392B);
      g.fillTriangle(s.x - 115, s.y - 70, s.x + 115, s.y - 70, s.x, s.y - 140);
      g.fillStyle(0x6B4423);
      g.fillRect(s.x - 22, s.y + 20, 44, 50);
      this.add.text(s.x, s.y - 155, '🏫 จุดเริ่ม', {
        fontFamily: NaSan.FONTS.HEADING,
        fontSize: '20px', color: '#FFFFFF', fontStyle: 'bold',
        stroke: NaSan.CSS_COLORS.TEXT, strokeThickness: 4,
      }).setOrigin(0.5);
    }
  }

  /* ==================================================================
     10 Portals (อ่านจาก DungeonData + เช็คล็อก SaveManager)
     ================================================================== */
  _addPortals() {
    this.portals = [];
    DungeonData.all().forEach(d => {
      const unlocked = SaveManager.isUnlocked(d.id);
      const completed = !!this.save.completedDungeons[d.id];
      const container = this.add.container(d.hubPos.x, d.hubPos.y);

      /* Ring สี: completed=เขียว / unlocked=สีตัวเอง / locked=เทา */
      const ring = this.add.graphics();
      const ringColor = completed ? 0x4F8536 : (unlocked ? d.color : 0x666666);
      const ringAlpha = unlocked ? (completed ? 0.55 : 0.85) : 0.5;
      ring.fillStyle(ringColor, ringAlpha);
      ring.fillCircle(0, 0, 60);
      ring.lineStyle(5, completed ? 0xFFFFFF : (unlocked ? 0xFFFFFF : 0x444444), 0.9);
      ring.strokeCircle(0, 0, 60);
      container.add(ring);

      /* รูปสถานที่จริงถ้าโหลดได้ + ปลดล็อก ไม่งั้น emoji */
      const portraitKey = 'dungeon_' + d.id;
      if (unlocked && this.textures.exists(portraitKey)) {
        /* ใช้ภาพจริง — clip เป็นวงกลม */
        const mask = this.add.graphics().fillStyle(0xffffff).fillCircle(d.hubPos.x, d.hubPos.y, 54);
        const portrait = this.add.image(0, 0, portraitKey);
        const tex = this.textures.get(portraitKey).getSourceImage();
        const fit = Math.max(110 / tex.width, 110 / tex.height);
        portrait.setScale(fit);
        portrait.setMask(mask.createGeometryMask());
        container.add(portrait);
        container._portraitMask = mask;
      } else {
        const icon = this.add.text(0, -5, unlocked ? d.emoji : '🔒', {
          fontSize: unlocked ? '48px' : '36px',
        }).setOrigin(0.5);
        container.add(icon);
      }

      /* Number badge */
      const numBg = this.add.graphics();
      numBg.fillStyle(0x000000, 0.8);
      numBg.fillCircle(-45, -45, 20);
      container.add(numBg);
      const numTxt = this.add.text(-45, -45, String(d.order), {
        fontFamily: NaSan.FONTS.HEADING, fontSize: '22px',
        color: '#FFFFFF', fontStyle: 'bold',
      }).setOrigin(0.5);
      container.add(numTxt);

      /* Check mark */
      if (completed) {
        const check = this.add.text(45, -45, '✓', {
          fontFamily: NaSan.FONTS.HEADING, fontSize: '40px', color: '#FFFFFF',
          stroke: '#2C7C2C', strokeThickness: 6, fontStyle: 'bold',
        }).setOrigin(0.5);
        container.add(check);
      }

      /* Label */
      const labelBg = this.add.graphics();
      labelBg.fillStyle(0x000000, 0.8);
      labelBg.fillRoundedRect(-110, 72, 220, 36, 8);
      container.add(labelBg);
      const labelText = unlocked ? d.name : '🔒 ล็อก — ผ่านด่านก่อนหน้าก่อน';
      const labelTxt = this.add.text(0, 90, labelText, {
        fontFamily: NaSan.FONTS.BODY, fontSize: '14px',
        color: unlocked ? '#FFFFFF' : '#AAAAAA',
        fontStyle: 'bold', align: 'center', wordWrap: { width: 210 },
      }).setOrigin(0.5);
      container.add(labelTxt);

      /* Pulse ถ้ายังไม่ผ่าน + ปลดล็อก */
      if (unlocked && !completed) {
        this.tweens.add({
          targets: ring, scale: 1.08,
          duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
      }

      /* Interactive zone */
      const zone = this.add.zone(0, 0, 200, 200).setInteractive({ useHandCursor: true });
      zone.on('pointerup', () => {
        if (!unlocked) {
          this._toast('🔒 ผ่านด่านก่อนหน้าก่อน!');
          return;
        }
        this._tryEnterPortal(d);
      });
      container.add(zone);

      container._meta = d;
      container._unlocked = unlocked;
      container._completed = completed;
      this.portals.push(container);
    });
  }

  /* ==================================================================
     Player + Camera
     ================================================================== */
  _addPlayer() {
    /* ตำแหน่งเริ่ม: ถ้ามี spawnX/Y ใช้ตามนั้น (กลับจากด่าน) ไม่งั้นเริ่มที่โรงเรียน */
    const start = (this.spawnX !== null && this.spawnY !== null)
      ? { x: this.spawnX, y: this.spawnY }
      : { x: this.SCHOOL_POS.x, y: this.SCHOOL_POS.y + 120 };

    let sprite;
    if (this.textures.exists(this.heroKey)) {
      sprite = this.add.image(0, 0, this.heroKey);
      const tex = this.textures.get(this.heroKey).getSourceImage();
      /* Sheet เป็น grid 2×2 — เอาเฉพาะ top-left pose
         origin (0.24, 0.50) จัดให้ตัวละครอยู่ตรงกับ player.x/y พอดี */
      sprite.setCrop(tex.width * 0.05, tex.height * 0.03, tex.width * 0.42, tex.height * 0.47);
      sprite.setOrigin(0.24, 0.50);
      sprite.setScale(0.22);
    } else {
      sprite = this.add.text(0, 0, '🍎', { fontSize: '52px' }).setOrigin(0.5);
    }
    this.player = this.add.container(start.x, start.y, [sprite]);
    this.physics.add.existing(this.player);
    this.player.body.setSize(60, 60);
    this.player.body.setOffset(-30, -30);
    this.player.body.setCollideWorldBounds(true);
    this.player._sprite = sprite;
    this.PLAYER_SPEED = 240;
    /* ไม่ใช้เงา — ตัวละครกับ hitbox จะตรงกัน 100% (แก้บั๊กจุดมาร์กกับเงาห่างกัน) */
  }

  _addCamera() {
    this.cameras.main.setBounds(0, 0, this.WORLD_W, this.WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }

  /* ==================================================================
     UI Overlay
     ================================================================== */
  _addUI() {
    /* Exit — ขยายขนาด/padding ให้กดง่ายบนมือถือ */
    const exitBtn = this.add.text(20, 20, '◄ เมนู', {
      fontFamily: NaSan.FONTS.BODY, fontSize: '22px',
      color: '#FFFFFF', fontStyle: 'bold',
      backgroundColor: 'rgba(217,38,61,0.92)', padding: { x: 18, y: 10 },
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(2000)
      .setInteractive({ useHandCursor: true });
    exitBtn.on('pointerup', () => {
      if (typeof SoundManager !== 'undefined') SoundManager.play('click');
      this.scene.start('TitleScene');
    });

    /* Progress */
    const done = Object.keys(this.save.completedDungeons).length;
    this.statusTxt = this.add.text(this.scale.width - 20, 20,
      `🏆 ${done}/10 ด่าน${this.save.teacherMode ? ' (Teacher)' : ''}`, {
        fontFamily: NaSan.FONTS.BODY, fontSize: '17px',
        color: '#FFFFFF', fontStyle: 'bold',
        backgroundColor: 'rgba(0,0,0,0.6)', padding: { x: 12, y: 6 },
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(2000);

    /* Hint */
    const hint = this.add.text(this.scale.width / 2, 28,
      '🕹 เดินไปป้ายด่าน — เริ่มที่ด่าน 1', {
        fontFamily: NaSan.FONTS.BODY, fontSize: '15px',
        color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.6)',
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(2000);
    this.tweens.add({
      targets: hint, alpha: 0, delay: 5000, duration: 600,
      onComplete: () => hint.destroy(),
    });

    /* Nearby + Enter button */
    this.nearbyTxt = this.add.text(this.scale.width / 2, this.scale.height - 200, '', {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '20px',
      color: '#F4B942', fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.8)', padding: { x: 14, y: 8 },
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000).setVisible(false);

    /* ปุ่ม "เข้า" — มุมขวาล่าง เลื่อนเข้าด้านในเพื่อกดง่าย */
    this.enterBtn = this.add.container(this.scale.width - 150, this.scale.height - 170)
      .setScrollFactor(0).setDepth(2000).setVisible(false);
    const eBg = this.add.graphics();
    eBg.fillStyle(NaSan.COLORS.SUCCESS, 0.95);
    eBg.fillCircle(0, 0, 70);
    eBg.lineStyle(5, 0xFFFFFF);
    eBg.strokeCircle(0, 0, 70);
    const eTxt = this.add.text(0, 0, 'เข้า\n▶', {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '22px',
      color: '#FFFFFF', fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5);
    const eZone = this.add.zone(0, 0, 160, 160).setInteractive({ useHandCursor: true });
    eZone.on('pointerup', () => {
      if (this._nearbyPortal && this._nearbyPortal._unlocked) {
        if (typeof SoundManager !== 'undefined') SoundManager.play('select');
        this._tryEnterPortal(this._nearbyPortal._meta);
      }
    });
    this.enterBtn.add([eBg, eTxt, eZone]);
    this._pin(this.enterBtn, 2000);   /* แก้บั๊ก: ปุ่มเข้ากดไม่ได้ตอนกล้องเลื่อนไปด่าน 3+ */
  }

  _addControls() {
    /* Joystick — เลื่อนเข้าด้านในเพื่อกดง่ายบนมือถือ */
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
    const tryEnter = () => {
      if (this._entering) return;
      if (this._nearbyPortal && this._nearbyPortal._unlocked) {
        this._tryEnterPortal(this._nearbyPortal._meta);
      }
    };
    this.keys.enter.on('down', tryEnter);
    this.keys.space.on('down', tryEnter);
  }

  /* ==================================================================
     Update loop
     ================================================================== */
  update() {
    if (!this.player) return;
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
    this._checkNearbyPortal();
  }

  _checkNearbyPortal() {
    const INTERACT_DIST = 140;
    let nearest = null;
    let minDist = Infinity;
    this.portals.forEach(p => {
      const dx = p.x - this.player.x;
      const dy = p.y - this.player.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < INTERACT_DIST && d < minDist) { nearest = p; minDist = d; }
    });
    if (nearest !== this._nearbyPortal) {
      this._nearbyPortal = nearest;
      if (nearest) {
        const m = nearest._meta;
        let status = '';
        if (!nearest._unlocked) status = '  (🔒 ล็อก)';
        else if (nearest._completed) status = '  (✓ ผ่านแล้ว)';
        this.nearbyTxt
          .setText(`${m.emoji}  ${m.name}${status}\nกด "เข้า" หรือกด E เพื่อเริ่มด่าน`)
          .setVisible(true);
        this.enterBtn.setVisible(true);
      } else {
        this.nearbyTxt.setVisible(false);
        this.enterBtn.setVisible(false);
      }
    }
  }

  /* ==================================================================
     Enter portal → DungeonIntroScene
     ================================================================== */
  _tryEnterPortal(dungeon) {
    if (this._entering) return;
    if (!SaveManager.isUnlocked(dungeon.id)) {
      this._toast('🔒 ผ่านด่านก่อนหน้าก่อน!');
      return;
    }
    this._entering = true;
    this._showConfirmModal(dungeon, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(420, () => {
        this.scene.start('DungeonIntroScene', {
          dungeonId: dungeon.id,
          difficulty: this.difficulty,
          returnScene: 'HubVillageScene',
        });
      });
    }, () => {
      this._entering = false;
    });
  }

  _showConfirmModal(dungeon, onYes, onNo) {
    const { width, height } = this.scale;
    const cx = width / 2, cy = height / 2;
    const boxW = Math.min(560, width - 60);
    const boxH = 360;

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.75);
    backdrop.fillRect(0, 0, width, height);
    backdrop.setScrollFactor(0).setDepth(5000);

    const box = this.add.graphics();
    box.fillStyle(NaSan.COLORS.BACKGROUND);
    box.fillRoundedRect(cx - boxW/2, cy - boxH/2, boxW, boxH, 20);
    box.lineStyle(4, dungeon.color);
    box.strokeRoundedRect(cx - boxW/2, cy - boxH/2, boxW, boxH, 20);
    box.setScrollFactor(0).setDepth(5001);

    const headerBg = this.add.graphics();
    headerBg.fillStyle(dungeon.color);
    headerBg.fillRoundedRect(cx - boxW/2, cy - boxH/2, boxW, 60,
      { tl: 20, tr: 20, bl: 0, br: 0 });
    headerBg.setScrollFactor(0).setDepth(5002);

    const titleTxt = this.add.text(cx, cy - boxH/2 + 30,
      `ด่าน ${dungeon.order}: ${dungeon.emoji} ${dungeon.name}`, {
        fontFamily: NaSan.FONTS.HEADING, fontSize: '20px',
        color: '#FFFFFF', fontStyle: 'bold',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(5003);

    const lorePreview = (dungeon.lore || '').slice(0, 160) + '…';
    const bodyTxt = this.add.text(cx, cy - 20,
      `${dungeon.subtitle}\n\n${lorePreview}\n\nเข้าด่านนี้เลยมั้ย?`, {
        fontFamily: NaSan.FONTS.BODY, fontSize: '15px',
        color: NaSan.CSS_COLORS.TEXT, align: 'center',
        lineSpacing: 6, wordWrap: { width: boxW - 40 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(5003);

    let yesBtn, noBtn;
    const cleanup = () => {
      [backdrop, box, headerBg, titleTxt, bodyTxt, yesBtn, noBtn].forEach(o => o && o.destroy());
    };

    yesBtn = UIButton.create(this, {
      x: cx - 90, y: cy + boxH/2 - 50,
      width: 160, height: 50,
      text: 'ลุย!', icon: '▶',
      bgColor: NaSan.COLORS.SUCCESS, fontSize: 20,
      onClick: () => { cleanup(); onYes(); },
    });
    yesBtn.setScrollFactor(0).setDepth(5003);

    noBtn = UIButton.create(this, {
      x: cx + 90, y: cy + boxH/2 - 50,
      width: 160, height: 50,
      text: 'ยังก่อน',
      bgColor: NaSan.COLORS.DANGER, fontSize: 20,
      onClick: () => { cleanup(); onNo && onNo(); },
    });
    noBtn.setScrollFactor(0).setDepth(5003);
  }

  _toast(text) {
    const t = this.add.text(this.scale.width / 2, this.scale.height / 2, text, {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '24px',
      color: '#FFFFFF', fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
    t.alpha = 0;
    this.tweens.add({
      targets: t, alpha: 1, duration: 300,
      yoyo: true, hold: 1500,
      onComplete: () => t.destroy(),
    });
  }
}
