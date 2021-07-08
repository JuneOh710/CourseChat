import express from 'express'
import path from 'path'
import http from 'http'
import { Server } from 'socket.io'
import { formatMessage, messages } from './utils/messages.js'
import { users } from './utils/users.js'


const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer)

const __dirname = path.resolve(path.dirname(decodeURI(new URL(import.meta.url).pathname)));
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }));

const botName = '[Bot]';

// this works
app.get('/', (req, res) => {
    res.render('index.ejs')
})

// todo: fix this 
app.get('/chat', (req, res) => {
    // assume user doensn't send direct get request lol
    const username = req.query.username;
    if (!users.find(user => user === username)) {
        users.push(username)
    }
    res.render('chat.ejs', { username, users, botName, messages })
})

// this works
// user requests to join a chat
app.post('/', (req, res) => {
    const username = encodeURIComponent(req.body.username);
    res.redirect(`/chat?username=${username}`)
})


// run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', (username) => {
        console.log(username)
        // handle user connection
        // notify user that they connected
        socket.emit('message', formatMessage(botName, 'you are connected!'))
        // notify everyone else that a user connected
        socket.broadcast.emit('message', formatMessage(botName, `${username} has joined the chat`))

        // handle chatMessage from user
        socket.on('chatMessage', (msg) => {
            // send this message to every user
            io.emit('message', formatMessage(msg[0], msg[1]))
        })

    })
    // handle user disconnecting
    socket.on('disconnect', () => {
        // send to everyone connected
        io.emit('message', formatMessage(botName, 'a user has left the chat'))
    })
})




const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => console.log(`serving port ${PORT}`))
