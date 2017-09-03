'use strict'
const fs = require('fs')

/** Class representing the core utilities */
class Util {
	constructor () {
		this.store = {}
	}
	/**
	* Util.page() - 
	* Renders and returns a page at a path
	*
	* @param {string} name Name of page (for caching)
	* @param {string} path Path to html page
	* @returns {string} Page string
	*/
	page (name, path) {
		if (typeof this.store[name] === 'undefined') {
			this.store[name] = fs.readFileSync(path, 'utf8')
			console.log(`Ingesting page "${name}" from ${path}`)
		}
		return this.store[name]
	}
	/**
	* Util.json() - 
	* Returns parsed json object at path
	*
	* @param {string} path Path of .json file
	* @returns {object} Contents of file as parsed object (or array or string)
	*/
	json (path) {
		//Could use require here, but would have to manage require.cache
		return JSON.parse(fs.readFileSync(path, 'utf8'))
	}
}

module.exports = new Util()