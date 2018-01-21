//simple timer set up and functions
let localTimer = {
  currentTimer: 0,
  getTimer: function () {
    chrome.extension.sendRequest(
      { method: 'getbackgroundTimer' }, 
      function (response) {
        localTimer.currentTimer = response.result
        localTimer.updateTimer()
    })
    // if(localTimer.currentTimer <= 0){
    //   localTimer.clearTimer()
    // }
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

//reminder set up and funcationality
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

//dom manipulation
//main menu
let showMainMenu = () => {
  document.getElementById('button-control').style.display = 'block'
  document.getElementById('simple-timer-control').style.display = 'none'
  document.getElementById('saved-reminders').style.display = 'none'
}

//simple timer
let showNewSimpleTimerPage = () => {
  document.getElementById('simple-timer-control').style.display = 'block'
  document.getElementById('button-control').style.display = 'none'
  const dropdown = document.getElementById('dropdown')
  const go = document.getElementById('go')
  const pause = document.getElementById('pause')
  const clear = document.getElementById('clear')
  let timeChoice = null
  go.disabled = true;
  pause.disabled = true;
  //dropdown
  dropdown.onchange = () => {
    timeChoice = dropdown.value
    go.disabled = false
  }
  //back
  document.getElementById('go-back').onclick = () => {
    showMainMenu()
  }
  //go
  go.onclick = function () {
   // timeChoice = dropdown.value
    console.log(timeChoice)
    if(!timeChoice){
      if(localTimer.currentTimer > 0){
        localTimer.startTimer()
      }
      this.disabled = true
    }
    else{
      localTimer.addToTimer(timeChoice * 60) 
      localTimer.startTimer()
    }
    pause.disabled = false
    this.disabled = true
    timeChoice = null
  }
  //pause/play
  pause.onclick = function () {
    localTimer.pauseTimer()
    go.disabled = false
    this.disabled = true
  }
  //clear
  clear.onclick = function() {
    localTimer.clearTimer()
    go.disabled = true
  }
}

//reminders
let showRemindersPage = () => {
  document.getElementById('saved-reminders').style.display = 'block'
  document.getElementById('button-control').style.display = 'none'
  document.getElementById('back').onclick = () => {
    showMainMenu()
  }
  document.getElementById('new-reminder').onclick = function () {
    chrome.extension.sendRequest(
      { method: 'newAlarm', 
        name: 'someReminder', 
        message: 'this is a message',
        urlToBlock: '*://www.facebook.com/*' },
      function (response) {
        reminders.push(response.alarm)
        console.log(reminders)
      }
    )
  }
}

//app functionality
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

document.addEventListener('DOMContentLoaded', function () {
  showMainMenu()
  
  document.getElementById('new-btn').onclick = () => {
    showNewSimpleTimerPage()
  }
  document.getElementById('saved-btn').onclick = () => {
    showRemindersPage()
  }
})