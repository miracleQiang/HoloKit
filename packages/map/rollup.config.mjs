import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.cjs.js', format: 'cjs', sourcemap: true },
    { file: 'dist/index.esm.js', format: 'es', sourcemap: true },
  ],
  external: ['three', 'three/addons/controls/OrbitControls.js', '@holokit/core'],
  plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json', declaration: true, declarationDir: 'dist' })],
}
