# 🎮 นาสารอเมซิ่ง! คดีลึกลับสามเหลี่ยมพีทาโกรัส
### *Na San Amazing: The Pythagorean Triangle Mystery*

เกม 2D Top-down RPG + Math Puzzle สอน **ทฤษฎีบทพีทาโกรัส** สำหรับ **นักเรียน ม.2**
สร้างด้วย **Phaser.js 3.70+** เล่นบนเบราว์เซอร์มือถือ/แท็บเล็ต/PC

---

## 📂 โครงสร้างโฟลเดอร์

```
เกม/
├── index.html                  ← ไฟล์เปิดเล่นในเบราว์เซอร์ (สร้าง Step 2)
├── README.md                   ← ไฟล์นี้
│
├── src/                        ← โค้ดทั้งหมด
│   ├── scenes/                 ← 13 ฉากของเกม
│   ├── systems/                ← ระบบกลาง (สุ่มโจทย์, gameState, ฯลฯ)
│   ├── ui/                     ← UI components (numberPad, hpBar, dialogue)
│   └── data/                   ← ข้อมูลคงที่ (บทพูด, ชุดเลข)
│
├── assets/
│   ├── images/
│   │   ├── characters/         ← น้องเงาะ, น้องทุเรียน, น้องปลาเม็ง
│   │   ├── bosses/             ← บอส 4 ตัว
│   │   ├── backgrounds/        ← น้ำตก, ถ้ำขมิ้น, ริมคลองฉวาง
│   │   ├── ui/                 ← ปุ่ม, โลโก้, หัวใจ, ดาว
│   │   └── triangles/          ← รูปสามเหลี่ยมประกอบโจทย์
│   └── audio/
│       ├── bgm/                ← เพลงพื้นหลัง
│       └── sfx/                ← เอฟเฟกต์เสียง
│
├── docs/                       ← เอกสารออกแบบ (GDD, Asset Prompts ฯลฯ)
├── dist/                       ← ใช้ตอน Step 12 build .zip
│
├── model/                      ← (โฟลเดอร์ต้นฉบับของครู — ภาพตัวละคร)
└── แผนที่/                     ← (โฟลเดอร์ต้นฉบับของครู — แผนที่)
```

---

## 🎯 ความก้าวหน้า

- [x] **Step 1** สร้างโครงสร้างโฟลเดอร์
- [x] **Step 2** สร้าง index.html
- [x] **Step 3** TitleScreen
- [x] **Step 4** Placeholder assets
- [x] **Step 5** ระบบสุ่มโจทย์
- [x] **Step 6** BattleScene + Number Pad
- [x] **Step 7** HubVillage + Virtual Joystick
- [x] **Step 8** 4 Dungeons + 4 Bosses (cutscene + dialogue + ambient particles)
- [x] **Step 9** เชื่อมทุกฉาก + EndingScene
- [x] **Step 10** ทดสอบ + แก้บัค (10 ด่านเนื้อหาจริง)
- [x] **Step 11** Local server (start-server.bat/.sh)
- [x] **Step 12** Build .zip + เอกสาร OBEC

---

## 👦👧 ตัวเอก

| ตัวละคร | คลาส | หน้าที่ | ไฟล์ |
|---|---|---|---|
| 🍎 น้องเงาะ | Wizard | คำนวณ **c** | `assets/images/characters/ngoh_sheet.png` |
| 🌰 น้องทุเรียน | Priest | คำนวณ **a / b** | `assets/images/characters/durian_sheet.png` |
| 🐟 น้องปลาเม็ง | Knight | พิสูจน์ **บทกลับ** | `assets/images/characters/plameng_sheet.png` |

## 🏞️ ดันเจี้ยน

| ลำดับ | สถานที่ | บอส | ไฟล์ฉาก |
|---|---|---|---|
| 1 | น้ำตกใต้ร่มเย็น | ผีน้ำตกตาเบลอ | `dungeon1_waterfall.png` |
| 2 | ถ้ำขมิ้น | ค้างคาวฮีโร่หูเอียง | `dungeon2_khammin.png` |
| 3 | เนินทรายเหมืองแกะ | ยักษ์ทรายผ้าขนหนู | _(ยังไม่มี)_ |
| Final | ตลาดริมคลองฉวาง | มิสเตอร์ X จอมเบี้ยว | `final_market_chawang.png` |

---

## 🚀 วิธีเล่น (จะอัพเดทหลัง Step 11)

ตอนนี้ยังเป็นโครงเปล่า เปิดเล่นไม่ได้
รอ Step 2 สร้าง `index.html` ก่อนค่ะ

