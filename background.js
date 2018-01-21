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
                backgroundTimer.decrementTimer()
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
        chrome.extension.sendRequest({ method: 'updateTimer', data: backgroundTimer.timer },
            function (response) {
            })
    },
}

let Reminder = function(name) {
    name: name;
    quietInterval: 0;
    alarmInterval: 0;
    alarm: null;
}
let date;
let alarms = []

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
        case 'newAlarm':
            date = Date.now()
            chrome.alarms.create(request.name, { when: date })
            // alarm = new Reminder()
            // alarm.name = request.name
            // alarms.push(alarm)
            chrome.alarms.get(request.name, function(alarm){
                sendResponse({ result: alarm})
            })
            break
        default:
            break
    }
})

document.addEventListener('DOMContentLoaded', function () {
    backgroundTimer.timer = 0
})

chrome.alarms.onAlarm.addListener(function( thisAlarm ) {
    console.log("Got an alarm!", thisAlarm);
    createNotification();
});

var alarmSound = new Audio('relaxing_sms.mp3');
let audioNotification = () => {
    alarmSound.play();
}

function createNotification(){
    let noti = {
        type: "basic",
        title: "Your Title",
        message: "Your message",
        iconUrl: "zenify_icon.png"
    }
    chrome.notifications.create(noti.title, noti, function(){
        audioNotification()
    })
    chrome.webRequest.onBeforeRequest.addListener(
        function() {
            return {cancel: true};
        },
        {
            urls: ['*://www.facebook.com/*']
        },
        ['blocking']
    )
    setTimeout(() => { 
        chrome.notifications.clear("notificationName", 
        () => {
            alarmSound.pause()
        })
    }, 5000)
}