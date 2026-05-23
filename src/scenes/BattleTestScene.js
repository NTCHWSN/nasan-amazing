/* =====================================================================
   BattleTestScene — เมนูทดสอบ BattleScene
   ---------------------------------------------------------------------
   เลือกบอส (10 ตัว) + ความยาก → ไปที่ BattleScene
   เปิดได้จากปุ่ม "⚔️ Battle" ใน TitleScene
   ===================================================================== */

class BattleTestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleTestScene' });
  }

  create() {
    const { width, height } = this.scale;

    /* พื้นหลัง */
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2C5F8D, 0x2C5F8D, 0x1A1A2E, 0x1A1A2E, 1);
    bg.fillRect(0, 0, width, height);

    /* หัวข้อ */
    this.add.text(width / 2, 36, '⚔️ Battle Test Lab — 10 บอส', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '28px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: NaSan.CSS_COLORS.PRIMARY,
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(width / 2, 72, 'เลือกบอสและความยาก เพื่อเข้าสู่การต่อสู้', {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '15px',
      color: NaSan.CSS_COLORS.WARNING,
    }).setOrigin(0.5);

    /* ───── เลือก difficulty ───── */
    this.selectedDifficulty = 'easy';
    this.diffButtons = [];
    const diffs = [
      { id: 'easy',   label: '🟢 ง่าย',   color: NaSan.COLORS.SUCCESS },
      { id: 'normal', label: '🟡 ปกติ',  color: NaSan.COLORS.WARNING },
      { id: 'hard',   label: '🔴 ยาก',   color: NaSan.COLORS.DANGER  },
    ];
    diffs.forEach((d, i) => {
      const btn = UIButton.create(this, {
        x: width / 2 - 220 + i * 220,
        y: 120,
        width: 200, height: 44,
        text: d.label,
        bgColor: d.color,
        textColor: (d.id === 'normal') ? NaSan.CSS_COLORS.TEXT : '#FFFFFF',
        fontSize: 18,
        onClick: () => this._selectDifficulty(d.id),
      });
      btn._diffId = d.id;
      this.diffButtons.push(btn);
    });
    this._selectDifficulty('easy');

    /* ───── เลือก boss 10 ตัว — 5 คอลัมน์ × 2 แถว ───── */
    const dungeons = DungeonData.all();
    const cols = 5;
    const cardW = 200;
    const cardH = 110;
    const gapX = 18;
    const gapY = 18;
    const startX = width / 2 - ((cardW + gapX) * cols - gapX) / 2 + cardW / 2;
    const startY = 220;

    dungeons.forEach((d, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = startX + c * (cardW + gapX);
      const y = startY + r * (cardH + gapY);

      const meta = PlaceholderFactory.BOSSES[d.finalBoss.bossId] || {};

      const card = this.add.graphics();
      card.fillStyle(d.color, 0.85);
      card.fillRoundedRect(x - cardW/2, y - cardH/2, cardW, cardH, 14);
      card.lineStyle(3, 0xFFFFFF, 0.5);
      card.strokeRoundedRect(x - cardW/2, y - cardH/2, cardW, cardH, 14);

      /* boss portrait ถ้ามี */
      if (this.textures.exists(d.finalBoss.bossId)) {
        const img = this.add.image(x - cardW/2 + 36, y, d.finalBoss.bossId);
        const tex = this.textures.get(d.finalBoss.bossId).getSourceImage();
        const s = Math.min(60 / tex.width, 80 / tex.height);
        img.setScale(s).setOrigin(0.5);
      } else {
        this.add.text(x - cardW/2 + 36, y, meta.emoji || '⚔️', { fontSize: '40px' }).setOrigin(0.5);
      }

      this.add.text(x - 20, y - 32, `ด่าน ${d.order}`, {
        fontFamily: NaSan.FONTS.HEADING,
        fontSize: '13px',
        color: '#FFEB3B',
        fontStyle: 'bold',
      }).setOrigin(0, 0);
      this.add.text(x - 20, y - 14, d.name, {
        fontFamily: NaSan.FONTS.HEADING,
        fontSize: '14px',
        color: '#FFFFFF',
        fontStyle: 'bold',
        wordWrap: { width: cardW - 70 },
      }).setOrigin(0, 0);
      this.add.text(x - 20, y + 22, QuestionGenerator.TYPE_LABELS[d.finalBoss.questionType] || '—', {
        fontFamily: NaSan.FONTS.BODY,
        fontSize: '11px',
        color: '#FFFFFF',
      }).setOrigin(0, 0).setAlpha(0.85);

      const goBtn = this.add.zone(x, y, cardW, cardH).setInteractive({ useHandCursor: true });
      goBtn.on('pointerup', () => this._startBattle(d.finalBoss.bossId));
    });

    /* ───── กลับ ───── */
    UIButton.create(this, {
      x: 100, y: height - 30,
      width: 160, height: 40,
      text: '◄ กลับ',
      bgColor: NaSan.COLORS.DANGER,
      fontSize: 16,
      onClick: () => this.scene.start('TitleScene'),
    });

    this.add.text(width / 2, height - 14,
      'Battle System | กดบอสเพื่อเริ่มต่อสู้', {
      fontFamily: NaSan.FONTS.MONO,
      fontSize: '11px',
      color: '#FFFFFF',
    }).setOrigin(0.5, 1).setAlpha(0.6);
  }

  _selectDifficulty(id) {
    this.selectedDifficulty = id;
    this.diffButtons.forEach(btn => {
      const isSelected = btn._diffId === id;
      btn.setScale(isSelected ? 1.08 : 1);
      btn.setAlpha(isSelected ? 1 : 0.55);
    });
  }

  _startBattle(bossId) {
    this.scene.start('BattleScene', {
      bossId,
      difficulty: this.selectedDifficulty,
      returnScene: 'BattleTestScene',
    });
  }
}
