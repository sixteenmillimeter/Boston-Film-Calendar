var pgc = require('public-google-calendar'),
	request = require('request'),
	scrape = {},
	cals = [];

scrape.gcals = function (cals, callback) {
	'use strict';
	var i = -1,
		data = {},
		next = function () {
			i++;
			if (i === cals.length) {
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

scrape.agx = function (callback) {
	'use strict';
	var url = 'http://dev.agxfilm.org/bostonfilmcalendar.json';
	request(url, function (err, res, body) {
		if (!err && res.statusCode == 200) {
		    //console.log(body); // Show the HTML for the Google homepage.
		    callback(null, JSON.parse(body));
		} else {
			console.error(err);
			console.error(res);
			callback(err);
		}
	});
};

module.exports = scrape;