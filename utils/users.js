const users = [];

function addUser(id, username, room) {
    const user = { id, username, room }
    users.push(user)
}

function getCurrentUser(id) {
    return users.find(user => user.id === id)
}

function removeCurrentUser(user) {
    const i = users.indexOf(user)
    users.splice(i, 1)
}

export { users, addUser, getCurrentUser, removeCurrentUser }