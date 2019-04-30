'use strict'
const fs = require('fs-extra')
const Handlebars = require('handlebars')

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
	* @param {object} data Data to compile template with
	* @returns {string} Page string
	*/
	async page (name, path, data = {}) {
		let source;
		if (typeof this.store[name] === 'undefined') {
			try {
				source = await fs.readFile(path, 'utf8')
				console.log(`Ingesting page "${name}" from ${path}`)
			} catch (err) {
				console.error(`Error ingesting page "${name}" from ${path}`)
				console.error(err)
			}
			this.store[name] = Handlebars.compile(source)
		}

		return this.store[name](data)
	}
	/**
	* Util.json() - 
	* Returns parsed json object at path
	*
	* @param {string} path Path of .json file
	* @returns {object} Contents of file as parsed object (or array or string)
	*/
	async json (path) {
		//Could use require here, but would have to manage require.cache
		let text;
		try {
			text = fs.readFile(path, 'utf8')
		} catch (err) {
			console.error(err)
		}
		return JSON.parse(text)
	}
}

module.exports = new Util()