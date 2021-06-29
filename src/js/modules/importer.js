import DarkMode from '../plugins/darkMode.js';
import ColorConfig from '../plugins/colorConfig.js';
import Header from '../plugins/header.js';
import ProgressBar from '../plugins/ProgressBar.js';
import Score from '../plugins/score.js';
import SpillTheBeans from '../plugins/spillTheBeans.js';
import LetterCount from '../plugins/letterCount.js';
import FirstLetter from '../plugins/firstLetter.js';
import YourProgress from '../plugins/yourProgress.js';
import Answers from '../plugins/answers.js';
import Pangrams from '../plugins/pangrams.js';
import Googlify from '../plugins/googlify.js';
import Styles from '../plugins/styles.js';
import Menu from '../plugins/menu.js';

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
          SpillTheBeans,
          ProgressBar,
          DarkMode,
          ColorConfig,
          Pangrams,
          Googlify,
          Styles,
          Menu,
          YourProgress,
          Answers
     }
}

export default getPlugins;
