export interface TileProviderOptions { subdomains?: string[]; maxZoom?: number; minZoom?: number; attribution?: string }

export abstract class BaseTileProvider {
  protected options: TileProviderOptions
  constructor(options: TileProviderOptions = {}) { this.options = { subdomains: ['a', 'b', 'c'], maxZoom: 18, minZoom: 0, ...options } }
  abstract getTileUrl(x: number, y: number, z: number): string
  getMaxZoom(): number { return this.options.maxZoom || 18 }
  getMinZoom(): number { return this.options.minZoom || 0 }
}

export class XYZTileProvider extends BaseTileProvider {
  private urlTemplate: string
  constructor(urlTemplate: string, options: TileProviderOptions = {}) { super(options); this.urlTemplate = urlTemplate }
  getTileUrl(x: number, y: number, z: number): string {
    const s = this.options.subdomains?.[Math.abs(x + y) % (this.options.subdomains?.length || 1)] || ''
    return this.urlTemplate.replace('{x}', String(x)).replace('{y}', String(y)).replace('{z}', String(z)).replace('{s}', s)
  }
}

export class AmapTileProvider extends BaseTileProvider {
  getTileUrl(x: number, y: number, z: number): string {
    const s = ((x + y) % 4) + 1
    return `https://webrd0${s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=${x}&y=${y}&z=${z}`
  }
}

export class TiandituTileProvider extends BaseTileProvider {
  private token: string
  constructor(token: string, options: TileProviderOptions = {}) { super(options); this.token = token }
  getTileUrl(x: number, y: number, z: number): string {
    const s = ((x + y) % 8)
    return `https://t${s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL=${x}&TILEROW=${y}&TILEMATRIX=${z}&tk=${this.token}`
  }
}
