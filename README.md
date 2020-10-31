# Spelling Bee Assistant

> JavaScript bookmarklet to add functionality to [Spelling Bee](https://www.nytimes.com/puzzles/spelling-bee), the New York Times' popular word puzzle.


## What does this thing do?

When you click on the bookmarklet it adds two new panels to the game. 

![Game stats](img/stats.png)

The first panel shows some statistics but contains no spoilers. The table will be updated as you progress in the game.


![Spoilers](img/spoilers.png)

The second panel is similar to the first one but it gives away information that you probably don’t want to know early on.


![Auto-solve the game](img/solution.png)

The third panel hides a button that - upon confirmation - will solve the game with a few mouse clicks. However, it won't make you Queen Bee 😞. All the words you didn't find yourself will be linked to the respective terms in Google. Maybe this will help you next time!

## How do I install it?

Download and unpack the [zip file](https://github.com/draber/spelling-bee-assistant/archive/main.zip) and open `index.html` in your web browser. Drag and drop the bookmarklet into the bookmark menu.


## Does it work everywhere?

The panel is not suitable for the mobile version of the game and has only been tested in the desktop version. It requires a [modern browser](https://caniuse.com/details) and won't work in Internet Explorer.


## Does it not spoil the game?

According to [this article](https://www.nytimes.com/2020/10/16/crosswords/spellingbee-puzzles.html) other people have been creating similar tools, which the Spelling Bee community seems to be fond of.

Start the game without the extra panels, then at some point you can display the stats. Do yourself the favor and make a serious effort to solve the game before you click on the magic button. The button is meant to be a last resort, when you eventually run out of ideas and frustration hits.


## Isn't this hacking and is it legal?

While this could certainly be called a _hack_ it's not the sort of hacking where you intrude into someone's computer system to do all sorts of evil things. At no point the code communicates with the NYT or any other server, everything happens in the browser. It only uses resources that are already available in the source code of the game, i.e. they have been downloaded by your browser anyway. It's hard to imagine that this could be illegal anywhere but obviously there is no guarantee.


## How did you do this?

You can study the JavaScript source code which is [right here](code/source.js). I used the Chrome console for development, then [compressed](code/source-compressed.js) the code with Andrew Chilton's [JavaScript Minifier](https://javascript-minifier.com/) and eventually created the bookmarklet from this compressed version with Peter Coles’ [Bookmarklet Creator](https://mrcoles.com/bookmarklet/).

The CSS code is written using SASS, you can [find it here](code/scss/styles.scss). The CSS has been manually copied to `appendStyles()` in the JavaScript source file. Not the most elegant way, but it does what it should.


## I discovered a bug / I would like to ask for a new feature

Sorry to disappoint you, this was a fun weekend project and chances that it's ever going to be picked up again are rather slim. The code is available under the [MIT license](LICENSE.md) and you can fork, modify and republish it as long as you respect the terms of the license. You can make a PR and I will probably look at it, but I don't want this to be a duty.
