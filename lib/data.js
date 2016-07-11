var data = {},
	pg = require('pg'),
	squel = require('squel'),
	squelPG = squel.useFlavour('postgres'),
	client;

data.init = function (cb) {
	'use strict';
	console.log('Connecting to database... ');
	pg.connect(process.env.DATABASE_URL, function(err, c) {
		if (err) {
			console.log('Error connecting to database:');
			throw err;
		}
		console.log('Connected to ' + process.env.DATABASE_URL);
		client = c;
		if (cb) cb();
	});
};

data.cal = {};
data.cal.table = 'bfcal_data_dev';
data.cal.index = 'bfcal_index_dev';

data.cal.create = function (cb) {
	'use strict';
	var query = 'CREATE TABLE ' + data.cal.table;
	query += ' (';
	query += 'event_id serial PRIMARY KEY, ';
	query += 'org varchar (255) NOT NULL, ';
	query += 'org_id varchar (255) NOT NULL, ';
	query += 'title varchar (255) NOT NULL, ';
	query += 'url varchar (255) NOT NULL, ';
	query += 'start_date date, ';
	query += 'end_date date, ';
	query += 'scraped_date date ';
	query += ');';
	
	console.log('Creating table ' + data.cal.table);
	console.log(query);

	client.query(query, function (err, result) {
		if (err) {
			return cb(err);
		}
		cb(null, result);
	});

	/*CREATE TABLE pg_equipment (
		equip_id serial PRIMARY KEY,
		type varchar (50) NOT NULL,
		color varchar (25) NOT NULL,
		location varchar(25) check (location in ('north', 'south', 'west', 'east', 'northeast', 'southeast', 'southwest', 'northwest')),
		install_date date
	);*/
	/*
		{"data":[{"start":"2016-07-14T22:00:00.000Z","end":"2016-07-15T00:00:00.000Z","status":"CONFIRMED","summary":"AgX Fundraising meeting","description":"","location":"","id":"jeofpcnavruqmgjtnkepgrb9e4@google.com"},{"start":"2016-07-11T23:00:00.000Z","end":"2016-07-12T02:30:00.000Z","status":"CONFIRMED","summary":"Boston Filmmaker Potluck @ Windy Pictures in East Boston, Hosted by Tripp Clemens","description":"","location":"East Boston, Hosted by Tripp Clemens","id":"61ovaguc3j3s70u41m6iji6k8g@google.com"}]}
		INSERT INTO bfcal_data_dev (event_id, org, org_id, title, url, start_date, end_date, scraped_date) VALUES ('DEFAULT', 'agx_public', '61ovaguc3j3s70u41m6iji6k8g@google.com', 'Boston Filmmaker Potluck @ Windy Pictures in East Boston, Hosted by Tripp Clemens', '', 'Mon Jul 11 2016 23:00:00 GMT+0000 (UTC)', 'Tue Jul 12 2016 02:30:00 GMT+0000 (UTC)', 'GETDATE()')
	*/
};

data.cal.gcalFields = function (obj) {
	'use strict';
	//console.log(JSON.stringify(obj));
	var output = {
			org : obj.orgname,
			org_id : obj.id + '',
			title : obj.summary,
			url : '',
			start_date : obj.start + '',
			end_date : obj.end + ''
		};
	return output;
};

data.cal.insert = function (obj, cb) {
	'use strict'
	var query;
	try {
		query = squelPG.insert()
			.into(data.cal.table)
			.set("event_id", "DEFAULT", {
            	dontQuote: true
			})
			.setFields(obj)
			.set("scraped_date", "NOW()", {
            	dontQuote: true
			})
			.toString();
	} catch (e) {
		console.log(e.lineNumber);
		return cb(e);
	}
	console.log('Adding event to database...');
	console.log(query);
	client.query(query + ';', function (err, result) {
		if (err) {
			return cb(err);
		}
		cb(null, result);
	});
};

data.cal.wipe = function (cb) {
	'use strict';
	var query = 'DROP TABLE ' + data.cal.table + ';';
	
	console.log('Dropping table ' + data.cal.table);
	console.log(query);

	client.query(query, function (err, result) {
		if (err) {
			return cb(err);
		}
		cb(null, result);
	});
};

data.cal.getAll = function (cb) {
	'use strict';
	client.query('SELECT * FROM ' + data.cal.table + ';', function(err, result) {
		if (err){ 
			cb(err);
		} else { 
			cb(null, result.rows);
		}
	});
};


module.exports = data;