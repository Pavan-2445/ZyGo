import { useMemo } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Card from '../ui/Card'

const knownCityCoordinates = {
  hyderabad: [17.385, 78.4867],
  secunderabad: [17.4399, 78.4983],
  nalgonda: [17.0575, 79.2684],
  suryapet: [17.1405, 79.6207],
  miryalaguda: [16.8722, 79.5625],
  kodad: [17.0003, 79.9656],
  khammam: [17.2473, 80.1514],
  warangal: [17.9689, 79.5941],
  hanamkonda: [18.0058, 79.5577],
  guntur: [16.3067, 80.4365],
  vijayawada: [16.5062, 80.648],
  bza: [16.5062, 80.648],
  bezawada: [16.5062, 80.648],
  vja: [16.5062, 80.648],
  ongole: [15.5057, 80.0499],
  chirala: [15.823, 80.3522],
  tenali: [16.243, 80.64],
  eluru: [16.7107, 81.0952],
  nellore: [14.4426, 79.9865],
  rajahmundry: [16.9891, 81.7787],
  kakinada: [16.9891, 82.2475],
  visakhapatnam: [17.6868, 83.2185],
  vizag: [17.6868, 83.2185],
  tirupati: [13.6288, 79.4192],
  kurnool: [15.8281, 78.0373],
  delhi: [28.6139, 77.209],
  'new delhi': [28.6139, 77.209],
  chandigarh: [30.7333, 76.7794],
  shimla: [31.1048, 77.1734],
  dehradun: [30.3165, 78.0322],
  lucknow: [26.8467, 80.9462],
  kanpur: [26.4499, 80.3319],
  varanasi: [25.3176, 82.9739],
  patna: [25.5941, 85.1376],
  guwahati: [26.1445, 91.7362],
  kolkata: [22.5726, 88.3639],
  bhubaneswar: [20.2961, 85.8245],
  ranchi: [23.3441, 85.3096],
  raipur: [21.2514, 81.6296],
  bhopal: [23.2599, 77.4126],
  indore: [22.7196, 75.8577],
  mumbai: [19.076, 72.8777],
  pune: [18.5204, 73.8567],
  nagpur: [21.1458, 79.0882],
  nashik: [19.9975, 73.7898],
  surat: [21.1702, 72.8311],
  ahmedabad: [23.0225, 72.5714],
  vadodara: [22.3072, 73.1812],
  jaipur: [26.9124, 75.7873],
  udaipur: [24.5854, 73.7125],
  jodhpur: [26.2389, 73.0243],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  mysuru: [12.2958, 76.6394],
  mangaluru: [12.9141, 74.856],
  chennai: [13.0827, 80.2707],
  coimbatore: [11.0168, 76.9558],
  madurai: [9.9252, 78.1198],
  kochi: [9.9312, 76.2673],
  kochin: [9.9312, 76.2673],
  thiruvananthapuram: [8.5241, 76.9366],
  trivandrum: [8.5241, 76.9366],
  goa: [15.2993, 74.124],
  panaji: [15.4909, 73.8278],
}

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export function getRoutePreviewMetrics(route = []) {
  const stops = route
    .map((name, index) => ({
      name,
      coords: resolveCoords(name, index),
    }))
    .filter((stop) => Array.isArray(stop.coords))

  return {
    stops,
    totalDistance: getTotalDistance(stops),
  }
}

export default function RouteMap({ route = [], height = '420px' }) {
  const { stops, totalDistance } = useMemo(() => getRoutePreviewMetrics(route), [route])

  const positions = stops.map((stop) => stop.coords)
  const center = positions[0] || [20.5937, 78.9629]

  if (route.length < 2) {
    return <Card className="text-sm text-slate-500">Add source and destination to preview the route map.</Card>
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-soft">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-display text-xl font-semibold text-slate-950">Route Preview</h2>
        <p className="mt-1 text-sm text-slate-600">
          {stops.length} stops mapped with OpenStreetMap. Approx. distance: {totalDistance.toFixed(1)} km
        </p>
      </div>
      <MapContainer center={center} zoom={6} style={{ height, width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stops.map((stop, index) => (
          <Marker key={`${stop.name}-${index}`} position={stop.coords} icon={markerIcon}>
            <Popup>{stop.name}</Popup>
          </Marker>
        ))}

        {positions.length > 1 && <Polyline positions={positions} color="#2563eb" weight={5} opacity={0.8} />}
      </MapContainer>
    </div>
  )
}

function normalizeCityName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
}

function resolveCoords(name, index) {
  const key = normalizeCityName(name)
  if (knownCityCoordinates[key]) return knownCityCoordinates[key]

  const seed = Array.from(key).reduce((total, char) => total + char.charCodeAt(0), 0)
  const lat = 8 + (seed % 2500) / 100
  const lng = 68 + ((seed + index * 13) % 3000) / 100
  return [Number(lat.toFixed(4)), Number(lng.toFixed(4))]
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function getTotalDistance(stops) {
  let totalDistance = 0

  for (let index = 0; index < stops.length - 1; index += 1) {
    totalDistance += getDistance(
      stops[index].coords[0],
      stops[index].coords[1],
      stops[index + 1].coords[0],
      stops[index + 1].coords[1],
    )
  }

  return totalDistance
}
