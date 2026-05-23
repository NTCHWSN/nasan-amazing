/* =====================================================================
   TitleScene — หน้าเริ่มเกม
   ===================================================================== */

class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.scale;
    this._addBackground(width, height);
    this._addLogo(width, height);
    this._addButtons(width, height);
    this._addHeroes(width, height);
    this._addSoundToggle(width, height);
    this._addFooter(width, height);

    /* เริ่ม BGM อัตโนมัติเมื่อเข้า title */
    if (typeof SoundManager !== 'undefined') {
      SoundManager.init();
      if (!SoundManager.isMuted()) SoundManager.startBGM();
    }
  }

  _addBackground(width, height) {
    /* ใช้ bg_title ที่ผู้ใช้สร้าง — ภาพป่าน้ำตกสำหรับหน้าแรก */
    if (this.textures.exists('bg_title')) {
      const bg = this.add.image(width / 2, height / 2, 'bg_title');
      const scale = Math.max(width / bg.width, height / bg.height);
      bg.setScale(scale);
    } else if (this.textures.exists('bg_d1')) {
      const bg = this.add.image(width / 2, height / 2, 'bg_d1');
      const scale = Math.max(width / bg.width, height / bg.height);
      bg.setScale(scale);
    } else {
      const g = this.add.graphics();
      g.fillGradientStyle(0x2C5F8D, 0x2C5F8D, 0x1A1A2E, 0x1A1A2E, 1);
      g.fillRect(0, 0, width, height);
    }
    const overlay = this.add.graphics();
    overlay.fillStyle(0x1A1A2E, 0.35);
    overlay.fillRect(0, 0, width, height);
  }

  _addLogo(width, height) {
    const cx = width / 2;
    const logoY = height * 0.20;

    /* ใช้ logo_game ถ้ามี ไม่งั้น text */
    let title, titleShadow;
    if (this.textures.exists('logo_game')) {
      title = this.add.image(cx, logoY, 'logo_game');
      const tex = this.textures.get('logo_game').getSourceImage();
      const maxW = Math.min(width * 0.7, 700);
      const s = Math.min(maxW / tex.width, 220 / tex.height);
      title.setScale(s);
      titleShadow = null;
    } else {
      titleShadow = this.add.text(cx + 4, logoY + 4, 'นาสารอเมซิ่ง!', {
        fontFamily: NaSan.FONTS.HEADING,
        fontSize: '88px',
        color: '#000000',
        fontStyle: '900',
      }).setOrigin(0.5).setAlpha(0.5);

      title = this.add.text(cx, logoY, 'นาสารอเมซิ่ง!', {
        fontFamily: NaSan.FONTS.HEADING,
        fontSize: '88px',
        color: NaSan.CSS_COLORS.WARNING,
        fontStyle: '900',
        stroke: NaSan.CSS_COLORS.PRIMARY,
        strokeThickness: 5,
      }).setOrigin(0.5);
    }

    const subtitle = this.add.text(cx, logoY + 80, 'คดีลึกลับสามเหลี่ยมพีทาโกรัส', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '30px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: NaSan.CSS_COLORS.TEXT,
      strokeThickness: 3,
    }).setOrigin(0.5);

    /* ป้าย "รายวิชาคณิตศาสตร์ระดับชั้นมัธยมศึกษาปีที่ 2" */
    const badgeY = logoY + 130;
    const badgeText = this.add.text(cx, badgeY, '📐 รายวิชาคณิตศาสตร์ระดับชั้นมัธยมศึกษาปีที่ 2', {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '17px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: 'rgba(217,38,61,0.92)',
      padding: { x: 16, y: 7 },
    }).setOrigin(0.5);

    /* Animation */
    title.setScale(title.scaleX === undefined ? 1 : title.scaleX);
    if (titleShadow) titleShadow.setScale(0);
    const baseScale = title.scaleX || 1;
    title.setScale(0);
    this.tweens.add({
      targets: title, scale: baseScale,
      duration: 700, ease: 'Back.easeOut',
    });
    if (titleShadow) {
      this.tweens.add({
        targets: titleShadow, scale: 1, duration: 700, ease: 'Back.easeOut',
      });
    }
    subtitle.setAlpha(0);
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 800, delay: 400 });
    badgeText.setAlpha(0);
    this.tweens.add({ targets: badgeText, alpha: 1, duration: 600, delay: 800 });

    /* Floating idle */
    this.tweens.add({
      targets: title, y: logoY - 5, duration: 1500,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 800,
    });
  }

  _addButtons(width, height) {
    const cx = width / 2;
    const baseY = height * 0.58;
    const gap = 78;

    const startBtn = UIButton.create(this, {
      x: cx, y: baseY, width: 320, height: 72,
      text: 'เริ่มเกม', icon: '▶',
      bgColor: NaSan.COLORS.SUCCESS, fontSize: 32,
      onClick: () => this._onStartClick(),
    });

    /* ปุ่ม "อัพสกิลพีทาโกรัส" — เน้นการศึกษา (เปลี่ยนชื่อจากเดิม "เรียนรู้") */
    const learnBtn = UIButton.create(this, {
      x: cx, y: baseY + gap, width: 280, height: 56,
      text: 'อัพสกิลพีทาโกรัส', icon: '📐',
      bgColor: 0x9B59B6, fontSize: 22,
      onClick: () => this._onLearnClick(),
    });

    const settingsBtn = UIButton.create(this, {
      x: cx, y: baseY + gap * 2, width: 260, height: 56,
      text: 'ตั้งค่า', icon: '⚙',
      bgColor: NaSan.COLORS.PRIMARY, fontSize: 24,
      onClick: () => this._onSettingsClick(),
    });

    const creditsBtn = UIButton.create(this, {
      x: cx, y: baseY + gap * 3, width: 260, height: 56,
      text: 'เครดิต', icon: '🏆',
      bgColor: NaSan.COLORS.WARNING,
      textColor: NaSan.CSS_COLORS.TEXT,
      fontSize: 24,
      onClick: () => this._onCreditsClick(),
    });

    [startBtn, learnBtn, settingsBtn, creditsBtn].forEach((btn, i) => {
      btn.y += 50;
      btn.alpha = 0;
      this.tweens.add({
        targets: btn,
        y: btn.y - 50, alpha: 1,
        duration: 500, delay: 1000 + i * 150,
        ease: 'Back.easeOut',
      });
    });
  }

  _addHeroes(width, height) {
    /* ภาพพื้นหลัง bg_title มีตัวละครวาดไว้แล้ว 3 ตัว
       เพื่อไม่ให้ทับซ้อน — ไม่ใส่ sprite เพิ่ม
       (ครูสามารถเปิด debug ปุ่ม Hub เพื่อทดสอบ sprite ในซีนอื่น) */
  }

  _addSoundToggle(width, height) {
    const padding = 20;
    const size = 50;

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.4);
    bg.fillCircle(width - padding - size/2, padding + size/2, size/2);

    const muted = (typeof SoundManager !== 'undefined') ? SoundManager.isMuted() : false;
    const icon = this.add.text(width - padding - size/2, padding + size/2,
      muted ? '🔇' : '🔊', { fontSize: '24px' }).setOrigin(0.5);

    const zone = this.add.zone(width - padding - size/2, padding + size/2, size + 10, size + 10)
      .setInteractive({ useHandCursor: true });
    zone.on('pointerup', () => {
      if (typeof SoundManager === 'undefined') {
        icon.setText(icon.text === '🔊' ? '🔇' : '🔊');
        return;
      }
      const isM = SoundManager.toggleMute();
      icon.setText(isM ? '🔇' : '🔊');
      if (isM) SoundManager.stopBGM();
      else SoundManager.startBGM();
      SoundManager.play('click');
    });
  }

  _addFooter(width, height) {
    /* footer credit — เปลี่ยนเป็นชื่อครู ตามที่ขอ */
    this.add.text(width / 2, height - 12,
      'ครูนันทชัย วิสมิตตนันท์  โรงเรียนบ้านนาสาร',
      {
        fontFamily: NaSan.FONTS.BODY,
        fontSize: '13px',
        color: '#FFFFFF',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5, 1).setAlpha(0.85);

    /* ปุ่ม debug (มุมขวาล่าง) */
    this._addDebugBtn(width - 12,  height - 12, '🧪 Asset',     'AssetTestScene');
    this._addDebugBtn(width - 100, height - 12, '🧠 Question',  'QuestionTestScene');
    this._addDebugBtn(width - 210, height - 12, '⚔️ Battle',     'BattleTestScene');
    this._addDebugBtn(width - 310, height - 12, '🏘 Hub',        'HubVillageScene');
    this._addDebugBtn(width - 390, height - 12, '🎬 End',        'EndingScene');

    /* ปุ่ม Teacher Mode (มุมซ้ายล่าง) */
    this._addTeacherButton(width, height);
  }

  _addTeacherButton(width, height) {
    const save = (typeof SaveManager !== 'undefined') ? SaveManager.load() : { teacherMode: false };
    const label = save.teacherMode ? '🎓 Teacher (ON)' : '🎓 Teacher';
    const btn = this.add.text(12, height - 12, label, {
      fontFamily: NaSan.FONTS.MONO, fontSize: '12px',
      color: '#FFFFFF', fontStyle: 'bold',
      backgroundColor: save.teacherMode ? 'rgba(107,177,61,0.85)' : 'rgba(0,0,0,0.5)',
      padding: { x: 8, y: 4 },
    }).setOrigin(0, 1).setInteractive({ useHandCursor: true });
    btn.on('pointerup', () => this._openTeacherModal());
    this._teacherBtn = btn;
  }

  /* ===================================================================
     Teacher modal — ใช้ NumberPad กดรหัส (ทำงานทั้ง Desktop + Mobile)
     =================================================================== */
  _openTeacherModal() {
    const { width, height } = this.scale;
    const cx = width/2, cy = height/2;
    const save = SaveManager.load();
    const boxW = Math.min(560, width - 40);
    const boxH = save.teacherMode ? 320 : 540;

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.78);
    backdrop.fillRect(0, 0, width, height);
    backdrop.setDepth(8000);
    backdrop.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains);

    const box = this.add.graphics();
    box.fillStyle(NaSan.COLORS.BACKGROUND);
    box.fillRoundedRect(cx - boxW/2, cy - boxH/2, boxW, boxH, 20);
    box.lineStyle(4, NaSan.COLORS.WARNING);
    box.strokeRoundedRect(cx - boxW/2, cy - boxH/2, boxW, boxH, 20);
    box.setDepth(8001);

    const headerBg = this.add.graphics();
    headerBg.fillStyle(NaSan.COLORS.WARNING);
    headerBg.fillRoundedRect(cx - boxW/2, cy - boxH/2, boxW, 56,
      { tl: 20, tr: 20, bl: 0, br: 0 });
    headerBg.setDepth(8002);

    const titleTxt = this.add.text(cx, cy - boxH/2 + 28, '🎓 โหมดคุณครู', {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '22px',
      color: NaSan.CSS_COLORS.TEXT, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(8003);

    const elements = [backdrop, box, headerBg, titleTxt];
    let pwTxt = null;
    let typed = '';
    let pad = null;
    let toggleBtn = null;
    let closeBtn = null;

    const cleanup = () => {
      elements.forEach(o => o && o.destroy());
      if (closeBtn) closeBtn.destroy();
      if (toggleBtn) toggleBtn.destroy();
      if (pad) pad.destroy();
      if (this._teacherBtn) this._teacherBtn.destroy();
      this._addTeacherButton(this.scale.width, this.scale.height);
    };

    if (save.teacherMode) {
      const bodyTxt = this.add.text(cx, cy - 30,
        '✅ โหมดคุณครูเปิดอยู่\nสามารถเลือกเล่นด่านใดก็ได้\n\nกด "ปิดโหมด" เพื่อกลับโหมดนักเรียน', {
        fontFamily: NaSan.FONTS.BODY, fontSize: '16px',
        color: NaSan.CSS_COLORS.TEXT, align: 'center', lineSpacing: 6,
      }).setOrigin(0.5).setDepth(8003);
      elements.push(bodyTxt);

      toggleBtn = UIButton.create(this, {
        x: cx, y: cy + boxH/2 - 90,
        width: 200, height: 50,
        text: 'ปิดโหมด',
        bgColor: NaSan.COLORS.WARNING, textColor: NaSan.CSS_COLORS.TEXT, fontSize: 18,
        onClick: () => {
          SaveManager.setTeacherMode(false);
          const s = SaveManager.load();
          const done = Object.keys(s.completedDungeons || {}).length;
          s.currentDungeon = Math.max(1, done + 1);
          SaveManager.save(s);
          if (typeof SoundManager !== 'undefined') SoundManager.play('click');
          cleanup();
        },
      });
      toggleBtn.setDepth(8003);

      closeBtn = UIButton.create(this, {
        x: cx, y: cy + boxH/2 - 30,
        width: 160, height: 44,
        text: 'ปิด',
        bgColor: NaSan.COLORS.DANGER, fontSize: 17,
        onClick: () => { if (typeof SoundManager !== 'undefined') SoundManager.play('click'); cleanup(); },
      });
      closeBtn.setDepth(8003);
      return;
    }

    /* ─── โหมดยังไม่เปิด → แสดงคำใบ้ + NumberPad ─── */
    const bodyTxt = this.add.text(cx, cy - boxH/2 + 80,
      'กรอกรหัสลับ (4 หลัก) เพื่อปลดล็อกทุกด่าน\nรหัส: 1234  (สำหรับครูทดสอบเนื้อหา)', {
      fontFamily: NaSan.FONTS.BODY, fontSize: '15px',
      color: NaSan.CSS_COLORS.TEXT, align: 'center', lineSpacing: 6,
    }).setOrigin(0.5, 0).setDepth(8003);
    elements.push(bodyTxt);

    /* ช่องแสดงตัวเลขที่กด */
    pwTxt = this.add.text(cx, cy - boxH/2 + 145, '____', {
      fontFamily: NaSan.FONTS.MONO, fontSize: '38px',
      color: NaSan.CSS_COLORS.PRIMARY, fontStyle: 'bold',
      backgroundColor: '#FFFFFF', padding: { x: 30, y: 8 },
    }).setOrigin(0.5).setDepth(8003);
    elements.push(pwTxt);

    /* NumberPad สำหรับมือถือ */
    const PW = '1234';
    const checkPw = () => {
      if (typed.length === 4) {
        if (typed === PW) {
          SaveManager.setTeacherMode(true);
          pwTxt.setText('✓ ปลดล็อก!').setColor('#2C7C2C');
          if (typeof SoundManager !== 'undefined') SoundManager.play('victory');
          this.time.delayedCall(800, cleanup);
        } else {
          pwTxt.setText('✗ ผิด').setColor('#D9263D');
          if (typeof SoundManager !== 'undefined') SoundManager.play('wrong');
          this.time.delayedCall(800, () => {
            typed = '';
            if (pwTxt && pwTxt.active) pwTxt.setText('____').setColor(NaSan.CSS_COLORS.PRIMARY);
          });
        }
      }
    };

    pad = NumberPad.create(this, {
      x: cx, y: cy - boxH/2 + 220,
      maxDigits: 4,
      labelText: 'รหัส',
      onChange: (v) => {
        typed = v;
        if (pwTxt && pwTxt.active && v.length < 4) {
          pwTxt.setText(v.padEnd(4, '_')).setColor(NaSan.CSS_COLORS.PRIMARY);
        }
      },
      onSubmit: () => {
        checkPw();
      },
    });
    pad.setDepth(8003);

    /* ตรวจรหัสทุกครั้งที่ครบ 4 หลัก (ไม่ต้องกด ✓) */
    const padOrigOnChange = pad.setValue;
    /* hook: เช็คทุกครั้งที่ใส่ครบ 4 หลัก โดย override onChange ผ่าน timer */
    this._checkPwTimer = this.time.addEvent({
      delay: 100, loop: true,
      callback: () => {
        if (typed.length === 4 && !this._pwCheckedAt) {
          this._pwCheckedAt = Date.now();
          checkPw();
        } else if (typed.length < 4) {
          this._pwCheckedAt = null;
        }
      },
    });

    /* keyboard support (Desktop) */
    const onKey = (event) => {
      if (/^[0-9]$/.test(event.key)) {
        if (typed.length < 4) typed += event.key;
        if (pwTxt && pwTxt.active) pwTxt.setText(typed.padEnd(4, '_')).setColor(NaSan.CSS_COLORS.PRIMARY);
        checkPw();
      } else if (event.key === 'Backspace') {
        typed = typed.slice(0, -1);
        if (pwTxt && pwTxt.active) pwTxt.setText(typed.padEnd(4, '_')).setColor(NaSan.CSS_COLORS.PRIMARY);
      } else if (event.key === 'Escape') {
        cleanup();
      }
    };
    this.input.keyboard.on('keydown', onKey);

    const origCleanup = cleanup;
    /* extend cleanup to detach keyboard + timer */
    /* eslint-disable */
    const finalCleanup = () => {
      this.input.keyboard.off('keydown', onKey);
      if (this._checkPwTimer) { this._checkPwTimer.remove(); this._checkPwTimer = null; }
      origCleanup();
    };

    closeBtn = UIButton.create(this, {
      x: cx, y: cy + boxH/2 - 30,
      width: 160, height: 44,
      text: 'ปิด',
      bgColor: NaSan.COLORS.DANGER, fontSize: 17,
      onClick: () => { if (typeof SoundManager !== 'undefined') SoundManager.play('click'); finalCleanup(); },
    });
    closeBtn.setDepth(8003);
  }

  _addDebugBtn(x, y, label, sceneKey) {
    const btn = this.add.text(x, y, label, {
      fontFamily: NaSan.FONTS.MONO,
      fontSize: '11px',
      color: '#FFFFFF',
      backgroundColor: 'rgba(0,0,0,0.4)',
      padding: { x: 6, y: 3 },
    }).setOrigin(1, 1).setAlpha(0.5)
      .setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setAlpha(1));
    btn.on('pointerout',  () => btn.setAlpha(0.5));
    btn.on('pointerup',   () => this.scene.start(sceneKey));
    return btn;
  }

  _onStartClick() {
    if (typeof SoundManager !== 'undefined') SoundManager.play('select');
    const save = (typeof SaveManager !== 'undefined') ? SaveManager.load() : null;
    const hasProgress = save && Object.keys(save.completedDungeons || {}).length > 0;

    if (hasProgress) {
      /* มีเซฟ → ถาม "เล่นต่อ" หรือ "เริ่มใหม่" */
      this._showStartChoice();
    } else {
      this._goToHub(false);
    }
  }

  _onLearnClick() {
    if (typeof SoundManager !== 'undefined') SoundManager.play('select');
    if (typeof LearnScene !== 'undefined') {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(320, () => this.scene.start('LearnScene'));
    } else {
      this._showModal('📐 อัพสกิลพีทาโกรัส',
        'ระบบบทเรียนกำลังโหลด... ลองรีเฟรชหน้าใหม่');
    }
  }

  _goToHub(reset) {
    if (reset) SaveManager.reset();
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(420, () => {
      this.scene.start('HubVillageScene', {
        heroKey: 'char_ngoh', difficulty: 'easy',
      });
    });
  }

  _showStartChoice() {
    const { width, height } = this.scale;
    const cx = width/2, cy = height/2;
    const save = SaveManager.load();
    const done = Object.keys(save.completedDungeons).length;

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.75);
    backdrop.fillRect(0, 0, width, height);
    backdrop.setDepth(7000);

    const box = this.add.graphics();
    box.fillStyle(NaSan.COLORS.BACKGROUND);
    box.fillRoundedRect(cx - 240, cy - 140, 480, 280, 16);
    box.lineStyle(4, NaSan.COLORS.PRIMARY);
    box.strokeRoundedRect(cx - 240, cy - 140, 480, 280, 16);
    box.setDepth(7001);

    const txt = this.add.text(cx, cy - 60,
      `พบเซฟเดิม\nผ่านแล้ว ${done}/10 ด่าน — ปลดล็อกถึงด่าน ${save.currentDungeon}`, {
        fontFamily: NaSan.FONTS.BODY, fontSize: '20px',
        color: NaSan.CSS_COLORS.TEXT, align: 'center', lineSpacing: 8,
      }).setOrigin(0.5).setDepth(7002);

    let contBtn, newBtn, cancelBtn;
    const cleanup = () => {
      [backdrop, box, txt, contBtn, newBtn, cancelBtn].forEach(o => o && o.destroy());
    };

    contBtn = UIButton.create(this, {
      x: cx - 120, y: cy + 50, width: 200, height: 50,
      text: 'เล่นต่อ', bgColor: NaSan.COLORS.SUCCESS, fontSize: 19,
      onClick: () => { cleanup(); this._goToHub(false); },
    });
    contBtn.setDepth(7002);
    newBtn = UIButton.create(this, {
      x: cx + 120, y: cy + 50, width: 200, height: 50,
      text: 'เริ่มใหม่', bgColor: NaSan.COLORS.DANGER, fontSize: 19,
      onClick: () => { cleanup(); this._goToHub(true); },
    });
    newBtn.setDepth(7002);
    cancelBtn = this.add.text(cx, cy + 110, 'ยกเลิก', {
      fontFamily: NaSan.FONTS.BODY, fontSize: '14px',
      color: '#888', backgroundColor: 'rgba(0,0,0,0.1)', padding: {x:8,y:4},
    }).setOrigin(0.5).setDepth(7002).setInteractive({ useHandCursor: true });
    cancelBtn.on('pointerup', cleanup);
  }

  _onSettingsClick() {
    if (typeof SoundManager !== 'undefined') SoundManager.play('click');
    const muted = (typeof SoundManager !== 'undefined') ? SoundManager.isMuted() : false;
    this._showModal('⚙ ตั้งค่า',
      `เสียง BGM: ${muted ? '🔇 ปิด' : '🔊 เปิด'}\nกดปุ่มลำโพงมุมขวาบนเพื่อสลับ\n\nหน้าตั้งค่าเพิ่มเติมจะมาในเวอร์ชันถัดไป`);
  }

  _onCreditsClick() {
    if (typeof SoundManager !== 'undefined') SoundManager.play('click');
    /* เครดิตเหลือเฉพาะผู้สร้าง — ตามที่ขอ */
    this._showModal('🏆 เครดิต',
      'ผู้สร้าง:\nครูนันทชัย วิสมิตตนันท์\nโรงเรียนบ้านนาสาร');
  }

  _showModal(title, body) {
    const { width, height } = this.scale;
    const cx = width / 2, cy = height / 2;
    const boxW = Math.min(560, width - 40);
    const boxH = 320;

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.7);
    backdrop.fillRect(0, 0, width, height);
    backdrop.setDepth(7000);
    backdrop.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains);

    const box = this.add.graphics();
    box.fillStyle(NaSan.COLORS.BACKGROUND);
    box.fillRoundedRect(cx - boxW/2, cy - boxH/2, boxW, boxH, 20);
    box.lineStyle(4, NaSan.COLORS.PRIMARY);
    box.strokeRoundedRect(cx - boxW/2, cy - boxH/2, boxW, boxH, 20);
    box.setDepth(7001);

    const headerBg = this.add.graphics();
    headerBg.fillStyle(NaSan.COLORS.PRIMARY);
    headerBg.fillRoundedRect(cx - boxW/2, cy - boxH/2, boxW, 60,
      { tl: 20, tr: 20, bl: 0, br: 0 });
    headerBg.setDepth(7002);

    const titleText = this.add.text(cx, cy - boxH/2 + 30, title, {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '22px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(7003);

    const bodyText = this.add.text(cx, cy - 10, body, {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '18px',
      color: NaSan.CSS_COLORS.TEXT,
      align: 'center',
      lineSpacing: 8,
      wordWrap: { width: boxW - 50 },
    }).setOrigin(0.5).setDepth(7003);

    let closeBtn;
    const cleanup = () => {
      [backdrop, box, headerBg, titleText, bodyText, closeBtn].forEach(o => o && o.destroy());
    };

    closeBtn = UIButton.create(this, {
      x: cx, y: cy + boxH/2 - 40,
      width: 160, height: 48,
      text: 'ปิด',
      bgColor: NaSan.COLORS.DANGER,
      fontSize: 20,
      onClick: cleanup,
    });
    closeBtn.setDepth(7003);

    backdrop.on('pointerup', cleanup);

    [box, headerBg, titleText, bodyText, closeBtn].forEach(o => {
      o.alpha = 0;
      this.tweens.add({ targets: o, alpha: 1, duration: 200 });
    });
  }
}
