import DarkMode from '../plugins/darkMode.js';
import Header from '../plugins/header.js';
import ProgressBar from '../plugins/ProgressBar.js';
import ScoreSoFar from '../plugins/scoreSoFar.js';
import SpillTheBeans from '../plugins/spillTheBeans.js';
import Spoilers from '../plugins/spoilers.js';
import StartingWith from '../plugins/startingWith.js';
import StepsToSuccess from '../plugins/stepsToSuccess.js';
import Surrender from '../plugins/surrender.js';
import HighlightPangrams from '../plugins/highlightPangrams.js';
import Googlify from '../plugins/googlify.js';
import Footer from '../plugins/footer.js';
import Styles from '../plugins/styles.js';
import Menu from '../plugins/menu.js';

/**
 * Plugins (minus Positioning on mobiles)
 * @param app
 * @returns {{
 *   Styles,
 *   DarkMode,
 *   Header,
 *   ProgressBar,
 *   ScoreSoFar,
 *   Spoilers,
 *   StartingWith,
 *   SpillTheBeans,
 *   StepsToSuccess,
 *   Surrender,
 *   HighlightPangrams,
 *   Googlify,
 *   Footer,
 *   Menu
 * }}
 */
const getPlugins = app => {
     return {
          DarkMode,
          Header,
          ProgressBar,
          ScoreSoFar,
          Spoilers,
          StartingWith,
          SpillTheBeans,
          HighlightPangrams,
          Googlify,
          Footer,
          Styles,
          Menu,
          StepsToSuccess,
          Surrender
     }
}

export default getPlugins;
