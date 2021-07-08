import express from 'express'
import path from 'path'
import http from 'http'
import { Server } from 'socket.io'
import { formatMessage } from './utils/messages.js'
import { users, addUser, getCurrentUser, removeCurrentUser } from './utils/users.js'


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
    const { username, room } = req.query;
    // pass in the username to define it as a global variable. 
    res.render('chat.ejs', { username, room })
})

// this works
// user requests to join a chat
app.post('/', (req, res) => {
    // get username input from the form and turn it into a query string
    const username = encodeURIComponent(req.body.username);
    const room = encodeURIComponent(req.body.room)
    res.redirect(`/chat?username=${username}&room=${room}`)
})


// run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        // check if user is not defined
        if (!getCurrentUser(socket.id)) {
            // if not defined... 
            addUser(socket.id, username, room)
        }
        socket.join(room)
        // emit to all clients' sidebar
        io.to(room).emit('sidebarUpdate', users)
        // handle user connection
        // notify user that they connected
        socket.emit('message', formatMessage(botName, `you are connected, ${username}`))
        // notify everyone else that a user connected
        socket.broadcast.to(room).emit('message', formatMessage(botName, `${username} has joined the chat`))
        // handle chatMessage from user
        socket.on('chatMessage', ({ username, text }) => {
            // send this message to every user
            io.to(room).emit('message', formatMessage(username, text))
        })
    })

    // handle user disconnecting
    socket.on('disconnect', () => {
        const user = getCurrentUser(socket.id)
        // send to everyone connected
        io.to(user.room).emit('message', formatMessage(botName, `${getCurrentUser(socket.id).username} has left the chat`))
        removeCurrentUser(user)
        io.to(user.room).emit('sidebarUpdate', users)
    })
})


const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => console.log(`serving port ${PORT}`))
