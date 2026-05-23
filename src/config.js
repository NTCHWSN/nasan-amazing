/* =====================================================================
   นาสารอเมซิ่ง! — Global Configuration
   ---------------------------------------------------------------------
   ไฟล์นี้รวมค่าคงที่ทั้งเกม — อยากเปลี่ยนชื่อ/สี/ความยาก ก็มาแก้ที่นี่
   ===================================================================== */

// สร้าง namespace กลางเพื่อไม่ให้ตัวแปรชนกัน
window.NaSan = window.NaSan || {};

/* ───── ข้อมูลเกม ───── */
NaSan.GAME_NAME_TH = 'นาสารอเมซิ่ง! คดีลึกลับสามเหลี่ยมพีทาโกรัส';
NaSan.GAME_NAME_EN = 'Na San Amazing: The Pythagorean Triangle Mystery';
NaSan.VERSION      = '0.1.0';
NaSan.AUTHOR       = 'ครู Nanthachai (โรงเรียนบ้านนาสาร)';

/* ───── ความละเอียดฐานของเกม (16:9) ─────
   Phaser จะ scale อัตโนมัติให้พอดีกับทุกหน้าจอ */
NaSan.BASE_WIDTH  = 1280;
NaSan.BASE_HEIGHT = 720;

/* ───── สีของเกม (ตาม GDD ส่วนที่ 8) ─────
   เก็บ 2 รูปแบบ:  HEX_NUM ใช้ใน Phaser (0xRRGGBB), CSS ใช้ใน HTML/text */
NaSan.COLORS = {
  PRIMARY:    0x2C5F8D,  // 🔵 น้ำเงินทะเลใต้
  SUCCESS:    0x6BB13D,  // 🟢 เขียวสับปะรด
  DANGER:     0xD9263D,  // 🔴 แดงเงาะ
  WARNING:    0xF4B942,  // 🟡 เหลืองขมิ้น
  BACKGROUND: 0xF8F4E8,  // ⚪ ครีมอ่อน
  TEXT:       0x1A1A2E,  // ⚫ ดำน้ำเงิน
};
NaSan.CSS_COLORS = {
  PRIMARY:    '#2C5F8D',
  SUCCESS:    '#6BB13D',
  DANGER:     '#D9263D',
  WARNING:    '#F4B942',
  BACKGROUND: '#F8F4E8',
  TEXT:       '#1A1A2E',
};

/* ───── ตัวเอก 3 คน (อ้างอิงจาก GDD ส่วนที่ 3) ───── */
NaSan.HEROES = {
  NGOH: {
    id: 'ngoh',
    nameTh: 'น้องเงาะ',
    nameEn: 'Nong-Ngoh',
    class: 'Wizard',
    role: 'หา c (ด้านตรงข้ามมุมฉาก)',
    slogan: 'เงาะคำนวณ ไม่ผันเปลี่ยน!',
    color: 0xD9263D,
    sheetKey: 'char_ngoh',
  },
  DURIAN: {
    id: 'durian',
    nameTh: 'น้องทุเรียน',
    nameEn: 'Nong-Durian',
    class: 'Priest',
    role: 'หา a หรือ b (ด้านประกอบมุมฉาก)',
    slogan: 'ทุเรียนคืน ด้านที่หายไป!',
    color: 0x6BB13D,
    sheetKey: 'char_durian',
  },
  PLAMENG: {
    id: 'plameng',
    nameTh: 'น้องปลาเม็ง',
    nameEn: 'Nong-Plameng',
    class: 'Knight',
    role: 'พิสูจน์บทกลับ (เป็นมุมฉากหรือไม่)',
    slogan: 'ปลาเม็งพิสูจน์ ต้องจริงเท่านั้น!',
    color: 0x2C5F8D,
    sheetKey: 'char_plameng',
  },
};

/* ───── ระดับความยาก (ตาม GDD ส่วนที่ 5E) ───── */
NaSan.DIFFICULTY = {
  EASY: {
    id: 'easy',
    label: '🟢 ง่าย',
    triples: [[3,4,5], [6,8,10], [5,12,13]],
    timePerQuestion: 90,
    hintsPerDungeon: 2,
    bossHP: 3,
    partyHP: 5,
    showFormula: true,
  },
  NORMAL: {
    id: 'normal',
    label: '🟡 ปกติ',
    triples: [[3,4,5], [6,8,10], [5,12,13], [8,15,17], [7,24,25], [9,12,15], [10,24,26]],
    timePerQuestion: 60,
    hintsPerDungeon: 1,
    bossHP: 4,
    partyHP: 4,
    showFormula: false,
  },
  HARD: {
    id: 'hard',
    label: '🔴 ยาก',
    triples: [[3,4,5], [6,8,10], [5,12,13], [8,15,17], [7,24,25], [9,12,15], [10,24,26],
              [20,21,29], [9,40,41], [12,35,37], [11,60,61]],
    timePerQuestion: 45,
    hintsPerDungeon: 0,
    bossHP: 5,
    partyHP: 3,
    showFormula: false,
  },
};

/* ───── Font Stack ───── */
NaSan.FONTS = {
  /* === Noto Sans Thai = Google's standard Thai font for canvas/digital ===
     ออกแบบมาเฉพาะ Thai shaping + combining marks ที่ canvas API ใช้งานได้ถูกต้อง
     ปัญหา synthetic bold ของ Sarabun/Mali ทำให้สระ/วรรณยุกต์ผิดตำแหน่ง */
  HEADING: '"Noto Sans Thai", "Sarabun", "Tahoma", sans-serif',
  BODY:    '"Noto Sans Thai", "Sarabun", "Tahoma", sans-serif',
  MONO:    '"Noto Sans Thai", "Sarabun", "Courier New", monospace',
};

