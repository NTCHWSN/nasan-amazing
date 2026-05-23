/* =====================================================================
   TextStyle — Helper สำหรับสร้าง text style ที่รองรับสระไทยครบ
   ---------------------------------------------------------------------
   ปัญหา: Phaser canvas text มัก clip สระบน (ิ ี ื ุ) และวรรณยุกต์
          เพราะคำนวณ line-height แบบ baseline เป็นหลัก
   แก้:   เพิ่ม padding บน/ล่าง + ใช้ font weight แทน fontStyle: 'bold'

   ใช้:
     scene.add.text(x, y, 'ข้อความ', TextStyle.heading({fontSize:'24px'}))
     หรือเรียกตรง ๆ:
     scene.add.text(x, y, txt, TextStyle.base(24, '#fff', 'heading'))
   ===================================================================== */

const TextStyle = {

  /* base style: padding รอบทุกด้าน + fontWeight แทน bold */
  _base(opts) {
    return Object.assign({
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '18px',
      color: NaSan.CSS_COLORS.TEXT,
      padding: { x: 0, y: 4, top: 6, bottom: 6 },  // เผื่อสระ/วรรณยุกต์
      resolution: 2,  // คมชัด retina
    }, opts);
  },

  heading(opts) {
    return this._base(Object.assign({
      fontFamily: NaSan.FONTS.HEADING,
      fontStyle: '700',  // weight แทน 'bold' — รองรับฟอนต์ไทยดีกว่า
      color: '#FFFFFF',
    }, opts));
  },

  body(opts) {
    return this._base(Object.assign({
      fontFamily: NaSan.FONTS.BODY,
      fontStyle: '400',
    }, opts));
  },

  bodyBold(opts) {
    return this._base(Object.assign({
      fontFamily: NaSan.FONTS.BODY,
      fontStyle: '700',
    }, opts));
  },

  mono(opts) {
    return this._base(Object.assign({
      fontFamily: NaSan.FONTS.MONO,
      fontStyle: '500',
    }, opts));
  },
};
