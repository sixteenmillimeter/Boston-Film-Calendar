var restify = require('restify'),
	port = process.env.PORT || 8080,
	util = require('./lib/util.js'),
	data = require('./lib/data.js'),
	scrape = require('./lib/scrape.js'),
	gcals = util.json('./data/gcals.json'),
	server,
	init,
	index,
	calendar,
	fail;

init = function () {
	'use strict';
	console.log('Initializing ' + server.name);
	data.init(function () {
		//
	});
};

index = function (req, res, next) {
	'use strict';
	console.log('Page "index" requested at ' + req.path());
	res.end(util.page('index', './views/index.html'));
	return next();
};

createTable = function (req, res, next) {
	'use strict';
	data.cal.create(function (err, data) {
		console.log(err);
		console.log(data);
	});
};

calendar = function (req, res, next) {
	'use strict';
	data.cal.getAll(function (err, data) {
		if (err) {
			return next(err);
		}
		res.send({calendar: data});
		return next();
	});	
};

scrapeCals = function (req, res, next) {
	'use strict';
	scrape.gcals(gcals, function (err, data) {
		if (err) {
			return next(err);
		}
		var i = -1,
			added = 0,
			eventObj,
			n = function () {
				i++;
				if (i === data.length) {
					return res.send({total: data.length, added: added});
				}
				eventObj = data.cal.gcalFields(data[i]);
				data.cal.insert(obj, function (err, result) {
					if (err) {
						console.log(err);
					} else {
						added++;
						console.log(result);
					}
					n();
				})
			};
		n();
		return next();
	});
};

server = restify.createServer({
	name: 'bostonfilm',
	version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/', index);

server.get('/calendar', calendar);

server.get('/scrape', scrapeCals);

server.get(/\/static\/?.*/, restify.serveStatic({
	directory : __dirname
}));



//

init();

server.listen(port, function () {
	'use strict';
	console.log('%s listening at %s', server.name, server.url);
});