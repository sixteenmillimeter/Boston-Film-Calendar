var restify = require('restify'),
	port = process.env.PORT || 8080,
	pg = require('pg'),
	squel = require('squel'),
	client,
	util = require('./lib/util.js'),
	server,
	init,
	index,
	calendar;

init = function () {
	'use strict';
	console.log('Initializing ' + server.name);
	pg.connect(process.env.DATABASE_URL, function(err, c, done) {
		client = c;
		console.log('Connected to ' + process.env.DATABASE_URL);
	});
};

index = function (req, res, next) {
	'use strict';
	console.log('Page "index" requested at ' + req.path());
	res.end(util.page('index', './views/index.html'));
	return next();
};

calendar = function (request, response) {
	client.query('SELECT * FROM test_table', function(err, result) {
		if (err){ 
			console.error(err); 
			res.send(err); 
		} else { 
			res.send({calendar: result.rows});
		}
	});
}

server = restify.createServer({
	name: 'bostonfilm',
	version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/', index);

server.get('/calendar', calendar);

server.get(/\/static\/?.*/, restify.serveStatic({
	directory : __dirname
}));



//

init();

server.listen(port, function () {
	'use strict';
	console.log('%s listening at %s', server.name, server.url);
});