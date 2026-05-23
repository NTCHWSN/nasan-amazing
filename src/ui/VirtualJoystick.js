/* =====================================================================
   VirtualJoystick — แท่งคุมทิศทาง (มือถือ/PC)
   ---------------------------------------------------------------------
   ใช้:
     const stick = VirtualJoystick.create(scene, {
       x: 150, y: scene.scale.height - 150,
       baseRadius: 70, knobRadius: 32,
       baseColor: 0x000000, baseAlpha: 0.35,
       knobColor: 0xF4B942, knobAlpha: 0.85,
       autoHide: false,    // ถ้า true จะแสดงเฉพาะตอนกด
     });

   อ่านค่าใน scene.update():
     const v = stick.value;   // {x, y, magnitude, angle, isActive}
                              // x,y อยู่ในช่วง -1..1
                              // magnitude = 0..1
                              // angle เป็น radian (0 = ขวา)

   ทำงานยังไง:
     - กดในรัศมี touchRadius (default = baseRadius * 3) → ขยับ knob
     - ลากเกิน baseRadius → clamp ไว้ที่ขอบ
     - ปล่อย → knob กลับกลาง, magnitude = 0
   ===================================================================== */

const VirtualJoystick = {

  create(scene, opts = {}) {
    const {
      x = 150,
      y = 600,
      baseRadius = 70,
      knobRadius = 32,
      baseColor = 0x000000,
      baseAlpha = 0.35,
      knobColor = 0xF4B942,
      knobAlpha = 0.85,
      touchRadius = null,   // default: baseRadius * 3 (ครอบคลุมพื้นที่ครึ่งจอด้านที่อยู่)
      autoHide = false,
      deadzone = 0.12,      // magnitude ต่ำกว่านี้ถือว่า 0
    } = opts;

    const stick = {
      _scene: scene,
      _baseX: x,
      _baseY: y,
      _baseR: baseRadius,
      _knobR: knobRadius,
      _knobX: x,
      _knobY: y,
      _pointerId: null,
      _autoHide: autoHide,
      _deadzone: deadzone,
      value: { x: 0, y: 0, magnitude: 0, angle: 0, isActive: false },
    };

    /* ───── Graphics ───── */
    const base = scene.add.graphics();
    base.fillStyle(baseColor, baseAlpha);
    base.fillCircle(0, 0, baseRadius);
    base.lineStyle(3, 0xFFFFFF, 0.5);
    base.strokeCircle(0, 0, baseRadius);
    base.x = x; base.y = y;
    base.setDepth(1000);

    const knob = scene.add.graphics();
    knob.fillStyle(knobColor, knobAlpha);
    knob.fillCircle(0, 0, knobRadius);
    knob.lineStyle(3, 0xFFFFFF, 0.7);
    knob.strokeCircle(0, 0, knobRadius);
    knob.x = x; knob.y = y;
    knob.setDepth(1001);

    if (autoHide) {
      base.alpha = 0;
      knob.alpha = 0;
    }

    stick._base = base;
    stick._knob = knob;

    /* ───── Touch zone (เลือก: pointer area ที่ kick ใช้งานได้) ───── */
    const tRadius = touchRadius || baseRadius * 3;
    const zoneSize = tRadius * 2;
    const zone = scene.add.zone(x, y, zoneSize, zoneSize)
      .setInteractive({ useHandCursor: false });
    zone.setDepth(999);
    stick._zone = zone;

    /* ───── Events ───── */
    const onDown = (pointer) => {
      if (stick._pointerId !== null) return;
      stick._pointerId = pointer.id;
      if (autoHide) {
        /* ย้าย stick มาที่จุดที่กด */
        stick._baseX = pointer.x;
        stick._baseY = pointer.y;
        base.x = pointer.x; base.y = pointer.y;
        knob.x = pointer.x; knob.y = pointer.y;
        base.alpha = baseAlpha;
        knob.alpha = knobAlpha;
      }
      stick._update(pointer);
    };

    const onMove = (pointer) => {
      if (stick._pointerId !== pointer.id) return;
      stick._update(pointer);
    };

    const onUp = (pointer) => {
      if (stick._pointerId !== pointer.id) return;
      stick._pointerId = null;
      /* รีเซ็ต */
      stick._knobX = stick._baseX;
      stick._knobY = stick._baseY;
      knob.x = stick._baseX;
      knob.y = stick._baseY;
      stick.value = { x: 0, y: 0, magnitude: 0, angle: 0, isActive: false };
      if (autoHide) {
        base.alpha = 0;
        knob.alpha = 0;
      }
    };

    zone.on('pointerdown', onDown);
    scene.input.on('pointermove', onMove);
    scene.input.on('pointerup', onUp);
    scene.input.on('pointerupoutside', onUp);

    /* ───── Internal helpers ───── */
    stick._update = function(pointer) {
      const dx = pointer.x - this._baseX;
      const dy = pointer.y - this._baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      let nx, ny, mag;
      if (dist <= this._baseR) {
        /* ภายในวง — ใช้ค่าเต็ม */
        this._knobX = this._baseX + dx;
        this._knobY = this._baseY + dy;
        nx = dx / this._baseR;
        ny = dy / this._baseR;
        mag = dist / this._baseR;
      } else {
        /* ลากเกิน — clamp ที่ขอบ */
        this._knobX = this._baseX + Math.cos(angle) * this._baseR;
        this._knobY = this._baseY + Math.sin(angle) * this._baseR;
        nx = Math.cos(angle);
        ny = Math.sin(angle);
        mag = 1;
      }

      this._knob.x = this._knobX;
      this._knob.y = this._knobY;

      /* deadzone */
      if (mag < this._deadzone) {
        nx = 0; ny = 0; mag = 0;
      }

      this.value = {
        x: nx,
        y: ny,
        magnitude: mag,
        angle: angle,
        isActive: mag > 0,
      };
    };

    /* ───── Public API ───── */
    stick.setPosition = function(nx, ny) {
      this._baseX = nx; this._baseY = ny;
      this._base.x = nx; this._base.y = ny;
      this._knob.x = nx; this._knob.y = ny;
      this._zone.x = nx; this._zone.y = ny;
    };

    stick.destroy = function() {
      this._base.destroy();
      this._knob.destroy();
      this._zone.destroy();
      this._scene.input.off('pointermove', onMove);
      this._scene.input.off('pointerup', onUp);
      this._scene.input.off('pointerupoutside', onUp);
    };

    return stick;
  },
};
