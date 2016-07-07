var cheerio = require('cheerio'),
	request = require('request'),
	pgc = require('public-google-calendar'),
	scrape = {},
	cals = [];

scrape.gcals = function (cals, callback) {
	'use strict';
	var i = -1,
		data = [],
		next = function () {
			i++;
			if (i === cals.length) {
				return callback(null, data);
			}
			cals['gcal_' + cals[i].machinename] = new pgc({ calendarId : cals[i].id });
			cals['gcal_' + cals[i].machinename].getEvents(function(err, events) {
				if (err) { 
					return callback(err); 
				}
				events = events.map(function (obj) {
					obj.orgname = cals[i].machinename;
					return obj;
				});
				data = data.concat(events);
				next();
				// events is now array of all calendar events
			});
		};
	next();
};

module.exports = scrape;