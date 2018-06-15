import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

import browser from './rollup-browser-plugin'

export default options => ({
	input: 'src/js/background.js',
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
	moduleContext: id => {
		if (id === require.resolve('webextension-polyfill')) {
			return 'self'
		}

		return undefined
	},
	output: [
		{
			file: `build/${options.variant}/background.js`,
			format: 'iife',
			sourcemap: options.sourcemap || false,
		},
	],
})

