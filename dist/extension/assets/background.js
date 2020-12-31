



chrome.extension.onMessage.addListener(
  
  (data, sender) => {
      return Promise.resolve('done');
  }
  // function(request, sender, sendResponse) {
  //   console.log('background running');
  //   console.log(request, sender, sendResponse)
  // 	chrome.pageAction.show(sender.tab.id);
  //   sendResponse();
  // }
  );

