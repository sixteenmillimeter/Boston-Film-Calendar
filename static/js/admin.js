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
	$('#next').on('click', next);
	$('#prev').on('click', prev);
});

var capitalize = function (string) {
	'use strict';
    return string.charAt(0).toUpperCase() + string.slice(1);
};


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
				layoutMonth(data.calendar);
			},
			error : function (err) {
				console.error(err);
			}
 		};
 	$('#tableMonth').text(capitalize(months[Math.round(month)]) + ', ' + year);
	$.ajax(obj);
};

var layoutMonth = function (cal) {
	'use strict';
	var table = $('#events tbody'),
		elem,
		start_date,
		i;
	table.empty();
	for (i = 0; i < cal.length; i++) {
		elem = $('<tr>');
		start_date = moment(Math.round(cal[i].start_date));
		elem.append($('<td>').text(start_date.format('D')));
		elem.append($('<td>').text(cal[i].title));
		elem.append($('<td>').text(start_date.format('hh:mm a')));
		elem.append($('<td>').text(''));
		elem.append($('<td>').text(cal[i].org));
		//if (cal[i].mute == 0) {
			//elem.append($('<td>').append($('<input type="checkbox" checked>')));
		//} else {
			//elem.append($('<td>').append($('<input type="checkbox">')));
		//}
		elem.append($('<td>').append($('<input type="checkbox">')));
		table.append(elem);
	}
};