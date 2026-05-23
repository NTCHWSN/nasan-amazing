/* =====================================================================
   DungeonIntroScene — Cutscene เปิดด่าน (จาก DungeonData)
   ---------------------------------------------------------------------
   รับ: { dungeonId, difficulty, returnScene }
   - แสดง dungeon.introDialogue (typewriter)
   - หลังจบ dialogue → ไป DungeonExploreScene
   ===================================================================== */

class DungeonIntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DungeonIntroScene' });
  }

  init(data) {
    data = data || {};
    this.dungeonId   = data.dungeonId   || 'd1';
    this.difficulty  = data.difficulty  || 'easy';
    this.returnScene = data.returnScene || 'HubVillageScene';

    this.dungeon = DungeonData.get(this.dungeonId);
    this.dialogueIndex = 0;

    /* reset transient state */
    this._typing = false;
    this._dialogueReady = false;
    this._fightShown = false;
    this._going = false;
    this._currentFull = '';
    if (this._typeEvent) { this._typeEvent.remove(); this._typeEvent = null; }
  }

  create() {
    if (!this.dungeon) {
      this.add.text(this.scale.width/2, this.scale.height/2,
        'ไม่พบ ' + this.dungeonId, { color: '#FFF', fontSize: '32px' }).setOrigin(0.5);
      return;
    }

    const { width, height } = this.scale;
    this._addBackground(width, height);

    /* ambient — ย้ายลงมาไว้เหนือ dialogue box แทน (ใกล้ speaker name)
       เก็บไว้ใน this._ambientLabel เพื่อให้ _addDialogueBox วางตำแหน่ง */

    /* Title */
    const titleTxt = this.add.text(width/2, 130, this.dungeon.name, {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '52px',
      color: '#FFFFFF', fontStyle: '900',
      stroke: NaSan.CSS_COLORS.PRIMARY, strokeThickness: 8,
    }).setOrigin(0.5).setScale(0);
    this.tweens.add({ targets: titleTxt, scale: 1, duration: 700, ease: 'Back.easeOut', delay: 300 });

    const subTxt = this.add.text(width/2, 190, this.dungeon.subtitle, {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '20px',
      color: NaSan.CSS_COLORS.WARNING, fontStyle: 'bold',
      stroke: NaSan.CSS_COLORS.TEXT, strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: subTxt, alpha: 1, duration: 600, delay: 800 });

    /* Emoji big (แทนรูปบอส) */
    const iconBig = this.add.text(width - 180, height/2 + 50, this.dungeon.emoji, {
      fontSize: '160px',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: iconBig, alpha: 0.9, duration: 700, delay: 800 });
    this.tweens.add({
      targets: iconBig, y: iconBig.y - 15,
      duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 1500,
    });

    /* Dialogue box */
    this._addDialogueBox(width, height);

    /* Skip */
    const skipBtn = this.add.text(width - 20, 20, 'ข้าม ▶▶', {
      fontFamily: NaSan.FONTS.BODY, fontSize: '14px',
      color: '#FFFFFF', fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.6)', padding: { x: 10, y: 6 },
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    skipBtn.on('pointerup', () => this._gotoExplore());

    /* เริ่ม dialogue */
    this.time.delayedCall(1500, () => this._showNextDialogue());

    this.input.on('pointerdown', (pointer, targets) => {
      if (targets && targets.includes(skipBtn)) return;
      if (!this._dialogueReady) return;
      this._showNextDialogue();
    });
    this.input.keyboard.on('keydown-SPACE', () => this._showNextDialogue());
    this.input.keyboard.on('keydown-ENTER', () => this._showNextDialogue());
  }

  _addBackground(width, height) {
    const bgKey = this.dungeon.background || 'bg_dungeon1';
    if (this.textures.exists(bgKey)) {
      const bg = this.add.image(width/2, height/2, bgKey);
      const scale = Math.max(width / bg.width, height / bg.height);
      bg.setScale(scale);
    } else {
      const g = this.add.graphics();
      g.fillStyle(this.dungeon.color || 0x2C5F8D);
      g.fillRect(0, 0, width, height);
    }
    const ov = this.add.graphics();
    ov.fillStyle(0x000000, 0.55);
    ov.fillRect(0, 0, width, height);
  }

  _addDialogueBox(width, height) {
    const boxY = height - 200;
    const boxH = 160;
    const boxX = 40;
    const boxW = width - 80 - 250;

    /* Ambient label — วางไว้เหนือ dialogue box ด้านขวา (อยู่ข้าง speaker tag) */
    if (this.dungeon.ambientLabel) {
      const a = this.add.text(boxX + boxW - 12, boxY - 18, this.dungeon.ambientLabel, {
        fontFamily: NaSan.FONTS.BODY, fontSize: '15px',
        color: '#F4B942', fontStyle: 'italic',
        backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 12, y: 5 },
      }).setOrigin(1, 1).setAlpha(0);
      this.tweens.add({ targets: a, alpha: 1, duration: 500, delay: 400 });
    }

    this.dialogueBox = this.add.graphics();
    this.dialogueBox.fillStyle(NaSan.COLORS.BACKGROUND, 0.96);
    this.dialogueBox.fillRoundedRect(boxX, boxY, boxW, boxH, 16);
    this.dialogueBox.lineStyle(4, NaSan.COLORS.PRIMARY);
    this.dialogueBox.strokeRoundedRect(boxX, boxY, boxW, boxH, 16);
    this.dialogueBox.setAlpha(0);

    this.speakerBg = this.add.graphics();
    this.speakerBg.setAlpha(0);

    /* Speaker tag อยู่บน TOP-LEFT ของ dialogue box (ยกขึ้นเหนือกรอบ) */
    this.speakerTxt = this.add.text(boxX + 116, boxY - 18, '', {
      fontFamily: NaSan.FONTS.HEADING, fontSize: '18px',
      color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    this.dialogueTxt = this.add.text(boxX + 24, boxY + 20, '', {
      fontFamily: NaSan.FONTS.BODY, fontSize: '20px',
      color: NaSan.CSS_COLORS.TEXT,
      lineSpacing: 8, wordWrap: { width: boxW - 48 },
    }).setOrigin(0, 0).setAlpha(0);

    this.tapHint = this.add.text(boxX + boxW - 24, boxY + boxH - 20, 'แตะเพื่อต่อ ▼', {
      fontFamily: NaSan.FONTS.MONO, fontSize: '13px',
      color: NaSan.CSS_COLORS.PRIMARY, fontStyle: 'bold',
    }).setOrigin(1, 1).setAlpha(0);
    this.tweens.add({
      targets: this.tapHint, alpha: { from: 0.3, to: 1 },
      duration: 800, yoyo: true, repeat: -1,
    });
  }

  _showNextDialogue() {
    if (this._typing) {
      this.dialogueTxt.setText(this._currentFull);
      this._typing = false;
      return;
    }
    const intro = this.dungeon.introDialogue || [];
    if (this.dialogueIndex >= intro.length) {
      this._showStartButton();
      return;
    }
    const line = intro[this.dialogueIndex++];
    this._dialogueReady = false;

    this.dialogueBox.setAlpha(1);
    this.dialogueTxt.setAlpha(1);

    const s = this._getSpeakerInfo(line.speaker);
    this.speakerBg.clear();
    this.speakerBg.fillStyle(s.color);
    const sw = s.name.length * 14 + 32;
    /* speaker tag ยกขึ้นเหนือกรอบ — Y ตรงกับ speakerTxt */
    const tagY = this.speakerTxt.y - 16;
    this.speakerBg.fillRoundedRect(64, tagY, sw, 32, 8);
    this.speakerBg.setAlpha(1);
    this.speakerTxt.setText(s.name);
    this.speakerTxt.setX(64 + sw/2);
    this.speakerTxt.setAlpha(1);

    this._currentFull = line.text;
    this.dialogueTxt.setText('');
    this._typing = true;
    let i = 0;
    if (this._typeEvent) this._typeEvent.remove();
    this._typeEvent = this.time.addEvent({
      delay: 22,
      repeat: line.text.length - 1,
      callback: () => {
        i++;
        this.dialogueTxt.setText(line.text.slice(0, i));
        if (i >= line.text.length) {
          this._typing = false;
          this._dialogueReady = true;
        }
      },
    });

    if (line.speaker === 'boss') {
      this.cameras.main.shake(200, 0.005);
    }
    this._dialogueReady = true;
  }

  _getSpeakerInfo(speaker) {
    const map = {
      narrator: { name: '— เสียงเล่า —', color: 0x555555 },
      ngoh:     { name: '🍎 น้องเงาะ',    color: NaSan.COLORS.DANGER },
      durian:   { name: '🌰 น้องทุเรียน', color: NaSan.COLORS.SUCCESS },
      plameng:  { name: '🐟 น้องปลาเม็ง', color: NaSan.COLORS.PRIMARY },
      boss:     { name: '👹 ปริศนา',      color: 0x1A1A2E },
    };
    return map[speaker] || map.narrator;
  }

  _showStartButton() {
    if (this._fightShown) return;
    this._fightShown = true;
    if (this.tapHint) this.tapHint.setAlpha(0);

    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height - 90;

    const btn = UIButton.create(this, {
      x: cx, y: cy,
      width: 360, height: 70,
      text: 'เริ่มสำรวจ!', icon: '🗺',
      bgColor: NaSan.COLORS.SUCCESS, fontSize: 28,
      onClick: () => this._gotoExplore(),
    });
    btn.setScale(0);
    this.tweens.add({ targets: btn, scale: 1, duration: 500, ease: 'Back.easeOut' });
    this.tweens.add({
      targets: btn, scale: 1.06,
      duration: 700, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut', delay: 500,
    });
  }

  _gotoExplore() {
    if (this._going) return;
    this._going = true;
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.time.delayedCall(370, () => {
      this.scene.start('DungeonExploreScene', {
        dungeonId: this.dungeonId,
        difficulty: this.difficulty,
        returnScene: this.returnScene,
      });
    });
  }
}
