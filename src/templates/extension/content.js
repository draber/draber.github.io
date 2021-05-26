window.addEventListener('load', () => {
	const el = document.createElement('script');
	el.async = true;
	el.src = chrome.extension.getURL('{{sbaFileName}}');
	el.id = '{{name}}';
	document.body.append(el);
})