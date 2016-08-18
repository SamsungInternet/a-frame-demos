/* global toolbox, importScripts, self */
/* jshint browser:true */
'use strict';

importScripts('scripts/sw-toolbox.js');

// Send a signal to all connected windows.
// Used for service worker bridge in a-slides
function reply(data) {
	return self.clients.matchAll({type: 'window'})
	.then(function (windows) {
		windows.forEach(function (w) {
			w.postMessage(data);
		});
	});
}

// Echo messages back to every window
self.addEventListener('message', function(event) {
	reply(event.data);
});

toolbox.router.default = (location.protocol === 'http:' || location.hostname === 'localhost') ? toolbox.networkFirst : toolbox.fastest;
