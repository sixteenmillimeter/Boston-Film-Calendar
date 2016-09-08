var data = {},
	pg = require('pg'),
	squelRaw = require('squel'),
	squel = squelRaw.useFlavour('postgres'),
	moment = require('moment'),
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

data.wipe = function (table, cb) {
	'use strict';
	var query = 'DROP TABLE ' + table + ';';
	
	console.log('Dropping table -> ' + table);
	console.log(query);

	client.query(query, function (err, result) {
		if (err) {
			return cb(err);
		}
		cb(null, result);
	});
};


data.orgs = {};
data.orgs.table = 'bfcal_orgs_dev';

data.orgs.create = function (cb) {
	'use strict';
	var query = 'CREATE TABLE ' + data.orgs.table;
	query += ' (';
	query += 'org_id varchar (255) NOT NULL UNIQUE, ';
	query += 'name varchar (1024) NOT NULL, ';
	query += 'site varchar (1024) NOT NULL, ';
	query += 'contact_name varchar (1024) NOT NULL, ';
	query += 'contact_email varchar (1024) NOT NULL ';
	query += ');';

	console.log('Creating table ' + data.orgs.table);
	console.log(query);

	client.query(query, function (err, result) {
		if (err) {
			return cb(err);
		}
		cb(null, result);
	});
};

data.orgs.getAll = function (cb) {
	'use strict';
	var query = squel.select()
			.from(data.orgs.table)
			.toString();
	client.query(query + ';', function(err, result) {
		if (err){ 
			cb(err);
		} else { 
			cb(null, result.rows);
		}
	});
};

data.orgs.getAllPublic = function (cb) {
	'use strict';
	var query = squel.select()
			.field('org_id')
			.field('name')
			.from(data.orgs.table)
			.toString();
	client.query(query + ';', function(err, result) {
		if (err){ 
			cb(err);
		} else { 
			cb(null, result.rows);
		}
	});
};

data.orgs.wipe = function (cb) {
	'use strict';
	data.wipe(data.orgs.table, cb);
};

data.orgs.insert = function (obj, cb) {
	'use strict'
	var query = squel.insert({replaceSingleQuotes: true})
		.into(data.orgs.table)
		.setFields(obj)
		.toString();
	console.log('Adding org to database...');
	console.log(query);
	client.query(query + ';', function (err, result) {
		if (err) {
			return cb(err);
		}
		cb(null, result);
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
	query += 'org_id varchar (255) NOT NULL UNIQUE, ';
	query += 'title varchar (1024) NOT NULL, '; //1024
	query += 'url varchar (1024) NOT NULL, '; //1024
	query += 'location varchar (1024) NOT NULL, ';
	query += 'description varchar (10000) NOT NULL, ';
	query += 'category varchar (255) NOT NULL CHECK (category IN (\'screening\', \'meeting\', \'workshop\', \'other\')), '
	query += 'mute smallint NOT NULL, '
	query += 'start_date bigint NOT NULL, ';
	query += 'end_date bigint NOT NULL, ';
	query += 'scraped_date timestamp ';
	query += ');';

	//location varchar (1024) NOT NULL
	//description varchar (4096) NOT NULL
	//
	
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
	var LINK_DETECTION_REGEX = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi,
		found = obj.summary.match(LINK_DETECTION_REGEX),
		url;
	if (found === null || found === undefined) {
		url = '';
	} else if (found.length > 0) {
		url = found[0];
	}

	var output = {
			org : obj.orgname,
			org_id : obj.id + '',
			title : obj.summary,
			url : url,
			description : obj.description,
			location : obj.location,
			category : 'screening', 
			mute : 0,
			start_date : +new Date(obj.start),
			end_date : +new Date(obj.end)
		};
	return output;
};

data.cal.insert = function (obj, cb) {
	'use strict'
	var query = squel.insert({replaceSingleQuotes: true})
		.into(data.cal.table)
		.set("event_id", "DEFAULT", {
        	dontQuote: true
		})
		.setFields(obj)
		.set("scraped_date", "NOW()", {
        	dontQuote: true
		})
		.toString();
	console.log('Adding event to database...');
	console.log(query);
	client.query(query + ';', function (err, result) {
		if (err) {
			return cb(err);
		}
		cb(null, result);
	});
};

data.cal.update = function (id, obj, cb) {
	'use strict'
	var query;
	try {
		query = squel.update({replaceSingleQuotes: true})
			.table(data.cal.table)
			.where('event_id = ' + id)
			.setFields(obj)	
			.toString();
	} catch (e) {
		console.log(e.lineNumber);
		return cb(e);
	}
	console.log('Updating event ' + id + '...');
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
	data.wipe(data.cal.table, cb);
};

data.cal.getAll = function (cb) {
	'use strict';
	var query = squel.select()
			.from(data.cal.table)
			.toString();
	client.query(query + ';', function(err, result) {
		if (err){ 
			cb(err);
		} else { 
			cb(null, result.rows);
		}
	});
};

data.cal.getAllOrg = function (org_id, cb) {
	'use strict';
	var query = squel.select()
		.from(data.cal.table)
		.where('org_id = ' + org_id)
		.toString();
	client.query(query + ';', function(err, result) {
		if (err){ 
			cb(err);
		} else { 
			cb(null, result.rows);
		}
	});
};

data.cal.getMonthValidate = function (month, year) {
	'use strict';
	if (isNaN(month) || month.length !== 2) {
		return false;
	}
	if (isNaN(year) || year.length !== 4) {
		return false;
	}
	return true;
};

data.cal.getMonthRange = function (month, year) {
	'use strict';
	var between = 'start_date BETWEEN ',
		start = moment('01-' + month + '-' + year, 'DD-MM-YYYY').valueOf(),
		end = moment('01-' + month + '-' + year, 'DD-MM-YYYY').add(1, 'months').subtract(1, 'minutes').valueOf();
	between += start + ' AND ' + end;
	return between;
};

data.cal.getMonth = function (month, year, cb) {
	'use strict';
	var query = squel.select()
		.from(data.cal.table)
		.where(data.cal.getMonthRange(month, year))
		.toString();
	client.query(query + ';', function(err, result) {
		if (err){ 
			cb(err);
		} else { 
			cb(null, result.rows);
		}
	});
};

module.exports = data;