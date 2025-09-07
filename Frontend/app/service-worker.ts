/* eslint-disable @typescript-eslint/no-explicit-any */
// Service Worker
const sw = self as any

// Cache names
const CACHE_NAME = "cyber-incident-feed-v2"
const DATA_CACHE_NAME = "cyber-incident-feed-data-v2"

// URLs to cache
const urlsToCache = [
  "/",
  "/dashboard",
  "/incidents",
  "/alerts",
  "/analytics/trends",
  "/analytics/reports",
  "/analytics/timeline",
  "/analytics/map",
  "/settings",
  "/profile",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-192x192.png",
  "/icons/icon-maskable-512x512.png",
]

// Install event
sw.addEventListener("install", (event: any) => {
  console.log("Service Worker: Installing...")

  // Skip waiting to ensure the new service worker activates immediately
  sw.skipWaiting()

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching app shell...")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Activate event - clean up old caches
sw.addEventListener("activate", (event: any) => {
  console.log("Service Worker: Activating...")

  // Claim clients to ensure the service worker controls all clients immediately
  sw.clients.claim()

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME
          })
          .map((cacheName) => {
            console.log("Service Worker: Clearing old cache:", cacheName)
            return caches.delete(cacheName)
          }),
      )
    }),
  )
})

// Fetch event - network first for API requests, cache first for static assets
sw.addEventListener("fetch", (event: any) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // For API requests, try network first, then fall back to cache
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone()

          // Open cache and store response
          caches.open(DATA_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request)
        }),
    )
  } else {
    // For non-API requests, try cache first, then network
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Cache hit - return the response from the cached version
        if (response) {
          return response
        }

        // Not in cache - fetch from network
        return fetch(event.request).then((networkResponse) => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse
          }

          // Clone the response
          const responseToCache = networkResponse.clone()

          // Open cache and store response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return networkResponse
        })
      }),
    )
  }
})

// Push notification event
sw.addEventListener("push", (event: any) => {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      data: {
        url: data.url || "/",
      },
      actions: [
        {
          action: "view",
          title: "View Details",
        },
      ],
    }

    event.waitUntil(sw.registration.showNotification(data.title, options))
  }
})

// Notification click event
sw.addEventListener("notificationclick", (event: any) => {
  event.notification.close()

  if (event.action === "view" && event.notification.data?.url) {
    event.waitUntil(sw.clients.openWindow(event.notification.data.url))
  } else {
    event.waitUntil(sw.clients.openWindow("/"))
  }
})

export {}

