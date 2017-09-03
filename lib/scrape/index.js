'use strict'
const pgc = require('public-google-calendar')
const request = require('request')
const cheerio = require('cheerio')
const moment = require('moment')
const async = require('async')

const data = require('../data')
const gcals = require('../../data/gcals.json')

let scrape = {} //TODO: use weakmaps

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/** Class representing the scraping jobs */
class Scrape {
	constructor () {

	}
	/**
	* Scrape.gcals() - 
	* Loops through all calendars and downloads all data
	*
	* @param {array} path Path to html page
	* @param {function} cb Invoked after all calendars gotten
	*/
	getGcals (cals, cb) {
		let data = {}
		const CALS = []
		const jobs = cals.map(cal => {
			return (next) => {
				console.log(`Getting Google Calendar ${cal.machinename}...`)
				CALS[`gcal_${cal.machinename}`] = new pgc({ calendarId : cal.id })
				CALS[`gcal_${cal.machinename}`].getEvents( (err, events) => {
					if (err) { 
						return cb(err)
					}
					console.log(`Retrieved Google Calendar ${cal.id} with ${events.length} events`)
					events = events.map(event => {
						event.orgname = cal.machinename
						return event
					})
					data[cal.machinename] = events
					next()
				})
			}
		})
		async.series(jobs, () => {
			data = this.flatten(data)
			cb(null, data)
		})
	}
	/**
	* Scrape.gcals() - 
	* Retrieves all Google Calendar data and inserts into database if unique
	* TODO: Refactor with async library
	*
	* @param {function} cb Invoked after gcal job is complete
	*/
	gcals (cb) {
		const cutoff = this.scrapeCutoff()
		let added = 0
		let eventObj
		let errs = []

		console.log('Starting gcals scrape')

		this.getGcals(gcals, (err, d) => {
			console.log(`Retreived gcals data`)
			let i = -1
			if (err) {
				console.log(err)
				return cb(err)
			}
			function next () {
				i++
				if (i === d.length) {
					console.log('Finished gcals scrape')
					return cb(null, {site : 'gcals', total: d.length, added: added, err: errs})
				}

				eventObj = data.gcalFields(d[i])
				//console.dir(eventObj)
				//process.exit()
				if (eventObj.start_date < cutoff) return next()
				data.calInsert(eventObj, (err, result) => {
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
					next()
				}, true)
			}
			next()	
		})
	}
	/**
	* Scrape.flatten() - 
	* Flattens an object into an array
	*
	* @param {object} obj Object to flatten
	* @returns {array} Flattened object
	*/
	flatten (obj) {
		const keys = Object.keys(obj)
		let arr = []
		for (let k of keys) {
			arr = arr.concat(obj[k])
		}
		return arr
	}
	/**
	* Scrape.cutoff() - 
	* Function determining a cutoff date prevent importing old events
	*
	* @returns {integer} Timestamp of cutoff date 
	*/
	scrapeCutoff () {
		const now = new Date()
		let lastMonth = now.getMonth() - 1

		if (lastMonth < 0) lastMonth = 11

		now.setDate(1)
		now.setHours(0)
		now.setMinutes(0)
		now.setMonth(lastMonth)
		console.log(now)
		return +now
	}
	/**
	* Scrape.getAgx() - 
	* Downloads json file containing all current agx events
	*
	* @param {function} callback Invoked after json is downloaded
	*/
	getAgx (callback) {
		const url = 'https://agxfilm.org/bostonfilmcalendar.json'
		request(url, (err, res, body) => {
			if (!err && res.statusCode == 200) {
			    //console.log(body); // Show the HTML for the Google homepage.
			    callback(null, JSON.parse(body))
			} else {
				console.error(err)
				console.error(res)
				callback(err)
			}
		})
	}
	/**
	* Scrape.agx() - 
	* Takes all downloaded events and inserts them into table if unique
	*
	* @param {function} cb Invoked after job is complete
	*/
	agx (cb) {
		const cutoff = this.scrapeCutoff()
		let added = 0
		let eventObj
		let errs = []

		console.log('Starting AgX scrape')

		this.getAgx((err, d) => {
			console.log(`Retreived AgX data`)
			let i = -1
			if (err) {
				console.error(err)
				return cb(err)
			}
			function next () {
				i++
				if (i == d.events.length) {
					console.log('Finished AgX scrape')
					return cb(null, {site : 'agxfilm.org', total: d.length, added: added, err: errs})
				}
				eventObj = data.calAgx(d.events[i].event)
				if (eventObj.start_date < cutoff) return next()
				console.log(eventObj)
				data.calInsert(eventObj, (err, result) => {
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
					next()
				}, true)
			}
			next()
		})
	}
	/**
	* Scrape.getMassart() - 
	* Downloads the massart film society page for later parsing
	*
	* @param {function} callback Invoked after page is downloaded
	*/
	getMassart (callback) {
		const url = 'http://massartfilmsociety.blogspot.com'
		request(url, (err, res, body) => {
			if (!err && res.statusCode == 200) {
			    //console.log(body); // Show the HTML for the Google homepage.
			    callback(null, body)
			} else {
				console.error(err)
				console.error(res)
				callback(err)
			}
		})
	}
	/**
	* Scrape.massartParseDate() - 
	* Parse dates found in massart film society titles
	*
	* @param {string} str Raw date string
	* @returns {string} Improved string
	*/
	massartParseDate (str) {
		const parts = str.split('')
		let datePart = ''
		let last
		for (let i = 0; i < parts.length; i++) {
			if (!isNumeric(parts[i]) && parts[i] !== '/' && parts[i] !== '-') {
				break
			} else {
				datePart += parts[i]
			}
		}
		return datePart
	}
	/**
	* Scrape.massartStartDate() - 
	* Determines the start date of a film society event
	*
	* @param {string} str Raw date string
	* @returns {integer} Start time as timestamp
	*/
	massartStartDate (datePart) {
		const mnt = moment(datePart, 'M/D/YY').hour(20).minute(0)
		//console.log(mnt.format('MM/DD/YY hh:mm'))
		return parseInt(mnt.format('x'))
	}
	/**
	* Scrape.massartEndDate() - 
	* Determines the end date of a film society event
	*
	* @param {string} str Raw date string
	* @returns {integer} Start time as timestamp
	*/
	massartEndDate (datePart) {
		const mnt = moment(datePart, 'M/D/YY').hour(22).minute(0)
		//console.log(mnt.format('MM/DD/YY hh:mm'))
		return parseInt(mnt.format('x'))
	}
	/**
	* Scrape.massartInsertAll() - 
	* Loops through all events inserts them if they're unique
	*
	* @param {array} events Array of event objects to insert into calendar table
	* @param {function} cb Invoked after job is complete
	*/
	massartInsertAll (events, cb) {
		const cutoff = this.scrapeCutoff()
		const total = events.length
		let added = 0
		let errs = []
		let eventObj
		function next () {
			if (events.length === 0) {
				return cb(null, {site : 'massartfilmsociety.blogspot.org', total: total, added: added, err: errs})
			}
			eventObj = events.pop()
			if (eventObj.start_date < cutoff) return next()
			console.log(eventObj)
			data.calInsert(eventObj, (err, result) => {
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
				next()
			}, true)
		}
		next()
	}
	/**
	* Scrape.massart() - 
	* Downloads massart website and extracts new events
	*
	* @param {function} cb Passed to next function to be invoked
	*/
	massart (cb) {
		const events = []
		this.getMassart((err, results) => {
			if (err) {
				console.error(err)
				return cb(err)
			}
			const $ = cheerio.load(results)
			const posts = $('.date-outer')
			let obj
			let dateStr
			for (let i = 0; i < posts.length; i++) {
				obj = {}
				obj.title = ($('.date-outer').eq(i).find('h3.post-title a').text()).trim()
				obj.org = 'massart_film_society'
				obj.url = $('.date-outer').eq(i).find('h3.post-title a').attr('href')
				dateStr = this.massartParseDate(obj.title)
				obj.start_date = this.massartStartDate(dateStr)
				obj.end_date = this.massartEndDate(dateStr)
				obj.org_id = `${obj.org}_${obj.start_date}`
				obj.location = 'Massachusetts College of Art Film Dept Screening Room 1\n 621 Huntington Ave. Boston MA 02115'
				obj.description = $('.date-outer').eq(i).find('.post-body').html()
				obj.mute = 0
				obj.category = 'screening'
				events.push(obj)
			}
			this.massartInsertAll(events, cb)
		})
	}
}

module.exports = new Scrape ()