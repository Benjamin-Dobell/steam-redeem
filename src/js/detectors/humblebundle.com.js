function detectHumbleBundleKeys() {
	const redeemables = []
	const containerNodes = document.evaluate("//*[./*[@class='game-name'] and .//*[contains(@class, 'redeemed')]]", document, null, XPathResult.ANY_TYPE, null)

	let containerNode = containerNodes.iterateNext()

	while (containerNode) {
		const keyNode = document.evaluate(".//*[contains(@class, 'redeemed')]", containerNode, null, XPathResult.ANY_TYPE, null).iterateNext()
		const titleNode = document.evaluate("./*[@class='game-name']", containerNode, null, XPathResult.ANY_TYPE, null).iterateNext()

		if (keyNode && titleNode) {
			const key = keyNode.textContent.trim()

			if (key.match(/[A-Z0-9]+(?:-[A-Z0-9]+)+/)) {
				redeemables.push({
					title: titleNode.textContent.trim().split('\n')[0],
					key: key,
					dom: {
						type: 'smallButton',
						node: keyNode,
					},
				})
			}
		}

		containerNode = containerNodes.iterateNext()
	}

	return redeemables
}

function detectHumbleBundlePurchases() {
	const redeemables = []
	const containerNodes = document.evaluate("//*[contains(concat(' ', normalize-space(@class), ' '), ' sr-key ') and .//*[contains(@class, 'sr-redeemed')]]", document, null, XPathResult.ANY_TYPE, null)

	let containerNode = containerNodes.iterateNext()

	while (containerNode) {
		let keyNode = document.evaluate(".//*[@class='sr-redeemed']", containerNode, null, XPathResult.ANY_TYPE, null).iterateNext()
		let titleNode = document.evaluate(".//*[@class='sr-key-heading']", containerNode, null, XPathResult.ANY_TYPE, null).iterateNext()
		let instructionsNode = document.evaluate(".//*[contains(@class, 'redeem-instructions') and (contains(@class, 'steam-redeem-large-button') or .//*[contains(text(),'Copy this key')])]", containerNode, null, XPathResult.ANY_TYPE, null).iterateNext()

		if (keyNode && titleNode && instructionsNode) {
			const title = titleNode.textContent.trim()
			const key = keyNode.textContent.trim().split('\n')[0]

			redeemables.push({
				title,
				key,
				dom: {
					type: 'largeButton',
					node: instructionsNode,
				},
			})
		}

		containerNode = containerNodes.iterateNext()
	}

	return redeemables
}

const hostnameRegex = /^(www\.)?humblebundle\.com/

export default () => {
	if (hostnameRegex.test(window.location.hostname)) {
		return [
			...detectHumbleBundleKeys(),
			...detectHumbleBundlePurchases(),
		]
	}

	return []
}
