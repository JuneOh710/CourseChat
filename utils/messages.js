import moment from 'moment'

const messages = [];

function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().format('h:mm a')
    }
}

export { formatMessage, messages }
