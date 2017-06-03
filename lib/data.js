'use strict'

const pg = require('pg')
const squelRaw = require('squel')
const squel = squelRaw.useFlavour('postgres')
const moment = require('moment')

class Data {
	constructor (cb) {
		console.log('Connecting to database... ');
		pg.connect(process.env.DATABASE_URL, function(err, c) {
			if (err) {
				console.log('Error connecting to database:')
				throw err;
			}
			console.log(`Connected to ${process.env.DATABASE_URL}`)
			this.client = c
			if (cb) cb()
		})
		this._orgsTable = 'bfcal_orgs_dev'
		this._calTable = 'bfcal_data_dev'
		this._calIndex = 'bfcal_index_dev'
		this._calCategories = ['screening', 'meeting', 'workshop', 'other']
	}

	static wipe (table, cb) {
		const query = `DROP TABLE ${table};`
		
		console.log(`Dropping table -> ${table}`)
		console.log(query)

		client.query(query, (err, result) => {
			if (err) {
				return cb(err)
			}
			cb(null, result)
		})
	}

	orgsCreate (cb) {
		let query = 'CREATE TABLE ' + this._orgsTable
		query += ' ('
		query += 'org_id varchar (255) NOT NULL UNIQUE, '
		query += 'name varchar (1024) NOT NULL, '
		query += 'site varchar (1024) NOT NULL, '
		query += 'contact_name varchar (1024) NOT NULL, '
		query += 'contact_email varchar (1024) NOT NULL '
		query += ');'

		console.log('Creating table ' + this._orgsTable)
		console.log(query)

		this.client.query(query, (err, result) => {
			if (err) {
				return cb(err)
			}
			cb(null, result)
		})
	}

	orgsGetAll(cb) {
		const query = squel.select()
				.from(this._orgsTable)
				.toString()
		this.client.query(query + ';', (err, result) => {
			if (err){ 
				cb(err)
			} else { 
				cb(null, result.rows)
			}
		})
	}

	orgsGetAllPublic (cb) {
		const query = squel.select()
				.field('org_id')
				.field('name')
				.from(this._orgsTable)
				.toString()
		this.client.query(query + ';', (err, result) => {
			if (err){ 
				cb(err)
			} else { 
				cb(null, result.rows)
			}
		})
	}

	orgsWipe (cb) {
		this.wipe(this._orgsTable, cb)
	}

	orgsInsert (obj, cb) {
		const query = squel.insert({replaceSingleQuotes: true})
			.into(this._orgsTable)
			.setFields(obj)
			.toString();
		console.log('Adding org to database...')
		console.log(query)
		this.client.query(query + ';', (err, result) => {
			if (err) {
				return cb(err)
			}
			cb(null, result)
		})
	}

	calCreate (cb) {
		let query = 'CREATE TABLE ' + this._calTable
		query += ' ('
		query += 'event_id serial PRIMARY KEY, '
		query += 'org varchar (255) NOT NULL, '
		query += 'org_id varchar (255) NOT NULL UNIQUE, '
		query += 'title varchar (1024) NOT NULL, ' //1024
		query += 'url varchar (1024) NOT NULL, ' //1024
		query += 'location varchar (1024) NOT NULL, '
		query += 'description varchar (10000) NOT NULL, '
		query += 'category varchar (255) NOT NULL CHECK (category IN (\'screening\', \'meeting\', \'workshop\', \'other\')), '
		query += 'mute smallint NOT NULL, '
		query += 'start_date bigint NOT NULL, '
		query += 'end_date bigint NOT NULL, '
		query += 'scraped_date timestamp '
		query += ');'

		//location varchar (1024) NOT NULL
		//description varchar (4096) NOT NULL
		//
		
		console.log('Creating table ' + this._calTable)
		console.log(query)

		this.client.query(query, (err, result) => {
			if (err) {
				return cb(err)
			}
			cb(null, result)
		})
	}

