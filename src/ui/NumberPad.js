/* =====================================================================
   NumberPad — แป้นกดตัวเลขใหญ่ ๆ สำหรับเด็ก ม.2 (Touch-Friendly)
   ---------------------------------------------------------------------
   Layout (3 แถว × 4 คอลัมน์):
       [ 7 ] [ 8 ] [ 9 ] [ ⌫ ]
       [ 4 ] [ 5 ] [ 6 ] [ C ]
       [ 1 ] [ 2 ] [ 3 ] [ ✓ ]
             [ 0 ]

   Display:
       ┌────────────────────────┐
       │  คำตอบ:  ___           │  ← textbox โชว์ตัวเลขที่กด
       └────────────────────────┘

   API:
     const pad = NumberPad.create(scene, {
       x, y,                    // จุดศูนย์กลางบนของ pad
       maxDigits: 3,            // จำกัดจำนวนหลัก
       onSubmit: (val) => ...,  // กดปุ่ม ✓
       onChange: (val) => ...,  // เมื่อค่าใน display เปลี่ยน
     });

     pad.getValue()           // คืน string ปัจจุบัน
     pad.setValue(v)          // ตั้งค่าใหม่
     pad.clear()              // ล้างค่า
     pad.setEnabled(bool)     // เปิด/ปิดการกด
     pad.flashCorrect() / flashWrong()  // animation feedback
     pad.destroy()
   ===================================================================== */

