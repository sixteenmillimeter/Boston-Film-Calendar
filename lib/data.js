var data = {},
	pg = require('pg'),
	squel = require('squel'),
	client;

data.init = function () {
	'use strict';
	pg.connect(process.env.DATABASE_URL, function(err, c, done) {
		client = c;
		console.log('Connected to ' + process.env.DATABASE_URL);
	});
};

data.cal = {};
data.cal.table = 'bfcal_data_dev';
data.cal.index = 'bfcal_index_dev';

data.cal.getAll = function (cb) {
	'use strict';
	client.query('SELECT * FROM ' + data.cal.table, function(err, result) {
		if (err){ 
			cb(err);
		} else { 
			cb(null, result.rows);
		}
	});
};


module.exports = data;