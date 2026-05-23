/* =====================================================================
   QuestionTestScene — ฉากทดสอบ QuestionGenerator
   ---------------------------------------------------------------------
   ใช้ตรวจว่าระบบสุ่มโจทย์ทำงานถูกต้อง:
   - มีปุ่มเลือกความยาก 3 ระดับ
   - แสดงโจทย์ 3 แบบ (find_c, find_leg, converse) พร้อมกันใน 3 คอลัมน์
   - แสดง: โจทย์, สามเหลี่ยม, คำตอบที่ถูก, hint
   - ปุ่ม "สุ่มใหม่" ทุกคอลัมน์
   ===================================================================== */

class QuestionTestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'QuestionTestScene' });
    this.currentDifficulty = 'easy';
    this.questions = { find_c: null, find_leg: null, converse: null };
    this.displays  = { find_c: [],   find_leg: [],   converse: [] };  // เก็บ Phaser objects เพื่อ destroy
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(NaSan.CSS_COLORS.BACKGROUND);

    /* หัวข้อ */
    this.add.text(width / 2, 16, '🧠 Question Generator Test', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '24px',
      color: NaSan.CSS_COLORS.PRIMARY,
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    /* แถวปุ่มเลือกความยาก */
    this._buildDifficultyButtons(width);

    /* 3 คอลัมน์โจทย์ */
    const colW = width / 3;
    this._buildColumn(QuestionGenerator.TYPES.FIND_C,   colW * 0.5, 110);
    this._buildColumn(QuestionGenerator.TYPES.FIND_LEG, colW * 1.5, 110);
    this._buildColumn(QuestionGenerator.TYPES.CONVERSE, colW * 2.5, 110);

    /* ปุ่มสุ่มใหม่ทั้งหมด + ปุ่มกลับ */
    this._buildControls(width, height);

    /* สุ่มครั้งแรก */
    this._refreshAll();
  }

  /* ───── ปุ่มเลือกความยาก ───── */
  _buildDifficultyButtons(width) {
    const y = 70;
    const levels = [
      { id: 'easy',   label: '🟢 ง่าย',  color: NaSan.COLORS.SUCCESS },
      { id: 'normal', label: '🟡 ปกติ',  color: NaSan.COLORS.WARNING },
      { id: 'hard',   label: '🔴 ยาก',   color: NaSan.COLORS.DANGER  },
    ];
    levels.forEach((lv, i) => {
      const x = width / 2 + (i - 1) * 160;
      const btn = UIButton.create(this, {
        x, y,
        width: 140, height: 42,
        text: lv.label,
        bgColor: lv.color,
        fontSize: 18,
        onClick: () => {
          this.currentDifficulty = lv.id;
          this._refreshAll();
        },
      });
      btn.diffId = lv.id;
      btn.bgColorOrig = lv.color;
    });
  }

  /* ───── คอลัมน์โจทย์ 1 อัน ───── */
  _buildColumn(type, cx, top) {
    /* หัวคอลัมน์ */
    const titleBg = this.add.graphics();
    titleBg.fillStyle(NaSan.COLORS.PRIMARY);
    titleBg.fillRoundedRect(cx - 200, top, 400, 40, 8);
    this.add.text(cx, top + 20, QuestionGenerator.TYPE_LABELS[type], {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    /* ปุ่มสุ่มเฉพาะคอลัมน์ */
    const refreshBtn = this.add.text(cx + 170, top + 20, '🔄', {
      fontSize: '20px',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    refreshBtn.on('pointerup', () => this._refreshColumn(type));
  }

  /* ───── สุ่มและแสดงโจทย์ใหม่ในคอลัมน์เดียว ───── */
  _refreshColumn(type) {
    /* Destroy ของเดิม */
    this.displays[type].forEach(o => o.destroy());
    this.displays[type] = [];

    /* สุ่มโจทย์ใหม่ */
    QuestionGenerator.resetHistory();
    const q = QuestionGenerator.generate(type, this.currentDifficulty);
    this.questions[type] = q;

    /* คำนวณตำแหน่ง */
    const colIndex = { find_c: 0, find_leg: 1, converse: 2 }[type];
    const cx = (this.scale.width / 3) * (colIndex + 0.5);
    const top = 170;

    /* แสดงโจทย์ (text) */
    const display = this.add.text(cx, top, q.display, {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '14px',
      color: NaSan.CSS_COLORS.TEXT,
      align: 'center',
      wordWrap: { width: 380 },
      lineSpacing: 4,
    }).setOrigin(0.5, 0);
    this.displays[type].push(display);

    /* สามเหลี่ยม */
    const tri = TriangleRenderer.draw(this, {
      x: cx, y: top + display.height + 90,
      a: q.triangle.a, b: q.triangle.b, c: q.triangle.c,
      unknown: q.triangle.unknown,
      maxSize: 100,
      labelSize: 16,
    });
    this.displays[type].push(tri);

    /* คำตอบ */
    const ansY = top + display.height + 200;
    const ansBg = this.add.graphics();
    ansBg.fillStyle(NaSan.COLORS.SUCCESS);
    ansBg.fillRoundedRect(cx - 100, ansY, 200, 36, 8);
    this.displays[type].push(ansBg);

    const ans = this.add.text(cx, ansY + 18, `✓ คำตอบ: ${q.correctAnswer}`, {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.displays[type].push(ans);

    /* Hint */
    const hint = this.add.text(cx, ansY + 50, q.hint, {
      fontFamily: NaSan.FONTS.MONO,
      fontSize: '12px',
      color: NaSan.CSS_COLORS.PRIMARY,
      align: 'left',
      lineSpacing: 2,
      backgroundColor: '#ffffff',
      padding: { x: 8, y: 6 },
    }).setOrigin(0.5, 0);
    this.displays[type].push(hint);

    /* สูตร */
    const formulaBg = this.add.graphics();
    formulaBg.fillStyle(NaSan.COLORS.WARNING, 0.3);
    formulaBg.fillRoundedRect(cx - 110, ansY + hint.height + 64, 220, 30, 6);
    this.displays[type].push(formulaBg);

    const formula = this.add.text(cx, ansY + hint.height + 79, `สูตร: ${q.formula}`, {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '14px',
      color: NaSan.CSS_COLORS.TEXT,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.displays[type].push(formula);
  }

  /* ───── สุ่มทั้ง 3 คอลัมน์ใหม่ ───── */
  _refreshAll() {
    [QuestionGenerator.TYPES.FIND_C,
     QuestionGenerator.TYPES.FIND_LEG,
     QuestionGenerator.TYPES.CONVERSE].forEach(t => this._refreshColumn(t));
  }

  /* ───── Controls ด้านล่าง ───── */
  _buildControls(width, height) {
    /* ป้ายแสดง difficulty ปัจจุบัน */
    this.difficultyLabel = this.add.text(width / 2, height - 70, '', {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '14px',
      color: NaSan.CSS_COLORS.TEXT,
    }).setOrigin(0.5);

    /* update label */
    const updateLabel = () => {
      const lv = NaSan.DIFFICULTY[this.currentDifficulty.toUpperCase()];
      this.difficultyLabel.setText(
        `ความยาก: ${lv.label}  •  เวลา ${lv.timePerQuestion}s  •  ` +
        `ชุดเลข ${lv.triples.length} ชุด  •  HP บอส ${lv.bossHP}`
      );
    };
    updateLabel();
    /* hook ให้ update เวลาเปลี่ยน difficulty */
    const origRefresh = this._refreshAll.bind(this);
    this._refreshAll = () => { origRefresh(); updateLabel(); };

    /* ปุ่มสุ่มทั้งหมด */
    UIButton.create(this, {
      x: width / 2 - 110, y: height - 30,
      width: 200, height: 40,
      text: 'สุ่มใหม่ทั้งหมด',
      icon: '🎲',
      bgColor: NaSan.COLORS.WARNING,
      textColor: NaSan.CSS_COLORS.TEXT,
      fontSize: 16,
      onClick: () => this._refreshAll(),
    });

    /* ปุ่มกลับ TitleScene */
    UIButton.create(this, {
      x: width / 2 + 110, y: height - 30,
      width: 200, height: 40,
      text: 'กลับหน้าเริ่ม',
      icon: '⬅',
      bgColor: NaSan.COLORS.PRIMARY,
      fontSize: 16,
      onClick: () => this.scene.start('TitleScene'),
    });
  }
}
