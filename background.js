//simple timer set up and functions
let backgroundTimer = {
    timerInterval: 1000,
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
                if (backgroundTimer.timer > 0) backgroundTimer.decrementTimer()
                else {
                    clearInterval(backgroundTimer.interval)
                    backgroundTimer.timerAlarm()
                }
            },
            backgroundTimer.timerInterval)
    },
    pauseTimer: function () {
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
        chrome.extension.sendRequest({ method: 'updateTimer', data: backgroundTimer.timer }, function () { })
    },
    timerAlarm: function () {
        alarmSound.play()
    }
}

//reminder set up and functions
let reminder = {
    title: '',
    message: '',
    type: 'basic',
    iconUrl: 'zenify_icon.png'
}
let date
let blockedURLs = []
let savedReminders = []
let alarmSound = new Audio('relaxing_sms.mp3');
let audioNotification = () => {
    alarmSound.play();
}

let createNonBlockingNotification = () => {
    chrome.notifications.create(
        reminder.title,
        reminder,
        function () {
            audioNotification()
        })
    setTimeout(() => {
        chrome.notifications.clear(reminder.title,
            () => {
                alarmSound.pause()
            })
    }, 5000)
}

let createBlockingNotification = (timeout) => {
    createNonBlockingNotification()
    let listener = function () {
        return { cancel: true };
    }
    chrome.webRequest.onBeforeRequest.addListener(
        listener,
        { urls: blockedURLs },
        ['blocking']
    )
    setTimeout(() => {
        chrome.webRequest.onBeforeRequest.removeListener(listener)
        console.log('finished')
    }, timeout)
}

//functionality
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    switch (request.method) {
        case 'addTobackgroundTimer':
            backgroundTimer.addToTimer(request.data)
            sendResponse({ result: 'success' })
            break
        case 'getbackgroundTimer':
            sendResponse({ result: '' + backgroundTimer.timer })
            break
        // case 'decrementTimer':
        //     sendResponse({ result: '' + backgroundTimer.timer })
        //     break
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
        case 'newAlarm':
            date = new Date(request.startTime)
            reminder.title = request.name
            reminder.message = request.message
            request.urlToBlock.forEach(function (url) {
                blockedURLs.push('*://' + url + '/*')
            })
            console.log(blockedURLs)
            chrome.alarms.create(request.name,
                {
                    when: date.getTime(),
                    periodInMinutes: request.frequency * 60
                })
            chrome.alarms.get(request.name, function (alarm) {
                savedReminders.push(alarm)
                sendResponse({ result: alarm })
            })
            break
        case 'getReminders':
            // console.log('saved reminders ',savedReminders)
            // chrome.alarms.getAll((alarm) => console.log(alarm))
            sendResponse({ reminders: savedReminders})
            break
        default:
            break
    }
})

document.addEventListener('DOMContentLoaded', function () {
    console.log(blockedURLs)
    chrome.alarms.getAll((alarm) => savedReminders.push(alarm))
    backgroundTimer.timer = 0
})

chrome.alarms.onAlarm.addListener(function () {
    createBlockingNotification(10000);
});