---

## ⚔️ Step 6 — Battle System (เพิ่งเสร็จ!)

### ไฟล์ใหม่ที่สร้าง
- `src/ui/NumberPad.js` — แป้นกดตัวเลข 0-9 + ⌫ + C + ✓ (ใหญ่ touch-friendly)
- `src/scenes/BattleScene.js` — ฉากต่อสู้บอส รับโจทย์จาก QuestionGenerator
- `src/scenes/BattleTestScene.js` — เมนูทดสอบเลือกบอส + ความยาก

### วิธีทดสอบ
1. เปิด `index.html` ในเบราว์เซอร์ (Chrome/Edge แนะนำ)
2. ที่ Title Screen → กดปุ่ม `⚔️ Battle` มุมขวาล่าง
3. เลือก difficulty + บอส → กด **ลุย!**
4. ตอบโจทย์ในแป้นตัวเลข → กด ✓
   - ✅ ตอบถูก → บอส HP -1 + สั่น + ไปโจทย์ถัดไป
   - ❌ ตอบผิด → ปาร์ตี้ HP -1 + เฉลย
   - ⏱ หมดเวลา → ปาร์ตี้ HP -1

### ระบบที่ทำเสร็จ
- ✅ HP บอส (3-5 ขึ้นกับความยาก) + HP ปาร์ตี้ (3-5)
- ✅ Timer (45-90 วินาทีตามความยาก) — เปลี่ยนสีเตือนเมื่อใกล้หมด
- ✅ ปุ่ม Hint (จำนวนจำกัดตามความยาก)
- ✅ Modal ชนะ/แพ้/ออก
- ✅ Floating text feedback ("โจมตี! -1 HP", "ผิด! เฉลย:...")
- ✅ NumberPad flash เขียว/แดง + ปุ่มสั่น
- ✅ Anti-เลขศูนย์นำ + กันค่าว่าง

### ตรวจสอบแล้ว
- ✅ Node syntax check ผ่านทั้ง 14 ไฟล์
- ✅ QuestionGenerator unit test 91/92 ผ่าน
- ✅ Scene class registration ครบ 7 ฉาก

---

## 🏘 Step 7 — HubVillage + Virtual Joystick (เพิ่งเสร็จ!)

### ไฟล์ใหม่
- `src/ui/VirtualJoystick.js` — joystick analog ซ้ายล่าง (touch + mouse)
- `src/scenes/HubVillageScene.js` — หมู่บ้านนาสาร แผนที่ 2000×1500 + camera follow

### Flow เกมที่ใช้ได้แล้ว
```
TitleScene  →  [เริ่มเกม]  →  HubVillageScene
                                ↓
                          เดินไปป้าย Boss + กด E/เข้า
                                ↓
                            BattleScene
                                ↓
                          ชนะ/แพ้ → HubVillageScene
                          (บอสที่ชนะแล้ว = ป้ายขึ้น ✓)
```

### Controls
- 🕹 **Joystick** ซ้ายล่าง — ลากเดิน 360°
- ⌨ **WASD** หรือ **ลูกศร** — เดินด้วยคีย์บอร์ด (PC)
- **E** หรือ **Space** — เข้าดันเจี้ยน (เมื่อใกล้ป้าย)
- ปุ่ม **เข้า ▶** มุมขวาล่าง — เข้าผ่าน touch

### 4 ดันเจี้ยนในแผนที่
- 💧 น้ำตกใต้ร่มเย็น (find_c) — มุมซ้ายบน
- 🦇 ถ้ำขมิ้น (find_leg) — มุมขวาบน
- 🏜 เนินทรายเหมืองแกะ (converse) — มุมซ้ายล่าง
- 🛒 ตลาดริมคลองฉวาง (mixed) — มุมขวาล่าง

### ตรวจสอบแล้ว
- ✅ Syntax: 16/16 ไฟล์ผ่าน
- ✅ Smoke: 8 ฉาก + 6 utility object โหลดได้
- ✅ Scene flow: HubVillage ↔ Battle ส่ง returnData ครบ (จดบอสที่ชนะแล้ว)

---

## 🎭 Step 8 — 4 Dungeons + 4 Bosses Polish (เพิ่งเสร็จ!)

### ไฟล์ใหม่
- `src/data/DialogueData.js` — บทพูดเปิด/เย้ย/แพ้/ชนะ แยกตามบอส 4 ตัว
- `src/scenes/DungeonIntroScene.js` — Cutscene ก่อนต่อสู้ + boss reveal animation

### ความแตกต่างของ 4 ดันเจี้ยน

