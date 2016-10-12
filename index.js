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
	orgs,
	adminOrgs,
	createEventTable,
	wipeEventTable,
	createOrgTable,
	wipeOrgTable,
	basicAuth,
	checkUserPassword,
	admin,
	createEvent,
	updateEvent,
	delEvent,
	createOrg,
	scrapeCals,
	scrapeCutoff;

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
	res.end(util.page('admin', './views/admin.html'));
	return next();
};

createEventTable = function (req, res, next) {
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

wipeEventTable = function (req, res, next) {
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

createOrgTable = function (req, res, next) {
	'use strict';
	data.orgs.create(function (err, data) {
		if (err) {
			console.log(err);
			return next(err);
		}
		console.log(data);
		res.send(data);
		return next();
	});
};

wipeOrgTable = function (req, res, next) {
	'use strict';
	data.orgs.wipe(function (err, data) {
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

orgs = function (req, res, next) {
	'use strict';
	data.orgs.getAllPublic(function (err, data) {
		if (err) {
			return next(err);
		}
		res.send({orgs: data});
		return next();
	});
};

adminOrgs = function (req, res, next) {
	'use strict';
	data.orgs.getAll(function (err, data) {
		if (err) {
			return next(err);
		}
		res.send({orgs: data});
		return next();
	});
};

scrapeCutoff = function () {
	'use strict';
	var now = new Date(),
		lastMonth = now.getMonth() - 1;
	if (lastMonth < 0) lastMonth = 11;
	now.setDate(1);
	now.setHours(0);
	now.setMinutes(0);
	now.setMonth(lastMonth);
	console.log(now);
	return +now;
};

scrapeCals = function (req, res, next) {
	'use strict';
	var cutoff = scrapeCutoff(),
		added = 0,
		eventObj,
		errs = [];
	scrape.gcals(gcals, function (err, d) {
		if (err) {
			console.log(err);
			return next(err);
		}
		//console.log(JSON.stringify(d));
		var i = -1,
		n = function () {
			i++;
			if (i === d.length) {
				return scrape.agx(scrapeAgxCb);
			}
			eventObj = data.cal.gcalFields(d[i]);
			if (eventObj.start_date < cutoff) return n();
			data.cal.insert(eventObj, function (err, result) {
				if (err) {
					if (err.code == 23505) {
						console.log('Event already exists');
					} else {
						console.log('Error adding to database');
						console.log(JSON.stringify(err));
						errs.push(err);
					}
				} else {
					added++;
					console.log(JSON.stringify(result));
				}
				n();
			})
		};
		n();
		
	});
	var scrapeAgxCb = function (err, d) {
		if (err) {
			console.error(err);
			return next(err);
		}
		var i = -1,
		n = function () {
			i++;
			if (i == d.events.length) {
				res.send({total: d.length, added: added, err: errs});
				return next();
			}
			eventObj = data.cal.agx(d.events[i].event);
			if (eventObj.start_date < cutoff) return n();
			console.log(eventObj);
			data.cal.insert(eventObj, function (err, result) {
				if (err) {
					if (err.code == 23505) {
						console.log('Event already exists');
					} else {
						console.log('Error adding to database');
						console.log(JSON.stringify(err));
						errs.push(err);
					}
				} else {
					added++;
					console.log(JSON.stringify(result));
				}
				n();
			});
		};
		n();
	};
};

createEvent = function (req, res, next) {
	'use strict';

	if ( typeof req.params.org === 'undefined' ||
		 typeof req.params.org_id === 'undefined' ||
		 typeof req.params.title === 'undefined' ||
		 typeof req.params.url === 'undefined' ||
		 typeof req.params.description === 'undefined' ||
		 typeof req.params.location === 'undefined' ||
		 typeof req.params.category === 'undefined' ||
		 typeof req.params.mute === 'undefined' ||
		 typeof req.params.start_date === 'undefined' ||
		 typeof req.params.end_date === 'undefined') {

		return next('Invalid request');
	}

	var obj = {
		org : req.params.org,
		org_id : req.params.org_id,
		title : req.params.title,
		url : req.params.url,
		description : req.params.description,
		location : req.params.location,
		category : req.params.category,
		mute : req.params.mute,
		start_date : req.params.start_date, //millis
		end_date : req.params.end_date //millis
	};

	data.cal.insert(obj, function (err, results) {
		if (err) return next(err);
		res.send(results);
	});
};

updateEvent = function (req, res, next) {
	'use strict';

	if ( typeof req.params.org === 'undefined' ||
		 typeof req.params.org_id === 'undefined' ||
		 typeof req.params.title === 'undefined' ||
		 typeof req.params.url === 'undefined' ||
		 typeof req.params.description === 'undefined' ||
		 typeof req.params.location === 'undefined' ||
		 typeof req.params.category === 'undefined' ||
		 typeof req.params.mute === 'undefined' ||
		 typeof req.params.start_date === 'undefined' ||
		 typeof req.params.end_date === 'undefined' ||

		 typeof req.params.event_id === 'undefined') {

		return next('Invalid request');
	}

	var obj = {
		org : req.params.org,
		org_id : req.params.org_id,
		title : req.params.title,
		url : req.params.url,
		description : req.params.description,
		location : req.params.location,
		category : req.params.category,
		mute : req.params.mute,
		start_date : req.params.start_date, //millis
		end_date : req.params.end_date //millis
	};

	data.cal.update(req.params.event_id, obj, function (err, results) {
		if (err) return next(err);
		res.send(results);
	});
};

createOrg = function (req, res, next) {
	'use strict';

	if ( typeof req.params.org_id === 'undefined' ||
		 typeof req.params.name === 'undefined' ||
	     typeof req.params.site === 'undefined' ||
		 typeof req.params.contact_name === 'undefined' ||
		 typeof req.params.contact_email === 'undefined') {

		return next('Invalid request');
	}
	var obj = {
		org_id : req.params.org_id,
		name : req.params.name,
		site : req.params.site,
		contact_name : req.params.contact_name,
		contact_email : req.params.contact_email
	};

	data.orgs.insert(obj, function (err, results) {
		if (err) {
			console.error(err);
			return next(err);
		}
		res.send(results);
	});
};

delEvent = function (req, res, next) {
	'use strict';

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

//server.get('/calendar', calendar);
server.get('/calendar/:month/:year', calendar);
server.get('/orgs', orgs);

//Admin endpoints
server.get('/admin', basicAuth, admin);
server.get('/admin/scrape', basicAuth, scrapeCals);

server.get('/admin/orgs', basicAuth, adminOrgs);

server.get('/admin/createEventTable', basicAuth, createEventTable);
server.get('/admin/wipeEventTable', basicAuth, wipeEventTable);

server.get('/admin/createOrgTable', basicAuth, createOrgTable);
server.get('/admin/wipeOrgTable', basicAuth, wipeOrgTable);

server.post('/admin/event', basicAuth, createEvent);
server.put('/admin/event', basicAuth, updateEvent);
server.del('/admin/event', basicAuth, delEvent);

server.post('/admin/org', basicAuth, createOrg);

//

init();

server.listen(port, function () {
	'use strict';
	console.log('%s listening at %s', server.name, server.url);
});