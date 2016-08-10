var cheerio = require('cheerio'),
	request = require('request'),
	pgc = require('public-google-calendar'),
	scrape = {},
	cals = [];

scrape.gcals = function (cals, callback) {
	'use strict';
	var i = -1,
		data = {},
		next = function () {
			i++;
			if (i === cals.length) {
				console.log(JSON.stringify(data));
				data = scrape.flatten(data);
				return callback(null, data);
			}
			cals['gcal_' + cals[i].machinename] = new pgc({ calendarId : cals[i].id });
			cals['gcal_' + cals[i].machinename].getEvents(function(err, events) {
				if (err) { 
					return callback(err); 
				}
				data[cals[i].machinename] = events;
				next();
				// events is now array of all calendar events
			});
		};
	next();
};

scrape.flatten = function (obj) {
	'use strict';
	var keys = Object.keys(obj),
		i,
		arr = [];
	for (i = 0; i < keys.length; i++) {
		obj[keys[i]].map(function (elem) {
			elem.orgname = keys[i];
			return elem;
		});
		arr = arr.concat(obj[keys[i]]);
	}
	return arr;
};

module.exports = scrape;