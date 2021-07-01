(function() {
  const newDoc = document.implementation.createHTMLDocument(document.title);
  const styleSheet = document.querySelector('link[href^="https://www.nytimes.com/games-assets/v2/spelling-bee"]').cloneNode();
  const wrapper = document.querySelector('#js-hook-game-wrapper').cloneNode(true);
  wrapper.querySelectorAll('script, svg text').forEach(element => element.remove());
  newDoc.querySelector('head').append(styleSheet);
  newDoc.body.append(wrapper);
  
  newDoc.querySelectorAll('*').forEach(element => {

    console.log(getComputedStyle(element))
  })
  const docString = newDoc.documentElement.innerHTML;
  console.log(newDoc, docString)
})()