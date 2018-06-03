const fs = require('fs')

require('@babel/register')

const rollup = require('rollup')

const configs = require('./rollup/rollup.config').default

const ASSETS_DIR = 'src/assets'
const VARIANTS = ['chrome', 'edge', 'firefox', 'opera']

const argv = require('minimist')(process.argv.slice(2))

const manifest = JSON.parse(fs.readFileSync('src/manifest.json', 'utf8'))

async function build() {
	for (const variant of VARIANTS) {
		const options = {
			...argv,
			variant,
		}

		for (const config of configs(options)) {
			const { output: outputs, ...input } = config
			const bundle = await rollup.rollup(input)

			for (const output of outputs) {
				await bundle.write(output)
			}
		}

		for (const file of fs.readdirSync(ASSETS_DIR)) {
			fs.copyFileSync(`${ASSETS_DIR}/${file}`, `build/${variant}/${file}`)
		}

		const variantManifestPath = `src/manifest.${variant}.json`

		const variantManifest = {
			...manifest,
			...(fs.existsSync(variantManifestPath) ? JSON.parse(fs.readFileSync(variantManifestPath, 'utf8')) : {}),
		}

		fs.writeFileSync(`build/${variant}/manifest.json`, JSON.stringify(variantManifest, null, 4))
	}
}

build()
