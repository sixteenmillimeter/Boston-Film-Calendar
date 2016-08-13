var months = [
	'blank',
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december'
];

var position;

$(document).ready(function () {
	position = moment();
	getMonth();
});

var next = function () {
	'use strict';
	position.add(1, 'months');
	getMonth();
};

var prev = function () {
	'use strict';
	position.subtract(1, 'months');
	getMonth();
};

var getMonth = function () {
	'use strict';
	var month = position.format('MM'),
		year = position.format('YYYY'),
		obj = {
			url : '/calendar/' + month + '/' + year,
			method : 'GET',
			dataType : 'json',
			success : function (data) {
				console.log(data);
			},
			error : function (err) {
				console.error(err);
			}
 		};
	$.ajax(obj);
};

