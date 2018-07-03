const cacheName = 'converter-1'
const filesToCache = [
  '/',
  'styles/app.css',
  'scripts/app.js',
  'scripts/idb.js',
  'https://free.currencyconverterapi.com/api/v5/currencies'
]

addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(filesToCache))
  )
})

addEventListener('fetch', event => { //return a copy from the cache or fire a new request
  event.respondWith(
    caches.match(event.request)
    .then(res => {
      if (res) return res
      else {
        return fetch(event.request)
          .then(res => {
            if (event.request.url.startsWith('https://free.currencyconverterapi.com/api/v5/convert')) return res //don't cache requests to the API
            return caches.open(cacheName)
              .then(cache => {
                cache.put(event.request.url, res.clone()) //save the response for future
                return res // return the fetched data
              })
          })
      }
    })
  )
})