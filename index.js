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
	data.init();
	data.cal.create(function (err, data) {
		'use strict';
		console.log(err);
		console.log(data);
	});
};

index = function (req, res, next) {
	'use strict';
	console.log('Page "index" requested at ' + req.path());
	res.end(util.page('index', './views/index.html'));
	return next();
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
		res.send({data: data});
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