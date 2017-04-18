'use strict'
const fs = require('fs')

class Util {
	constructor () {
		this.store = {}
	}
	page (name, path) {
		if (typeof this.store[name] === 'undefined') {
			this.store[name] = fs.readFileSync(path, 'utf8')
			console.log(`Ingesting page "${name}" from ${path}`)
		}
		return this.store[name]
	}
	json (path) {
		return JSON.parse(fs.readFileSync(path, 'utf8'))
	}
}

module.exports = new Util()