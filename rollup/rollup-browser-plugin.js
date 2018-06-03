import MagicString from 'magic-string'

export default (variant) => {
	let mainId = null

	return {
		name: 'browser-variant',
		options: (options) => {
			mainId = require.resolve('../' + options.input)
		},
		transform: (code, id) => {
			if (variant === 'chrome' && id.match(mainId)) {
				// Chrome requires web extensions's `browser` to be polyfilled (from `chrome`)
				const magicString = new MagicString(code)
				magicString.prepend("import browser from 'webextension-polyfill'\n\n")
				return {
					code: magicString.toString(),
					map: magicString.generateMap(),
				}
			}

			return null
		},
	}
}
