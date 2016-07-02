var util = {},
	fs = require('fs');

//keep it small

util.store = {}

util.page = function (name, path) {
	'use strict';
	if (typeof util.store[name] === 'undefined') {
		util.store[name] = fs.readFileSync(path, 'utf8');
		console.log('Ingesting page "' + name + '" from ' + path);
	}
	return util.store[name];
};

module.exports = util;