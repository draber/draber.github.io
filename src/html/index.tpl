<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>{{label}}</title>
    <meta name="description" content="{{description}}">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>{{css}}</style>
    <meta property="og:title" content="{{label}}" />
    <meta property="og:description" content="{{description}}" />
    <meta property="og:image" content="{{url}}img/social.png?{{version}}" />
    <meta property="og:url" content="{{url}}" />
    <meta property="og:site_name" content="{{label}}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="{{twitter}}" />
    <meta name="twitter:image" content="{{url}}img/social.png?{{version}}" />
    <meta name="twitter:image:alt" content="{{label}}" />
    <meta name="google-site-verification" content="{{gsc.drg}}" />
    <meta name="google-site-verification" content="{{gsc.sba}}" />
    <link rel="icon" href="img/favicon.png?{{version}}" type="image/png" />
  </head>
  <body>
    <header>
      <div class="wrapper">
        <h1>{{label}}</h1>
        <a class="twitter-share-button" data-show-count="false" href="https://twitter.com/share?ref_src=twsrc%5Etfw">Tweet</a>
        <script async="" charset="utf-8" src="https://platform.twitter.com/widgets.js"></script>
      </div>
    </header>
    <main class="wrapper">
      <section>
        <h2>What is this?</h2>
        <p><strong>Spelling Bee Assistant</strong> is a JavaScript <a href="#bookmarklet" class="help">bookmarklet</a> for <a href="https://www.nytimes.com/puzzles/spelling-bee" rel="nofollow">Spelling Bee</a>, the New York Times’ popular word puzzle.</p>
      </section>
      <section>
        <h2>Installation</h2>
        <p>Drag and drop this bookmarklet {{bookmarklet}} into your browser’s bookmark menu. Next time you are playing Spelling Bee you can click on the bookmarklet to display the assistant.</p>
        <p><em>Note: The current version of Spelling Bee Assistant is {{version}}. If you already have an older version, you may want to delete it immediately (Right-click → Delete), otherwise it might be difficult to tell both versions apart.</em></p>
      </section>
      <section id="pz-game-root">
        <h2>What are the different parts good for?</h2>
        <div class="sb-content-box">
          <span class="sb-progress"></span>
          <ul class="sb-wordlist-items">
            <li>ambient</li>
            <li>animate</li>
            <li>anime</li>
            <li>bait</li>
            <li>biennia</li>
            <li>bite</li>
            <li>bitten</li>
            <li>imitate</li>
            <li>imminent</li>
            <li>inane</li>
            <li>inanimate</li>
            <li>initiate</li>
            <li>inmate</li>
            <li>innie</li>
            <li>intent</li>
            <li>intimate</li>
            <li>maintain</li>
            <li>matinee</li>
            <li>mien</li>
            <li>mime</li>
            <li>mine</li>
            <li>mint</li>
            <li>mite</li>
            <li>mitt</li>
            <li>mitten</li>
            <li>nine</li>
            <li>nineteen</li>
            <li>nite</li>
            <li>taint</li>
            <li>tibia</li>
            <li>time</li>
            <li>tine</li>
            <li>tint</li>
            <li>titan</li>
          </ul>
          {{plugins}}            
        </div>
      </section>
      </section>
      <section>
        <h2 id="bookmarklet">What is a bookmarklet?</h2>
        <p>Bookmarklets are small pieces of code that can enhance the functionality of a website. They reside, just like regular bookmarks, in your browser’s bookmark menu.</p>
        <p><img alt="Bookmarks" src="img/bookmarklet.png?{{version}}"><br /></p>
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
        <p>You can report bugs or request features <a href="https://github.com/draber/draber.github.io/issues">here</a>. Keep in mind that this is a fun weekend project and I don't want it to be a burden. I might work on issues from time to time but I won't make any promises.</p>
        <h2>Is the NYT behind this or are you affiliated with the NYT?</h2>
        <p>No.</p>
      </section>
      <section class="sb-modal-wrapper">
        <h2 class="modal-title">Rankings</h2>
        <span class="modal-close">×</span>
      </section>
    </main>
    <script>
      window.gameData={today:{centerLetter:"t",pangrams:["ambient"],answers:["ambient","ambit","anemia","anima","animate","anime","anti","attain","attainment","attaint","bait","beanie","biennia","bite","bitten","eminent","emit","iamb","iambi","imam","imbibe","imitate","imminent","inane","inanimate","initiate","inmate","innate","innie","intent","intimate","item","maim","main","maintain","mania","matinee","meanie","meantime","mien","mime","mine","mini","minim","minima","mint","mite","mitt","mitten","nimbi","nine","nineteen","nite","taint","tannin","tatami","teatime","tibia","tibiae","time","tine","tint","titan"],editor:"Sam Ezersky"}};
    </script>
    <script>
      {{widgetJs}}       
    </script>
    <script>
      {{siteJs}}       
    </script>
    <script>
      document.querySelector('.bookmarklet').addEventListener('dragstart', e => {
          window.fetch('https://www.google-analytics.com/collect?' + new URLSearchParams({
              v: 1,
              tid: '{{ga.tid}}',
              cid: Date.now(),
              t: 'event',
              aip: '1',
              ec: '{{ga.ec}}',
              ea: e.type,
              el: '{{version}}'
          }).toString());
      }, false);
    </script>      
    <ol class="sb-modal-list">
      <li>Beginner (0)</li>
      <li>Good Start (4)</li>
      <li>Moving Up (10)</li>
      <li>Good (17)</li>
      <li>Solid (31)</li>
      <li>Nice (52)</li>
      <li>Great (84)</li>
      <li>Amazing (105)</li>
      <li>Genius (146)</li>
    </ol>
  </body>
</html>