/* ───── Debug Flags ───── */
NaSan.DEBUG = {
  showFPS: false,        // แสดง FPS counter
  skipIntro: false,      // ข้าม intro cutscene
  unlockAllDungeons: false,  // ปลดล็อคทุกดันเจี้ยน (สำหรับทดสอบ)
};

console.log(`%c🎮 ${NaSan.GAME_NAME_TH} v${NaSan.VERSION}`,
            `color: ${NaSan.CSS_COLORS.PRIMARY}; font-size: 16px; font-weight: bold;`);

/* ─────────────────────────────────────────────────
   PADDING ที่ใช้ใน text Thai (เพื่อสระไม่ถูกตัด)
   ───────────────────────────────────────────────── */
NaSan.THAI_PADDING = {
  /* ใช้กับ text ที่มี backgroundColor */
  withBg: { x: 12, y: 8, top: 10, bottom: 10 },
  /* ใช้กับ text ปกติ (ไม่มี bg) */
  base:   { x: 0,  y: 4, top: 6,  bottom: 6 },
};

/* ─── Monkey-patch Phaser Text สำหรับ Thai vowels/tones clipping ───
       Phaser canvas text ตัดวรรณยุกต์บน (ไม้เอก ้ ๊ ๋) และสระบน (ิ ี ื ึ ์)
       ถ้า padding/lineSpacing ไม่พอ — เกิดบ่อยกับ font size ใหญ่ + strokeThickness
       แก้: ใส่ padding ตาม fontSize อัตโนมัติ + เพิ่ม lineSpacing */
window.addEventListener('load', () => {
  if (typeof Phaser !== 'undefined' && Phaser.GameObjects && Phaser.GameObjects.Text) {
    const _parsePx = (s) => {
      if (typeof s === 'number') return s;
      if (typeof s === 'string') return parseInt(s, 10) || 16;
      return 16;
    };
    const _calcPadding = (fontSize, hasStroke) => {
      const px = _parsePx(fontSize);
      const stroke = hasStroke ? Math.ceil(px * 0.12) : 0;
      /* top ต้องเผื่อสระบน + วรรณยุกต์ + stroke */
      return {
        x: 0,
        y: 0,
        top:    Math.max(8,  Math.ceil(px * 0.32) + stroke),
        bottom: Math.max(6,  Math.ceil(px * 0.22) + stroke),
        left:   Math.max(2,  stroke),
        right:  Math.max(2,  stroke),
      };
    };

    const originalSetStyle = Phaser.GameObjects.Text.prototype.setStyle;
    Phaser.GameObjects.Text.prototype.setStyle = function(style, ...rest) {
      if (style && typeof style === 'object') {
        const fontSize = style.fontSize || (this.style && this.style.fontSize) || '16px';
        const hasStroke = !!(style.stroke && style.strokeThickness > 0);
        const autoP = _calcPadding(fontSize, hasStroke);

        /* === CRITICAL: ปัญหาสระ/วรรณยุกต์ Thai หาย ===
           canvas API render Thai combining marks ผิดเมื่อใช้ "bold" synthetic
           แก้: แปลง fontStyle: 'bold'/'700' เป็น font string ที่ canvas เข้าใจชัด */
        if (style.fontStyle === 'bold' || style.fontStyle === '700' ||
            style.fontStyle === '900' || style.fontStyle === '800') {
          /* ใช้ font: '700 24px Family' format — canvas render Thai bold ถูกต้อง */
          const weight = style.fontStyle === 'bold' ? '700' : style.fontStyle;
          const fam = style.fontFamily || NaSan.FONTS.HEADING;
          style.font = weight + ' ' + (style.fontSize || '16px') + ' ' + fam;
          delete style.fontStyle;
        }

        if (style.padding === undefined) {
          style.padding = autoP;
        } else if (typeof style.padding === 'number') {
          const p = style.padding;
          style.padding = { x: p, y: p, top: Math.max(p, autoP.top), bottom: Math.max(p, autoP.bottom), left: p, right: p };
        } else if (typeof style.padding === 'object') {
          /* keep user x/y but ensure top/bottom enough for Thai vowels */
          if (style.padding.top === undefined)    style.padding.top    = Math.max((style.padding.y || 0), autoP.top);
          if (style.padding.bottom === undefined) style.padding.bottom = Math.max((style.padding.y || 0), autoP.bottom);
          if (style.padding.left === undefined)   style.padding.left   = (style.padding.x !== undefined ? style.padding.x : autoP.left);
          if (style.padding.right === undefined)  style.padding.right  = (style.padding.x !== undefined ? style.padding.x : autoP.right);
        }
        /* บังคับ lineSpacing พอเหมาะกับฟอนต์ไทย ถ้ายังไม่ตั้ง */
        if (style.lineSpacing === undefined) {
          style.lineSpacing = Math.max(2, Math.ceil(_parsePx(fontSize) * 0.20));
        }
        /* บังคับ fontMetrics — บอก Phaser ตรงๆ ว่า ascent/descent คือเท่าไหร่
           ป้องกันการตัดวรรณยุกต์บนของฟอนต์ไทย (Mali/Mitr/Sarabun ใน canvas) */
        if (style.metrics === undefined) {
          const px = _parsePx(fontSize);
          style.metrics = {
            ascent:   Math.ceil(px * 1.20),  /* เผื่อสระบน + วรรณยุกต์ */
            descent:  Math.ceil(px * 0.45),  /* เผื่อสระล่าง */
            fontSize: Math.ceil(px * 1.65),
          };
        }
      }
      return originalSetStyle.call(this, style, ...rest);
    };
    console.log('✅ Phaser Text patched: auto padding+lineSpacing for Thai');
  }
});