| Dungeon | บอส | ประเภทโจทย์ | Particle Effect | ตัวเอกหลัก |
|---|---|---|---|---|
| 💧 น้ำตกใต้ร่มเย็น | ผีตาเบลอ | find_c | หยดน้ำตกลงในแนวดิ่ง | น้องเงาะ 🍎 |
| 🦇 ถ้ำขมิ้น | ค้างคาวหูเอียง | find_leg | ค้างคาวบินผ่านจอ | น้องทุเรียน 🌰 |
| 🏜 เนินทรายเหมืองแกะ | ยักษ์ผ้าขนหนู | converse | ผงทรายลอย | น้องปลาเม็ง 🐟 |
| 🛒 ตลาดริมคลองฉวาง | มิสเตอร์ X | mixed | ประกายไฟ ✨ | ทั้ง 3 คน |

### Flow ใหม่
```
HubVillage → กดป้ายดันเจี้ยน → DungeonIntroScene
                                  ↓
                          [Cutscene + dialogue 3-5 บท]
                          [กดข้าม ▶▶ เพื่อข้าม]
                                  ↓
                          [ปุ่ม "เริ่มต่อสู้ ⚔️"]
                                  ↓
                              BattleScene
                          (มี ambient particles
                           + boss taunt เมื่อตอบผิด)
                                  ↓
                          ชนะ/แพ้ → กลับ HubVillage
```

### Feature ใหม่ใน BattleScene
- 💬 **Boss taunt** — บอสจะพูดเย้ยเมื่อตอบผิด (สุ่มจาก DialogueData.bossTaunts)
- ✨ **Ambient particles** — แต่ละบอสมี effect ต่างกัน
- 🏆 **Victory dialogue** — ข้อความชนะใช้คำพูดจาก DialogueData.victory

### Typewriter effect
- ใน DungeonIntroScene บทพูดพิมพ์ทีละตัวอักษร (22ms/ตัว)
- กดอีกครั้งเพื่อแสดงทั้งบทพูดทันที (skip typing)
- บอสพูด → กล้องสั่นเบาๆ

### ตรวจสอบแล้ว
- ✅ 18/18 ไฟล์ syntax check ผ่าน
- ✅ 9 ฉาก + 7 utility object/data register ครบ
- ✅ DialogueData API ทำงานถูกต้อง (forBoss, randomTaunt, intro)

---

## 🏘 Step 9.5 — ขยายเป็น 10 ด่าน + ระบบล็อกลำดับ (เพิ่งเสร็จ!)

### ไฟล์ใหม่ 3 ไฟล์
- `src/systems/SaveManager.js` — บันทึก/โหลด progress ใน localStorage
- `src/data/DungeonData.js` — ข้อมูล 10 ด่าน (ด่าน 1 เต็ม + 9 placeholder)
- `src/scenes/DungeonExploreScene.js` — มินิแมพในด่าน (เดินหา 3-5 จุดแสตมป์)

### Refactor
- `HubVillageScene` — แสดง 10 ป้าย, ล็อกตามลำดับ (🔒), checkmark ✓ บนด่านที่ผ่าน
- `DungeonIntroScene` — อ่าน dialogue จาก DungeonData → DungeonExploreScene
- `BattleScene._win` — เรียก `SaveManager.markCompleted()` อัตโนมัติ
- `TitleScene` — ปุ่ม "🎓 Teacher" มุมซ้ายล่าง + ถาม "เล่นต่อ/เริ่มใหม่"

### 10 ด่าน
| # | สถานที่ | สถานะ |
|---|---|---|
| 1 | 🍎 เงาะต้นแรกโรงเรียนนาสาร | ✅ เนื้อเรื่อง+คำถามเต็ม |
| 2 | 🌉 สะพานแคบนาสาร | ⏳ placeholder |
| 3 | 🛒 ริมคลองฉวาง | ⏳ |
| 4 | 🙏 เจ้าแม่กวนอิม | ⏳ |
| 5 | 🦇 ถ้ำขมิ้น | ⏳ |
| 6 | 💧 น้ำตกเหมืองทวด | ⏳ |
| 7 | 🌊 น้ำตกดาดฟ้า | ⏳ |
| 8 | ⛰ ภูเขาเหมืองแกะ | ⏳ |
| 9 | 🏞 อุทยานแห่งชาติใต้ร่มเย็น | ⏳ |
| 10 | 👑 โครงการจุฬาภรณ์พัฒนา 8 | ⏳ |

