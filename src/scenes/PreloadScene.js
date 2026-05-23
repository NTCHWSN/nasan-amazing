/* =====================================================================
   PreloadScene
   ---------------------------------------------------------------------
   โหลด asset ทั้งหมดที่ใช้ในเกม + แสดง progress bar
   เมื่อโหลดเสร็จจะกระโดดไป TitleScene
   ===================================================================== */

class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(NaSan.CSS_COLORS.BACKGROUND);

    this._buildLoadingUI(width, height);

    this._missingAssets = [];
    this.load.on('loaderror', (file) => {
      console.warn(`⚠️  Asset ขาด: ${file.key} (${file.src}) — จะใช้ placeholder แทน`);
      this._missingAssets.push(file.key);
    });

    /* ───── ตัวเอก 3 คน ───── */
    this.load.image('char_ngoh',     'assets/images/characters/ngoh_sheet.png');
    this.load.image('char_durian',   'assets/images/characters/durian_sheet.png');
    this.load.image('char_plameng',  'assets/images/characters/plameng_sheet.png');

    /* ───── พื้นหลังด่าน 10 ด่าน ───── */
    for (let i = 1; i <= 10; i++) {
      this.load.image('bg_d' + i, 'assets/images/backgrounds/bg_d' + i + '.jpg');
    }

    /* ───── บอส 10 ตัว ───── */
    for (let i = 1; i <= 10; i++) {
      this.load.image('boss_d' + i, 'assets/images/bosses/boss_d' + i + '.png');
    }

    /* ───── ภาพประกอบสถานที่ 10 ด่าน (สำหรับ portrait/intro) ───── */
    for (let i = 1; i <= 10; i++) {
      this.load.image('dungeon_d' + i, 'assets/images/dungeons/dungeon_d' + i + '.png');
    }

    /* ───── NPCs ───── */
    this.load.image('npc_lost_child',    'assets/images/npcs/npc_lost_child.png');
    this.load.image('npc_merchant',      'assets/images/npcs/npc_merchant.png');
    this.load.image('npc_ranger',        'assets/images/npcs/npc_ranger.png');
    this.load.image('npc_village_chief', 'assets/images/npcs/npc_village_chief.png');

    /* ───── Items ───── */
    this.load.image('item_book',     'assets/images/items/item_book.png');
    this.load.image('item_compass',  'assets/images/items/item_compass.png');
    this.load.image('item_lantern',  'assets/images/items/item_lantern.png');
    this.load.image('item_rambutan', 'assets/images/items/item_rambutan.png');

    /* ───── Props ───── */
    this.load.image('prop_old_machine', 'assets/images/props/prop_old_machine.png');
    this.load.image('prop_signboard',   'assets/images/props/prop_signboard.png');

    /* ───── UI ───── */
    this.load.image('bg_title',     'assets/images/ui/bg_title.png');
    this.load.image('bg_ending',    'assets/images/ui/bg_ending.png');
    this.load.image('bg_hub',       'assets/images/ui/bg_hub.png');
    this.load.image('start_game',   'assets/images/ui/start_game.png');
    this.load.image('frame_modal',  'assets/images/ui/frame_modal.png');
    this.load.image('icon_heart',   'assets/images/ui/icon_heart.png');
    this.load.image('icon_star',    'assets/images/ui/icon_star.png');
    this.load.image('logo_game',    'assets/images/ui/logo_game.png');

    /* ───── เสียง (SFX + BGM แบบ Synthesized via WebAudio — ดูใน SoundManager.js) ─────
       ไม่ต้อง load file เพราะใช้ WebAudio API สร้างเสียงสด */
  }

  _buildLoadingUI(width, height) {
    const cx = width / 2;
    const cy = height / 2;

    this.add.text(cx, cy - 100, '🎮 นาสารอเมซิ่ง!', {
      fontFamily: NaSan.FONTS.HEADING,
      fontSize: '42px',
      color: NaSan.CSS_COLORS.PRIMARY,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 50, 'กำลังโหลดเกม…', {
      fontFamily: NaSan.FONTS.BODY,
      fontSize: '20px',
      color: NaSan.CSS_COLORS.TEXT,
    }).setOrigin(0.5);

    const barW = 500, barH = 32;
    const barX = cx - barW / 2;
    const barY = cy + 10;

    const frame = this.add.graphics();
    frame.lineStyle(3, NaSan.COLORS.PRIMARY);
    frame.strokeRoundedRect(barX - 4, barY - 4, barW + 8, barH + 8, 8);

    const bar = this.add.graphics();

    const percentText = this.add.text(cx, barY + barH + 24, '0%', {
      fontFamily: NaSan.FONTS.MONO,
      fontSize: '18px',
      color: NaSan.CSS_COLORS.PRIMARY,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const fileText = this.add.text(cx, barY + barH + 56, '', {
      fontFamily: NaSan.FONTS.MONO,
      fontSize: '13px',
      color: NaSan.CSS_COLORS.TEXT,
    }).setOrigin(0.5).setAlpha(0.6);

    this.load.on('progress', (value) => {
      bar.clear();
      bar.fillStyle(NaSan.COLORS.SUCCESS);
      bar.fillRoundedRect(barX, barY, barW * value, barH, 6);
      percentText.setText(Math.floor(value * 100) + '%');
    });
    this.load.on('fileprogress', (file) => fileText.setText(file.key));
    this.load.on('complete', () => fileText.setText('โหลดเสร็จสมบูรณ์ ✓'));
  }

  create() {
    if (this._missingAssets.length > 0) {
      console.log(`%c📦 Asset ที่ใช้ placeholder (${this._missingAssets.length}):`,
                  'color: orange; font-weight: bold;');
      this._missingAssets.forEach(k => console.log(`   • ${k}`));
    } else {
      console.log('%c✅ Asset ทั้งหมดโหลดเป็นภาพจริง', 'color: green; font-weight: bold;');
    }

    /* เริ่ม SoundManager (ถ้ามี) */
    if (typeof SoundManager !== 'undefined') {
      SoundManager.init();
    }

    this.time.delayedCall(300, () => {
      this.scene.start('TitleScene');
    });
  }
}
