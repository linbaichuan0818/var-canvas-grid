import rollupTypescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs'; // 转化jquery库cmjs => es
import postcss from "rollup-plugin-postcss"
import {babel} from '@rollup/plugin-babel';
export default {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'umd',
      name:"VarCanvasGrid",
      // globals: {
      //   jquery: '$'
      // },
      sourcemap: true
    },
    plugins: [
  
      rollupTypescript({sourceMap:true}),
      babel({
        exclude:"node_modules/**",
      }),
      commonjs(),
      postcss({
        extensions:[
          ".css"
        ]
      }),
      nodeResolve({browser: true})
    ],
    // external:["jquery"]
  };