const express = require('express');
const http = require('http');
const path = require('path');
const app = express()
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generatedMessage, generatedLocationMessage}  = require('./utils/messages');
const {addUser,getUser,removeUser,getUsersInRoom}= require('./utils/users')

const server = http.createServer(app)
const io = socketio(server)
const publicDirPath = path.join(__dirname, '../public')

const port = process.env.PORT || 3000

app.use(express.static(publicDirPath))

// app.get('',(req,res)=>{
//     res.render('index')
// })
let count = 0
// connecting our web socket to the server side
// socket is an object that contains information  about our the new connection
io.on('connection', (socket)=>{
    console.log('new websocket connection')
 
    socket.on('join', ({username,room}, callback)=>{
        const {error, user} = addUser({id:socket.id, username,room})
        if (error) {
            return callback(error)
        }
        socket.join(user.room) // to join a chat room

    // sending data from the server to the client
    // it takes in an event parameter to emit the data from the server to the client
    socket.emit('message', generatedMessage('Admin','Welcome'))
    socket.broadcast.to(user.room).emit('message', generatedMessage('Admin',`${user.username} has joined`))// emit a message to all users in a specific room
    io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
    })

    callback()
    })

    // recieving data from the client side
    socket.on('messageSent',(msg, callback)=>{
        const user = getUser(socket.id)

        const filter = new Filter()
        if (filter.isProfane(msg)) {
          return  callback('Profanity is not allowed')
        }
        
        // send data to all users connected to a server
        io.to(user.room).emit('message', generatedMessage(user.username,msg))
        callback()
    })

    socket.on('sendLocation',(coords, callback)=>{
        const user = getUser(socket.id)
        
        io.to(user.room).emit('message',generatedLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generatedMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })
})


server.listen(port, ()=>{
    console.log('Server is up on port '+ port);
})