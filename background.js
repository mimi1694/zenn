let backgroundTimer = {
    timerInterval: 1000, // seconds
    timer: 0,
    started: false,
    interval: null,
    addToTimer: function (amount) {
        backgroundTimer.timer += amount
        backgroundTimer.updateTimer()
    },
    decrementTimer: function () {
        backgroundTimer.timer--
        backgroundTimer.updateTimer()
    },
    startTimer: function () {
        backgroundTimer.started = true
        backgroundTimer.interval = setInterval(
            function () {
                backgroundTimer.decrementTimer()
            },
            backgroundTimer.timerInterval)
    },
    pauseTimer: function (){
        backgroundTimer.started = true
        clearInterval(backgroundTimer.interval)
        backgroundTimer.updateTimer()
    },
    clearTimer: function () {
        backgroundTimer.started = false
        clearInterval(backgroundTimer.interval)
        backgroundTimer.timer = 0
        backgroundTimer.updateTimer()
    },
    updateTimer: function () {
        if (backgroundTimer.timer === 0) {
            chrome.browserAction.setBadgeText({ text: '' })
        } else {
            chrome.browserAction.setBadgeText({ text: '' + backgroundTimer.timer })
        }
        chrome.extension.sendRequest({ method: 'updateTimer', data: backgroundTimer.timer }, 
        function (response) {
        })
    },
}

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    switch (request.method) {
        case 'addTobackgroundTimer':
            backgroundTimer.addToTimer(request.data)
            sendResponse({ result: 'success' })
            break
        case 'getbackgroundTimer':
            sendResponse({ result: '' + backgroundTimer.timer })
            break
        case 'decrementTimer':
            sendResponse({ result: '' + backgroundTimer.timer })
            break
        case 'startTimer':
            backgroundTimer.startTimer()
            sendResponse({ result: 'success' })
            break
        case 'pauseTimer':
            backgroundTimer.pauseTimer()
            sendResponse({ result: 'success' })
            break
        case 'clearTimer':
            backgroundTimer.clearTimer()
            sendResponse({ result: 'success' })
            break
        default:
            break
    }
})

document.addEventListener('DOMContentLoaded', function () {
    backgroundTimer.timer = 0
})
