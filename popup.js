let localTimer = {
  currentTimer: 0,
  getTimer: function () {
    chrome.extension.sendRequest(
      { method: 'getbackgroundTimer' }, 
      function (response) {
        localTimer.currentTimer = response.result
        localTimer.updateTimer()
    })
  },
  addToTimer: function (amount) {
    chrome.extension.sendRequest(
      { method: 'addTobackgroundTimer', data: amount },
      function (response) {
        localTimer.getTimer()
      }
    )
  },
  updateTimer: function () {
    document.getElementById('timer').innerHTML = '' + localTimer.currentTimer
  },
  decrementTimer: function () {
    chrome.extension.sendRequest(
      { method: 'decrementTimer' },
      function (response) {
        localTimer.getTimer()
      }
    )
  },
  startTimer: function () {
    chrome.extension.sendRequest(
      { method: 'startTimer' },
      function (response) {
        localTimer.getTimer()
      }
    )
  },
  pauseTimer: function () {
    chrome.extension.sendRequest (
      { method: 'pauseTimer' },
      function (response) {
        localTimer.getTimer()
      }
    )
  },
  clearTimer: function () {
    chrome.extension.sendRequest (
      { method: 'clearTimer' },
      function (response) {
        localTimer.getTimer()
      }
    )
  }
}

let localReminders = {
  name: name,
  alarms: [],
  setAlarmName: function (name) {
    chrome.extension.sendRequest (
      { method: 'setName', name: name },
      function (response) {
        console.log(response)
        localReminder.name = response.name
      }
    )
  }
}
let reminders = []
let newReminder = {};

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
  switch (request.method) {
    case 'updateTimer':
      localTimer.currentTimer = request.data
      localTimer.updateTimer()
      console.log(localTimer.currentTimer)
      sendResponse({ result: 'success' })
      break
    default:
      break
  }
})

let showMainMenu = () => {
  document.getElementById('button-control').style.display = 'block'
  document.getElementById('simple-timer-control').style.display = 'none'
  document.getElementById('saved-reminders').style.display = 'none'
}

let showNewSimpleTimerPage = () => {
  document.getElementById('simple-timer-control').style.display = 'block'
  document.getElementById('button-control').style.display = 'none'

  document.getElementById('go-back').onclick = () => {
    showMainMenu()
  }
  document.getElementById('go').onclick = function () {
    localTimer.startTimer()
    this.disabled = true
  }
  document.getElementById('pause').onclick = function () {
    localTimer.pauseTimer()
    document.getElementById('go').disabled = false
  }
  document.getElementById('clear').onclick = function() {
    localTimer.clearTimer()
    document.getElementById('go').disabled = false
  }
}

let showRemindersPage = () => {
  document.getElementById('saved-reminders').style.display = 'block'
  document.getElementById('button-control').style.display = 'none'
  document.getElementById('back').onclick = () => {
    showMainMenu()
  }
  
  document.getElementById('new-reminder').onclick = function () {
    console.log('clicked')
    chrome.extension.sendRequest(
      { method: 'newAlarm', name: 'someReminder' },
      function (response) {
        console.log(response)
        reminders.push(response.alarm)
        console.log(reminders)
      }
    )
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const dropdown = document.getElementById('dropdown')  

  showMainMenu()
  
  document.getElementById('new-btn').onclick = () => {
    showNewSimpleTimerPage()
  }
  document.getElementById('saved-btn').onclick = () => {
    showRemindersPage()
  }
  
})