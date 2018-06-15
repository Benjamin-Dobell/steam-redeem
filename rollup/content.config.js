import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

import browser from './rollup-browser-plugin'

export default options => {
	return {
		input: 'src/js/content.js',
		plugins: [
			browser(options.variant),
			babel({
				exclude: 'node_modules/**',
				runtimeHelpers: true,
			}),
			nodeResolve({
				jsnext: true,
				main: true,
				browser: true,
			}),
			commonjs(),
		],
		output: [
			{
				file: `build/${options.variant}/content.js`,
				format: 'iife',
				sourcemap: true,
			},
		],
	}
}

