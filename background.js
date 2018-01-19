let backgroundTimer = {
	timerInterval: 1000, // seconds
	timer: 0,
	addToTimer: function(amount) {
		backgroundTimer.timer += amount
		backgroundTimer.updateTimer()
    },
    decrementTimer: function() {
        backgroundTimer.timer--
        backgroundTimer.updateTimer()
    },
	updateTimer: function() {
		if (backgroundTimer.timer === 0) {
			chrome.browserAction.setBadgeText({text: ""})
		} else {
			chrome.browserAction.setBadgeText({text: "" + backgroundTimer.timer})
		}
		chrome.extension.sendRequest({method: 'updateTimer', data: backgroundTimer.timer}, function(response) {
		})
	},
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	switch (request.method) {
	case 'addTobackgroundTimer':
		backgroundTimer.addToTimer(request.data)
		sendResponse({result: 'success'})
		break
	case 'getbackgroundTimer':
		sendResponse({result: '' + backgroundTimer.timer})
        break
    case 'decrementTimer':
        sendResponse({result: '' + backgroundTimer.timer})
        break
    default:
        break
	}
})

document.addEventListener('DOMContentLoaded', function () {
    backgroundTimer.timer = 0
	setInterval(
        function(){
            backgroundTimer.decrementTimer()
        },
        backgroundTimer.timerInterval)
})
