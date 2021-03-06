'use strict'

const { Pool } = require('pg')
const squelRaw = require('squel')
const squel = squelRaw.useFlavour('postgres')
const moment = require('moment')

function calMapRSS (event) {
	const format = `ddd, DD MMM YYYY HH:mm:ss ZZ`
					//Thu, 25 Jun 2020 06:41:50 +0000
	event.pub_date_str  = moment(event.created).format(format)
	event.start_date_str = moment(event.end_date).format(format)
	event.end_date_str = moment(event.end_date).format(format)
	return event
}

/** Class representing the database */
class Data {

	constructor (cb) {
		console.log('Connecting to database... ')
		this.client = null
		this.pool = new Pool({connectionString : process.env.DATABASE_URL })
		this.pool.connect((err, c) => {
			if (err) {
				console.log('Error connecting to database:')
				throw err;
			}
			//console.log(`Connected to ${process.env.DATABASE_URL}`)
			this.client = c
			if (cb) cb()
		})
		this._orgsTable = 'bfcal_orgs'
		this._calTable = 'bfcal_cal'
		this._calIndex = 'bfcal_index'
		this._gcalTable = 'bfcal_gcal'
		this._calCategories = ['screening', 'meeting', 'workshop', 'other']
	}
	/**
	* Data.wipe() - 
	* Drops table matching name provided
	*
	* @param {string} table Name of table
	* @param {function} cb Invoked after table is dropped
	*/
	wipe (table, cb) {
		const query = `DROP TABLE ${table};`
		
		console.log(`Dropping table -> ${table}`)
		console.log(query)

		this.client.query(query, (err, result) => {
			if (err) {
				return cb(err)
			}
			cb(null, result)
		})
	}
	/**
	* Data.gcalCreate() - 
	* Creates a table of public Google Calendars which are to be pulled into the database periodically
	*
	* @param {function} cb Invoked afer table is created
	*/
	gcalCreate(cb) {
		let query = `CREATE TABLE IF NOT EXISTS ${this._gcalTable}(
			id varchar NOT NULL UNIQUE,
			name varchar NOT NULL UNIQUE,
			machinename varchar NOT NULL
		);`
		console.log(`Creating table ${this._gcalTable}`)
		console.log(query)
		this.client.query(query, (err, result) => {
			if (err) {
				return cb(err)
			}
			cb(null, result)
		})
	}
	/**
	* Data.orgsCreate() - 
	* Creates a table of organizations to be referenced in the calendar
	*
	* @param {function} cb Invoked after the table is created
	*/
	orgsCreate (cb) {
		let query = 'CREATE TABLE IF NOT EXISTS ' + this._orgsTable
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
	/**
	* Data.orgsGetAll() - 
	* Retreives all organizations (used in admin panel)
	*
	* @param {function} cb Invoked once query is complete
	*/
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
	/**
	* Data.orgsGetAllPublic() - 
	* Retreives all organizations (to be used on public-facing site)
	*
	* @param {function} cb Invoked once query is complete
	*/
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
	/**
	* Data.orgsWipe() - 
	* Drops orgs table
	*
	* @param {function} cb Invoked once query is complete
	*/
	orgsWipe (cb) {
		this.wipe(this._orgsTable, cb)
	}
	/**
	* Data.orgsInsert() - 
	* Inserts a organization record into the orgs table
	*
	* @params {object} obj Organization object containing all fields
	* @param {function} cb Invoked once query is complete
	*/
	orgsInsert (obj, cb) {
		const query = squel.insert({replaceSingleQuotes: true})
			.into(this._orgsTable)
			.setFields(obj)
			.toString()
		console.log('Adding org to database...')
		console.log(query)
		this.client.query(query + ';', (err, result) => {
			if (err) {
				return cb(err)
			}
			cb(null, result)
		})
	}
	/**
	* Data.calCreate() - 
	* Creates a table of events in the calendar
	*
	* @param {function} cb Invoked after the table is created
	*/
	calCreate (cb) {
		let query = 'CREATE TABLE IF NOT EXISTS ' + this._calTable
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
		query += 'created bigint NOT NULL '
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
	/**
	* Data.gcalFields() - 
	* Modifies gcal object to a database-friendly object
	*
	* @param {object} obj Source object
	* @returns {object} Database-ready calendar event object
	*/
	gcalFields (obj) {
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
	/**
	* Data.calInsert() - 
	* Creates a new record in the calendar table
	*
	* @param {object} obj Object containing all calendar event fields
	* @param {function} cb Invoked after query is complete
	* @param {boolean} single Optional flag determining whether query fields have single quotes replace
	*/
	calInsert (obj, cb, single) {
		//console.log(JSON.stringify(obj))
		let query
		let opts = {}

		if (single) {
			opts.replaceSingleQuotes = true
		}

		query = squel.insert(opts)
			.into(this._calTable)
			.set("event_id", "DEFAULT", {
				dontQuote: true
			})
			.setFields(obj)
			.set('created', moment().valueOf())
			.toString()

		console.log('Adding event to database...')
		//console.log(query)
		console.log(`Event ${obj.org_id} from org ${obj.org}`)
		this.client.query(query + ';', (err, result) => {
			if (err) {
				//console.error(err)
				return cb(err)
			}
			cb(null, result)
		})
	}
	/**
	* Data.calUpdate() - 
	* Update a single calendar event record
	*
	* @param {string} id Unique id of the calendar event to update
	* @param {object} obj New record for calendar table
	* @param {function} cb Invoked after query is completed
	*/
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
	/**
	* Data.calWipe() - 
	* Drops calendar table
	*
	* @param {function} cb Invoked once query is complete
	*/
	calWipe (cb) {
		this.wipe(this._calTable, cb)
	}
	/**
	* Data.calGetAll() - 
	* Retrieves all calendar events in table
	*
	* @param {function} cb Invoked once query is complete
	*/
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
	/**
	* Data.calGetAllOrg() - 
	* Retrieves all calendar events matching a single organization
	*
	* @param {string} org_id Machine id of the organization to match
	* @param {function} cb Invoked once query is complete
	*/
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
	/**
	* Data.calGetMonthValidate() - 
	* Function to validate month and year arguments
	*
	* @param {integer} month Month value
	* @param {integer} year Year value
	* @returns {boolean} Whether values are valid
	*/
	calGetMonthValidate (month, year) {
		if (isNaN(month) || month.length !== 2) {
			return false;
		}
		if (isNaN(year) || year.length !== 4) {
			return false;
		}
		return true;
	}
	/**
	* Data.calGetMonthRange() - 
	* Get all events in the range of a month
	*
	* @param {string} month  Month in 2 digit code
	* @param {string} year  Year in 4 digit code
	*
	* @param {string} WHERE statement for month query
 	*/
	calGetMonthRange (month, year) {
		let between = 'start_date BETWEEN '
		const start = moment('01-' + month + '-' + year, 'DD-MM-YYYY').valueOf()
		const end = moment('01-' + month + '-' + year, 'DD-MM-YYYY').add(1, 'months').subtract(1, 'minutes').valueOf()
		between += start + ' AND ' + end
		return between
	}
	/**
	* Data.calGetMonth() - 
	* Retrieve calendar events by month/year
	*
	* @param {integer} month Month to retrieve (2 digits)
	* @param {integer} year Year to retrieve (4 digits)
	* @param {function} cb Invoked once query is complete
	*/
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
	onlyUnique (value, index, self) { 
		return self.indexOf(value) === index
	}
	/**
	* Data.calGetRSSRange() - 
	* Get all events in the range of a month
	*
	* @param {string} WHERE statement for rss query
 	*/
	calGetRSSRange () {
		const now = moment().valueOf()
		const where = `end_date > ${now} AND mute = 0`
		return where
	}

	/**
	* Data.calGetRSS() - 
	* Retrieve calendar events by month/year
	*
	* @param {function} cb Invoked once query is complete
	*/
	calGetRSS (cb) {
		const query = squel.select()
			.from(this._calTable)
			.where(this.calGetRSSRange())
			.order('start_date', true) //ascending
			.limit(10)
			.toString()
		let rss
		this.client.query(query + ';', (err, result) => {
			if (err) {
				return cb(err)
			}
			if (result && result.rows) {
				console.dir(result.rows)
				rss = result.rows.map(calMapRSS)
			} else {
				rss = []
			}
			return cb(null, rss)
		})
	}
	/**
	* Data.calDelete() - 
	* Deletes a single entry in the calendar table
	*
	* @param {string} event_id Unique id of the calendar event to delete
	* @param {function} cb Invoked once query is complete
	*/
	calDelete (event_id, cb) {
		const query = squel.delete()
			.from(this._calTable)
			.where('event_id = ' + event_id)
			.toString()
		this.client.query(query + ';', (err, result) => {
			if (err){ 
				cb(err)
			} else { 
				cb(null, result)
			}
		})
	}

	now () {
		return moment().format(`ddd, DD MMM YYYY HH:mm:ss ZZ`)
	}
}

module.exports = function (cb) { 
	return new Data(cb)
}