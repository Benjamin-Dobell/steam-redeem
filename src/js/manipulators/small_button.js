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
	if (!redeemButton.classList.contains('steam-redeem-small-button')) {
		redeemButton.classList.add('steam-redeem-small-button')

		redeemButton.setAttribute('data-steam-redeem-key', key)

		if (title) {
			redeemButton.setAttribute('data-title', title)
		}

		redeemButton.style.fontSize = '12px'
		redeemButton.style.marginTop = '6px'
		redeemButton.style.marginBottom = '6px'
		redeemButton.style.marginLeft = '8px'
		redeemButton.style.lineHeight = '24px'
		redeemButton.style.paddingTop = '4px'
		redeemButton.style.paddingBottom = '4px'
		redeemButton.style.paddingLeft = '6px'
		redeemButton.style.paddingRight = '6px'
		redeemButton.style.backgroundColor = '#000'
		redeemButton.style.color = '#fff'
		redeemButton.style.borderRadius = '4px'
		redeemButton.style.fontWeight = '600'
		redeemButton.style.cursor = 'pointer'

		redeemButton.addEventListener('click', (event) => {
			const status = redeemButton.getAttribute('data-steam-redeem-status') || 0

			if (title && key && status <= RedemptionStatus.DEFAULT) {
				manipulate(redeemable, RedemptionStatus.REDEEMING)
				browser.runtime.sendMessage({ redeem: [{ title, key }] })
			}
		})

		node.addEventListener(RedemptionEventName, (event) => {
			manipulate(redeemable, event.detail.status)
		})
	}

	// Has the status changed?
	if (nextStatus !== redeemButton.getAttribute('data-steam-redeem-status')) {
		redeemButton.setAttribute('data-steam-redeem-status', nextStatus)

		switch (nextStatus) {
			default:
			case RedemptionStatus.DEFAULT:
				redeemButton.innerHTML = "<i class='hb hb-steam' style='margin-right: 4px'></i>Redeem"
				break

			case RedemptionStatus.REDEEMING:
				redeemButton.innerHTML = "<i class='hb hb-spinner hb-spin' style='margin-right: 4px'></i>Redeeming"
				break

			case RedemptionStatus.REDEEMED:
				redeemButton.innerHTML = "<i class='hb hb-check' style='margin-right: 4px'></i>Redeemed"
				break
		}
	}

	if (redeemButton.parentNode !== node.parentNode) {
		node.parentNode.insertBefore(redeemButton, node.nextSibling)
	}
}

export default manipulate
