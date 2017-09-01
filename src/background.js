import 'babel-polyfill'
import thenChrome from 'then-chrome'
import 'whatwg-fetch'

import { RedemptionState } from './redemption.js'

const REDEEM_URL = 'https://store.steampowered.com/account/ajaxregisterkey'

async function redeem(tabId, title, key, sessionId) {
    const formData = new FormData()
    formData.append('product_key', key)
    formData.append('sessionid', sessionId)

    const response = await fetch(REDEEM_URL, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: formData,
        credentials: 'include'
    })

    try {
        const result = await response.json()

        if (result.success === 1) {
            chrome.tabs.sendMessage(tabId, {redeemed: {key, state: RedemptionState.REDEEMED}})
        } else {
            if (result.purchase_receipt_info && result.purchase_receipt_info.line_items && result.purchase_receipt_info.line_items.length > 0) {
                chrome.tabs.sendMessage(tabId, {redeemed: {key, state: RedemptionState.REDEEMED}})
                alert("You've already redeemed '" + title + "'")
            } else {
                chrome.tabs.sendMessage(tabId, {redeemed: {key, state: RedemptionState.FAILED}})

                if (result.purchase_result_details === 53) {
                    alert("Steam reported too many key redemption attempts whilst redeeming '" + title + "'. You'll have to try again later.")
                } else {
                    alert("Invalid key encountered whilst redeeming '" + title + "'")
                }
            }
        }
    } catch (e) {
        chrome.tabs.sendMessage(tabId, {redeemed: {key, state: RedemptionState.DEFAULT}})
        alert("You must first login to Steam through your browser before you can redeem keys using Steam Redeem.")
        chrome.tabs.create({ url: 'https://store.steampowered.com/login/?redir=' })
    }
}

async function fetchCookieThenRedeem(tabId, title, key) {
    const cookie = await thenChrome.cookies.get({
        url: 'https://store.steampowered.com',
        name: 'sessionid'
    })

    if (cookie && cookie.value && cookie.value.length > 0) {
        const sessionId = cookie.value
        await redeem(tabId, title, key, sessionId)
    }
}

async function redeemItems(tabId, items) {
    for (let item of items) {
        const {title, key} = item

        if (title && key) {
            await fetchCookieThenRedeem(tabId, title, key)
        }
    }
}

function postRedeemAll(tab) {
    chrome.tabs.sendMessage(tab.id, {redeemAll: true})
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.keysFound !== undefined) {
        if (request.keysFound === true) {
            chrome.pageAction.show(sender.tab.id)

            if (!chrome.pageAction.onClicked.hasListener(postRedeemAll)) {
                chrome.pageAction.onClicked.addListener(postRedeemAll)
            }
        } else {
            chrome.pageAction.hide(sender.tab.id)
            chrome.pageAction.onClicked.removeListener(postRedeemAll)
        }
    }

    if (request.redeem !== undefined) {
        redeemItems(sender.tab.id, request.redeem)
    }
})
