import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    entry: 'src/content.js',
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        nodeResolve({
            jsnext: true,
            main: true,
            browser: true
        }),
        commonjs()
    ],
    targets: [
        {
            dest: 'extension/content.js',
            format: 'iife',
            moduleName: 'steam-redeem',
            sourceMap: true
        }
    ]
}