const NumberPad = {

  create(scene, opts = {}) {
    const {
      x = 0,
      y = 0,
      maxDigits = 4,
      onSubmit = () => {},
      onChange = () => {},
      keyW = 78,
      keyH = 64,
      gap  = 8,
      labelText = 'คำตอบ',
    } = opts;

    /* Container กลาง */
    const container = scene.add.container(x, y);
    container.value = '';
    container._enabled = true;
    container._maxDigits = maxDigits;
    container._buttons = [];

    /* ===== Display ===== */
    const dispW = keyW * 4 + gap * 3;
    const dispH = 64;

    const dispBg = scene.add.graphics();
    dispBg.fillStyle(NaSan.COLORS.BACKGROUND);
    dispBg.fillRoundedRect(-dispW/2, 0, dispW, dispH, 12);
    dispBg.lineStyle(3, NaSan.COLORS.PRIMARY);
    dispBg.strokeRoundedRect(-dispW/2, 0, dispW, dispH, 12);
    container.add(dispBg);

    const labelTxt = scene.add.text(-dispW/2 + 16, dispH/2, `${labelText}:`, {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '22px',
      color: NaSan.CSS_COLORS.TEXT,
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    container.add(labelTxt);

    const valueTxt = scene.add.text(dispW/2 - 16, dispH/2, '___', {
      fontFamily: NaSan.FONTS.MONO,
      fontSize: '36px',
      color: NaSan.CSS_COLORS.PRIMARY,
      fontStyle: 'bold',
    }).setOrigin(1, 0.5);
    container.add(valueTxt);
    container._valueTxt = valueTxt;
    container._dispBg = dispBg;

    /* ===== Buttons ===== */
    /* Grid: row 0 → 7 8 9 ⌫ | row 1 → 4 5 6 C | row 2 → 1 2 3 ✓ | row 3 → · 0 · · */
    const layout = [
      [ {l:'7',v:'7'},   {l:'8',v:'8'},   {l:'9',v:'9'},   {l:'⌫',v:'BACK',  color: NaSan.COLORS.WARNING} ],
      [ {l:'4',v:'4'},   {l:'5',v:'5'},   {l:'6',v:'6'},   {l:'C',v:'CLEAR', color: NaSan.COLORS.DANGER}  ],
      [ {l:'1',v:'1'},   {l:'2',v:'2'},   {l:'3',v:'3'},   {l:'✓',v:'OK',    color: NaSan.COLORS.SUCCESS, w: keyW, h: keyH * 2 + gap, spanRows: 2} ],
      [ null,             {l:'0',v:'0'},   null,             null ],
    ];

    const gridY0 = dispH + 16;
    const gridX0 = -dispW/2;

    for (let r = 0; r < layout.length; r++) {
      for (let c = 0; c < 4; c++) {
        const cell = layout[r][c];
        if (!cell) continue;

        /* skip if this is the lower half of a row-spanning key */
        if (r === 3 && c === 3) continue;  // ✓ already spans

        const w = cell.w || keyW;
        const h = cell.h || keyH;
        const cx = gridX0 + c * (keyW + gap) + w/2;
        const cy = gridY0 + r * (keyH + gap) + h/2;

        const bgColor = cell.color || 0xE8E8F0;   // ปุ่มตัวเลข = สีเทาอ่อน
        const textColor = (cell.color === NaSan.COLORS.WARNING) ? NaSan.CSS_COLORS.TEXT : '#FFFFFF';
        const numColor = NaSan.CSS_COLORS.TEXT;   // ปุ่ม 0-9 ใช้ดำ
        const isNum = /^[0-9]$/.test(cell.l);

        const btn = this._makeButton(scene, cx, cy, w, h, cell.l,
          isNum ? 0xFFFFFF : bgColor,
          isNum ? numColor : textColor);

        container.add(btn);
        container._buttons.push(btn);

        /* Click handler */
        btn.zone.on('pointerup', () => {
          if (!container._enabled) return;
          this._handlePress(container, cell.v, onSubmit, onChange);
          this._flashButton(scene, btn);
        });
      }
    }

    /* ===== API ===== */
    container.getValue = () => container.value;
    container.setValue = (v) => {
      container.value = String(v).slice(0, container._maxDigits);
      this._refreshDisplay(container);
      onChange(container.value);
    };
    container.clear = () => {
      container.value = '';
      this._refreshDisplay(container);
      onChange('');
    };
    container.setEnabled = (b) => {
      container._enabled = !!b;
      container.alpha = b ? 1 : 0.55;
    };
    container.flashCorrect = () => this._flashDisplay(scene, container, NaSan.COLORS.SUCCESS);
    container.flashWrong   = () => this._flashDisplay(scene, container, NaSan.COLORS.DANGER);

    /* === FIX: propagate setDepth / setScrollFactor ลงทุกปุ่มย่อย ===
       NumberPad มี nested containers (each button = container with zone)
       ถ้าไม่ propagate hit-test ของ zone จะใช้ default scrollFactor=1
       → ปุ่ม ✓ ใน modal ที่ scrollFactor=0 จะกดไม่ได้ */
    const _walkChildren = (obj, fn) => {
      fn(obj);
      if (obj.list && Array.isArray(obj.list)) obj.list.forEach(c => _walkChildren(c, fn));
    };
    const origSetDepth = container.setDepth.bind(container);
    container.setDepth = function(d) {
      origSetDepth(d);
      _walkChildren(container, child => {
        if (child !== container && typeof child.setDepth === 'function') child.setDepth(d);
      });
      return this;
    };
    const origSetScrollFactor = container.setScrollFactor.bind(container);
    container.setScrollFactor = function(sx, sy) {
      origSetScrollFactor(sx, sy);
      _walkChildren(container, child => {
        if (child !== container && typeof child.setScrollFactor === 'function') child.setScrollFactor(sx, sy);
      });
      return this;
    };

    return container;
  },

  /* ───── private helpers ───── */
  _handlePress(container, key, onSubmit, onChange) {
    if (key === 'BACK') {
      container.value = container.value.slice(0, -1);
      this._refreshDisplay(container);
      onChange(container.value);
    } else if (key === 'CLEAR') {
      container.value = '';
      this._refreshDisplay(container);
      onChange(container.value);
    } else if (key === 'OK') {
      onSubmit(container.value);
    } else {
      /* ตัวเลข 0-9 */
      if (container.value.length >= container._maxDigits) return;
      /* กันเลขศูนย์นำ */
      if (container.value === '' && key === '0') {
        container.value = '0';
      } else if (container.value === '0') {
        container.value = key;
      } else {
        container.value += key;
      }
      this._refreshDisplay(container);
      onChange(container.value);
    }
  },

  _refreshDisplay(container) {
    const v = container.value;
    container._valueTxt.setText(v === '' ? '___' : v);
  },

  _makeButton(scene, cx, cy, w, h, label, bgColor, textColor) {
    const bg = scene.add.graphics();
    bg.fillStyle(bgColor);
    bg.fillRoundedRect(cx - w/2, cy - h/2, w, h, 12);
    bg.lineStyle(2, 0x000000, 0.2);
    bg.strokeRoundedRect(cx - w/2, cy - h/2, w, h, 12);

    const txt = scene.add.text(cx, cy, label, {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: label.length > 1 ? '26px' : '32px',
      color: textColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const zone = scene.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true });

    const btnContainer = scene.add.container(0, 0, [bg, txt, zone]);
    btnContainer.bg = bg;
    btnContainer.txt = txt;
    btnContainer.zone = zone;
    btnContainer._cx = cx;
    btnContainer._cy = cy;
    btnContainer._w = w;
    btnContainer._h = h;
    btnContainer._bgColor = bgColor;
    return btnContainer;
  },

  _flashButton(scene, btn) {
    /* กดปุ่ม → ย่อแล้วยืดกลับ */
    scene.tweens.add({
      targets: btn,
      scale: 0.92,
      duration: 60,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  },

  _flashDisplay(scene, container, color) {
    const dispBg = container._dispBg;
    const dispW = (container._maxDigits ? 78 : 78) * 4 + 8 * 3;
    /* ใช้ width จาก _w ที่จดไว้ไม่ได้ — สมมุติคงที่ตามค่าใน create() */
    const w = 78 * 4 + 8 * 3;
    const h = 64;

    /* คลุมด้วยรูปสีชั่วคราว */
    const flash = scene.add.graphics();
    flash.fillStyle(color, 1);
    flash.fillRoundedRect(-w/2, 0, w, h, 12);
    flash.alpha = 0;
    container.add(flash);

    scene.tweens.add({
      targets: flash,
      alpha: 0.7,
      duration: 100,
      yoyo: true,
      hold: 100,
      onComplete: () => flash.destroy(),
    });

    /* สั่นเบาๆ */
    if (color === NaSan.COLORS.DANGER) {
      const origX = container.x;
      scene.tweens.add({
        targets: container,
        x: origX + 8,
        duration: 50,
        yoyo: true,
        repeat: 3,
        onComplete: () => { container.x = origX; },
      });
    }
  },
};
