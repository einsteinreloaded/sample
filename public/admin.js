var users


(function fetchResult() {
  axios.get('/users')
    .then(result => {
      users = result.data
      appendResults(document.querySelector('#container'), users)
    }) 
})()

function appendResults(div, users) {
  for(let user of users) {
    let userDiv = document.createElement('span')
    userDiv.id = user._id
    userDiv.innerHTML = ` ${user.name} <img src="${user.image}">  <button  onClick=removeUser("${user._id}")> delete </input>`
    div.appendChild(userDiv)
  }
}

function removeUser(id) {
  axios.delete(`/user/${id}`)
    .then( () => {
      let el  = document.getElementById(id)
      if(el) el.parentNode.removeChild(el)
    })
}
var socket = io()
socket.on('user_deleted', function(msg) {
  let {id} = msg
  let el  = document.getElementById(id)
 if(el !== null) el.parentNode.removeChild(el)
})

socket.on('user_added', function(msg) {
  let {user} = msg
  appendResults(document.querySelector('#container'), [user])
})