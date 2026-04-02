const mapsCache = {
  promise: null,
}

export function loadGoogleMaps() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (window.google?.maps) return Promise.resolve(window.google.maps)
  if (mapsCache.promise) return mapsCache.promise

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) return Promise.resolve(null)

  mapsCache.promise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.google.maps)
    script.onerror = () => reject(new Error('Unable to load Google Maps.'))
    document.head.appendChild(script)
  })

  return mapsCache.promise
}
