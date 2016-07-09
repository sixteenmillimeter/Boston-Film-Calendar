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
	createTable,
	wipeTable
	basicAuth,
	checkUserPassword,
	admin;

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

admin = function (req, res, next) {
	res.end('Admin console');
	return next();
};

createTable = function (req, res, next) {
	'use strict';
	data.cal.create(function (err, data) {
		if (err) {
			console.log(err);
			return next(err);
		}
		console.log(data);
		res.send(data);
		return next();
	});
};

wipeTable = function (req, res, next) {
	'use strict';
	data.cal.wipe(function (err, data) {
		if (err) {
			console.log(err);
			return next(err);
		}
		console.log(data);
		res.send(data);
		return next();
	});
};

basicAuth = function(req, res, next){                                       
	res.header('WWW-Authenticate','Basic realm="Admin Console"');            

	if (!req.authorization ||                                                       
		!req.authorization.basic ||                                                 
		!req.authorization.basic.password){   

		res.send(401);                                                              
		return next(false);                                                         
	}                                                                             

	checkUserPassword(req.authorization.basic.password, function(err, data){        
		if (err || !data) {                                                          
			res.send(401);                                                            
			return next(false);                                                       
		} else {
			return next();  
		}                                                       
	});                                                                           
};

checkUserPassword = function (pw, cb) {
	'use strict';
	if (pw === process.env.ADMIN_PW) {
		return cb(null, true);
	}
	return cb('Error');
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
	scrape.gcals(gcals, function (err, d) {
		if (err) {
			return next(err);
		}
		var i = -1,
			added = 0,
			eventObj,
			n = function () {
				i++;
				if (i === data.length) {
					return res.send({total: d.length, added: added});
				}
				console.log(d[i]);
				eventObj = data.cal.gcalFields(d[i]);
				data.cal.insert(eventObj, function (err, result) {
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
server.use(restify.authorizationParser());

server.get(/\/static\/?.*/, restify.serveStatic({
	directory : __dirname
}));

server.get('/', index);

server.get('/calendar', calendar);
//server.get('/calendar/:month/:year', calendar);

//Admin endpoints
server.get('/admin', basicAuth, admin);
server.get('/admin/scrape', basicAuth, scrapeCals);
server.get('/admin/createTable', basicAuth, createTable);
server.get('/admin/wipeTable', basicAuth, wipeTable);


//

init();

server.listen(port, function () {
	'use strict';
	console.log('%s listening at %s', server.name, server.url);
});