'use strict'
const express = require('express')
const bluebird = require('bluebird')
const mongoose = require('mongoose')
const multer = require('multer')
const app = express()
const http = require('http').Server(app)
var io = require('socket.io')(http);

const PORT = 3000
const db = mongoose.connection

const imageExtensions = ['jpg', 'jpeg', 'png']

db.on('error', () => {
  console.log('mongodb failed on you!')
  process.exit(1)
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images')
  },
  filename: (req, file, cb) => {
    let extension = file.mimetype.split('/')[1]
    let name = 'image-'+ Date.now().toString() +'.' + extension
    cb(null, name )
  }
})

const upload = multer({storage: storage})

//mongoose Schema
const UserSchema = new mongoose.Schema({
  name: String,
  image: String
})

const User = mongoose.model('Users', UserSchema)


app.use('/', express.static('public'))
app.use('/images', express.static('images'))
app.post('/user', upload.array("myFile", 1), addUser)
app.delete('/user/:id', deleteUser)
app.get('/users', getUsers)
app.get('/i/:url', sendImageHandler)

//Controllers
function addUser(req, res, next) {
  let file = req.files[0]
  let username = req.body.name
  console.log('username is ', username)
  let filename = file.filename
  if(!imageExtensions.includes(filename.split('.')[1]) ) {
    res.statusCode = 400
    res.send('invalid image, using default image instead')
    file.filename = 'default.jpeg'
    return
  }
  let randomString = generateRandomString()
  let user = createUser(username,  filename,  randomString)
  user.save().then((user) => {
    io.emit('user_added', {user})
    res.send('User Sucessfully Added')
  })
}

function deleteUser(req, res) {
  let id = req.params.id
  User.remove({'_id': id}).then(() => {
    res.send('user deleted')
  })
  io.emit('user_deleted', {id})
}

function getUsers(req, res) {
  User.find({})
    .then(result => {res.send(result)})
    .catch(e => errorHandler(e, res))
}

function errorHandler(err, res) {
  res.statusCode = 400
  console.log(`Error : ${err}`)
  res.send("Error processing request")
}

function sendImageHandler(req, res, next) {
  let link = req.params.url
  Image.findOne({url: link})
    .then((doc) => {
      res.redirect(doc.location)
    })
    .catch((err) => {
      res.redirect('/images/404.png')
    })
}

//services
function createUser(name, filename, randomString) {
  return new User({
    name,
    image: '/images/'+ filename
  })
}

function generateRandomString() {
  let ar = Date.now().toString().split('').slice(3, 13)
  let str = ""
  ar.forEach((el) => {
    str += String.fromCharCode(97 + parseInt(el))
  })
  return str
}

//connect to db and start server !
mongoose.connect("mongodb://localhost/test")
http.listen(PORT, () => {
  console.log('app started listening on port '+ PORT)
  console.log('May the force be with you!')
})
