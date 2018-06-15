import { RedemptionEventName } from './redemption'

import detectors from './detectors'
import manipulators from './manipulators'
import observers from './observers'

function detectRedeemables() {
	const redeemables = []

	for (const detector of detectors) {
		redeemables.push(...detector())
	}

	return redeemables
}

function manipulateDom(redeemables) {
	for (const redeemable of redeemables) {
		if (redeemable.dom) {
			manipulators[redeemable.dom.type](redeemable)
		}
	}
}

function update() {
	const redeemables = detectRedeemables()
	manipulateDom(redeemables)
	browser.runtime.sendMessage({keysFound: redeemables.length > 0})
	return redeemables
}

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.redeemAll) {
		const redeemables = update()
		browser.runtime.sendMessage({redeem: redeemables.map(entry => ({title: entry.title, key: entry.key}))})
	}

	if (request.redeemed) {
		const {key, status} = request.redeemed
		const node = document.evaluate(".//*[boolean(@data-steam-redeem-status) @data-steam-redeem-key='" + key + "']", document, null, XPathResult.ANY_TYPE, null).iterateNext()

		if (node) {
			node.dispatchEvent(new CustomEvent(RedemptionEventName, {detail: {key, status}}))
		}
	}
})

for (const setupObservers of observers) {
	setupObservers(update)
}

update()
