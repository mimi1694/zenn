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
    let text = localTimer.toPretty(localTimer.currentTimer)
    document.getElementById('timer').innerHTML = '' + text
  },
  toPretty(seconds){
    let sec = seconds%60
    let min = (seconds-sec) / 60
    if(sec<10) sec = ''+0+sec
    return ''+min+':'+sec
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
    chrome.extension.sendRequest(
      { method: 'pauseTimer' },
      function (response) {
        localTimer.getTimer()
      }
    )
  },
  clearTimer: function () {
    chrome.extension.sendRequest(
      { method: 'clearTimer' },
      function (response) {
        localTimer.getTimer()
      }
    )
  }
}

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
    if (!timeChoice) {
      if (localTimer.currentTimer > 0) {
        localTimer.startTimer()
      }
      this.disabled = true
    }
    else {
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
  clear.onclick = function () {
    localTimer.clearTimer()
    go.disabled = true
  }
}

let reminders = []
let alarms = []
let newReminder = {}

let createRemindersInDom = () => {
  chrome.extension.sendRequest(
    { method: 'getReminders' },
    function (response) {
      console.log(response.reminders)
      reminders = response.reminders
      for (var i = 0; i < response.reminders.length; i++) {
        let reminder = response.reminders[i]
        console.log('HI')
        let date = new Date(reminder.scheduledTime).toLocaleTimeString()
        let div = document.createElement('div')
        let name = document.createTextNode(reminder.name)
        let time = document.createTextNode(' Starts: ' + date)
        let freq = document.createTextNode(' Every: ' + reminder.periodInMinutes + ' minutes')
        //let blocks = document.createTextNode('Blocked URLs: ' + reminder.urlToBlock.join(' '))
        div.appendChild(name)
        div.appendChild(time)
        div.appendChild(freq)
        //div.appendChild(blocks)
        let currentDiv = document.getElementById('reminder-list')
        currentDiv.appendChild(div)
      }
    })
}

let createNewReminder = (obj) => {
  chrome.extension.sendRequest(
    {
      method: 'newAlarm',
      name: obj.name,
      message: obj.message,
      startTime: obj.startTime,
      frequency: obj.frequency,
      urlToBlock: obj.urlToBlock
    },
    function (response) {
      alarms.push(response.result)
      createRemindersInDom(response)
    }
  )
}

let showReminderForm = () => {
  document.body.style.height = '400px'
  document.body.style.width = '300px'
  document.getElementById('reminder-form').style.display = 'block'
}

let showRemindersPage = () => {
  document.getElementById('saved-reminders').style.display = 'block'
  document.getElementById('button-control').style.display = 'none'
  document.getElementById('back').onclick = () => {
    document.body.style.height = '150px'
    document.body.style.width = '250px'
    document.getElementById('reminder-form').style.display = 'none'
    showMainMenu()
  }
  createRemindersInDom()
  document.getElementById('new-reminder').onclick = function () {
    showReminderForm()
  }
  document.getElementById('form').onsubmit = function (evt) {
    evt.preventDefault()
    newReminder.name = evt.target.reminderName.value
    newReminder.message = evt.target.reminderMessage.value
    newReminder.startTime = evt.target.startTime.value
    newReminder.urlToBlock = evt.target.reminderUrls.value.split(' ').join('').split(',')
    newReminder.frequency = event.target.frequency.value

    document.getElementById('reminder-form').style.display = 'none'
    createNewReminder(newReminder)
  }
}

//app functionality
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
  switch (request.method) {
    case 'updateTimer':
      localTimer.currentTimer = request.data
      localTimer.updateTimer()
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