//A little message that consoles that the service worker is at least being loaded
console.log("service worker script started");

//caching files, so this application can be used offline
const FILES_TO_CACHE = [
    "/",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "manifest.webmanifest",
    "index.html",
    "styles.css"
];

//declared caches
//our cache for storing our files
const CACHE_NAME = "static-cache-v2";
//our cache for storing data
const DATA_CACHE_NAME = "data-cache-v1";

// install the service worker when the page loads
self.addEventListener("install", function(event) {
  
  //make the service worker wait
  event.waitUntil(
    
    //open or create our cache
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your files were pre-cached successfully!");
      
      //cache our files that we need
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  //make the service worker stop waiting
  self.skipWaiting();
});

// activate the service worker
//when the page goes active, the service worker will check if the cache needs updating
self.addEventListener("activate", function(event) {
  event.waitUntil(
    
    //find and wait on the keys
    caches.keys().then(keyList => {
      return Promise.all(
        
        //go through all of our caches, and delete ones that are irrelivent
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// fetch our cache from storage
self.addEventListener("fetch", function(event) {
  
  //get the request and see if this service worker needs to do anything
  if (event.request.url.startsWith(self.location.origin)) {
    //if the fetch comes back with it does need to do something, determine what
    //this first will open the current data cache on file, and also try to pull one from the server
    
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            
            //responce 200, the request came back with info, put it up to the app, and also keep a copy for the cache.
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }

            return response;
          })
          .catch(error => {
            
            //some sort of error receiving data? Must be offline or something, search for what we might need in the cache instead
            //and allow the program to still run
            return cache.match(event.request);
          });
          //that didn't work? give us our error
      }).catch(error => console.log(error))
    );

    //end
    return;
}});
