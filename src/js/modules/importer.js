import Launcher from '../plugins/launcher.js';
import DarkMode from '../plugins/darkMode.js';
import Header from '../plugins/header.js';
import SetUp from '../plugins/setUp.js';
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
import Positioning from '../plugins/positioning.js';
import Styles from '../plugins/styles.js';

const plugins = {
     Launcher,
     DarkMode,
     Header,
     SetUp,
     ProgressBar,
     ScoreSoFar,
     Spoilers,
     StartingWith,
     SpillTheBeans,
     StepsToSuccess,
     Surrender,
     HighlightPangrams,
     Googlify,
     Footer,
     Positioning,
     Styles
}

/**
 * Plugins (minus Positioning on mobiles)
 * @param app
 * @returns {{
 *   Styles,
 *   Launcher,
 *   DarkMode,
 *   Header,
 *   SetUp,
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
 *   [Positioning]
 * }}
 */
const getPlugins = app => {
     if(!app.envIs('desktop')){
          delete plugins.Positioning;
     }
     return plugins
}

export default getPlugins;
