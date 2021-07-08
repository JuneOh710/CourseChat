import express from 'express'
import path from 'path'
import http from 'http'
import { Server } from 'socket.io'
import { formatMessage } from './utils/messages.js'
import { users } from './utils/users.js'


const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer)

const __dirname = path.resolve(path.dirname(decodeURI(new URL(import.meta.url).pathname)));
app.use(express.static(path.join(__dirname, 'public')))
// allow reading from req.body
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


const botName = '[Bot]';

// this works
app.get('/', (req, res) => {
    res.render('index.ejs')
})

// todo: fix this 
app.get('/chat', (req, res) => {
    const username = req.query.username;
    // pass in the username to define it as a global variable. 
    res.render('chat.ejs', { username })
})

// this works
// user requests to join a chat
app.post('/', (req, res) => {
    // get username input from the form and turn it into a query string
    const username = encodeURIComponent(req.body.username);
    res.redirect(`/chat?username=${username}`)
})

const socketList = [];
// run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', (username) => {
        // check if username is not already taken
        if (!users.includes(username)) {
            // if not taken...
            users.push(username)
            socket.username = username;
            socketList.push(socket)
        }
        // if username was taken then do nothing and continue... 
        // emit to all clients' sidebar
        io.emit('sidebarUpdate', users)
        // handle user connection
        // notify user that they connected
        socket.emit('message', formatMessage(botName, `you are connected, ${username}`))
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
        // modify existing users array... 
        const i = socketList.indexOf(socket)
        // send to everyone connected
        io.emit('message', formatMessage(botName, `${users[i]} has left the chat`))
        users.splice(i, 1);
        socketList.splice(i, 1);
        io.emit('sidebarMessage', users)
    })
})




const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => console.log(`serving port ${PORT}`))
