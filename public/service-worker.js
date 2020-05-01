//A little message that consoles that the service worker is at least being loaded
console.log("service worker script started");

//caching files, so this application can be used offline
const FILE_CACHE = [
    "/",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "manifest.webmanifest",
    "index.html",
    "styles.css"
];

//some control variables
const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

//install the required files into the cache
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(PRECACHE)
            .then(cache => cache.addAll(FILE_CACHE))
                .then(self.skipWaiting())
    );
});

//An event that will help clean up the cache
self.addEventListener("activate", event => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches.keys().then(cachNames => {
            return cachNames.filter(CacheName => !currentCaches.includes(cachNames));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

//if there is a connection to the database then have the fetch event run as normal, if not, return what is stored in the cache
self.addEventListener("fetch", event => {
    if(event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if(cachedResponse){
                    return cachedResponse;
                }

                return caches.open(RUNTIME).then(cache => {
                    return fetch(event.request).then(response => {
                        return cache.put(event.request, response.clone()).then(() =>{
                            return response;
                        });
                    });
                });
            })
        );
    }
});