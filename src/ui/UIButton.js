/* =====================================================================
   UIButton — ปุ่มเกมที่ใช้ซ้ำได้ทุกฉาก
   ---------------------------------------------------------------------
   ออกแบบให้กดง่ายบนมือถือ:
   - ขนาดอย่างน้อย 60×60px (ตาม GDD ส่วนที่ 8)
   - มีเงา + เด้งเมื่อกด
   - รองรับ hover (เม้าส์) และ touch (มือถือ) แยกกัน
   ---------------------------------------------------------------------
   วิธีใช้:
     const btn = UIButton.create(this, {
       x: 640, y: 400,
       width: 280, height: 80,
       text: 'เริ่มเกม',
       bgColor: NaSan.COLORS.SUCCESS,
       onClick: () => this.scene.start('SomeScene')
     });
   ===================================================================== */

const UIButton = {

  create(scene, opts) {
    const {
      x = 0, y = 0,
      width = 240, height = 70,
      text = 'ปุ่ม',
      bgColor = NaSan.COLORS.PRIMARY,
      hoverColor = null,                // ถ้าไม่ใส่ จะใช้ bgColor + อ่อนลง
      textColor = '#FFFFFF',
      fontSize = null,                  // ถ้าไม่ใส่ จะคำนวณตามความสูง
      fontStyle = 'bold',
      fontFamily = NaSan.FONTS.HEADING,
      icon = null,                       // emoji หรือ text ที่จะอยู่หน้าข้อความ
      onClick = () => {},
      radius = 16,                       // มุมโค้ง
      shadowOffset = 4,
    } = opts;

    /* Container เก็บทุก element */
    const container = scene.add.container(x, y);

    /* คำนวณสี hover ถ้าไม่ระบุ */
    const _hoverColor = hoverColor !== null
      ? hoverColor
      : Phaser.Display.Color.IntegerToColor(bgColor).clone().brighten(15).color;
    const _pressColor = Phaser.Display.Color.IntegerToColor(bgColor).clone().darken(15).color;

    /* เงา (rectangle ด้านล่าง) */
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.25);
    shadow.fillRoundedRect(-width/2, -height/2 + shadowOffset, width, height, radius);
    container.add(shadow);

    /* พื้นปุ่ม */
    const bg = scene.add.graphics();
    bg.fillStyle(bgColor);
    bg.fillRoundedRect(-width/2, -height/2, width, height, radius);
    /* เส้นขอบบางสีอ่อน (highlight ด้านบน) */
    bg.lineStyle(2, 0xFFFFFF, 0.4);
    bg.strokeRoundedRect(-width/2, -height/2, width, height, radius);
    container.add(bg);

    /* ข้อความ */
    const displayText = icon ? `${icon} ${text}` : text;
    const _fontSize = fontSize !== null ? fontSize : Math.floor(height * 0.42) + 'px';
    const label = scene.add.text(0, 0, displayText, {
      fontFamily,
      fontSize: typeof _fontSize === 'number' ? _fontSize + 'px' : _fontSize,
      color: textColor,
      fontStyle,
    }).setOrigin(0.5);
    container.add(label);

    /* Hit zone โปร่งใส — interactive ทั้ง container
       ขยาย hit-zone ใหญ่กว่าปุ่ม 20px ทุกด้าน ช่วยให้กดง่ายขึ้นบนมือถือ */
    const hitPadding = 20;
    const hitZone = scene.add.zone(0, 0, width + hitPadding, height + hitPadding)
      .setInteractive({ useHandCursor: true });
    container.add(hitZone);

    /* === Interaction === */
    hitZone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(_hoverColor);
      bg.fillRoundedRect(-width/2, -height/2, width, height, radius);
      bg.lineStyle(2, 0xFFFFFF, 0.4);
      bg.strokeRoundedRect(-width/2, -height/2, width, height, radius);
    });

    hitZone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(bgColor);
      bg.fillRoundedRect(-width/2, -height/2, width, height, radius);
      bg.lineStyle(2, 0xFFFFFF, 0.4);
      bg.strokeRoundedRect(-width/2, -height/2, width, height, radius);
      /* คืนตำแหน่งหากกดค้างแล้วเลื่อนออก */
      container.y = y;
      shadow.alpha = 1;
    });

    hitZone.on('pointerdown', () => {
      bg.clear();
      bg.fillStyle(_pressColor);
      bg.fillRoundedRect(-width/2, -height/2, width, height, radius);
      /* ปุ่มจมลง */
      container.y = y + shadowOffset;
      shadow.alpha = 0.5;
    });

    hitZone.on('pointerup', () => {
      /* คืนสภาพปุ่ม */
      bg.clear();
      bg.fillStyle(_hoverColor);
      bg.fillRoundedRect(-width/2, -height/2, width, height, radius);
      bg.lineStyle(2, 0xFFFFFF, 0.4);
      bg.strokeRoundedRect(-width/2, -height/2, width, height, radius);
      container.y = y;
      shadow.alpha = 1;
      /* เรียก callback */
      onClick();
    });

    /* เก็บ reference สำหรับเข้าถึงภายหลัง */
    container.bg = bg;
    container.label = label;
    container.hitZone = hitZone;
    container.setText = (newText) => label.setText(icon ? `${icon} ${newText}` : newText);
    container.setEnabled = (enabled) => {
      hitZone.input.enabled = enabled;
      container.alpha = enabled ? 1 : 0.5;
    };

    /* === FIX: propagate setDepth / setScrollFactor ลง hitZone ด้วย ===
       Phaser Container.setDepth ไม่ propagate ไปยัง child ทำให้
       hit-testing ของ interactive zone ใช้ default depth = 0
       → backdrop ของ modal กลืน click หมด */
    const origSetDepth = container.setDepth.bind(container);
    container.setDepth = function(d) {
      origSetDepth(d);
      hitZone.setDepth(d);
      bg.setDepth(d);
      shadow.setDepth(d);
      label.setDepth(d);
      return this;
    };
    const origSetScrollFactor = container.setScrollFactor.bind(container);
    container.setScrollFactor = function(sx, sy) {
      origSetScrollFactor(sx, sy);
      hitZone.setScrollFactor(sx, sy);
      bg.setScrollFactor(sx, sy);
      shadow.setScrollFactor(sx, sy);
      label.setScrollFactor(sx, sy);
      return this;
    };

    return container;
  },
};
