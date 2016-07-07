var restify = require('restify'),
	port = process.env.PORT || 8080,
	util = require('./lib/util.js'),
	data = require('./lib/data.js'),
	server,
	init,
	index,
	calendar,
	fail;

init = function () {
	'use strict';
	console.log('Initializing ' + server.name);
	data.init();
};

index = function (req, res, next) {
	'use strict';
	console.log('Page "index" requested at ' + req.path());
	res.end(util.page('index', './views/index.html'));
	return next();
};

calendar = function (req, res) {
	'use strict';
	data.cal.getAll(function (err, data) {
		if (err) {
			return next(err);
		}
		res.send({calendar: data});
		return next();
	});	
};

scrape = function (req, res) {
	'use strict';
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

server.get('/scrape', scrape);

server.get(/\/static\/?.*/, restify.serveStatic({
	directory : __dirname
}));



//

init();

server.listen(port, function () {
	'use strict';
	console.log('%s listening at %s', server.name, server.url);
});