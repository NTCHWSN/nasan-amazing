/* =====================================================================
   AssetTestScene — ฉากดู placeholder ทั้งหมด (Debug)
   ---------------------------------------------------------------------
   เข้าได้จาก TitleScene (ใส่ปุ่มลับ) หรือกด debug จาก console:
     game.scene.start('AssetTestScene')

   แสดง:
   - บอสทั้ง 4 ตัว (placeholder)
   - ฉากที่ขาด (Hub, Dungeon 3)
   - สามเหลี่ยมตัวอย่าง 3 แบบ (หา c / หา a / บทกลับ)
   - หัวใจ + ดาว
   ===================================================================== */

class AssetTestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AssetTestScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor(NaSan.CSS_COLORS.BACKGROUND);

    /* หัวข้อ */
    this.add.text(width / 2, 30, '🧪 Asset Test Scene — ดู Placeholder ทั้งหมด', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '24px',
      color: NaSan.CSS_COLORS.PRIMARY,
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    /* === ซ้าย: บอส 4 ตัว === */
    this.add.text(20, 80, '👹 บอส (4 ตัว)', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '18px',
      color: NaSan.CSS_COLORS.TEXT,
      fontStyle: 'bold',
    });

    const bossIds = ['boss1_ghost', 'boss2_bat', 'boss3_sand', 'boss_final'];
    bossIds.forEach((id, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      PlaceholderFactory.getBossDisplay(
        this,
        140 + col * 200, 220 + row * 280,
        id,
        { scale: 0.7 }
      );
    });

    /* === กลาง: สามเหลี่ยม 3 แบบ === */
    this.add.text(width / 2, 80, '📐 สามเหลี่ยมโจทย์', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '18px',
      color: NaSan.CSS_COLORS.TEXT,
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    /* หา c */
    this.add.text(width / 2, 130, 'แบบที่ 1: หา c', {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '14px',
      color: NaSan.CSS_COLORS.TEXT,
    }).setOrigin(0.5, 0);
    TriangleRenderer.draw(this, {
      x: width / 2, y: 220,
      a: 3, b: 4, c: 5,
      unknown: 'c',
      maxSize: 100,
      labelSize: 16,
    });

    /* หา a */
    this.add.text(width / 2, 310, 'แบบที่ 2: หา a', {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '14px',
      color: NaSan.CSS_COLORS.TEXT,
    }).setOrigin(0.5, 0);
    TriangleRenderer.draw(this, {
      x: width / 2, y: 400,
      a: 6, b: 8, c: 10,
      unknown: 'a',
      maxSize: 100,
      labelSize: 16,
    });

    /* บทกลับ */
    this.add.text(width / 2, 500, 'แบบที่ 3: บทกลับ', {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '14px',
      color: NaSan.CSS_COLORS.TEXT,
    }).setOrigin(0.5, 0);
    TriangleRenderer.draw(this, {
      x: width / 2, y: 590,
      a: 5, b: 12, c: 13,
      maxSize: 100,
      labelSize: 16,
      showFormula: true,
    });

    /* === ขวา: หัวใจ + ดาว + ฉาก === */
    this.add.text(width - 20, 80, '❤️ HP + ⭐ Rating', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '18px',
      color: NaSan.CSS_COLORS.TEXT,
      fontStyle: 'bold',
    }).setOrigin(1, 0);

    /* HP: 5 หัวใจ (3 เต็ม + 2 ว่าง) */
    const hpGraphics = this.add.graphics();
    for (let i = 0; i < 5; i++) {
      const hx = width - 230 + i * 42;
      const hy = 140;
      if (i < 3) PlaceholderFactory.drawHeart(hpGraphics, hx, hy, 32);
      else       PlaceholderFactory.drawEmptyHeart(hpGraphics, hx, hy, 32);
    }
    this.add.text(width - 20, 175, '3/5 HP', {
      fontFamily: NaSan.FONTS.MONO,
      fontSize: '14px',
      color: NaSan.CSS_COLORS.TEXT,
    }).setOrigin(1, 0);

    /* Rating: 3 ดาวเต็ม / 2 ดาว / 1 ดาว / 0 ดาว */
    const starGraphics = this.add.graphics();
    const ratings = [
      { y: 230, filled: 3, label: '⭐⭐⭐ — ผ่านสมบูรณ์' },
      { y: 290, filled: 2, label: '⭐⭐ — ผ่านปานกลาง' },
      { y: 350, filled: 1, label: '⭐ — ผ่านพอตัว' },
    ];
    ratings.forEach(r => {
      for (let i = 0; i < 3; i++) {
        const sx = width - 230 + i * 50;
        PlaceholderFactory.drawStar(starGraphics, sx, r.y, 20,
          NaSan.COLORS.WARNING, i < r.filled);
      }
      this.add.text(width - 20, r.y - 10, r.label, {
        fontFamily: NaSan.FONTS.BODY,
        fontSize: '12px',
        color: NaSan.CSS_COLORS.TEXT,
      }).setOrigin(1, 0);
    });

    /* ตัวอย่าง bg placeholder (ย่อ ๆ) */
    this.add.text(width - 20, 410, '🖼 พื้นหลัง Placeholder', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '14px',
      color: NaSan.CSS_COLORS.TEXT,
      fontStyle: 'bold',
    }).setOrigin(1, 0);

    /* Mini preview ของ Hub */
    const miniW = 240, miniH = 120;
    const previewX = width - 250;
    const previewY = 450;
    this._drawMiniBgPreview(previewX, previewY, miniW, miniH,
      0x6BB13D, 0x8FCB68, '🏫 โรงเรียนบ้านนาสาร');
    this._drawMiniBgPreview(previewX, previewY + 140, miniW, miniH,
      0xF4B942, 0xCC9966, '🏜 เนินทรายเหมืองแกะ');

    /* === ปุ่มกลับ TitleScene === */
    UIButton.create(this, {
      x: width / 2, y: height - 40,
      width: 200, height: 50,
      text: 'กลับหน้าเริ่ม',
      icon: '⬅',
      bgColor: NaSan.COLORS.PRIMARY,
      onClick: () => this.scene.start('TitleScene'),
    });
  }

  _drawMiniBgPreview(x, y, w, h, c1, c2, label) {
    const g = this.add.graphics();
    g.fillStyle(c1);
    g.fillRect(x, y, w, h);
    g.fillStyle(c2, 0.5);
    g.fillRect(x, y + h / 2, w, h / 2);
    g.lineStyle(2, NaSan.COLORS.TEXT);
    g.strokeRect(x, y, w, h);
    this.add.text(x + w / 2, y + h / 2, label, {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
  }
}
