 'use strict'
const pgc = require('public-google-calendar')
const request = require('request')
const data = require('../data.js')
const gcals = require('../../data/gcals.json')

let scrape = {} //TODO: use weakmaps
let cals = [] //Same here

class Scrape {
	constructor () {

	}
	gcals (cals, callback) {
		let i = -1
		let data = {}
		const next = () => {
			i++
			if (i === cals.length) {
				data = this.flatten(data)
				return callback(null, data)
			}
			cals[`gcal_${cals[i].machinename}`] = new pgc({ calendarId : cals[i].id })
			cals[`gcal_${cals[i].machinename}`].getEvents( (err, events) => {
				if (err) { 
					return callback(err); 
				}
				data[cals[i].machinename] = events
				next()
				// events is now array of all calendar events
			})
		}
		next()
	}
	flatten (obj) {
		const keys = Object.keys(obj)
		let arr = []
		for (let k of keys) {
			arr = arr.concat(obj[k])
		}
		return arr
	}
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
	agx (callback) {
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
	all (req, res, next) {
		console.log(`Starting scraping job`)
		const cutoff = this.scrapeCutoff()
		let added = 0
		let eventObj
		let errs = []

		this.gcals(gcals, (err, d) => {
			console.log(`Retreived gcal data`)
			let i = -1
			if (err) {
				console.log(err)
				return next(err)
			}
			const n = () => {
				i++
				if (i === d.length) {
					console.log(`Scraping AgX`)
					return this.agx(scrapeAgxCb)
				}
				eventObj = data.gcalFields(d[i])
				if (eventObj.start_date < cutoff) return n()
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
					n()
				})
			}
			n()	
		})

		const scrapeAgxCb = (err, d) => {
			console.log(`Retreived AgX data`)
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
				eventObj = data.calAgx(d.events[i].event)
				if (eventObj.start_date < cutoff) return n()
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
					n()
				})
			}
			n()
		}
	}
}

module.exports = new Scrape ()