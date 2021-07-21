import ts from 'rollup-plugin-typescript2'
import pkg from './package.json'
import sourceMaps from 'rollup-plugin-sourcemaps'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
// import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'

const name = pkg.name

const configs = [
  { input: 'src/index.ts', file: `dist/${name}.esm-browser.js`, format: 'es', browser: true, sourcemap: true, env: 'development' },
  { input: 'src/index.ts', file: `dist/${name}.esm-browser.prod.js`, format: 'es', minify: true, browser: true, sourcemap: true, env: 'production' }
  // { input: 'src/index.ts', file: `dist/${name}.global.js`, format: 'iife', env: 'development' },
  // { input: 'src/index.ts', file: `dist/${name}.global.prod.js`, format: 'iife', minify: true, env: 'production' }
  // { input: 'src/index.cjs.ts', file: `dist/${name}.cjs.js`, format: 'cjs', env: 'development' }
]

function createEntries() {
  return configs.map((c) => createEntry(c))
}

function createEntry(config) {
  const c = {
    external: ['vue'],
    input: config.input,
    plugins: [
      // replace({
      //   'process.env.NODE_ENV': JSON.stringify('development'),
      //   __buildDate__: () => JSON.stringify(new Date())
      // })
    ],
    output: {
      name: config.name ? config.name : '',
      file: config.file,
      format: config.format,
      plugins: [config.minify && terser()],
      sourcemap: config.sourcemap
    }
  }

  c.plugins.push(resolve())
  c.plugins.push(commonjs())
  c.plugins.push(
    ts({
      //  tsconfig: path.resolve(__dirname, 'tsconfig.json') // 导入本地ts配置
    })
  )
  c.plugins.push(sourceMaps())

  return c
}

export default createEntries()

/*
export default {
  input: './src/index.ts',
  output: [
    {
      format: 'cjs',
      file: 'dist/qiankun.cjs.js',
      sourcemap: true
    },
    {
      format: 'es',
      file: 'dist/qiankun.esm.js',
      sourcemap: true
    },
    {
      file: 'dist/qiankun.iife.js',
      // name: 'qiankun',
      format: 'iife'
    },
    {
      file: 'dist/qiankun.iife.min.js',
      // name: 'qiankun',
      format: 'iife',
      plugins: [terser()]
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    ts(),
    sourceMaps()
    // terser({ module: true })
  ]
}
*/
