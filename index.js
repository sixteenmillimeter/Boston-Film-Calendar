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
	wipeTable,
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
	if (req.params
		&& typeof req.params.month !== 'undefined'
		&& typeof req.params.year !== 'undefined') {
		data.cal.getMonth(req.params.month, req.params.year, function (err, data) {
			if (err) {
				return next(err);
			}
			res.send({calendar: data});
			return next();
		});
	} else {
		data.cal.getAll(function (err, data) {
			if (err) {
				return next(err);
			}
			res.send({calendar: data});
			return next();
		});	
	}
};

scrapeCals = function (req, res, next) {
	'use strict';
	scrape.gcals(gcals, function (err, d) {
		if (err) {
			return next(err);
		}
		//console.log(JSON.stringify(d));
		var i = -1,
			added = 0,
			eventObj,
			errs = [],
			n = function () {
				i++;
				if (i === d.length) {
					res.send({total: d.length, added: added, err: errs});
					return next();
				}
				eventObj = data.cal.gcalFields(d[i]);
				data.cal.insert(eventObj, function (err, result) {
					if (err) {
						errs.push(err);
						console.log('Error adding to database');
						console.log(JSON.stringify(err));
					} else {
						added++;
						console.log(JSON.stringify(result));
					}
					n();
				})
			};
		n();
		
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
server.get('/calendar/:month/:year', calendar);

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