	gcalFields (obj) {
		//console.log(JSON.stringify(obj));
		const LINK_DETECTION_REGEX = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi
		const found = obj.summary.match(LINK_DETECTION_REGEX)
		let url

		if (found === null || found === undefined) {
			url = ''
		} else if (found.length > 0) {
			url = found[0]
		}

		const output = {
			org : obj.orgname,
			org_id : obj.id + '',
			title : obj.summary,
			url : url,
			description : obj.description,
			location : obj.location,
			category : 'screening', 
			mute : 0,
			start_date : +new Date(obj.start),
			end_date : +new Date(obj.end)
		}
		return output
	}

	calAgx (obj) {
		const format = 'M-D-YYYY HH:mm'
		const site = 'http://dev.agxfilm.org'
		//'Saturday, April 9, 2016 - 15:00'
		obj.category = obj.category.toLowerCase()
		if (this._calCategories.indexOf(obj.category) === -1) {
			obj.category = this._calCategories[this._calCategories.length - 1]
		}
		obj.start_date = moment(obj.start_date, format).valueOf()
		obj.end_date = moment(obj.end_date, format).valueOf()
		obj.mute = 0
		obj.url = site + obj.url
		return obj
	}

	calInsert (obj, cb) {
		console.log(JSON.stringify(obj));
		const query = squel.insert({replaceSingleQuotes: true})
			.into(this._calTable)
			.set("event_id", "DEFAULT", {
	        	dontQuote: true
			})
			.setFields(obj)
			.set("scraped_date", "NOW()", {
	        	dontQuote: true
			})
			.toString()
		console.log('Adding event to database...')
		console.log(query)
		this.client.query(query + ';', (err, result) => {
			if (err) {
				return cb(err)
			}
			cb(null, result);
		})
	}

	calUpdate (id, obj, cb) {
		let query
		try {
			query = squel.update({replaceSingleQuotes: true})
				.table(this._calTable)
				.where('event_id = ' + id)
				.setFields(obj)	
				.toString()
		} catch (e) {
			console.log(e.lineNumber)
			return cb(e)
		}
		console.log('Updating event ' + id + '...')
		console.log(query)
		this.client.query(query + ';', (err, result) => {
			if (err) {
				return cb(err)
			}
			cb(null, result)
		})
	}

	calWipe (cb) {
		this.wipe(this._calTable, cb)
	}

	calGetAll (cb) {
		const query = squel.select()
				.from(this._calTable)
				.toString();
		this.client.query(query + ';', (err, result) => {
			if (err){ 
				cb(err)
			} else { 
				cb(null, result.rows)
			}
		})
	}

	calGetAllOrg (org_id, cb) {
		const query = squel.select()
			.from(this._calTable)
			.where('org_id = ' + org_id)
			.toString()
		this.client.query(query + ';', (err, result) => {
			if (err){ 
				cb(err)
			} else { 
				cb(null, result.rows)
			}
		})
	}

	calGetMonthValidate (month, year) {
		if (isNaN(month) || month.length !== 2) {
			return false;
		}
		if (isNaN(year) || year.length !== 4) {
			return false;
		}
		return true;
	}

	calGetMonthRange (month, year) {
		let between = 'start_date BETWEEN '
		const start = moment('01-' + month + '-' + year, 'DD-MM-YYYY').valueOf()
		const end = moment('01-' + month + '-' + year, 'DD-MM-YYYY').add(1, 'months').subtract(1, 'minutes').valueOf()
		between += start + ' AND ' + end
		return between
	}

	calGetMonth (month, year, cb) {
		const query = squel.select()
			.from(this._calTable)
			.where(this.calGetMonthRange(month, year))
			.toString();
		this.client.query(query + ';', (err, result) => {
			if (err){ 
				cb(err)
			} else { 
				cb(null, result.rows)
			}
		})
	}
}

module.exports = new Data()
