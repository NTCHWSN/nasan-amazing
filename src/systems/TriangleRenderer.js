/* =====================================================================
   TriangleRenderer — วาดสามเหลี่ยมมุมฉากประกอบโจทย์พีทาโกรัส
   ---------------------------------------------------------------------
   ใช้ใน BattleScene (Step 6) แสดงรูปสามเหลี่ยมพร้อม label
   วาดด้วย Phaser Graphics → ไม่ต้องใช้ไฟล์ภาพแยก

   วิธีใช้:
     TriangleRenderer.draw(this, {
       x: 640, y: 360,           // จุดกึ่งกลาง
       a: 3, b: 4, c: 5,         // ความยาว 3 ด้าน
       unknown: 'c',             // ด้านที่ถาม ('a' | 'b' | 'c' | null)
       maxSize: 240               // ขนาดสูงสุดของขาที่ยาวที่สุด
     });
   ===================================================================== */

const TriangleRenderer = {

  /* สีของแต่ละด้าน (ตรงกับ GDD color palette) */
  COLORS: {
    A: NaSan.COLORS.WARNING,    // 🟡 a — เหลือง
    B: NaSan.COLORS.SUCCESS,    // 🟢 b — เขียว
    C: NaSan.COLORS.DANGER,     // 🔴 c — แดง
    UNKNOWN: NaSan.COLORS.TEXT, // ⚫ ?
  },

  draw(scene, opts) {
    const {
      x = 0, y = 0,
      a, b, c,
      unknown = null,
      maxSize = 200,
      showFormula = false,
      labelSize = 22,
    } = opts;

    /* คำนวณ scale ให้ขายาวสุด = maxSize */
    const maxLeg = Math.max(a, b);
    const scale  = maxSize / maxLeg;
    const aPx    = a * scale;
    const bPx    = b * scale;

    /* จุดยอด: มุมฉากที่ซ้ายล่าง */
    const x0 = x - aPx / 2;        // มุมฉาก
    const y0 = y + bPx / 2;
    const x1 = x0 + aPx;           // มุมขวาล่าง
    const y1 = y0;
    const x2 = x0;                 // มุมซ้ายบน
    const y2 = y0 - bPx;

    const container = scene.add.container(0, 0);

    /* === 1. พื้นสามเหลี่ยม (โปร่งใส) === */
    const fill = scene.add.graphics();
    fill.fillStyle(NaSan.COLORS.PRIMARY, 0.08);
    fill.fillTriangle(x0, y0, x1, y1, x2, y2);
    container.add(fill);

    /* === 2. ขอบสามเหลี่ยม === */
    const lines = scene.add.graphics();
    /* ด้าน a (ฐาน) */
    lines.lineStyle(5, unknown === 'a' ? this.COLORS.UNKNOWN : this.COLORS.A);
    lines.lineBetween(x0, y0, x1, y1);
    /* ด้าน b (ตั้ง) */
    lines.lineStyle(5, unknown === 'b' ? this.COLORS.UNKNOWN : this.COLORS.B);
    lines.lineBetween(x0, y0, x2, y2);
    /* ด้าน c (ตรงข้ามมุมฉาก) */
    lines.lineStyle(5, unknown === 'c' ? this.COLORS.UNKNOWN : this.COLORS.C);
    lines.lineBetween(x1, y1, x2, y2);
    container.add(lines);

    /* === 3. มุมฉาก (สี่เหลี่ยมเล็กที่ x0,y0) === */
    const ra = scene.add.graphics();
    ra.lineStyle(3, NaSan.COLORS.TEXT);
    const raSize = 16;
    ra.strokeRect(x0, y0 - raSize, raSize, raSize);
    container.add(ra);

    /* === 4. Labels ของแต่ละด้าน === */
    const fmtLabel = (name, value, isUnknown) =>
      isUnknown ? `${name} = ?` : `${name} = ${value}`;

    const baseStyle = {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: labelSize + 'px',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 5,
    };

    /* a — ใต้ฐาน */
    const labelA = scene.add.text(
      (x0 + x1) / 2, y0 + 14,
      fmtLabel('a', a, unknown === 'a'),
      { ...baseStyle, color: PlaceholderFactory.hexToCss(unknown === 'a' ? this.COLORS.UNKNOWN : this.COLORS.A) }
    ).setOrigin(0.5, 0);
    container.add(labelA);

    /* b — ซ้ายของด้านตั้ง */
    const labelB = scene.add.text(
      x0 - 14, (y0 + y2) / 2,
      fmtLabel('b', b, unknown === 'b'),
      { ...baseStyle, color: PlaceholderFactory.hexToCss(unknown === 'b' ? this.COLORS.UNKNOWN : this.COLORS.B) }
    ).setOrigin(1, 0.5);
    container.add(labelB);

    /* c — ขวาของด้านตรงข้ามมุมฉาก */
    const cMidX = (x1 + x2) / 2;
    const cMidY = (y1 + y2) / 2;
    const labelC = scene.add.text(
      cMidX + 14, cMidY - 14,
      fmtLabel('c', c, unknown === 'c'),
      { ...baseStyle, color: PlaceholderFactory.hexToCss(unknown === 'c' ? this.COLORS.UNKNOWN : this.COLORS.C) }
    ).setOrigin(0, 1);
    container.add(labelC);

    /* === 5. (Optional) สูตร a² + b² = c² === */
    if (showFormula) {
      const formula = scene.add.text(x, y0 + 70, 'a² + b² = c²', {
        fontFamily: NaSan.FONTS.HEADING,
        fontSize: '24px',
        color: NaSan.CSS_COLORS.PRIMARY,
        fontStyle: 'bold',
        backgroundColor: NaSan.CSS_COLORS.BACKGROUND,
        padding: { x: 14, y: 6 },
      }).setOrigin(0.5, 0);
      container.add(formula);
    }

    return container;
  },

  /* =====================================================================
     drawSimple — วาดสามเหลี่ยมเล็ก ๆ ไม่มี label (สำหรับ decoration)
     ===================================================================== */
  drawSimple(scene, x, y, size = 40, color = 0x2C5F8D) {
    const g = scene.add.graphics();
    g.lineStyle(3, color);
    g.beginPath();
    g.moveTo(x - size/2, y + size/2);
    g.lineTo(x + size/2, y + size/2);
    g.lineTo(x - size/2, y - size/2);
    g.closePath();
    g.strokePath();
    /* มุมฉาก */
    g.lineStyle(2, color);
    g.strokeRect(x - size/2, y + size/2 - 8, 8, 8);
    return g;
  },
};
