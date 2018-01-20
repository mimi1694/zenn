let localTimer = {
  currentTimer: 0,
  getTimer: function () {
    chrome.extension.sendRequest({ method: 'getbackgroundTimer' }, function (response) {
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
    document.getElementById('timer').innerHTML = "" + localTimer.currentTimer
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
  const dropdown = document.getElementById('dropdown')  
  //menu control
  document.getElementById('timer-control').style.display = 'none'
  document.getElementById('new-btn').onclick = () => {
    document.getElementById('timer-control').style.display = 'block'
    document.getElementById('button-control').style.display = 'none'
  }
  document.getElementById('saved-btn').onclick = () => {
    document.getElementById('timer-control').style.display = 'block'
    document.getElementById('button-control').style.display = 'none'
  }

  //timer button control
  document.getElementById('go').onclick = function () {
    localTimer.startTimer()
    this.disabled = true
    console.log('DROPDOWN VALUE', dropdown.value)
  }
  document.getElementById('pause').onclick = function () {
    localTimer.pauseTimer()
    document.getElementById('go').disabled = false
    console.log('DROPDOWN VALUE', dropdown.value)
  }
  document.getElementById('clear').onclick = function() {
    localTimer.clearTimer()
    console.log('DROPDOWN VALUE', dropdown.value)
  }
})