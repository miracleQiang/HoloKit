import { vi } from 'vitest'

vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(() => {
      const canvas = document.createElement('canvas')
      return {
        domElement: canvas,
        setSize: vi.fn(),
        setPixelRatio: vi.fn(),
        render: vi.fn(),
        dispose: vi.fn(),
        getContext: vi.fn(),
        getRenderTarget: vi.fn(),
        setRenderTarget: vi.fn(),
        clear: vi.fn(),
        setClearColor: vi.fn(),
        getSize: vi.fn().mockReturnValue({ width: 800, height: 600 }),
        getPixelRatio: vi.fn().mockReturnValue(1),
        shadowMap: { enabled: false },
        outputColorSpace: 'srgb',
        toneMapping: 0,
        info: { render: { triangles: 0, calls: 0 } },
      }
    }),
  }
})

vi.mock('three/addons/controls/OrbitControls.js', () => ({
  OrbitControls: vi.fn().mockImplementation(() => ({
    enableDamping: false,
    update: vi.fn(),
    dispose: vi.fn(),
  })),
}))
