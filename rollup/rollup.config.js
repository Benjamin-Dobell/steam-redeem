import content from './content.config.js'
import background from './background.config.js'

export default options => [
	content(options),
	background(options),
]
