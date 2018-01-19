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
  }
}

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
  //localTimer.getTimer()
  document.getElementById('timer-control').style.display = 'none'
  document.getElementById('new-btn').onclick = () => {
    document.getElementById('timer-control').style.display = 'block'
    document.getElementById('button-control').style.display = 'none'
  }
  document.getElementById('saved-btn').onclick = () => {
    document.getElementById('timer-control').style.display = 'block'
    document.getElementById('button-control').style.display = 'none'
  }
  
  document.getElementById('go').onclick = function () {
    localTimer.startTimer()
  }
})

//     const dropdown = document.getElementById('dropdown')
//     const go = document.getElementById('go')
//     const stop = document.getElementById('stop')
//     const pause = document.getElementById('pause')
//     let time

//     let timer = null 


//     getCurrentTabUrl((url) => {
//       getSavedTimer( (savedTimer) => {
//         if (savedTimer >= 0){
//           go.disabled = true
//           time = savedTimer
//         }
//         else{
//           time = dropdown.value * 60
//           console.log('reset')
//         }
//         document.getElementById('timer').innerHTML = time
//         stop.addEventListener('click', () => {
//             switchFunctionality(go, stop)
//             document.getElementById('timer').innerHTML = 'You are so zen.'
//             clearInterval(timer)
//             time = 0
//             saveTimerSettings(time)
//           })

//           go.addEventListener('click', () => {
//             if (time === 0) time = dropdown.value * 60
//             switchFunctionality(go, stop)
//             timer = setInterval(() => {
//               document.getElementById('timer').innerHTML = time
//               time--
//               saveTimerSettings(time)
//             }, 1000)
//           })

//           pause.addEventListener('click', () => {
//             go.disabled = false
//             clearInterval(timer)
//             saveTimerSettings(time)
//           })

//       })

//       if (!dropdown.value) {
//         getSavedTimer(url, (savedTimer) => {
//           if (savedTimer) { //no drop down clicked, already saved
//             console.log('saved', savedTimer)
//             time = savedTimer.timer
//             timer = setInterval()
//           }
//           else { //no drop down clicked, not saved
//             console.log('nothing saved in storage')
//             document.getElementById('timer').innerHTML('No zen settings in the ether.')
//           }
//         })
//       } else { //a drop down was chosen and should be set as the new timer
//         document.getElementById('timer').innerHTML = ''
//         setTimer(dropdown.value)
//       }

//     })
// }
// })

// function saveTimerSettings(timer) {
//   chrome.storage.sync.set({ timer: timer }, () => {
//     console.log('timer saved', timer)
//   })
// }

// function getSavedTimer(callback) {
//   chrome.storage.sync.get("timer", (obj) => {
//     console.log('GOT EM', obj.timer)
//     callback(chrome.runtime.lastError ? null : obj)
//   })
// }

// function switchFunctionality(go, stop){
//   if(go.disabled === false) {
//     go.disabled = true 
//     stop.disabled = false
//   }
//   else {
//     go.disabled = false 
//     stop.disabled = true
//   }
// }
