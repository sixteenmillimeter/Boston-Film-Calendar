var cheerio = require('cheerio'),
	request = require('request'),
	fs = require('fs'),
	filmsociety,
	schedules = JSON.parse(fs.readFileSync('../data/massart_film_society.json'));
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
};

module.exports = filmsociety;