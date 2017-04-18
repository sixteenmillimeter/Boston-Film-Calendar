'use strict'
const pgc = require('public-google-calendar')
const request = require('request')

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
}

module.exports = new Scrape ()