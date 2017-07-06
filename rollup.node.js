var pkg = require('./package.json')

export default {
  entry: 'src/y-array.js',
  moduleName: 'yArray',
  format: 'umd',
  dest: 'y-array.node.js',
  sourceMap: true,
  banner: `
/**
 * ${pkg.name} - ${pkg.description}
 * @version v${pkg.version}
 * @license ${pkg.license}
 */
`
}
