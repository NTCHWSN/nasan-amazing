/* =====================================================================
   PlaceholderFactory — สร้าง assets แบบ "วาดด้วยโค้ด"
   ---------------------------------------------------------------------
   ใช้แทนภาพที่ยังไม่มี → เกมเล่นได้ครบทันที
   เมื่อคุณครูเอาภาพจริงมาวาง:
     → เปลี่ยน asset map ใน PreloadScene.js
     → ทุกที่เรียก getBossDisplay() จะใช้ภาพจริงอัตโนมัติ

   API หลัก:
     PlaceholderFactory.getBossDisplay(scene, x, y, bossId)
     PlaceholderFactory.getBackgroundDisplay(scene, sceneId)
     PlaceholderFactory.drawHeart(graphics, x, y, size, color)
     PlaceholderFactory.drawStar(graphics, x, y, radius, color, filled)
   ===================================================================== */

const PlaceholderFactory = {

  /* ───── ข้อมูลบอส (ใช้กับ placeholder + real assets) ─────
     10 บอสตาม 10 ด่าน + เก็บ legacy 4 ตัวไว้สำหรับ test scene */
  BOSSES: {
    /* 10 บอสหลัก */
    boss_d1:  { color: 0xD9263D, emoji: '🐛', name: 'หนอนผีเสื้อปริศนา', hp: 3 },
    boss_d2:  { color: 0x444444, emoji: '🚂', name: 'เงาแห่งรถไฟ',        hp: 3 },
    boss_d3:  { color: 0x2C5F8D, emoji: '🛒', name: 'พ่อค้าโกง',           hp: 3 },
    boss_d4:  { color: 0xF4B942, emoji: '🙏', name: 'ผู้รักษาประตูศาล',  hp: 4 },
    boss_d5:  { color: 0xF4B942, emoji: '🦇', name: 'ค้างคาวฮีโร่หูเอียง', hp: 4 },
    boss_d6:  { color: 0x4A90E2, emoji: '⛏', name: 'วิญญาณคนงานเหมือง',  hp: 4 },
    boss_d7:  { color: 0x88C5E8, emoji: '🌊', name: 'ผู้พิทักษ์แห่งดาดฟ้า', hp: 5 },
    boss_d8:  { color: 0xCC9966, emoji: '👹', name: 'ยักษ์ทรายโบราณ',     hp: 5 },
    boss_d9:  { color: 0x6BB13D, emoji: '🌳', name: 'ผู้พิทักษ์ผืนป่า',    hp: 6 },
    boss_d10: { color: 0x9B59B6, emoji: '👑', name: 'ผู้ทดสอบสุดท้าย',    hp: 7 },
    /* legacy keys ใช้สำหรับ BattleTest เดิม */
    boss1_ghost:  { color: 0x4A90E2, emoji: '👻', name: 'ผีน้ำตกตาเบลอ',  hp: 3 },
    boss2_bat:    { color: 0xF4B942, emoji: '🦇', name: 'ค้างคาวหูเอียง',  hp: 3 },
    boss3_sand:   { color: 0xCC9966, emoji: '👹', name: 'ยักษ์ทรายผ้าขนหนู', hp: 3 },
    boss_final:   { color: 0x1A1A2E, emoji: '🕴', name: 'มิสเตอร์ X จอมเบี้ยว', hp: 6 },
  },

  /* ───── ข้อมูลฉาก (สีพื้นและชื่อ) ───── */
  BACKGROUNDS: {
    hub_school:      { colors: [0x6BB13D, 0x8FCB68], label: 'โรงเรียนบ้านนาสาร', emoji: '🏫' },
    dungeon3_sand:   { colors: [0xF4B942, 0xCC9966], label: 'เนินทรายเหมืองแกะ', emoji: '🏜' },
  },

  /* =====================================================================
     getBossDisplay — คืนค่า Container ของบอส (ภาพจริงหรือ placeholder)
     ===================================================================== */
  getBossDisplay(scene, x, y, bossId, opts = {}) {
    const { width = 220, height = 260, scale = 1 } = opts;
    const meta = this.BOSSES[bossId];
    if (!meta) {
      console.warn(`[PlaceholderFactory] ไม่มี boss id: ${bossId}`);
      return scene.add.container(x, y);
    }

    /* ถ้ามีภาพจริง → ใช้ภาพจริง พร้อม scale ให้พอดีกับกล่อง */
    if (scene.textures.exists(bossId)) {
      const img = scene.add.image(x, y, bossId);
      /* ปรับขนาดให้พอดี width × height (scale param เป็น multiplier เพิ่มอีกที) */
      const tex = scene.textures.get(bossId).getSourceImage();
      const fit = Math.min(width / tex.width, height / tex.height);
      img.setScale(fit * scale);
      return img;
    }

    /* ไม่มี → สร้าง placeholder */
    return this._buildBossPlaceholder(scene, x, y, meta, width, height, scale);
  },

  _buildBossPlaceholder(scene, x, y, meta, width, height, scale) {
    const container = scene.add.container(x, y);

    /* เงา */
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(-width/2 + 4, -height/2 + 6, width, height, 24);
    container.add(shadow);

    /* พื้นหลังกล่อง */
    const bg = scene.add.graphics();
    bg.fillStyle(meta.color);
    bg.fillRoundedRect(-width/2, -height/2, width, height, 24);
    bg.lineStyle(4, 0xFFFFFF, 0.6);
    bg.strokeRoundedRect(-width/2, -height/2, width, height, 24);
    container.add(bg);

    /* ลาย "PLACEHOLDER" เฉียง ๆ บอกว่าเป็นของชั่วคราว */
    const pattern = scene.add.graphics();
    pattern.lineStyle(1, 0xFFFFFF, 0.15);
    for (let i = -height; i < width; i += 16) {
      pattern.lineBetween(
        -width/2 + i, -height/2,
        -width/2 + i + height, height/2
      );
    }
    container.add(pattern);

    /* Emoji ใหญ่ */
    const emoji = scene.add.text(0, -28, meta.emoji, {
      fontSize: '96px',
    }).setOrigin(0.5);
    container.add(emoji);

    /* ชื่อบอส */
    const name = scene.add.text(0, height/2 - 36, meta.name, {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
      wordWrap: { width: width - 20 },
    }).setOrigin(0.5);
    container.add(name);

    /* ป้าย "PLACEHOLDER" */
    const tag = scene.add.text(0, -height/2 + 14, 'PLACEHOLDER', {
      fontFamily: NaSan.FONTS.MONO,
      fontSize: '10px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 6, y: 2 },
    }).setOrigin(0.5);
    tag.setAlpha(0.5);
    container.add(tag);

    container.setScale(scale);
    return container;
  },

  /* =====================================================================
     getBackgroundDisplay — Container ภาพพื้นหลังเต็มหน้าจอ
     ===================================================================== */
  getBackgroundDisplay(scene, sceneId) {
    const { width, height } = scene.scale;
    const meta = this.BACKGROUNDS[sceneId];

    /* ถ้ามีภาพจริง → ใช้ภาพจริง (cover) */
    if (scene.textures.exists(sceneId)) {
      const bg = scene.add.image(width/2, height/2, sceneId);
      const scale = Math.max(width / bg.width, height / bg.height);
      bg.setScale(scale);
      return bg;
    }

    if (!meta) {
      console.warn(`[PlaceholderFactory] ไม่มี background id: ${sceneId}`);
      const g = scene.add.graphics();
      g.fillStyle(0x333333);
      g.fillRect(0, 0, width, height);
      return g;
    }

    return this._buildBgPlaceholder(scene, width, height, meta);
  },

  _buildBgPlaceholder(scene, width, height, meta) {
    const container = scene.add.container(0, 0);

    /* Gradient bg ด้วย 2 rectangle ซ้อนกัน */
    const bg = scene.add.graphics();
    bg.fillStyle(meta.colors[0]);
    bg.fillRect(0, 0, width, height);
    /* Gradient ด้านล่าง: rect สีที่ 2 พร้อม alpha ไล่ */
    for (let i = 0; i < 10; i++) {
      bg.fillStyle(meta.colors[1], i / 10);
      bg.fillRect(0, height * i / 10, width, height / 10);
    }
    container.add(bg);

    /* ลายเส้นเฉียงบ่งบอกว่าเป็น placeholder */
    const pattern = scene.add.graphics();
    pattern.lineStyle(2, 0xFFFFFF, 0.08);
    for (let i = -height; i < width; i += 60) {
      pattern.lineBetween(i, 0, i + height, height);
    }
    container.add(pattern);

    /* Emoji ใหญ่กลางจอ */
    const emoji = scene.add.text(width/2, height/2 - 50, meta.emoji, {
      fontSize: '180px',
    }).setOrigin(0.5).setAlpha(0.5);
    container.add(emoji);

    /* ป้ายชื่อ */
    const label = scene.add.text(width/2, height/2 + 80, meta.label, {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '48px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5);
    container.add(label);

    const tag = scene.add.text(width/2, height/2 + 130, '— PLACEHOLDER —', {
      fontFamily: NaSan.FONTS.MONO,
      fontSize: '16px',
      color: '#FFEB3B',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    container.add(tag);

    return container;
  },

  /* =====================================================================
     drawHeart — วาดหัวใจสำหรับ HP
     ===================================================================== */
  drawHeart(graphics, x, y, size = 24, color = 0xD9263D, alpha = 1) {
    graphics.fillStyle(color, alpha);
    graphics.beginPath();
    /* หัวใจประกอบจาก 2 ครึ่งวงกลม + สามเหลี่ยม */
    const w = size, h = size;
    const r = w * 0.28;
    /* วงกลมซ้าย */
    graphics.arc(x - r, y - h * 0.05, r, Math.PI, 0, false);
    /* วงกลมขวา */
    graphics.arc(x + r, y - h * 0.05, r, Math.PI, 0, false);
    /* ปลายล่าง */
    graphics.lineTo(x, y + h * 0.5);
    graphics.closePath();
    graphics.fillPath();
  },

  /* วาดหัวใจ "ว่าง" (HP ที่หมด) */
  drawEmptyHeart(graphics, x, y, size = 24, color = 0xD9263D) {
    graphics.lineStyle(2, color);
    graphics.beginPath();
    const w = size, h = size;
    const r = w * 0.28;
    graphics.arc(x - r, y - h * 0.05, r, Math.PI, 0, false);
    graphics.arc(x + r, y - h * 0.05, r, Math.PI, 0, false);
    graphics.lineTo(x, y + h * 0.5);
    graphics.closePath();
    graphics.strokePath();
  },

  /* =====================================================================
     drawStar — วาดดาวสำหรับ Rating
     ===================================================================== */
  drawStar(graphics, x, y, radius = 24, color = 0xF4B942, filled = true) {
    const points = 5;
    const innerR = radius * 0.4;

    if (filled) graphics.fillStyle(color);
    else        graphics.lineStyle(3, color);

    graphics.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : innerR;
      const a = (i * Math.PI) / points - Math.PI / 2;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (i === 0) graphics.moveTo(px, py);
      else         graphics.lineTo(px, py);
    }
    graphics.closePath();
    if (filled) graphics.fillPath();
    else        graphics.strokePath();
  },

  /* =====================================================================
     getLogoDisplay — โลโก้เกม (ถ้ามีภาพ ใช้ภาพ ไม่งั้น text สวย ๆ)
     ===================================================================== */
  getLogoDisplay(scene, x, y, opts = {}) {
    const { scale = 1 } = opts;

    if (scene.textures.exists('game_logo')) {
      return scene.add.image(x, y, 'game_logo').setScale(scale);
    }

    /* Text logo */
    const container = scene.add.container(x, y);
    const shadow = scene.add.text(4, 4, 'นาสารอเมซิ่ง!', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '72px',
      color: '#000000',
      fontStyle: '900',
    }).setOrigin(0.5).setAlpha(0.4);
    container.add(shadow);

    const main = scene.add.text(0, 0, 'นาสารอเมซิ่ง!', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '72px',
      color: NaSan.CSS_COLORS.WARNING,
      fontStyle: '900',
      stroke: NaSan.CSS_COLORS.PRIMARY,
      strokeThickness: 6,
    }).setOrigin(0.5);
    container.add(main);

    container.setScale(scale);
    return container;
  },

  /* =====================================================================
     Utility: HEX integer → CSS string
     ===================================================================== */
  hexToCss(intColor) {
    return '#' + intColor.toString(16).padStart(6, '0').toUpperCase();
  },
};
