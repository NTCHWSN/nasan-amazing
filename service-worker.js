const CACHE_NAME = 'nasan-amazing-v1.0.0-pwa-20260523';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './offline.html',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './vendor/phaser.min.js',
  './src/config.js',
  './src/data/DialogueData.js',
  './src/data/DungeonData.js',
  './src/main.js',
  './src/scenes/AssetTestScene.js',
  './src/scenes/BattleScene.js',
  './src/scenes/BattleTestScene.js',
  './src/scenes/BootScene.js',
  './src/scenes/DungeonExploreScene.js',
  './src/scenes/DungeonIntroScene.js',
  './src/scenes/EndingScene.js',
  './src/scenes/HubVillageScene.js',
  './src/scenes/LearnScene.js',
  './src/scenes/PreloadScene.js',
  './src/scenes/QuestionTestScene.js',
  './src/scenes/TitleScene.js',
  './src/systems/PlaceholderFactory.js',
  './src/systems/QuestionGenerator.js',
  './src/systems/SaveManager.js',
  './src/systems/SoundManager.js',
  './src/systems/TriangleRenderer.js',
  './src/ui/NumberPad.js',
  './src/ui/TextStyle.js',
  './src/ui/UIButton.js',
  './src/ui/VirtualJoystick.js',
  './assets/images/backgrounds/bg_d1.jpg',
  './assets/images/backgrounds/bg_d10.jpg',
  './assets/images/backgrounds/bg_d2.jpg',
  './assets/images/backgrounds/bg_d3.jpg',
  './assets/images/backgrounds/bg_d4.jpg',
  './assets/images/backgrounds/bg_d5.jpg',
  './assets/images/backgrounds/bg_d6.jpg',
  './assets/images/backgrounds/bg_d7.jpg',
  './assets/images/backgrounds/bg_d8.jpg',
  './assets/images/backgrounds/bg_d9.jpg',
  './assets/images/bosses/boss_d1.png',
  './assets/images/bosses/boss_d10.png',
  './assets/images/bosses/boss_d2.png',
  './assets/images/bosses/boss_d3.png',
  './assets/images/bosses/boss_d4.png',
  './assets/images/bosses/boss_d5.png',
  './assets/images/bosses/boss_d6.png',
  './assets/images/bosses/boss_d7.png',
  './assets/images/bosses/boss_d8.png',
  './assets/images/bosses/boss_d9.png',
  './assets/images/characters/durian_sheet.png',
  './assets/images/characters/ngoh_sheet.png',
  './assets/images/characters/plameng_sheet.png',
  './assets/images/dungeons/dungeon_d1.png',
  './assets/images/dungeons/dungeon_d10.png',
  './assets/images/dungeons/dungeon_d2.png',
  './assets/images/dungeons/dungeon_d3.png',
  './assets/images/dungeons/dungeon_d4.png',
  './assets/images/dungeons/dungeon_d5.png',
  './assets/images/dungeons/dungeon_d6.png',
  './assets/images/dungeons/dungeon_d7.png',
  './assets/images/dungeons/dungeon_d8.png',
  './assets/images/dungeons/dungeon_d9.png',
  './assets/images/items/item_book.png',
  './assets/images/items/item_compass.png',
  './assets/images/items/item_lantern.png',
  './assets/images/items/item_rambutan.png',
  './assets/images/npcs/npc_lost_child.png',
  './assets/images/npcs/npc_merchant.png',
  './assets/images/npcs/npc_ranger.png',
  './assets/images/npcs/npc_village_chief.png',
  './assets/images/props/prop_old_machine.png',
  './assets/images/props/prop_signboard.png',
  './assets/images/ui/bg_ending.png',
  './assets/images/ui/bg_hub.png',
  './assets/images/ui/bg_title.png',
  './assets/images/ui/frame_modal.png',
  './assets/images/ui/icon_heart.png',
  './assets/images/ui/icon_star.png',
  './assets/images/ui/logo_game.png',
  './assets/images/ui/start_game.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('nasan-amazing-') && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
            }
            return networkResponse;
          })
          .catch(() => caches.match('./offline.html'));
      })
  );
});
