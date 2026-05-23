/* =====================================================================
   BootScene
   ---------------------------------------------------------------------
   ฉากแรกของเกม — ใช้ทดสอบว่า Phaser โหลดสำเร็จ
   ใน Step 3 ฉากนี้จะถูกแทนที่ด้วย TitleScreen (หน้าเริ่มเกมจริง)
   ===================================================================== */

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    /* พื้นหลังสีครีม */
    this.cameras.main.setBackgroundColor(NaSan.CSS_COLORS.BACKGROUND);

    /* วาดสามเหลี่ยมพีทาโกรัสง่าย ๆ ตกแต่งฉาก */
    this._drawDecorativeTriangle(cx, cy - 220);

    /* ข้อความหลัก */
    const heading = this.add.text(cx, cy - 50, '🎮 Phaser พร้อมใช้งานแล้ว!', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: Math.min(width * 0.04, 48) + 'px',
      color: NaSan.CSS_COLORS.PRIMARY,
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    /* ชื่อเกม */
    const title = this.add.text(cx, cy + 20, NaSan.GAME_NAME_TH, {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: Math.min(width * 0.025, 28) + 'px',
      color: NaSan.CSS_COLORS.TEXT,
      align: 'center',
      wordWrap: { width: width - 80 },
    }).setOrigin(0.5);

    /* แสดงเวอร์ชัน */
    const versionLine = `Phaser v${Phaser.VERSION}  •  เกม v${NaSan.VERSION}`;
    this.add.text(cx, cy + 90, versionLine, {
      fontFamily: NaSan.FONTS.MONO,
      fontSize: '16px',
      color: NaSan.CSS_COLORS.PRIMARY,
    }).setOrigin(0.5);

    /* บอกสถานะ Step ปัจจุบัน */
    const status = this.add.text(cx, cy + 150,
      '✅ Step 2 สำเร็จ — รอ Step 3: TitleScreen',
      {
        fontFamily: NaSan.FONTS.BODY,
        fontSize: '18px',
        color: NaSan.CSS_COLORS.SUCCESS,
        fontStyle: 'bold',
      }
    ).setOrigin(0.5);

    /* คำแนะนำ */
    this.add.text(cx, height - 40,
      'หน้านี้เป็นฉากทดสอบ จะถูกแทนด้วยหน้าเริ่มเกมจริงใน Step ถัดไป',
      {
        fontFamily: NaSan.FONTS.BODY,
        fontSize: '14px',
        color: NaSan.CSS_COLORS.TEXT,
        align: 'center',
      }
    ).setOrigin(0.5).setAlpha(0.6);

    /* Animation: heading เด้งขึ้นลงเบา ๆ */
    this.tweens.add({
      targets: heading,
      scale: { from: 1, to: 1.06 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    /* Animation: title fade in */
    title.setAlpha(0);
    status.setAlpha(0);
    this.tweens.add({ targets: title,  alpha: 1, duration: 800, delay: 200 });
    this.tweens.add({ targets: status, alpha: 1, duration: 800, delay: 600 });
  }

  /* วาดสามเหลี่ยมพีทาโกรัส 3-4-5 แบบกราฟิก */
  _drawDecorativeTriangle(cx, cy) {
    const scale = 20;  // 1 หน่วย = 20px
    const a = 3 * scale;  // ฐาน
    const b = 4 * scale;  // ความสูง

    const x0 = cx - a / 2;
    const y0 = cy + b / 2;
    const x1 = x0 + a;
    const y1 = y0;
    const x2 = x0;
    const y2 = y0 - b;

    const g = this.add.graphics();

    /* เส้นตรงข้ามมุมฉาก (c) — แดง */
    g.lineStyle(4, NaSan.COLORS.DANGER);
    g.lineBetween(x1, y1, x2, y2);

    /* ด้าน a — เหลือง */
    g.lineStyle(4, NaSan.COLORS.WARNING);
    g.lineBetween(x0, y0, x1, y1);

    /* ด้าน b — เขียว */
    g.lineStyle(4, NaSan.COLORS.SUCCESS);
    g.lineBetween(x0, y0, x2, y2);

    /* มุมฉาก (สี่เหลี่ยมเล็กที่มุม) */
    g.lineStyle(2, NaSan.COLORS.TEXT);
    g.strokeRect(x0, y0 - 12, 12, 12);

    /* Labels: a, b, c */
    const labelStyle = {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '18px',
      fontStyle: 'bold',
    };
    this.add.text(x0 + a / 2, y0 + 6,
      'a = 3', { ...labelStyle, color: NaSan.CSS_COLORS.WARNING }).setOrigin(0.5, 0);
    this.add.text(x0 - 10, y0 - b / 2,
      'b = 4', { ...labelStyle, color: NaSan.CSS_COLORS.SUCCESS }).setOrigin(1, 0.5);
    this.add.text((x1 + x2) / 2 + 12, (y1 + y2) / 2,
      'c = 5', { ...labelStyle, color: NaSan.CSS_COLORS.DANGER }).setOrigin(0, 0.5);
  }
}
