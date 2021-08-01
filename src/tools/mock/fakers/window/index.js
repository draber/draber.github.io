import gameData from './gameData.js';
import userType from './userType.js';
import env from './env.js';
import sentryConfig from './sentryConfig.js';

const getData = options => {

    return {
        gameData: gameData(options),
        userType: userType(options),
        env: env(options),
        sentryConfig: sentryConfig(options)
    };
}

export default {
    getData
}