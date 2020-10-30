# Spelling Bee Assistant

> JavaScript bookmarklet to add functionality to [Spelling Bee](https://www.nytimes.com/puzzles/spelling-bee), the New York Times' popular word puzzle.


## What does this thing do?

When you click on the bookmarklet it adds two new panels to the game. The first one shows some statistics which are updated as you progress in the game.

![Game stats](/media/stats.png)

The second panel is initially closed for a good reason - it hides a button that will, upon confirmation, solve the game with a few mouse clicks., though it won't make you Queen Bee 😞. As a bonus, all the words you didn't find yourself will displayed as links to the respective terms in Google. Maybe this helps you next time.

![Auto-solve the game](/media/solution.png)

## How do I install it?

Open `index.html` in your web browser and drag and drop the bookmarklet into the bookmark menu.


## Does it work anywhere?

The panel is not suitable for the mobile version of the game and has only been tested on desktop computers. It requires a relatively recent modern browser and won't work in Internet Explorer.


## Does this not spoil the game?

According to [this article](https://www.nytimes.com/2020/10/16/crosswords/spellingbee-puzzles.html) other people have been doing similar things and the Spelling Bee fans seem to like them. Displaying the stats is fine but you should make a serious effort to solve the game before you click on the magic button. The button is meant to be a last resort, when you eventually run out of ideas and frustration hits.


## Isn't this hacking and is it legal?

While this could certainly be called a _hack_ it's not the sort of hacking where you intrude into someone's computer system to do all sorts of evil things. At no point the code communicates with the NYT or any other server, everything happens in the browser. It only uses resources that are already available in the source code of the game, i.e. code that has been downloaded by your browser anyway. It's hard to imagine that this could be illegal anywhere but obviously there is no guarantee.


## How did you do this?

The full source code is available under the [MIT license](LICENSE.md) at [code/source.js](code/source.js). The compressed version has been created with [Andrew Chilton's JavaScript Minifier](https://javascript-minifier.com/) and the bookmarklet itself with [Peter Coles’ Bookmarklet Creator](https://mrcoles.com/bookmarklet/).


## I discovered a bug / I would like to ask for a new feature

Sorry to disappoint you, this was a fun weekend project and chances that it's ever going to be picked up again are rather slim. You can fork the code, modify it and republish it as long as you respect the license. You can make a PR and I will probably look at it, but I don't wan't this to be a duty. 
