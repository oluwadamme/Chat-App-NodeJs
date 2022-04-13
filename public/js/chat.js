// client side script to connect to the server web scoket

const socket = io()

// to receive emitted data from the server

// socket.on('countUpdated', (count)=>{
//     console.log('the count has been updated', count)
// })

const locationButton  = document.querySelector('#send-location')
const chatForm  = document.querySelector('#message-form')
const messageFormInput = chatForm.querySelector('input')
const messageFormButton = chatForm.querySelector('button')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

// Options

const {username, room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (text) => {
   // console.log(text)
    const html = Mustache.render(locationMessageTemplate, {
        url: text.url,
        createdAt: moment(text.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', html)
})

chatForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    // disable a button
    messageFormButton.setAttribute('disabled', 'disabled')

    const msgVal = e.target.elements.messageInput.value

    socket.emit('messageSent', msgVal,(error)=>{
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value = ''
        messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        //Event Acknowledgement to the server side
        console.log('The message was delievered!')
    })
   
    socket.on('message', (msg)=>{
        console.log(msg);
    })

    
})
socket.on('message', (msg)=>{
    console.log(msg);
})


locationButton.addEventListener('click',()=>{
    
   if (!navigator.geolocation) {
       return alert('Geolocation is not supported by your browser.')
   } 
   locationButton.setAttribute('disabled', 'disabled')
   navigator.geolocation.getCurrentPosition((position)=>{
    
    const lng =position.coords.longitude
    const lat = position.coords.latitude
    socket.emit('sendLocation',{'longitude':lng,'latitude':lat},
    ()=>{
        console.log('Location shared!')
        locationButton.removeAttribute('disabled')
    })
   })
})

socket.emit('join', {username,room}, (error)=>{
    if (error) {
        alert(error)
        location.href ='/'
    }
})