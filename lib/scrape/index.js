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
			if (err) {
				console.log(err)
				return cb(err)
			}
			const events = d.filter((obj) => {
				const e = data.gcalFields(obj)
				if (e.start_date > cutoff) {
					return obj
				}
			})
			const jobs = events.map(obj => {
				return (next) => {
					const eventObj = data.gcalFields(obj)
					data.calInsert(eventObj, (err, result) => {
						if (err) {
							if (err.code == 23505) {
								console.log('Event already exists')
							} else {
								console.log('Error adding to database')
								console.error(err)
								errs.push(err)
							}
						} else {
							added++
							//console.log(JSON.stringify(result))
						}
						next()
					}, true)
				}
			})
			async.series(jobs, () => {
				console.log('Finished gcals scrape')
				return cb(null, {site : 'gcals', total: d.length, added: added, err: errs})
			})
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
		//console.log(now)
		return +now
	}
}

module.exports = new Scrape ()