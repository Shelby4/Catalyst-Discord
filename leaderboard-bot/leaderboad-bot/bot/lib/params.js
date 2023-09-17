const getParams = ( msg ) => {
    var msgContent = msg.content;

    var params = msgContent.split(' ')

    return params
}

module.exports = { getParams }