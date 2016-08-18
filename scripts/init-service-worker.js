if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js', { scope: '/' })
	.then(function(reg) {
		console.log('sw registered', reg);
	}).catch(function(error) {
		console.log('sw registration failed with ' + error);
	});
}
