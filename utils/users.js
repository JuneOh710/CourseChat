const users = [];

function addUser(id, username, room) {
    const user = { id, username, room }
    users.push(user)
}

function getCurrentUser(id) {
    return users.find(user => user.id === id)
}

export { users, addUser, getCurrentUser }