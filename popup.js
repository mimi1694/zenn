//--------- SIMPLE TIMER FUNCTIONALITY ------ ///
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
  toPretty(seconds) {
    let sec = seconds % 60
    let min = (seconds - sec) / 60
    if (sec < 10) sec = '' + 0 + sec
    return '' + min + ':' + sec
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

//--------------SAVED REMINDERS FUNCTIONALITY --------------//

let reminders = []
//let alarms = []
let newReminder = {}
let reminderListNode = document.getElementById('reminder-list')
let holder = document.getElementById('holder')

let flatten = (arr) => {
  let flattened = []
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      flattened.push(...flatten(arr[i]))
    } else {
      flattened.push(arr[i])
    }
  }
  return flattened
}

let onDeleteButton = (id) => {
  //console.log('DELETE', document.getElementById(id), flatten(alarms))
  // let thisReminder = flatten(alarms).find((elt) => {
  //   return (elt.name === id)
  // })
 // console.log(thisReminder)
  chrome.extension.sendRequest(
    { method: 'deleteReminder', 
      alarmName: id },
    function (response) {
      console.log(response)
      remover()
    }
  )
}

let remover = () => {
  if (reminderListNode.children.length) {
    console.log(holder.childNodes, 'reminder list has children', reminderListNode.childElementCount, reminderListNode.childNodes)
    for (var i = 0; i < reminderListNode.children.length; i++) {
      if (reminderListNode.children[i]) {
        reminderListNode.removeChild(reminderListNode.children[i])
      }
    }
    console.log('holder list has children', holder.childNodes)
  }
}
let appender = (sentReminders) => {
  console.log('HEY', sentReminders)
  let spreadReminders = flatten(sentReminders)
  for (let i = 0; i < spreadReminders.length; i++) {
    let reminder = spreadReminders[i]
    let li = document.createElement('li')
    let time = new Date(reminder.scheduledTime).toLocaleTimeString()
    let date = new Date(reminder.scheduledTime).toLocaleDateString()
    li.innerHTML = `${reminder.name} at ${time} starting on ${date}`
    let btn = document.createElement('button')
    btn.innerHTML = 'X'
    btn.setAttribute('class', 'delete-btn')
    btn.setAttribute('id', reminder.name)
    li.append(btn)
    reminderListNode.append(li)
    document.getElementById(reminder.name).onclick = () => {
      onDeleteButton(reminder.name)
    }
  }
}

let createRemindersInDom = () => {
  //console.log('in create dom', alarms)
  reminderListNode = document.getElementById('reminder-list')
  holder = document.getElementById('holder')
  chrome.extension.sendRequest(
    { method: 'getReminders' },
    function (response) {
      console.log('RESPONSE', response)
      //alarms = response.fullInfoReminders
      reminders = response.reminders
      remover()
      appender(reminders)
    }
  )
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
     // alarms = response.fullInfoReminders
      createRemindersInDom()
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
    //alarms.push(newReminder)
    document.getElementById('reminder-form').style.display = 'none'
    createNewReminder(newReminder)
  }
}

// --------------- app functionality ----------- //
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
