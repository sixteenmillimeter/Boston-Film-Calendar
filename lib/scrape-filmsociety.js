var cheerio = require('cheerio'),
	request = require('request'),
	crypto = require('crypto'),
	moment = require('moment'),
	fs = require('fs'),
	filmsociety,
	schedules = JSON.parse(fs.readFileSync('./data/massart_film_society.json')),
	org = 'massart_film_society',
	location = 'Room 1 in East Hall, 621 Huntington Ave, Boston, MA 02115';
/*
	1/20 Joe Gibbons: SPYING  AND OTHER PROVOCATIONS
	1/27 Joe Gibbons: DEADBEAT + CONFIDENTIAL PART 2
	2/3 THE EXILE by Oscar Michaulx + RAGE IN HARLEM by Bill Duke
	2/10  BLOOD OF JESUS by Spencer Williams + CABIN IN THE SKY by Vincent Minnelli
	2/17 ON COPPER WINGS by Dave Fischer
	2/24 Jean Rasenberger
	3/2  Sustainability Incubator + Rob Todd 
	3/16 MOOLAADÉ 
	3/23 Kate McCabe 
	03/30 Julianna Schley
	4/6  Rapture curated by Saul Levine
	4/13 Ana Vaz
	4/20 Jennifer Reeves 
	4/27 John Price 
	5/4 Amy Halpern
*/

filmsociety = function () {
	'use strict';
	var $,
		list,
		obj,
		i,
		date;
	request(schedules[0].url, function (err, data) {
		if (err) {
			return console.error(err);
		}
		$ = cheerio.load(data.body);
		list = $('.post-body.entry-content').text();
		list = list.split('\n');
		list = list.filter(function (elem) {
			if (elem !== '') {
				return elem;
			}
		});
		for (i = 0; i < list.length; i++) {
			date = list[i].split(' ')[0];
			obj = {};
			obj.org = org;
			obj.org_id = crypto.createHash('md5').update(list[i]).digest('hex');
			obj.title = list[i].replace(date + ' ', '').trim();
			obj.url = '';
			obj.location = location;
			obj.start_date = moment(date + '/' + schedules[0].year).add(20, 'hours').valueOf();
			obj.end_date = moment(date + '/' + schedules[0].year).add(22, 'hours').valueOf();

			console.log(obj);
		}
		//console.log($);
		//console.log(data);
		console.log(list);
	});
};

module.exports = filmsociety;
//test
//var fs = require('./lib/scrape-filmsociety.js'); fs();