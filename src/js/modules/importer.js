import Styles from '../plugins/styles.js';
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
import TrMarkCompleted from '../plugins/trMarkCompleted.js';
import TrHideCompleted from '../plugins/trHideCompleted.js';
import TrMarkPreeminent from '../plugins/trMarkPreeminent.js';
import Footer from '../plugins/footer.js';
import Positioning from '../plugins/positioning.js';

const plugins = {
     Styles,
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
     TrMarkCompleted,
     TrHideCompleted,
     TrMarkPreeminent,
     HighlightPangrams,
     Footer,
     Positioning
}

/**
 * Plugins (minus Positioning on mobiles)
 * @param app
 * @returns {{StartingWith: StartingWith, Positioning: Positioning, DarkMode: DarkMode, ScoreSoFar: ScoreSoFar, Surrender: Surrender, Spoilers: Spoilers, SpillTheBeans: SpillTheBeans, StepsToSuccess: StepsToSuccess, TrHideCompleted: TrHideCompleted, Header: Header, TrMarkPreeminent: TrMarkPreeminent, TrMarkCompleted: TrMarkCompleted, Footer: Footer, Launcher: Launcher, SetUp: SetUp, ProgressBar: ProgressBar, Styles: Styles, HighlightPangrams: HighlightPangrams}}
 */
const getPlugins = app => {
     if(!app.envIs('desktop')){
          delete plugins.Positioning;
     }
     return plugins
}

export default getPlugins;
