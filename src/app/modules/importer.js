/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 * 
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import DarkMode from '../plugins/darkMode.js';
import ColorConfig from '../plugins/colorConfig.js';
import Header from '../plugins/header.js';
import ProgressBar from '../plugins/ProgressBar.js';
import Score from '../plugins/score.js';
import SpillTheBeans from '../plugins/spillTheBeans.js';
import LetterCount from '../plugins/letterCount.js';
import FirstLetter from '../plugins/firstLetter.js';
import Pangrams from '../plugins/pangrams.js';
import YourProgress from '../plugins/yourProgress.js';
import Community from '../plugins/community.js';
import TodaysAnswers from '../plugins/todaysAnswers.js';
import PangramHl from '../plugins/pangramHl.js';
import Googlify from '../plugins/googlify.js';
import Styles from '../plugins/styles.js';
import Menu from '../plugins/menu.js';
import Grid from '../plugins/grid.js';
import SideBar from '../plugins/sidebar.js'
import Popup from '../plugins/popup.js'

/**
 * Plugins
 * @param app
 * @returns {Object}
 */
const getPlugins = () => {
    return {
        Header,
        Score,
        LetterCount,
        FirstLetter,
        Pangrams,
        ProgressBar,
        SpillTheBeans,
        DarkMode,
        PangramHl,
        Googlify,
        Styles,
        Menu,
        Grid,
        YourProgress,
        Community,
        ColorConfig,
        SideBar,
        Popup,
        TodaysAnswers
    }
}

export default getPlugins;
