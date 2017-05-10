import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  entry: 'src/test.js',
  moduleName: 'tests',
  format: 'umd',
  plugins: [
    nodeResolve({
      main: true,
      module: true,
      browser: true
    }),
    commonjs()
  ],
  dest: 'test.js',
  sourceMap: true,
  external: [],
  globals: {
  }
}
