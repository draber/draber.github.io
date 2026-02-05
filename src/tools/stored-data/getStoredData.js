/**
 * Dump all values from localStorage and cookie
 * This method is meant to help with debugging
 *
 * @returns Object
 */

function getStoredData(formatAsString = false) {

    const hiddenAnswers = {
        pangrams: ["unspoiled"],
        answers: ["unspoiled"],
    };

    /**
     * Parse a value as JSON if possible
     *
     * @param {String} value
     * @returns Object|String
     */
    const parsePossibleJson = (value) => {
        let parsed;
        try {
            parsed = JSON.parse(value);
        } catch (e) {
            return value;
        }
        return parsed;
    };

    /**
     * Remove all answers, pangrams and such
     *
     * @param {Object} obj
     * @param {Object} values
     * @returns
     */
    const removeSpoilers = (obj, values) => {
        const keysToUpdate = Object.keys(values);

        Object.keys(obj).forEach((key) => {
            if (keysToUpdate.includes(key)) {
                obj[key] = values[key];
            } else if (typeof obj[key] === "object" && obj[key] !== null) {
                removeSpoilers(obj[key], values);
            }
        });
        return obj;
    };

    /**
     * Parse a cookie
     * @returns Object
     */
    const getCookieData = () => {
        if (!document.cookie) {
            return {};
        }
        let data = document.cookie
            .split(";")
            .map((entry) => entry.split("="))
            .reduce((acc, v) => {
                acc[decodeURIComponent(v[0].trim())] = parsePossibleJson(decodeURIComponent(v[1].trim()));
                return acc;
            }, {});
        return removeSpoilers(data, hiddenAnswers);
    };

    /**
     * Get the actual game data
     * @returns Object
     */
    const getGameData = () => {
        return removeSpoilers(window.gameData, hiddenAnswers);
    }

    /**
     * Get data from local or session storage
     * @param {Storage} storage
     * @returns Object
     */
    const getStorageData = (storage) => {
        let data = {};
        Object.keys(storage).forEach((key) => {
            data[key] = parsePossibleJson(storage.getItem(key));
        });
        return removeSpoilers(data, hiddenAnswers);
    };

    const data = {
        localStorage: getStorageData(localStorage),
        sessionStorage: getStorageData(sessionStorage),
        cookie: getCookieData(),
        game: getGameData()
    };


    return formatAsString ? JSON.stringify(data) : data;
}
