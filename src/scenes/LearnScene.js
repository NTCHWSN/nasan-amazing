/* =====================================================================
   LearnScene — บทเรียนพีทาโกรัส (3 บท)
   ---------------------------------------------------------------------
   บทที่ 1: ทฤษฎีบทพีทาโกรัส  c² = a² + b²
   บทที่ 2: การหาด้านที่หายไป  (a, b, หรือ c)
   บทที่ 3: บทกลับ — ตรวจสามเหลี่ยมมุมฉาก

   แต่ละบทมี:
     - คำอธิบาย + ภาพสามเหลี่ยมเด่นชัด
     - ตัวอย่างคำนวณทีละขั้น
     - Quiz ตรวจความเข้าใจ (ผิดได้ — มีคำใบ้)
     - ปุ่ม "ต่อบทถัดไป →"
   ===================================================================== */

class LearnScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LearnScene' });
  }

  init(data) {
    data = data || {};
    this.returnScene = data.returnScene || 'TitleScene';
    this.currentLesson = 0;
    this._modalOpen = false;
  }

  create() {
    const { width, height } = this.scale;

    /* พื้นหลัง gradient ฟ้าอ่อน */
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xE8F4FA, 0xE8F4FA, 0xC8E0EC, 0xC8E0EC, 1);
    bg.fillRect(0, 0, width, height);

    /* Top bar */
    const barBg = this.add.graphics();
    barBg.fillStyle(NaSan.COLORS.PRIMARY);
    barBg.fillRect(0, 0, width, 60);

    this.titleTxt = this.add.text(width / 2, 30, '📐 อัพสกิลพีทาโกรัส', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '26px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    /* ปุ่มกลับ — เพิ่มขนาดให้กดง่ายบนมือถือ */
    const backBtn = this.add.text(20, 30, '◄ กลับ', {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '22px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 18, y: 10 },
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerup', () => {
      if (typeof SoundManager !== 'undefined') SoundManager.play('click');
      this.scene.start(this.returnScene);
    });

    /* Progress dots */
    this.dotsContainer = this.add.container(width - 100, 30);
    this._renderDots();

    /* Lesson container (จะถูก rebuild ใน _renderLesson) */
    this._renderLesson();
  }

  _renderDots() {
    this.dotsContainer.removeAll(true);
    for (let i = 0; i < 3; i++) {
      const dot = this.add.graphics();
      const filled = i <= this.currentLesson;
      dot.fillStyle(filled ? 0xFFFFFF : 0x666666, 0.9);
      dot.fillCircle(i * 24, 0, 8);
      this.dotsContainer.add(dot);
    }
  }

  _clearLesson() {
    if (this._lessonObjs) {
      this._lessonObjs.forEach(o => o && o.destroy());
    }
    this._lessonObjs = [];
  }

  _renderLesson() {
    this._clearLesson();
    const { width, height } = this.scale;

    if (this.currentLesson === 0) {
      this._lesson1(width, height);
    } else if (this.currentLesson === 1) {
      this._lesson2(width, height);
    } else if (this.currentLesson === 2) {
      this._lesson3(width, height);
    } else {
      this._lessonComplete(width, height);
    }
    this._renderDots();
  }

  /* ==================================================================
     บทที่ 1: ทฤษฎีบทพีทาโกรัส — c² = a² + b²
     ================================================================== */
  _lesson1(width, height) {
    const cx = width / 2;

    /* ชื่อบท */
    const t = this.add.text(cx, 100, 'บทที่ 1 — ทฤษฎีบทพีทาโกรัส', {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '36px',
      color: NaSan.CSS_COLORS.PRIMARY, fontStyle: 'bold',
    }).setOrigin(0.5);
    this._lessonObjs.push(t);

    /* เนื้อหา */
    const txt = this.add.text(cx, 160,
      'ในสามเหลี่ยมมุมฉาก:\n' +
      'a และ b คือ "ด้านประกอบมุมฉาก"\n' +
      'c คือ "ด้านตรงข้ามมุมฉาก" (ด้านยาวที่สุด)', {
        fontFamily: NaSan.FONTS.BODY, fontSize: '24px',
        color: NaSan.CSS_COLORS.TEXT, align: 'center', lineSpacing: 10,
      }).setOrigin(0.5, 0);
    this._lessonObjs.push(txt);

    /* สูตรใหญ่ */
    const formula = this.add.text(cx, 320, 'c² = a² + b²', {
      fontFamily: NaSan.FONTS.MONO, fontSize: '60px',
      color: NaSan.CSS_COLORS.DANGER, fontStyle: 'bold',
      backgroundColor: '#FFFFFF', padding: { x: 36, y: 16 },
    }).setOrigin(0.5);
    this._lessonObjs.push(formula);

    /* สามเหลี่ยมตัวอย่าง 3-4-5 (ซ้าย) + ตัวอย่างคำนวณ (ขวา) — แถวเดียว ไม่ทับ quiz */
    const rowY = 460;
    const triG = this._drawTriangle(cx - 240, rowY + 50, 3, 4, 5, 26);
    triG.forEach(o => this._lessonObjs.push(o));

    const ex = this.add.text(cx + 40, rowY,
      'ตัวอย่าง: a=3, b=4\n' +
      '  c² = 3² + 4²\n' +
      '  c² = 9 + 16 = 25\n' +
      '  c  = √25 = 5', {
        fontFamily: NaSan.FONTS.MONO, fontSize: '22px',
        color: NaSan.CSS_COLORS.TEXT, lineSpacing: 6,
        backgroundColor: '#FFFFFF', padding: { x: 20, y: 14 },
      }).setOrigin(0, 0.5);
    this._lessonObjs.push(ex);

    /* Quiz */
    this._addQuiz('ลองเอง: ถ้า a=6, b=8 แล้ว c = ?',
      ['8', '10', '14', '√100'], 1,
      'c² = 6² + 8² = 36 + 64 = 100 → c = √100 = 10 ✓');
  }

  /* ==================================================================
     บทที่ 2: หาด้านที่หายไป
     ================================================================== */
  _lesson2(width, height) {
    const cx = width / 2;

    const t = this.add.text(cx, 100, 'บทที่ 2 — หาด้านที่หายไป', {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '36px',
      color: NaSan.CSS_COLORS.PRIMARY, fontStyle: 'bold',
    }).setOrigin(0.5);
    this._lessonObjs.push(t);

    const txt = this.add.text(cx, 160,
      'จากสูตร c² = a² + b² เราจัดสมการได้:\n' +
      '🟢 หา c (ด้านตรงข้ามมุมฉาก):  c = √(a² + b²)\n' +
      '🟡 หา a (ด้านประกอบ):  a = √(c² − b²)\n' +
      '🟡 หา b (ด้านประกอบ):  b = √(c² − a²)', {
        fontFamily: NaSan.FONTS.BODY, fontSize: '23px',
        color: NaSan.CSS_COLORS.TEXT, align: 'center', lineSpacing: 10,
      }).setOrigin(0.5, 0);
    this._lessonObjs.push(txt);

    /* ตัวอย่าง */
    const ex = this.add.text(cx, 380,
      'ตัวอย่าง: รู้ว่า c = 13, a = 5  หา b\n' +
      '  b² = c² − a² = 13² − 5²\n' +
      '  b² = 169 − 25 = 144\n' +
      '  b  = √144 = 12', {
        fontFamily: NaSan.FONTS.MONO, fontSize: '23px',
        color: NaSan.CSS_COLORS.TEXT, align: 'center', lineSpacing: 6,
        backgroundColor: '#FFFFFF', padding: { x: 24, y: 16 },
      }).setOrigin(0.5, 0);
    this._lessonObjs.push(ex);

    /* Quiz */
    this._addQuiz('ลองเอง: รู้ว่า c=25, b=24 หา a = ?',
      ['1', '7', '11', '49'], 1,
      'a² = c² − b² = 25² − 24² = 625 − 576 = 49 → a = √49 = 7 ✓');
  }

  /* ==================================================================
     บทที่ 3: บทกลับของพีทาโกรัส
     ================================================================== */
  _lesson3(width, height) {
    const cx = width / 2;

    const t = this.add.text(cx, 100, 'บทที่ 3 — บทกลับของพีทาโกรัส', {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '34px',
      color: NaSan.CSS_COLORS.PRIMARY, fontStyle: 'bold',
    }).setOrigin(0.5);
    this._lessonObjs.push(t);

    const txt = this.add.text(cx, 155,
      'บทกลับ = พิสูจน์ว่า "สามเหลี่ยมเป็นมุมฉากไหม"\n' +
      '🔍 ขั้นตอน: 1) หาด้านยาวสุด (ให้เป็น c)\n' +
      '2) คำนวณ a² + b² และ c²   3) เปรียบเทียบ:', {
        fontFamily: NaSan.FONTS.BODY, fontSize: '22px',
        color: NaSan.CSS_COLORS.TEXT, align: 'center', lineSpacing: 8,
      }).setOrigin(0.5, 0);
    this._lessonObjs.push(txt);

    /* สูตรกล่อง */
    const rule1 = this.add.text(cx - 170, 300,
      'ถ้า a² + b² = c²\n⇒ มุมฉาก ✓', {
        fontFamily: NaSan.FONTS.MONO, fontSize: '22px',
        color: '#FFFFFF', fontStyle: 'bold', align: 'center',
        backgroundColor: '#6BB13D', padding: { x: 18, y: 14 },
      }).setOrigin(0.5);
    const rule2 = this.add.text(cx + 170, 300,
      'ถ้า a² + b² ≠ c²\n⇒ ไม่ใช่มุมฉาก ✗', {
        fontFamily: NaSan.FONTS.MONO, fontSize: '22px',
        color: '#FFFFFF', fontStyle: 'bold', align: 'center',
        backgroundColor: '#D9263D', padding: { x: 18, y: 14 },
      }).setOrigin(0.5);
    this._lessonObjs.push(rule1, rule2);

    /* ตัวอย่าง */
    const ex = this.add.text(cx, 380,
      'ตัวอย่าง: สามเหลี่ยมด้าน 9, 40, 41 เป็นมุมฉากไหม?\n' +
      '  9² + 40² = 81 + 1600 = 1681   และ   41² = 1681\n' +
      '  1681 = 1681 ✓ ⇒ เป็นมุมฉาก!', {
        fontFamily: NaSan.FONTS.MONO, fontSize: '22px',
        color: NaSan.CSS_COLORS.TEXT, align: 'center', lineSpacing: 6,
        backgroundColor: '#FFFFFF', padding: { x: 20, y: 14 },
      }).setOrigin(0.5, 0);
    this._lessonObjs.push(ex);

    /* Quiz */
    this._addQuiz('ลองเอง: สามเหลี่ยมด้าน 5, 12, 13 เป็นมุมฉากไหม?',
      ['ใช่ (มุมฉาก)', 'ไม่ใช่', 'ตอบไม่ได้', 'ต้องวัดด้วยไม้บรรทัด'], 0,
      '5² + 12² = 25 + 144 = 169 และ 13² = 169 → เท่ากัน ⇒ มุมฉาก ✓');
  }

  /* ==================================================================
     จบบทเรียน
     ================================================================== */
  _lessonComplete(width, height) {
    const cx = width / 2;
    const cy = height / 2;

    const star = this.add.text(cx, cy - 100, '🎓⭐🎓', {
      fontSize: '80px',
    }).setOrigin(0.5);
    this._lessonObjs.push(star);

    const t = this.add.text(cx, cy - 10, 'เรียนจบ 3 บทแล้ว!', {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '38px',
      color: NaSan.CSS_COLORS.SUCCESS, fontStyle: 'bold',
    }).setOrigin(0.5);
    this._lessonObjs.push(t);

    const sub = this.add.text(cx, cy + 50,
      'พร้อมแล้ว! ใช้พีทาโกรัสในการผจญภัยเลย', {
        fontFamily: NaSan.FONTS.BODY, fontSize: '20px',
        color: NaSan.CSS_COLORS.TEXT,
      }).setOrigin(0.5);
    this._lessonObjs.push(sub);

    const startBtn = UIButton.create(this, {
      x: cx, y: cy + 140,
      width: 280, height: 60,
      text: 'เริ่มผจญภัย', icon: '▶',
      bgColor: NaSan.COLORS.SUCCESS, fontSize: 22,
      onClick: () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.time.delayedCall(420, () => {
          this.scene.start('HubVillageScene', { heroKey: 'char_ngoh', difficulty: 'easy' });
        });
      },
    });
    this._lessonObjs.push(startBtn);

    const reviewBtn = UIButton.create(this, {
      x: cx, y: cy + 210,
      width: 280, height: 50,
      text: 'ทบทวนอีกครั้ง', icon: '🔄',
      bgColor: NaSan.COLORS.PRIMARY, fontSize: 18,
      onClick: () => { this.currentLesson = 0; this._renderLesson(); },
    });
    this._lessonObjs.push(reviewBtn);
  }

  /* ==================================================================
     Helpers
     ================================================================== */
  _drawTriangle(x, y, a, b, c, scale) {
    const objs = [];
    const g = this.add.graphics();
    g.lineStyle(4, NaSan.COLORS.PRIMARY);
    g.fillStyle(NaSan.COLORS.WARNING, 0.3);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + b * scale, y);
    g.lineTo(x, y - a * scale);
    g.closePath();
    g.fillPath();
    g.strokePath();
    /* right angle marker */
    g.lineStyle(2, NaSan.COLORS.PRIMARY);
    g.strokeRect(x, y - 12, 12, 12);
    objs.push(g);

    /* labels */
    objs.push(this.add.text(x - 16, y - a*scale/2, 'a=' + a, {
      fontFamily: NaSan.FONTS.MONO, fontSize: '20px',
      color: NaSan.CSS_COLORS.TEXT, fontStyle: 'bold',
    }).setOrigin(1, 0.5));
    objs.push(this.add.text(x + b*scale/2, y + 8, 'b=' + b, {
      fontFamily: NaSan.FONTS.MONO, fontSize: '20px',
      color: NaSan.CSS_COLORS.TEXT, fontStyle: 'bold',
    }).setOrigin(0.5, 0));
    objs.push(this.add.text(x + b*scale/2 + 10, y - a*scale/2 - 10, 'c=' + c, {
      fontFamily: NaSan.FONTS.MONO, fontSize: '20px',
      color: NaSan.CSS_COLORS.DANGER, fontStyle: 'bold',
    }).setOrigin(0, 1));
    return objs;
  }

  _addQuiz(question, choices, correctIdx, explain) {
    const { width, height } = this.scale;
    const cx = width / 2;
    /* วาง quiz เป็นแถบล่างแบบกระชับ — คำถาม 1 แถว + ตัวเลือก 4 ปุ่มเรียงแถวเดียว
       (จอ landscape กว้างพอ) → ประหยัดพื้นที่แนวตั้ง ไม่ทับเนื้อหาด้านบน */
    const qy = height - 130;          // แถบคำถาม
    const choiceY = height - 64;       // แถวตัวเลือก

    /* แถบคำถาม */
    const qBg = this.add.graphics();
    qBg.fillStyle(NaSan.COLORS.PRIMARY, 0.97);
    qBg.fillRoundedRect(30, qy - 30, width - 60, 60, 14);
    this._lessonObjs.push(qBg);

    const qTxt = this.add.text(cx, qy, '🧠 ' + question, {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '24px',
      color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5);
    this._lessonObjs.push(qTxt);

    /* ตัวเลือก 4 ปุ่ม เรียงแถวเดียว */
    const n = choices.length;
    const gap = 16;
    const maxBtnW = 360;
    const btnW = Math.min(maxBtnW, (width - 60 - gap * (n - 1)) / n);
    const totalW = btnW * n + gap * (n - 1);
    const startX = cx - totalW / 2 + btnW / 2;
    choices.forEach((choice, idx) => {
      const bx = startX + idx * (btnW + gap);
      const btn = UIButton.create(this, {
        x: bx, y: choiceY, width: btnW, height: 52,
        text: `${String.fromCharCode(65 + idx)}. ${choice}`,
        bgColor: NaSan.COLORS.BACKGROUND,
        textColor: NaSan.CSS_COLORS.TEXT, fontSize: 20,
        onClick: () => this._answerQuiz(idx === correctIdx, explain),
      });
      this._lessonObjs.push(btn);
    });
  }

  _answerQuiz(correct, explain) {
    const { width, height } = this.scale;
    const cx = width/2, cy = height/2;
    const boxW = Math.min(660, width - 60), boxH = 340;

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.7);
    backdrop.fillRect(0, 0, width, height);

    const color = correct ? NaSan.COLORS.SUCCESS : NaSan.COLORS.WARNING;
    const icon = correct ? '✓ ถูกต้อง! เก่งมาก' : '✗ ลองอีกครั้งนะ';

    const box = this.add.graphics();
    box.fillStyle(NaSan.COLORS.BACKGROUND);
    box.fillRoundedRect(cx - boxW/2, cy - boxH/2, boxW, boxH, 20);
    box.lineStyle(4, color);
    box.strokeRoundedRect(cx - boxW/2, cy - boxH/2, boxW, boxH, 20);

    const headerBg = this.add.graphics();
    headerBg.fillStyle(color);
    headerBg.fillRoundedRect(cx - boxW/2, cy - boxH/2, boxW, 56,
      { tl: 20, tr: 20, bl: 0, br: 0 });

    const title = this.add.text(cx, cy - boxH/2 + 30, icon, {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '28px',
      color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5);

    const exTxt = this.add.text(cx, cy - 15, explain, {
      fontFamily: NaSan.FONTS.MONO, fontSize: '21px',
      color: NaSan.CSS_COLORS.TEXT, align: 'center',
      lineSpacing: 8, wordWrap: { width: boxW - 60 },
    }).setOrigin(0.5);

    let closeBtn;
    const cleanup = () => [backdrop, box, headerBg, title, exTxt, closeBtn].forEach(o => o && o.destroy());

    closeBtn = UIButton.create(this, {
      x: cx, y: cy + boxH/2 - 45,
      width: 240, height: 50,
      text: correct ? 'บทถัดไป →' : 'ลองใหม่',
      bgColor: correct ? NaSan.COLORS.SUCCESS : NaSan.COLORS.PRIMARY,
      fontSize: 19,
      onClick: () => {
        cleanup();
        if (correct) {
          this.currentLesson++;
          this._renderLesson();
        }
      },
    });
  }
}
