window.addEventListener('load', () => {
	const el = document.createElement('script');
	el.async = true;
	el.src = chrome.runtime.getURL('spelling-bee-assistant.js');
	el.id = 'spelling-bee-assistant';
	setTimeout(() => {
		document.body.append(el);
	}, 1500)
})