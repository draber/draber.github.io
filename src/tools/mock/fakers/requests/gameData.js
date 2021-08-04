const gameData = options => {
    return options.req.method === 'PUT' ? {
        status: 'OK'
    } : {
        userID: options.userId,
        puzzleID: options.gameId,
        answers: []
    }
}

export default gameData;