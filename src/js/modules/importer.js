/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import DarkMode from "../plugins/darkMode.js";
import Header from "../plugins/header.js";
import ProgressBar from "../plugins/ProgressBar.js";
import Overview from "../plugins/overview.js";
import SpillTheBeans from "../plugins/spillTheBeans.js";
import LetterCount from "../plugins/letterCount.js";
import FirstLetter from "../plugins/firstLetter.js";
import FirstTwoLetters from "../plugins/firstTwoLetters.js";
import Pangrams from "../plugins/pangrams.js";
import Milestones from "../plugins/milestones.js";
import Community from "../plugins/community.js";
import TodaysAnswers from "../plugins/todaysAnswers.js";
import PangramHl from "../plugins/pangramHl.js";
import Googlify from "../plugins/googlify.js";
import Styles from "../plugins/styles.js";
import Menu from "../plugins/menu.js";
import Grid from "../plugins/grid.js";
import NytShortcuts from "../plugins/nytShortcuts.js";
import ShortcutScreen from "../plugins/shortcutScreen.js";

/**
 * Plugins
 * @param app
 * @returns {Object}
 */
const getPlugins = () => {
    return {
        Header,
        Overview,
        LetterCount,
        FirstLetter,
        FirstTwoLetters,
        Pangrams,
        ProgressBar,
        SpillTheBeans,
        Grid,
        DarkMode,
        PangramHl,
        Googlify,
        Styles,
        Menu,
        Milestones,
        Community,
        ShortcutScreen,
        TodaysAnswers,
        NytShortcuts
    };
};

export default getPlugins;
