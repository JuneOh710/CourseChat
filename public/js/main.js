const chatForm = document.getElementById('chat-form')
const socket = io()

// catch the 'message' from the server
socket.on('message', message => {
    displayMessage(message)
})
// listen to chat form submission
chatForm.addEventListener('submit', event => {
    // prevent form from submitting
    event.preventDefault()
    // set msg as [text, username]
    // where event.target.elements.msg.value is the actual text
    const msg = [event.target.elements.msg.value, username]
    socket.emit('chatMessage', msg)
    // clear message and refocus field
    event.target.elements.msg.value = ''
    event.target.elements.msg.focus()
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
