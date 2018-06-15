const hostnameRegex = /^https?:\/\/(www)?\.humblebundle\.com\//

function attachObserver(observer) {
	if (hostnameRegex.test(window.location.hostname)) {
		const containerNodes = document.evaluate(
			"//*[contains(concat(' ', normalize-space(@class), ' '), ' sr-widget-key-list-region ')]"
			+ "|" + "//*[contains(concat(' ', normalize-space(@class), ' '), ' unredeemed-keys-table ')]",
			document, null, XPathResult.ANY_TYPE, null)

		let containerNode = containerNodes.iterateNext()

		while (containerNode) {
			observer.observe(containerNode, {subtree: true, attributes: true, childList: true})
			containerNode = containerNodes.iterateNext()
		}
	}
}

export default (update) => {
	const observer = new MutationObserver(update)
	attachObserver(observer)

	// Super hacky, Humble Bundle loads content (and the DOM) dynamically, so we try attach our observers and run update() several times after a delay.
	for (const timeout of [100, 750, 3000]) {
		setTimeout(function() {
			attachObserver(observer)
			update()
		}, timeout)
	}
}
