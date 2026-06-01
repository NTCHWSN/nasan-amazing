/* =====================================================================
   นาสารอเมซิ่ง! — Main Entry Point
   ---------------------------------------------------------------------
   หน้าที่:
   1. ตรวจว่า Phaser โหลดสำเร็จ
   2. สร้าง Phaser.Game พร้อมตั้งค่า responsive (Scale.FIT)
   3. ลงทะเบียนฉากทั้งหมด
   4. ซ่อน loading screen หลังเกมพร้อม
   ===================================================================== */

window.addEventListener('load', () => {
  const loadingEl    = document.getElementById('loading');
  const loadingStat  = document.getElementById('loading-status');
  const errorEl      = document.getElementById('error');
  const errorMsg     = document.getElementById('error-message');

  function showError(msg) {
    console.error('🔴 Game Error:', msg);
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorMsg)  errorMsg.textContent = msg;
    if (errorEl)   errorEl.classList.add('show');
  }

  try {
    if (typeof Phaser === 'undefined') {
      throw new Error('โหลด Phaser.js ไม่สำเร็จ — กรุณาตรวจการเชื่อมต่ออินเตอร์เน็ต');
    }
    if (typeof NaSan === 'undefined') {
      throw new Error('โหลด config.js ไม่สำเร็จ');
    }
    if (loadingStat) loadingStat.textContent = `Phaser v${Phaser.VERSION} โหลดสำเร็จ — กำลังเริ่มเกม…`;

    const sceneClasses = [];
    if (typeof PreloadScene !== 'undefined')      sceneClasses.push(PreloadScene);
    if (typeof TitleScene !== 'undefined')        sceneClasses.push(TitleScene);
    if (typeof HubVillageScene !== 'undefined')   sceneClasses.push(HubVillageScene);
    if (typeof DungeonIntroScene !== 'undefined') sceneClasses.push(DungeonIntroScene);
    if (typeof DungeonExploreScene !== 'undefined') sceneClasses.push(DungeonExploreScene);
    if (typeof LearnScene !== 'undefined')      sceneClasses.push(LearnScene);
    if (typeof EndingScene !== 'undefined')       sceneClasses.push(EndingScene);
    if (typeof AssetTestScene !== 'undefined')    sceneClasses.push(AssetTestScene);
    if (typeof QuestionTestScene !== 'undefined') sceneClasses.push(QuestionTestScene);
    if (typeof BattleScene !== 'undefined')       sceneClasses.push(BattleScene);
    if (typeof BattleTestScene !== 'undefined')   sceneClasses.push(BattleTestScene);
    if (typeof BootScene !== 'undefined')         sceneClasses.push(BootScene);

    if (sceneClasses.length === 0) {
      throw new Error('ไม่พบ scene ใด ๆ ที่ลงทะเบียนไว้');
    }

    /* ───── คำนวณขนาดเกมให้ "เต็มจอ" ตามอัตราส่วนเครื่องจริง ─────
       เดิม: ล็อค 1280×720 (16:9) แบบตายตัว → มือถือจอกว้าง (เช่น iPhone ~19.5:9)
             เกิดแถบดำซ้าย-ขวา (letterbox) จอไม่เต็ม
       ใหม่: ยึดความสูงฐาน 720 แล้วคำนวณความกว้างตามสัดส่วนหน้าจอจริง
             → Scale.FIT ไม่มีแถบดำอีก เพราะ canvas สัดส่วนตรงกับจอ
       ฉากทุกฉากใช้ this.scale.width/height อยู่แล้ว จึง re-layout ได้เอง */
    const calcGameSize = () => {
      const vw = window.innerWidth  || NaSan.BASE_WIDTH;
      const vh = window.innerHeight || NaSan.BASE_HEIGHT;
      const aspect = vw / vh;
      const baseH = NaSan.BASE_HEIGHT;                 // ความสูงฐาน (ระบบพิกัดฉาก)
      /* จับคู่อัตราส่วนจอจริงให้ใกล้เคียงที่สุด → ไม่มีแถบดำ (letterbox)
         จำกัดเฉพาะกรณีสุดโต่งจริง ๆ: 1.4 (เกือบ 3:2) ถึง 3.0 (ยาวมาก) */
      const clampedAspect = Math.min(3.0, Math.max(1.4, aspect));
      const w = Math.round(baseH * clampedAspect);
      return { width: w, height: baseH };
    };
    const initSize = calcGameSize();
    NaSan.GAME_WIDTH  = initSize.width;
    NaSan.GAME_HEIGHT = initSize.height;

    const config = {
      type: Phaser.AUTO,
      parent: 'game-container',
      backgroundColor: NaSan.CSS_COLORS.BACKGROUND,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: initSize.width,
        height: initSize.height,
      },
      input: { activePointers: 4 },
      disableContextMenu: true,
      pixelArt: false,
      antialias: true,
      roundPixels: false,
      scene: sceneClasses,
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: NaSan.DEBUG.showFPS },
      },
    };

    /* ───── สร้างเกม — รอ Sarabun โหลดเสร็จก่อน เพื่อให้สระ/วรรณยุกต์ครบ ───── */
    const startGame = () => {
      if (window._gameStarted) return;
      window._gameStarted = true;
      const game = new Phaser.Game(config);
      window.game = game;

      game.events.once('ready', () => {
        console.log('✅ เกมพร้อมเล่นแล้ว');
        if (loadingEl) {
          loadingEl.classList.add('fade-out');
          setTimeout(() => loadingEl.remove(), 600);
        }
      });

      /* ───── ปรับขนาดเกมใหม่เมื่อหมุนจอ / browser bar ซ่อน-แสดง ─────
         คำนวณสัดส่วนใหม่ → setGameSize → restart ฉากที่กำลังเล่นอยู่
         เพื่อให้ layout จัดตำแหน่งใหม่ตามขนาดที่เปลี่ยน (ฉากสร้าง UI จาก
         this.scale.width/height ตอน create) — debounce กันสั่นรัว */
      let _resizeTimer = null;
      let _lastAspect = initSize.width / initSize.height;
      const applyResize = () => {
        const s = calcGameSize();
        const newAspect = s.width / s.height;
        /* ทำงานเฉพาะเมื่อสัดส่วนเปลี่ยน "อย่างมีนัย" (เช่น หมุนจอ) มากกว่า 8%
           — กัน browser bar ซ่อน/แสดง (ความสูงเปลี่ยนเล็กน้อย) ไม่ให้ restart รัว
             กลางเกม ซึ่งจะรีเซ็ตความคืบหน้าของฉาก */
        if (Math.abs(newAspect - _lastAspect) / _lastAspect < 0.08) return;
        _lastAspect = newAspect;
        NaSan.GAME_WIDTH  = s.width;
        NaSan.GAME_HEIGHT = s.height;
        game.scale.setGameSize(s.width, s.height);
        /* restart เฉพาะฉากที่ active เพื่อให้ re-layout ด้วยขนาดใหม่ */
        game.scene.getScenes(true).forEach((sc) => {
          if (sc.scene.key !== 'BootScene' && sc.scene.key !== 'PreloadScene') {
            sc.scene.restart();
          }
        });
      };
      const onResize = () => {
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(applyResize, 250);
      };
      window.addEventListener('resize', onResize);
      window.addEventListener('orientationchange', () => setTimeout(applyResize, 350));
    };

    if (document.fonts && document.fonts.load) {
      if (loadingStat) loadingStat.textContent = 'กำลังโหลดฟอนต์ไทย…';
      Promise.all([
        /* รอ Noto Sans Thai ทั้ง 4 weight ที่ใช้ในเกม */
        document.fonts.load('400 16px "Noto Sans Thai"'),
        document.fonts.load('500 16px "Noto Sans Thai"'),
        document.fonts.load('700 16px "Noto Sans Thai"'),
        document.fonts.load('800 16px "Noto Sans Thai"'),
        document.fonts.load('400 16px "Sarabun"'),
        document.fonts.load('700 16px "Sarabun"'),
      ]).then(() => {
        if (loadingStat) loadingStat.textContent = 'พร้อมแล้ว!';
        startGame();
      }).catch(() => {
        /* fallback: รอ document.fonts.ready */
        document.fonts.ready.then(startGame).catch(startGame);
      });
      /* failsafe — ถ้าฟอนต์โหลดนานเกิน 3 วินาที เริ่มเกมเลย */
      setTimeout(startGame, 3000);
    } else {
      startGame();
    }

    document.addEventListener('gesturestart', e => e.preventDefault());
    document.addEventListener('touchmove', e => {
      if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });

  } catch (err) {
    showError(err.message || String(err));
  }
});
