'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "4f2c8eb4abc4a471841212acc73432ca",
"assets/AssetManifest.bin.json": "9e6c0fa0c161d2f0cefba05586a050a4",
"assets/AssetManifest.json": "b2f8e2bed523da5468c8b8b2820a65c8",
"assets/FontManifest.json": "238b959cbcd9c84c77e01e5eebebac9e",
"assets/fonts/FeatherIcons.ttf": "5fbfe4d58b19943498d0aa4b3bf9d320",
"assets/fonts/InterTight-Italic.ttf": "45df727fa3ea4b63d7883952f210a886",
"assets/fonts/InterTight-Light.ttf": "a838133e540468c71092d9a071f5e7c8",
"assets/fonts/InterTight-LightItalic.ttf": "c0bfd41835091f6cb6b2ad445ca37e52",
"assets/fonts/InterTight-Medium.ttf": "b4ab32bca9dae366fa7193b1b7bb1b4c",
"assets/fonts/InterTight-MediumItalic.ttf": "babfa3325296dcc5d9473ff21ec113c2",
"assets/fonts/InterTight-Regular.ttf": "6c7bcaa885b5c58fe97d7f025e26bd30",
"assets/images/svg/flag_en.svg": "7528539fbb22eb009e713fcb4c5db67e",
"assets/images/svg/flag_pl.svg": "de624bb2e4c4d51df392a49d8a213b7a",
"assets/images/svg/flag_uk.svg": "569161651d3b2edd7cc39cc988b2a86e",
"assets/images/svg/logo.svg": "010641d01f91f34f535d14663b1bfd45",
"assets/images/svg/logo_outline.svg": "c23752ed5225225a0285dc2a7f152d74",
"assets/json_data/header_menu.json": "c0f0e2be01cabbbff63a4edcdad4539e",
"assets/NOTICES": "104afd26daafae9536796edd2e0f6c89",
"assets/shaders/ink_sparkle.frag": "4096b5150bac93c41cbc9b45276bd90f",
"css/spinner.css": "9cb67234f86ada738082b13c96479e27",
"icons/120x120.png": "68a611b1553aa11405488acba70f2170",
"icons/128x128.png": "87be6b2cf6ed19f837ec7421afa07945",
"icons/144x144.png": "44f536cf8164c533d598dfbece889b12",
"icons/152x152.png": "64b60464f087a2d6ad0f2e9a2fcca424",
"icons/16x16.png": "d89005157d192f8280654c107ebdafd7",
"icons/180x180.png": "9996658f35d4f2b05bf88a9a533b1d86",
"icons/192x192.png": "df0f088c238384c0f5763b838f7dc367",
"icons/32x32.png": "94b56ac2a29235b35ac6702236556004",
"icons/384x384.png": "082a414446e77fcb56af085172899912",
"icons/512x512.png": "34a6f51a8589db7ac557f807128a73d2",
"icons/72x72.png": "e3f66a315af72c7b75ba2afb2df0176d",
"icons/96x96.png": "f8b133dea990378750c42e299c34eaa3",
"index.html": "181329b748b7009da41434e60633e6f7",
"/": "181329b748b7009da41434e60633e6f7",
"main.dart.js": "56d81113fb91fb823597dc24f858d656",
"manifest.json": "d73a9cafb3b02b290178116f70187b19",
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
