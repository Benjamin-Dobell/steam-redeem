import { RedemptionEventName, RedemptionStatus } from '../redemption'

function manipulate(redeemable, nextStatus = null) {
	const {title, key, dom: {node}} = redeemable

	const redeemButton = (
		node.nextSibling && node.nextSibling.getAttribute && node.nextSibling.getAttribute('data-steam-redeem-key')
	) ? node.nextSibling : document.createElement('span')

	if (nextStatus === null) {
		nextStatus = redeemButton.getAttribute('data-steam-redeem-status') || RedemptionStatus.DEFAULT
	}

	// Is this a new DOM element?
	if (!redeemButton.classList.contains('steam-redeem-large-button')) {
		node.classList.add('steam-redeem-large-button')

		node.setAttribute('data-steam-redeem-key', key)

		if (title) {
			node.setAttribute('data-title', title)
		}

		node.style.fontSize = '16px'
		node.style.padding = '4px'
		node.style.backgroundColor = '#000'
		node.style.color = '#fff'
		node.style.borderRadius = '4px'
		node.style.fontWeight = '500'
		node.style.cursor = 'pointer'

		node.addEventListener('click', (event) => {
			const status = node.getAttribute('data-steam-redeem-status') || 0

			if (title && key && status <= RedemptionStatus.DEFAULT) {
				manipulate(redeemable, RedemptionStatus.REDEEMING)
				browser.runtime.sendMessage({redeem: [{title, key}]})
			}
		})

		node.addEventListener(RedemptionEventName, (event) => {
			manipulate(redeemable, event.detail.status)
		})
	}

	// Has the status changed?
	if (nextStatus !== redeemButton.getAttribute('data-steam-redeem-status')) {
		redeemButton.setAttribute('data-steam-redeem-status', nextStatus)

		switch (status) {
			default:
			case RedemptionStatus.DEFAULT:
				node.innerHTML = "<i class='hb hb-steam' style='margin-right: 8px'></i>Redeem Now!"
				break

			case RedemptionStatus.REDEEMING:
				node.innerHTML = "<i class='hb hb-spinner hb-spin' style='margin-right: 8px'></i>Redeeming"
				break

			case RedemptionStatus.REDEEMED:
				node.innerHTML = "<i class='hb hb-check' style='margin-right: 8px'></i>Redeemed"
				break
		}
	}

	if (redeemButton.parentNode !== node.parentNode) {
		node.parentNode.insertBefore(redeemButton, node.nextSibling)
	}
}

export default manipulate
