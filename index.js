var restify = require('restify'),
	port = process.env.PORT || 8080,

	util = require('./lib/util.js'),
	server,
	init,
	index;

init = function () {
	'use strict';
	console.log('Initializing ' + server.name);
};

index = function (req, res, next) {
	'use strict';
	console.log('Page "index" requested at ' + req.path());
	res.end(util.page('index', './views/index.html'));
	return next();
};

server = restify.createServer({
	name: 'bostonfilm',
	version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/', index);

server.get(/\/static\/?.*/, restify.serveStatic({
	directory : __dirname
}));

//

init();

server.listen(port, function () {
	'use strict';
	console.log('%s listening at %s', server.name, server.url);
});