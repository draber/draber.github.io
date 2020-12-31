chrome.extension.sendMessage({}, response => {
	var readyStateCheckInterval = setInterval(() => {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// chrome.tabs.executeScript({
		// 	file: 'assets/spelling-bee-assistant.min.js'
		//   });

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log(response, "Hello. This message was sent from assets/content.js");
		// ----------------------------------------------------------

	}
	}, 10);
});


// console.log('content running', chrome.extension, 'xx');

// document.addEventListener('DOMContentLoaded', () => {
// 	console.log('content loaded');
//  }, false);

// // chrome.extension.webNavigation.onCompleted.addListener(()=> {
// //   console.log('site loaded (content)')
// // })