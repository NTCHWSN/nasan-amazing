/* =====================================================================
   EndingScene — ฉากจบเกมเมื่อเอาชนะบอสทั้ง 4 ตัว
   ---------------------------------------------------------------------
   Flow:
     Act 1: Splash "ชัยชนะ!" (3s)
     Act 2: ผู้เล่นเห็นบอสทั้ง 4 ขึ้น ✓ พร้อมกัน
     Act 3: ตัวเอก 3 คนเด้งเข้ามา + พูดบทจบ (3 บท)
     Act 4: Final monologue + เครดิต
     Act 5: ปุ่ม "เล่นใหม่" / "กลับเมนูหลัก"

   ใช้:
     scene.start('EndingScene', { difficulty: 'easy' })
   ===================================================================== */

class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndingScene' });
  }

  init(data) {
    data = data || {};
    this.difficulty = data.difficulty || 'easy';
    this.startTime  = data.startTime  || null;
    this._act = 0;
  }

  create() {
    const { width, height } = this.scale;

    /* พื้นหลังสีเข้ม + วงรีกลาง (spotlight) */
    this._addBackground(width, height);

    /* ปุ่มข้าม */
    this._addSkipButton(width, height);

    /* เริ่ม Act 1 */
    this._runAct1();
  }

  /* ===================================================================
     Background — วงรี gradient + ดาวกระพริบ
     =================================================================== */
  _addBackground(width, height) {
    /* ใช้ bg_ending ถ้ามี ไม่งั้น fallback เป็นพื้นทึบ */
    if (this.textures.exists('bg_ending')) {
      const bg = this.add.image(width / 2, height / 2, 'bg_ending');
      const s = Math.max(width / bg.width, height / bg.height);
      bg.setScale(s);
      const overlay = this.add.graphics();
      overlay.fillStyle(0x1A1A2E, 0.55);
      overlay.fillRect(0, 0, width, height);
    } else {
      const bg = this.add.graphics();
      bg.fillStyle(0x1A1A2E);
      bg.fillRect(0, 0, width, height);
    }

    /* Vignette gold-ish ตรงกลาง */
    const vignette = this.add.graphics();
    vignette.fillStyle(0xF4B942, 0.12);
    vignette.fillCircle(width / 2, height / 2, 500);
    vignette.fillStyle(0xF4B942, 0.06);
    vignette.fillCircle(width / 2, height / 2, 700);

    /* ดาวกระพริบสุ่มๆ */
    this._stars = [];
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const star = this.add.graphics();
      star.fillStyle(0xFFFFFF, 0.3 + Math.random() * 0.5);
      star.fillCircle(0, 0, 1 + Math.random() * 2);
      star.x = x; star.y = y;
      this.tweens.add({
        targets: star,
        alpha: 0.1 + Math.random() * 0.4,
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1500,
      });
      this._stars.push(star);
    }
  }

  _addSkipButton(width, height) {
    this.skipBtn = this.add.text(width - 20, 20, 'ข้าม ▶▶', {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: { x: 10, y: 6 },
    }).setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(9000);
    this.skipBtn.on('pointerup', () => this._skipToFinal());
  }

  /* ===================================================================
     ACT 1 — Splash "ชัยชนะ!"
     =================================================================== */
  _runAct1() {
    const { width, height } = this.scale;

    /* รัศมีระเบิดทอง */
    const burst = this.add.graphics();
    burst.fillStyle(0xF4B942, 0.6);
    burst.fillCircle(width / 2, height / 2, 50);
    this.tweens.add({
      targets: burst,
      scale: { from: 0, to: 8 },
      alpha: { from: 0.7, to: 0 },
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => burst.destroy(),
    });

    /* ตัวหนังสือ "ชัยชนะ!" */
    const winText = this.add.text(width / 2, height / 2, '🏆 ชัยชนะ! 🏆', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '88px',
      color: NaSan.CSS_COLORS.WARNING,
      fontStyle: '900',
      stroke: NaSan.CSS_COLORS.TEXT,
      strokeThickness: 8,
    }).setOrigin(0.5).setScale(0).setDepth(100);
    this._act1Text = winText;

    this.tweens.add({
      targets: winText,
      scale: 1,
      duration: 800,
      ease: 'Back.easeOut',
    });

    /* บรรยาย */
    const sub = this.add.text(width / 2, height / 2 + 100,
      'คุณเอาชนะบอสทั้ง 10 ตัว!\nบ้านนาสารปลอดภัยแล้ว!', {
        fontFamily: NaSan.FONTS.HEADING,
        fontSize: '26px',
        color: '#FFFFFF',
        align: 'center',
        lineSpacing: 8,
        stroke: NaSan.CSS_COLORS.PRIMARY,
        strokeThickness: 4,
      }).setOrigin(0.5).setAlpha(0).setDepth(100);
    this._act1Sub = sub;
    this.tweens.add({ targets: sub, alpha: 1, duration: 700, delay: 600 });

    /* ไปต่อ Act 2 หลัง 3.5s */
    this._actTimer = this.time.delayedCall(3500, () => {
      this.tweens.add({
        targets: [winText, sub],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          winText.destroy();
          sub.destroy();
          this._runAct2();
        },
      });
    });
  }

  /* ===================================================================
     ACT 2 — แสดงบอสทั้ง 4 ตัวพร้อม ✓
     =================================================================== */
  _runAct2() {
    const { width, height } = this.scale;
    this._act2Objs = [];

    const header = this.add.text(width / 2, 50, '⚔️ บอสทั้ง 10 ที่เอาชนะ ⚔️', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '28px',
      color: NaSan.CSS_COLORS.WARNING,
      fontStyle: 'bold',
      stroke: NaSan.CSS_COLORS.TEXT,
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0).setDepth(100);
    this.tweens.add({ targets: header, alpha: 1, duration: 500 });
    this._act2Objs.push(header);

    /* 10 บอส grid 5×2 */
    const bosses = ['boss_d1','boss_d2','boss_d3','boss_d4','boss_d5',
                    'boss_d6','boss_d7','boss_d8','boss_d9','boss_d10'];
    const cols = 5, rows = 2;
    const cardW = 180, cardH = 200;
    const gapX = 16, gapY = 24;
    const totalW = cardW * cols + gapX * (cols - 1);
    const totalH = cardH * rows + gapY * (rows - 1);
    const startX = (width - totalW) / 2 + cardW / 2;
    const startY = 110 + cardH / 2;

    bosses.forEach((bossId, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const pos = {
        x: startX + col * (cardW + gapX),
        y: startY + row * (cardH + gapY),
      };
      const meta = PlaceholderFactory.BOSSES[bossId] || {};

      /* การ์ดพื้นหลัง */
      const card = this.add.graphics();
      card.fillStyle(meta.color || 0x4A90E2, 0.3);
      card.fillRoundedRect(pos.x - cardW/2, pos.y - cardH/2, cardW, cardH, 14);
      card.lineStyle(3, meta.color || 0x4A90E2, 0.9);
      card.strokeRoundedRect(pos.x - cardW/2, pos.y - cardH/2, cardW, cardH, 14);
      card.setAlpha(0).setDepth(100);
      this._act2Objs.push(card);

      /* บอส sprite ย่อ */
      const sprite = PlaceholderFactory.getBossDisplay(this, pos.x, pos.y - 18, bossId, {
        width: 130, height: 130, scale: 1,
      });
      sprite.setAlpha(0).setDepth(101);
      this._act2Objs.push(sprite);

      /* ✓ มุมขวาบน */
      const check = this.add.text(pos.x + cardW/2 - 22, pos.y - cardH/2 + 22, '✓', {
        fontFamily: NaSan.FONTS.HEADING,
        fontSize: '26px',
        color: '#FFFFFF',
        stroke: '#2C7C2C',
        strokeThickness: 5,
        fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(0).setDepth(102);
      this._act2Objs.push(check);

      /* ชื่อบอส */
      const name = this.add.text(pos.x, pos.y + cardH/2 - 30, meta.name || bossId, {
        fontFamily: NaSan.FONTS.HEADING,
        fontSize: '13px',
        color: '#FFFFFF',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: cardW - 16 },
      }).setOrigin(0.5).setAlpha(0).setDepth(102);
      this._act2Objs.push(name);

      /* Animation: เด้งเข้ามาทีละตัว (เร็วขึ้น เพราะมี 10) */
      const delay = 150 + i * 200;
      this.tweens.add({
        targets: [card, sprite, check, name],
        alpha: 1,
        duration: 400,
        delay,
      });
      const baseScale = sprite.scaleX || 1;
      sprite.setScale(0);
      this.tweens.add({
        targets: sprite,
        scale: baseScale,
        duration: 500,
        delay,
        ease: 'Back.easeOut',
      });

      /* ring effect */
      this.time.delayedCall(delay + 250, () => {
        const ring = this.add.graphics();
        ring.lineStyle(3, 0x6BB13D, 1);
        ring.strokeCircle(pos.x + cardW/2 - 22, pos.y - cardH/2 + 22, 18);
        ring.setDepth(103);
        this.tweens.add({
          targets: ring,
          scale: 3,
          alpha: 0,
          duration: 500,
          onComplete: () => ring.destroy(),
        });
      });
    });

    /* ไปต่อ Act 3 หลังโชว์ครบ 10 + buffer */
    this._actTimer = this.time.delayedCall(1800 + bosses.length * 200, () => {
      this.tweens.add({
        targets: this._act2Objs,
        alpha: 0,
        duration: 600,
        onComplete: () => {
          this._act2Objs.forEach(o => o.destroy());
          this._runAct3();
        },
      });
    });
  }

  /* ===================================================================
     ACT 3 — ตัวเอก 3 คน พูดบทจบ
     =================================================================== */
  _runAct3() {
    const { width, height } = this.scale;
    this._act3Objs = [];

    const header = this.add.text(width / 2, 70, '👦👧 ปาร์ตี้ผู้กล้า 👦👧', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '30px',
      color: NaSan.CSS_COLORS.WARNING,
      fontStyle: 'bold',
      stroke: NaSan.CSS_COLORS.TEXT,
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0).setDepth(100);
    this.tweens.add({ targets: header, alpha: 1, duration: 500 });
    this._act3Objs.push(header);

    /* 3 ตัวเอก เรียงแถวกลาง */
    const heroes = [
      { key: 'char_ngoh',    name: 'น้องเงาะ',    role: 'Wizard — หา c', emoji: '🍎', color: NaSan.COLORS.DANGER,  x: width / 2 - 220 },
      { key: 'char_durian',  name: 'น้องทุเรียน', role: 'Priest — หา a/b', emoji: '🌰', color: NaSan.COLORS.SUCCESS, x: width / 2       },
      { key: 'char_plameng', name: 'น้องปลาเม็ง', role: 'Knight — บทกลับ', emoji: '🐟', color: NaSan.COLORS.PRIMARY, x: width / 2 + 220 },
    ];
    const heroY = height / 2 - 30;

    heroes.forEach((h, i) => {
      const delay = 300 + i * 250;

      let sprite;
      if (this.textures.exists(h.key)) {
        sprite = this.add.image(h.x, heroY, h.key);
        const tex = this.textures.get(h.key).getSourceImage();
        /* Sheet 2×2 — เอา top-left pose เท่านั้น */
        sprite.setCrop(tex.width * 0.05, tex.height * 0.03, tex.width * 0.42, tex.height * 0.47);
        sprite.setOrigin(0.5, 1);
        sprite.setScale(0.42);
      } else {
        /* placeholder วงกลม */
        sprite = this.add.graphics();
        sprite.fillStyle(h.color);
        sprite.fillCircle(h.x, heroY, 40);
        const ic = this.add.text(h.x, heroY, h.emoji, { fontSize: '50px' }).setOrigin(0.5).setDepth(101);
        sprite = ic;
      }
      sprite.setAlpha(0).setDepth(101);
      sprite.y = heroY + 100;
      this.tweens.add({
        targets: sprite,
        alpha: 1,
        y: heroY,
        duration: 600,
        delay,
        ease: 'Back.easeOut',
      });
      this._act3Objs.push(sprite);

      /* ป้ายชื่อ */
      const nameBg = this.add.graphics();
      nameBg.fillStyle(h.color, 0.9);
      nameBg.fillRoundedRect(h.x - 95, heroY + 30, 190, 32, 8);
      nameBg.setAlpha(0).setDepth(100);
      this._act3Objs.push(nameBg);

      const nameTxt = this.add.text(h.x, heroY + 46, `${h.emoji} ${h.name}`, {
        fontFamily: NaSan.FONTS.HEADING,
        fontSize: '18px',
        color: '#FFFFFF',
        fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(0).setDepth(102);
      this._act3Objs.push(nameTxt);

      const roleTxt = this.add.text(h.x, heroY + 80, h.role, {
        fontFamily: NaSan.FONTS.BODY,
        fontSize: '15px',
        color: '#F4B942',
        fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(0).setDepth(102);
      this._act3Objs.push(roleTxt);

      this.tweens.add({
        targets: [nameBg, nameTxt, roleTxt],
        alpha: 1,
        duration: 400,
        delay: delay + 300,
      });

      /* idle float */
      this.tweens.add({
        targets: sprite,
        y: heroY - 8,
        duration: 1500 + i * 200,
        yoyo: true,
        repeat: -1,
        delay: delay + 800,
        ease: 'Sine.easeInOut',
      });
    });

    /* บทพูดสรุป */
    const finalQuote = this.add.text(width / 2, height - 200,
      '"ทฤษฎีบทพีทาโกรัส ไม่ใช่แค่สูตรในหนังสือ\nแต่มันคือ ‘เครื่องมือ’ ที่ใช้แก้ปัญหาในชีวิตจริงได้"', {
        fontFamily: NaSan.FONTS.HEADING,
        fontSize: '20px',
        color: '#FFFFFF',
        fontStyle: 'italic',
        align: 'center',
        lineSpacing: 8,
        stroke: NaSan.CSS_COLORS.PRIMARY,
        strokeThickness: 3,
      }).setOrigin(0.5).setAlpha(0).setDepth(100);
    this._act3Objs.push(finalQuote);

    this.tweens.add({
      targets: finalQuote,
      alpha: 1,
      duration: 800,
      delay: 1500,
    });

    /* ไปต่อ Act 4 */
    this._actTimer = this.time.delayedCall(5500, () => {
      this.tweens.add({
        targets: this._act3Objs,
        alpha: 0,
        duration: 600,
        onComplete: () => {
          this._act3Objs.forEach(o => o.destroy());
          this._runAct4();
        },
      });
    });
  }

  /* ===================================================================
     ACT 4 — เครดิต + ปุ่มจบ
     =================================================================== */
  _runAct4() {
    const { width, height } = this.scale;

    /* "THE END" ใหญ่ */
    const theEnd = this.add.text(width / 2, height / 2 - 140, 'THE END', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '90px',
      color: NaSan.CSS_COLORS.WARNING,
      fontStyle: '900',
      stroke: NaSan.CSS_COLORS.TEXT,
      strokeThickness: 8,
    }).setOrigin(0.5).setAlpha(0).setDepth(100);
    this.tweens.add({ targets: theEnd, alpha: 1, duration: 800 });

    /* เครดิต */
    const credits = this.add.text(width / 2, height / 2,
      `${NaSan.GAME_NAME_TH}\n\nผู้สร้าง: ครูนันทชัย วิสมิตตนันท์\nโรงเรียนบ้านนาสาร\n\nขอบคุณที่เล่นค่ะ! 💚`, {
        fontFamily: NaSan.FONTS.BODY,
        fontSize: '18px',
        color: '#FFFFFF',
        align: 'center',
        lineSpacing: 8,
      }).setOrigin(0.5).setAlpha(0).setDepth(100);
    this.tweens.add({ targets: credits, alpha: 1, duration: 800, delay: 500 });

    /* ปุ่ม */
    const replayBtn = UIButton.create(this, {
      x: width / 2 - 150, y: height - 90,
      width: 260, height: 60,
      text: 'เล่นใหม่', icon: '🔄',
      bgColor: NaSan.COLORS.SUCCESS,
      fontSize: 22,
      onClick: () => this._replay(),
    });
    replayBtn.setDepth(100);
    replayBtn.alpha = 0;
    this.tweens.add({ targets: replayBtn, alpha: 1, duration: 600, delay: 1500 });

    const menuBtn = UIButton.create(this, {
      x: width / 2 + 150, y: height - 90,
      width: 260, height: 60,
      text: 'เมนูหลัก', icon: '🏠',
      bgColor: NaSan.COLORS.PRIMARY,
      fontSize: 22,
      onClick: () => this._toMenu(),
    });
    menuBtn.setDepth(100);
    menuBtn.alpha = 0;
    this.tweens.add({ targets: menuBtn, alpha: 1, duration: 600, delay: 1700 });

    /* ซ่อนปุ่มข้าม */
    if (this.skipBtn) this.skipBtn.setVisible(false);
  }

  /* ===================================================================
     Skip → ไป Act 4 เลย
     =================================================================== */
  _skipToFinal() {
    /* ลบ act timer ปัจจุบัน */
    if (this._actTimer) this._actTimer.remove();

    /* ทำลายทุกอย่างจาก act ก่อน */
    if (this._act1Text) this._act1Text.destroy();
    if (this._act1Sub)  this._act1Sub.destroy();
    if (this._act2Objs) this._act2Objs.forEach(o => o && o.destroy());
    if (this._act3Objs) this._act3Objs.forEach(o => o && o.destroy());

    this._runAct4();
  }

  /* ===================================================================
     Replay / Menu
     =================================================================== */
  _replay() {
    /* รีเซ็ตทุกบอสกลับ + เริ่มที่ Hub */
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(420, () => {
      this.scene.start('HubVillageScene', {
        heroKey: 'char_ngoh',
        difficulty: this.difficulty,
        defeatedBosses: {},   // reset
      });
    });
  }

  _toMenu() {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(420, () => {
      this.scene.start('TitleScene');
    });
  }
}
