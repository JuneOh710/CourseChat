import express from 'express'
import path from 'path'
import http from 'http'
import { Server } from 'socket.io'
import formatMessage from './utils/messages.js'


const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer)

const __dirname = path.resolve(path.dirname(decodeURI(new URL(import.meta.url).pathname)));
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }));

const botName = '[Bot]';

app.get('/', (req, res) => {
    res.render('index.ejs')
})

app.get('/chat', (req, res) => {
    res.render('chat.ejs')
})

// user requests to join a chat
app.post('/', (req, res) => {
    const { username } = req.body;
    res.render('chat.ejs', { username, botName })
})


// run when a client connects
io.on('connection', socket => {
    // handle user connection
    // notify user that they connected
    socket.emit('message', formatMessage(botName, 'you are connected!'))
    // notify everyone else that a user connected
    socket.broadcast.emit('message', formatMessage(botName, 'a user has joined the chat'))

    // handle chatMessage from user
    socket.on('chatMessage', (msg) => {
        // send this message to every user
        io.emit('message', formatMessage(msg[1], msg[0]))
    })

    // handle user disconnecting
    socket.on('disconnect', () => {
        // send to everyone connected
        io.emit('message', formatMessage(botName, 'a user has left the chat'))
    })
})




const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => console.log(`serving port ${PORT}`))
