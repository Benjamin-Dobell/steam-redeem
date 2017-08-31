import { RedemptionState } from './redemption.js'

function redeemPressed(event) {
    const node = event.target

    const title = node.getAttribute('data-title')
    const key = node.getAttribute('data-key')
    const state = node.getAttribute('data-redemption-state') || 0

    if (title && key && state <= RedemptionState.DEFAULT) {
        if (node.classList.contains('steam-redeem-large-button')) {
            setupLargeRedeemButton(title, key, node, RedemptionState.REDEEMING)
        } else {
            setupSmallRedeemButton(title, key, node, RedemptionState.REDEEMING)
        }

        chrome.runtime.sendMessage({redeem: [{title, key}]})
    }
}

function setupLargeRedeemButton(title, key, node, state=null) {
    if (state === null) {
        state = parseInt(node.getAttribute('data-redemption-state')) || RedemptionState.DEFAULT
    }

    node.classList.add('steam-redeem-large-button')

    if (title) {
        node.setAttribute('data-title', title)
    }

    node.setAttribute('data-key', key)
    node.setAttribute('data-redemption-state', state)

    node.style.fontSize = '16px'
    node.style.padding = '4px'
    node.style.backgroundColor = '#000'
    node.style.color = '#fff'
    node.style.borderRadius = '4px'
    node.style.fontWeight = '500'
    node.style.cursor = 'pointer'

    switch (state) {
        default:
        case RedemptionState.DEFAULT:
            node.innerHTML = "<i class='hb hb-steam' style='margin-right: 8px'></i>Redeem Now!"
            break

        case RedemptionState.REDEEMING:
            node.innerHTML = "<i class='hb hb-spinner hb-spin' style='margin-right: 8px'></i>Redeeming"
            break

        case RedemptionState.REDEEMED:
            node.innerHTML = "<i class='hb hb-check' style='margin-right: 8px'></i>Redeemed"
            break
    }

    node.addEventListener('click', redeemPressed)
}

function setupSmallRedeemButton(title, key, node, state=null) {
    if (state === null) {
        state = parseInt(node.getAttribute('data-redemption-state')) || RedemptionState.DEFAULT
    }

    node.classList.add('steam-redeem-small-button')

    if (title) {
        node.setAttribute('data-title', title)
    }

    node.setAttribute('data-key', key)
    node.setAttribute('data-redemption-state', state)

    node.style.fontSize = '12px'
    node.style.marginTop = '6px'
    node.style.marginBottom = '6px'
    node.style.marginLeft = '8px'
    node.style.lineHeight = '24px'
    node.style.paddingTop = '4px'
    node.style.paddingBottom = '4px'
    node.style.paddingLeft = '6px'
    node.style.paddingRight = '6px'
    node.style.backgroundColor = '#000'
    node.style.color = '#fff'
    node.style.borderRadius = '4px'
    node.style.fontWeight = '600'
    node.style.cursor = 'pointer'

    switch (state) {
        default:
        case RedemptionState.DEFAULT:
            node.innerHTML = "<i class='hb hb-steam' style='margin-right: 4px'></i>Redeem"
            break

        case RedemptionState.REDEEMING:
            node.innerHTML = "<i class='hb hb-spinner hb-spin' style='margin-right: 4px'></i>Redeeming"
            break

        case RedemptionState.REDEEMED:
            node.innerHTML = "<i class='hb hb-check' style='margin-right: 4px'></i>Redeemed"
            break
    }

    node.addEventListener('click', redeemPressed)
}

function findKeys() {
    const largeButtonKeys = []

    let containerNodes = document.evaluate("//*[contains(concat(' ', normalize-space(@class), ' '), ' sr-key ') and .//*[contains(@class, 'sr-redeemed')]]", document, null, XPathResult.ANY_TYPE, null)
    let containerNode = containerNodes.iterateNext()

    while (containerNode) {
        let keyNode = document.evaluate(".//*[@class='sr-redeemed']", containerNode, null, XPathResult.ANY_TYPE, null).iterateNext()
        let titleNode = document.evaluate(".//*[@class='sr-key-heading']", containerNode, null, XPathResult.ANY_TYPE, null).iterateNext()
        let instructionsNode = document.evaluate(".//*[@class='redeem-instructions']", containerNode, null, XPathResult.ANY_TYPE, null).iterateNext()

        if (keyNode && titleNode && instructionsNode) {
            const title = titleNode.textContent.trim()
            const key = keyNode.textContent.trim().split('\n')[0]

            largeButtonKeys.push({
                title: titleNode.textContent.trim(),
                key: key,
                node: instructionsNode
            })
        }

        containerNode = containerNodes.iterateNext()
    }

    const smallButtonKeys = []

    containerNodes = document.evaluate("//*[./*[@class='game-name'] and .//*[contains(@class, 'redeemed')]]", document, null, XPathResult.ANY_TYPE, null)
    containerNode = containerNodes.iterateNext()

    while (containerNode) {
        let keyNode = document.evaluate(".//*[contains(@class, 'redeemed')]", containerNode, null, XPathResult.ANY_TYPE, null).iterateNext()
        let titleNode = document.evaluate("./*[@class='game-name']", containerNode, null, XPathResult.ANY_TYPE, null).iterateNext()

        if (keyNode && titleNode) {
            const key = keyNode.textContent.trim()

            if (key.match(/[A-Z0-9]+(?:-[A-Z0-9]+)+/)) {
                smallButtonKeys.push({
                    title: titleNode.textContent.trim().split('\n')[0],
                    key: key,
                    node: keyNode
                })
            }
        }

        containerNode = containerNodes.iterateNext()
    }

    largeButtonKeys.forEach(function(found) {
        const {title, key, node} = found
        setupLargeRedeemButton(title, key, node)
    })

    smallButtonKeys.forEach(function(found) {
        const {title, key, node} = found

        const redeemButton = (node.nextSibling && node.nextSibling.getAttribute && node.nextSibling.getAttribute('data-key')) ? node.nextSibling : document.createElement('span')
        setupSmallRedeemButton(title, key, redeemButton)

        if (redeemButton.parentNode !== node.parentNode) {
            node.parentNode.insertBefore(redeemButton, node.nextSibling)
        }
    })

    return smallButtonKeys.concat(largeButtonKeys)
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.redeemAll) {
        const keys = findKeys()
        chrome.runtime.sendMessage({redeem: keys.map(entry => ({title: entry.title, key: entry.key}))})
    }

    if (request.redeemed) {
        const {key, state} = request.redeemed
        let node = document.evaluate(".//*[@data-key='" + key + "']", document, null, XPathResult.ANY_TYPE, null).iterateNext()

        if (node.classList.contains('steam-redeem-large-button')) {
            setupLargeRedeemButton(null, key, node, state)
        } else {
            setupSmallRedeemButton(null, key, node, state)
        }
    }
})

for (let timeout of [100, 750, 3000, 10000]) {
    setTimeout(function() {
        chrome.runtime.sendMessage({ keysFound: findKeys().length > 0 })
    }, timeout)
}
