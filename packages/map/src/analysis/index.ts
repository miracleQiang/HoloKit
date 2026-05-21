const EARTH_RADIUS = 6371000

export function toRadians(degrees: number): number { return degrees * (Math.PI / 180) }
export function toDegrees(radians: number): number { return radians * (180 / Math.PI) }

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function pointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export function bufferPoint(lat: number, lng: number, radiusMeters: number, segments = 64): [number, number][] {
  const points: [number, number][] = []
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const dLat = (radiusMeters / EARTH_RADIUS) * Math.cos(angle)
    const dLng = (radiusMeters / (EARTH_RADIUS * Math.cos(toRadians(lat)))) * Math.sin(angle)
    points.push([lng + toDegrees(dLng), lat + toDegrees(dLat)])
  }
  points.push(points[0])
  return points
}

export function polygonArea(polygon: [number, number][]): number {
  let area = 0
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    area += (polygon[j][0] + polygon[i][0]) * (polygon[j][1] - polygon[i][1])
  }
  return Math.abs(area / 2)
}

export function lineIntersects(a1: [number, number], a2: [number, number], b1: [number, number], b2: [number, number]): boolean {
  const det = (a2[0] - a1[0]) * (b2[1] - b1[1]) - (a2[1] - a1[1]) * (b2[0] - b1[0])
  if (det === 0) return false
  const t = ((b1[0] - a1[0]) * (b2[1] - b1[1]) - (b1[1] - a1[1]) * (b2[0] - b1[0])) / det
  const u = -((a2[0] - a1[0]) * (b1[1] - a1[1]) - (a2[1] - a1[1]) * (b1[0] - a1[0])) / det
  return t >= 0 && t <= 1 && u >= 0 && u <= 1
}