### Flow ของด่าน 1 (ต้นแบบ)
```
HubVillage → กดป้ายด่าน 1 (เงาะต้นแรก)
   ↓
DungeonIntroScene (cutscene 5 บท)
   ↓
DungeonExploreScene (มินิแมพ 1800×1200)
   ├── จุด 1: ป้ายประวัติ (Quiz: เงาะค้นพบปีไหน?)
   ├── จุด 2: วัดความสูงต้นเงาะ (Math: หา b)
   ├── จุด 3: สวนเงาะ (Math: หา c แนวทแยง)
   └── จุด 4: เด็กหลงทาง (Roleplay: เลือกวิธีช่วย)
   ↓ (ครบ 4 จุด)
BattleScene (ฟาดบอสประจำด่าน + 3 คำถาม)
   ↓
SaveManager.markCompleted('d1') → ปลดล็อกด่าน 2
   ↓
กลับ HubVillage
```

### Teacher Mode
- ปุ่ม **🎓 Teacher** มุมซ้ายล่างของ Title screen
- กรอก **1234** → ปลดล็อกทุกด่าน (ไม่ต้องเล่นตามลำดับ)
- กดปิดโหมด → กลับโหมดนักเรียน (currentDungeon รีเซ็ตตามที่ผ่านจริง)

### Save / Load
- บันทึกอัตโนมัติทุกครั้งที่ผ่านด่าน (localStorage)
- ปุ่ม "เริ่มเกม" จะถาม **เล่นต่อ** / **เริ่มใหม่** ถ้ามีเซฟ
- รีเซ็ตทั้งหมดเมื่อกด "เริ่มใหม่"

### Multi-choice ใน DungeonExploreScene
- โหมด **inline**: คำถาม 4 ตัวเลือก A-D ตอบถูกผ่าน
- โหมด **math**: ใช้ NumberPad ใส่ตัวเลข
- โหมด **roleplay**: เลือกได้หลายแบบ ทุกแบบผ่าน + ได้ followUp dialogue ต่าง ๆ กัน

### ตรวจสอบแล้ว
- ✅ 22 ไฟล์ syntax check ผ่าน
- ✅ 21/21 ไฟล์โหลดเข้า context สำเร็จ
- ✅ 8/8 functional tests ผ่าน (SaveManager + DungeonData APIs)

---

## 🏞 Step 10 — เติม 10 ด่านเต็ม + ใช้ฟอนต์ Mali/Mitr/Chakra Petch

### ฟอนต์ใหม่
- **Mali** — Heading น่ารักกลม ๆ
- **Mitr** — Body อ่านง่ายทันสมัย
- **Chakra Petch** — Mono ตัวเลข/สูตร

### 10 ด่านครบเนื้อหา
| # | สถานที่จริง | จุดในด่าน | ประเภทบอส |
|---|---|---|---|
| 1 | 🍎 เงาะโรงเรียนต้นแรก | 4 (ป้าย+วัดต้น+สวน+ช่วยเด็ก) | หา c |
| 2 | 🌉 สะพานแคบนาสาร | 3 (ป้าย+ความยาว+เสา) | หา c |
| 3 | 🛒 ริมคลองฉวาง | 3 (ป้าย+ระยะข้าม+ตลาด) | หา a/b |
| 4 | 🙏 เจ้าแม่กวนอิม | 3 (ป้าย+หลังคา+โคม) | หา c |
| 5 | 🦇 ถ้ำขมิ้น | 3 (ป้าย+ความลึก+แสง) | หา a/b |
| 6 | 💧 น้ำตกเหมืองทวด | 3 (ป้าย+ชั้นน้ำตก+สวิตช์) | หา c |
| 7 | 🌊 น้ำตกดาดฟ้า | 3 (ป้าย+ปีน+วิว) | หา a/b |
| 8 | ⛰ ภูเขาทรายเหมืองแกะ | 3 (ป้าย+เนิน+แคนยอน) | บทกลับ |
| 9 | 🏞 อุทยานใต้ร่มเย็น | 4 (ป้าย+ลาดตระเวน+บัวผุด+เลือก) | ผสม (hard) |
| 10 | 👑 จุฬาภรณ์พัฒนา 8 | 4 (ป้าย+แปลง+ท่องเที่ยว+อาชีพ) | ผสม (hard) |

### ตรวจสอบ
- ✅ 33 sub-point quizzes — Pythagorean triples ทุกข้อ ได้จำนวนเต็ม
- ✅ เนื้อหา intro/lore/sub-points อิงประวัติจริงทุกด่าน
- ✅ ผสม 3 รูปแบบคำถาม: inline (multiple-choice), math (NumberPad), roleplay
- ✅ 21/21 ไฟล์ syntax + load ผ่านทั้งหมด
