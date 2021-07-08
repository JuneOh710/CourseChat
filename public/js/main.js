const chatForm = document.getElementById('chat-form')
const socket = io()

// catch the 'message' from the server
socket.on('message', message => {
    displayMessage(message)
})
const chatMessages = document.querySelector('.chat-messages')
// send to sever that this user joined this room (when the ejs renders I guess)
// a bit janky but I can send the username as the message. 
// (username is defined as a global variable in the ejs file)
socket.emit('joinRoom', username)

// listen to chat form submission
chatForm.addEventListener('submit', event => {
    // prevent form from submitting
    event.preventDefault()
    // where event.target.elements.msg.value is the actual text
    const msg = [username, event.target.elements.msg.value]
    socket.emit('chatMessage', msg)
    clearAndRefocus(event.target.elements.msg)
})



function displayMessage(message) {
    const chatMessages = document.querySelector('.chat-messages')
    const newChatMessage = document.createElement('div')
    newChatMessage.classList.add('message')
    newChatMessage.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
                    <p class="text">
                        ${message.text}
                    </p>
                    `
    chatMessages.appendChild(newChatMessage)
    scrollToBottom(chatMessages)
}

function scrollToBottom(chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight
}
function clearAndRefocus(field) {
    field.value = '';
    field.focus()
}