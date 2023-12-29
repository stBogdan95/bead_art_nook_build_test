'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "5163a2bc9d4debcf0d3a79208b012054",
"assets/AssetManifest.bin.json": "c050728981d130ca8cb4eff8e8693599",
"assets/AssetManifest.json": "bcceb9e3ddacb988656d209637ea885d",
"assets/FontManifest.json": "2cc38742d44c8f4911dbcc923347bf0c",
"assets/fonts/FeatherIcons.ttf": "5fbfe4d58b19943498d0aa4b3bf9d320",
"assets/fonts/InterTight-Black.ttf": "6c9e974eef4d6d7988dca4616cd79d48",
"assets/fonts/InterTight-BlackItalic.ttf": "1cb20185136a4dcbf7ae85ed1218d094",
"assets/fonts/InterTight-Bold.ttf": "d992d45d0373e33b3d75e471af494b7b",
"assets/fonts/InterTight-BoldItalic.ttf": "7e8e429b7d4c775acf71ca91607701cc",
"assets/fonts/InterTight-ExtraBold.ttf": "2b9ea8f49ca23242e25172a4fd06f995",
"assets/fonts/InterTight-ExtraBoldItalic.ttf": "9d319feb5c8af15c95c4f32fb825f362",
"assets/fonts/InterTight-ExtraLight.ttf": "f8f2e25a6c86927cfc3bf7e3c71706e1",
"assets/fonts/InterTight-ExtraLightItalic.ttf": "41ec1486cbe3d35603591b71055191a3",
"assets/fonts/InterTight-Italic.ttf": "45df727fa3ea4b63d7883952f210a886",
"assets/fonts/InterTight-Light.ttf": "a838133e540468c71092d9a071f5e7c8",
"assets/fonts/InterTight-LightItalic.ttf": "c0bfd41835091f6cb6b2ad445ca37e52",
"assets/fonts/InterTight-Medium.ttf": "b4ab32bca9dae366fa7193b1b7bb1b4c",
"assets/fonts/InterTight-MediumItalic.ttf": "babfa3325296dcc5d9473ff21ec113c2",
"assets/fonts/InterTight-Regular.ttf": "6c7bcaa885b5c58fe97d7f025e26bd30",
"assets/fonts/InterTight-SemiBold.ttf": "701cf433d42ef71e28080e88d58354e1",
"assets/fonts/InterTight-SemiBoldItalic.ttf": "e0b43fd9b66d7ef6f5a459751119a686",
"assets/fonts/InterTight-Thin.ttf": "0d30450031845dab0d691219ece4ee2f",
"assets/fonts/InterTight-ThinItalic.ttf": "e7ebe282bec6b64cc00725518c776f88",
"assets/images/svg/logo.svg": "8fee18508552c49a1e4792c8b8c5fa91",
"assets/images/svg/no_bg_logo.svg": "010641d01f91f34f535d14663b1bfd45",
"assets/NOTICES": "104afd26daafae9536796edd2e0f6c89",
"assets/shaders/ink_sparkle.frag": "4096b5150bac93c41cbc9b45276bd90f",
"canvaskit/canvaskit.js": "eb8797020acdbdf96a12fb0405582c1b",
"canvaskit/canvaskit.wasm": "73584c1a3367e3eaf757647a8f5c5989",
"canvaskit/chromium/canvaskit.js": "0ae8bbcc58155679458a0f7a00f66873",
"canvaskit/chromium/canvaskit.wasm": "143af6ff368f9cd21c863bfa4274c406",
"canvaskit/skwasm.js": "87063acf45c5e1ab9565dcf06b0c18b8",
"canvaskit/skwasm.wasm": "2fc47c0a0c3c7af8542b601634fe9674",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"flutter.js": "59a12ab9d00ae8f8096fffc417b6e84f",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "02cabde75d2e2869d06316bbb4fb7214",
"/": "02cabde75d2e2869d06316bbb4fb7214",
"main.dart.js": "404bdfaca517291bd1fdc3053852a5f0",
"manifest.json": "cd07f125052a867524badeaa2c3d6c9a",
"version.json": "3ae1f8ec8749836cea87c35fefd79d5d"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
