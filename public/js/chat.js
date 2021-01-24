const socket = io()

//server (emit) -> client (receive) --acknowledgement --> server

//client (emit) -> server (receive) --acknowledgement --> client


//Elements
const messageForm = document.querySelector("#message-form")
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')
const sendLocationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//console.log(locationMessageTemplate)


//options
const {username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})



socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message: message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html) 
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username:message.username,
        url: message.url,
        createdAt:moment(message.createdAt).format('h:mm a')

    })
    messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html 
})

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    messageFormButton.setAttribute('disabled', 'disabled')
    //const message = document.querySelector('input').value
    const message = e.target.elements.message.value ;

    socket.emit('sendMessage', message, (error) =>{
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value=''
        messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message delivered')
    })
    
})

sendLocationButton.addEventListener('click', () => {
    
    sendLocationButton.setAttribute('disabled', 'disabled')
    
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

        navigator.geolocation.getCurrentPosition((position) => {

            socket.emit('sendLocation', {
                latitude:position.coords.latitude,
                longitude: position.coords.longitude
            } 
        , () => {
            sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
    
})

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})

// //on basically listen whenever countUpdated happen
// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated', count)
// })

// document.querySelector("#increament").addEventListener('click', () => {
//     console.log('clicked')
//     socket.emit('increment')
// })