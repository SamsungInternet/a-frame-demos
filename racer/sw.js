/* global toolbox, importScripts, self */
/* jshint browser:true */
'use strict';

importScripts('/scripts/sw-toolbox.js');

toolbox.options.networkTimeoutSeconds = 3;
toolbox.router.default = (location.protocol === 'http:' || location.hostname === 'localhost') ? toolbox.networkFirst : toolbox.fastest;
