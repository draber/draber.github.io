<!DOCTYPE html>
<html lang="en">
<head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type">
    <meta charset="utf-8">
    <title>{{config(label)}}</title>
    <style>{{include(project/css/site.css)}}</style>
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta content="{{config(label)}}" property="og:title">
    <meta content="{{config(description)}}" property="og:description">
    <meta content="{{config(url)}}img/social.png" property="og:image">
    <meta content="{{config(url)}}" property="og:url">
    <meta content="summary_large_image" name="twitter:card">
    <meta content="{{config(twitter)}}" name="twitter:site">
    <meta content="{{config(label)}}" property="og:site_name">
    <meta content="{{config(label)}}" name="twitter:image:alt">
    <link rel="icon" href="img/favicon.png?{{config(version)}}" type="image/png">
</head>

<body>
    <header>
        <div class="wrapper">
            <h1>{{config(label)}}</h1>
            <a class="twitter-share-button" data-show-count="false" href="https://twitter.com/share?ref_src=twsrc%5Etfw">Tweet</a>
            <script async="" charset="utf-8" src="https://platform.twitter.com/widgets.js"></script>
        </div>
    </header>
    <main class="wrapper">
        <section>
            <h2>What is this?</h2>
            <p><strong>Spelling Bee Assistant</strong> is a JavaScript bookmarklet for <a href="https://www.nytimes.com/puzzles/spelling-bee" rel="nofollow">Spelling Bee</a>, the New York Times’ popular word puzzle.</p>
            <p>In case you haven’t heard of bookmarklets before, they are small pieces of code that can enhance the functionality of a website. They reside, just like regular bookmarks in your browser’s bookmark menu.</p>
            <p><img alt="Bookmarks" src="img/bookmarklet.png?{{config(version)}}"><br /></p>
            <p>This bookmarklet adds a new panel with three sections to the game, data will be updated as you progress.</p>
            <div class="panels">
                <div>
                    <h3>Stats</h3>
                    <img alt="Game stats" src="img/stats.png?{{config(version)}}">
                    <p>This panel shows some statistics but contains - apart from the total number of points - no spoilers.</p>
                </div>
                <div>
                    <h3>Spoilers</h3>
                    <img alt="Spoilers" src="img/spoilers.png?{{config(version)}}">
                    <p>This one is similar but it gives away information that you probably don’t want to know early on.</p>
                </div>
                <div>
                    <h3>Solution</h3>
                    <img alt="Solution" src="img/solution.png?{{config(version)}}">
                    <p>The third section hides a button that will solve the game with a few mouse clicks, though without making you Queen Bee 😞. All the words you didn't find will be linked to the respective terms in Google. Maybe this will help you next time!</p>
                </div>
            </div>
        </section>
        <section>
            <h2>Installation</h2>
            <p><em>Note: The current version of Spelling Bee Assistant is {{config(version)}}. If you already have an older version, you may want to delete it first (Right-click → Delete), otherwise it might be difficult to tell both versions apart.</em></p>
            <p>Drag and drop the bookmarklet below into your browser’s bookmark menu <br /><a class="bookmarklet" href="{{config(bookmarklet)}}">Spelling Bee Assistant</a></p>
            <p>Next time you are playing Spelling Bee you can click on the bookmarklet to display the assistant. You can drag it anywhere on the page by grabbing it at the top and close it by clicking on the <b>×</b> symbol.</p>
        </section>
        <section>
            <h2>Does it work everywhere?</h2>
            <p>The assistant is not suitable for the mobile version of the game and has only been tested in the desktop version. It requires a <a href="https://caniuse.com/details">modern browser</a> and won’t work in Internet Explorer.</p>
            <h2>Does it not spoil the game?</h2>
            <p>Other people have been creating <a href="https://www.shunn.net/bee/">tools with a similar purpose</a> which - according to <a href="https://www.nytimes.com/2020/10/16/crosswords/spellingbee-puzzles.html">this article</a> - the Spelling Bee community seems to like well.</p>
            <p>Use the Assistant sparsely, don't launch it before having solved a good chunk of the game on your own. Don't open the <em>Spoilers</em> panel before you really need to. Only hit the magic button when you eventually run completely out of ideas. At least for me it works well this way.</p>
            <h2>How did you do this?</h2>
            <p>The source code is available under the MIT License from <a href="https://github.com/draber/draber.github.io">this repository</a>.</p>
            <h2>I discovered a bug | I’d like to ask for a new feature</h2>
            <p>You can report bugs or request features <a href="https://github.com/draber/draber.github.io/issues">here</a>. Keep in mind that this is as a fun weekend project and I don't want it to be a burden. I might work on issues from time to time but I won't make any promises.</p>
            <h2>Is the NYT behind this or are you affiliated with the NYT?</h2>
            <p>No.</p>
        </section>
    </main>
    <script>
        document.querySelector('.bookmarklet').addEventListener('dragstart', e => {
            window.fetch('https://www.google-analytics.com/collect?' + new URLSearchParams({
                v: 1,
                tid: '{{config(ga.tid)}}',
                cid: Date.now(),
                t: 'event',
                aip: '1',
                ec: '{{config(ga.ec)}}',
                ea: e.type,
                el: '{{config(version)}}'
            }).toString());
        }, false);
    </script>
</body>
</html>
