'use strict'
const restify = require('restify')
const port = process.env.PORT || 8080

const util = require('./lib/util')
const data = require('./lib/data.js')
const scrape = require('./lib/scrape')
const gcals = require('./data/gcals.json')

function init () {
	console.log(`Initializing ${server.name}`)
	data.init(() => {
		//
	})
}

function index (req, res, next) {
	console.log(`Page "index" requested at ${req.path()}`)
	res.end(util.page('index', './views/index.html'))
	return next()
}

function admin (req, res, next) {
	res.end(util.page('admin', './views/admin.html'))
	return next()
}

function createEventTable (req, res, next) {
	data.cal.create((err, data) => {
		if (err) {
			console.log(err)
			return next(err)
		}
		console.log(data)
		res.send(data)
		return next()
	})
}

function wipeEventTable(req, res, next) {
	data.cal.wipe((err, data) => {
		if (err) {
			console.log(err)
			return next(err)
		}
		console.log(data)
		res.send(data)
		return next()
	})
}

function createOrgTable (req, res, next) {
	data.orgs.create((err, data) => {
		if (err) {
			console.log(err)
			return next(err)
		}
		console.log(data)
		res.send(data)
		return next()
	})
}

function wipeOrgTable (req, res, next) {
	data.orgs.wipe((err, data) => {
		if (err) {
			console.log(err)
			return next(err)
		}
		console.log(data)
		res.send(data)
		return next()
	})
}

function basicAuth (req, res, next) {                                       
	res.header('WWW-Authenticate','Basic realm="Admin Console"')          

	if (!req.authorization ||                                                       
		!req.authorization.basic ||                                                 
		!req.authorization.basic.password){   

		res.send(401)                                                             
		return next(false)                                                      
	}                                                                             

	checkUserPassword(req.authorization.basic.password, (err, data) => {        
		if (err || !data) {                                                          
			res.send(401)                                                         
			return next(false)                                                     
		} else {
			return next()
		}                                                       
	})                                                                        
}

function checkUserPassword (pw, cb) {
	if (pw === process.env.ADMIN_PW) {
		return cb(null, true)
	}
	return cb('Error')
}

function calendar (req, res, next) {
	if (req.params
		&& typeof req.params.month !== 'undefined'
		&& typeof req.params.year !== 'undefined') {
		data.cal.getMonth(req.params.month, req.params.year, (err, data) => {
			if (err) {
				return next(err)
			}
			res.send({calendar: data})
			return next()
		})
	} else {
		data.cal.getAll((err, data) => {
			if (err) {
				return next(err)
			}
			res.send({calendar: data})
			return next()
		})
	}
};

function orgs (req, res, next) {
	data.orgs.getAllPublic((err, data) => {
		if (err) {
			return next(err)
		}
		res.send({orgs: data})
		return next()
	})
}

function adminOrgs (req, res, next) {
	data.orgs.getAll((err, data) => {
		if (err) {
			return next(err)
		}
		res.send({orgs: data})
		return next()
	})
}

function scrapeCutoff () {
	const now = new Date()
	const lastMonth = now.getMonth() - 1

	if (lastMonth < 0) lastMonth = 11

	now.setDate(1)
	now.setHours(0)
	now.setMinutes(0)
	now.setMonth(lastMonth)
	console.log(now)
	return +now
}

function scrapeCals (req, res, next) {
	const cutoff = scrapeCutoff()

	let added = 0
	let eventObj
	let errs = []

	scrape.gcals(gcals, (err, d) => {
		let i = -1

		if (err) {
			console.log(err)
			return next(err)
		}

		const n = () => {
			i++
			if (i === d.length) {
				return scrape.agx(scrapeAgxCb)
			}
			eventObj = data.cal.gcalFields(d[i])
			if (eventObj.start_date < cutoff) return n()
			data.cal.insert(eventObj, (err, result) => {
				if (err) {
					if (err.code == 23505) {
						console.log('Event already exists')
					} else {
						console.log('Error adding to database')
						console.log(JSON.stringify(err))
						errs.push(err)
					}
				} else {
					added++
					console.log(JSON.stringify(result))
				}
				n()
			})
		}
		n()	
	})

	const scrapeAgxCb = (err, d) => {
		let i = -1
		if (err) {
			console.error(err)
			return next(err)
		}
		const n = () => {
			i++
			if (i == d.events.length) {
				res.send({total: d.length, added: added, err: errs})
				return next()
			}
			eventObj = data.cal.agx(d.events[i].event)
			if (eventObj.start_date < cutoff) return n()
			console.log(eventObj)
			data.cal.insert(eventObj, (err, result) => {
				if (err) {
					if (err.code == 23505) {
						console.log('Event already exists')
					} else {
						console.log('Error adding to database')
						console.log(JSON.stringify(err))
						errs.push(err)
					}
				} else {
					added++
					console.log(JSON.stringify(result))
				}
				n()
			})
		}
		n()
	}

}

function createEvent (req, res, next) {
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

	let obj = {
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
	}

	data.cal.insert(obj, (err, results) => {
		if (err) return next(err)
		res.send(results)
		return next()
	})
}

function updateEvent (req, res, next) {
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
	}

	data.cal.update(req.params.event_id, obj, (err, results) => {
		if (err) return next(err)
		res.send(results)
	})
}

function createOrg (req, res, next) {
	if ( typeof req.params.org_id === 'undefined' ||
		 typeof req.params.name === 'undefined' ||
	     typeof req.params.site === 'undefined' ||
		 typeof req.params.contact_name === 'undefined' ||
		 typeof req.params.contact_email === 'undefined') {

		return next('Invalid request');
	}
	let obj = {
		org_id : req.params.org_id,
		name : req.params.name,
		site : req.params.site,
		contact_name : req.params.contact_name,
		contact_email : req.params.contact_email
	}
	data.orgs.insert(obj, (err, results) => {
		if (err) {
			console.error(err)
			return next(err)
		}
		res.send(results)
	})
}

function delEvent (req, res, next) {
	return next()
}

const server = restify.createServer({
	name: 'bostonfilm',
	version: '1.0.0'
})

server.use(restify.acceptParser(server.acceptable))
server.use(restify.queryParser())
server.use(restify.bodyParser())
server.use(restify.authorizationParser())

server.get(/\/static\/?.*/, restify.serveStatic({
	directory : __dirname
}))

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