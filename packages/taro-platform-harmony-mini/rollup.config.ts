import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import fg from 'fast-glob'
import { join } from 'path'
import { type InputPluginOption, type RollupOptions, defineConfig } from 'rollup'
import copy from 'rollup-plugin-copy'
import externals from 'rollup-plugin-node-externals'
import ts from 'rollup-plugin-ts'

const cwd = __dirname

const base: RollupOptions & { plugins: InputPluginOption[] } = {
  external: d => {
    return /^@(system\.|ohos\.|hmscore\/)/.test(d)
  },
  plugins: [
    externals({
      devDeps: false
    }),
    nodeResolve({
      preferBuiltins: false
    }),
    ts({
      tsconfig: e => ({
        ...e,
        declaration: false,
      })
    }),
    commonjs()
  ]
}

// 供 CLI 编译时使用的 Taro 插件入口
const compileConfig: RollupOptions = {
  ...base,
  input: join(cwd, 'src/index.ts'),
  output: {
    dir: join(cwd, 'dist'),
    format: 'cjs',
    sourcemap: true,
    exports: 'named'
  },
  plugins: [
    ...base.plugins,
    copy({

      targets: [
        // { src: 'src/template/container.js', dest: 'dist/template' },
        // { src: 'src/template/global.scss', dest: 'dist/template' },
        // { src: 'src/components/components-harmony-ets', dest: 'dist' },
        // { src: 'src/components/components-harmony', dest: 'dist' },
        { src: 'src/apis', dest: 'dist' },
        // { src: 'src/runtime-ets', dest: 'dist' },
        // { src: 'src/runtime-framework', dest: 'dist' },
        // { src: 'src/react', dest: 'dist' },
      ]
    }) as InputPluginOption,
    {
      name: 'copy-runtime-watch',
      async buildStart () {
        const files = await fg('src/**/*')
        for (const file of files) {
          this.addWatchFile(file)
        }
      }
    }
  ]
}

// 供 Loader 使用的运行时入口
const runtimeConfig: RollupOptions = {
  ...base,
  input: join(cwd, 'src/runtime/index.ts'),
  output: {
    dir: join(cwd, 'dist/runtime'),
    format: 'es',
    sourcemap: true
  }
}

// 供继承的包使用，为了能 tree-shaking
// const runtimeUtilsConfig: RollupOptions = {
//   ...base,
//   input: join(cwd, 'src/runtime-utils.ts'),
//   output: {
//     dir: join(cwd, 'dist/runtime-utils.js'),
//     format: 'es',
//     sourcemap: true
//   }
// }

// React 下 webpack 会 alias @tarojs/components 为此文件
// const otherConfig: RollupOptions = {
//   ...base,
//   input: join(cwd, 'src/components/components-react.ts'),
//   output: {
//     dir: join(cwd, 'dist/components/components-react.js'),
//     format: 'es',
//     sourcemap: true
//   },
//   plugins: [
//     ts({
//       tsconfig: e => ({
//         ...e,
//         declaration: false,
//       })
//     })
//   ]
// }

export default defineConfig([compileConfig, runtimeConfig])
