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
	$('#year').text(moment().format('YYYY'));
	$('#Cancel').on('click', clearForm);
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
		title,
		start_date,
		i;
	table.empty();
	for (i = 0; i < cal.length; i++) {
		elem = $('<tr>');
		start_date = moment(Math.round(cal[i].start_date));
		elem.append($('<td>').text(start_date.format('D')));
		title = $('<td>').text(cal[i].title);
		title.addClass('title');
		title.data('item', cal[i]);
		title.on('click', function () {
			var data = $(this).data('item');
			console.log(data);
			fillForm(data);
		});
		elem.append(title);
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

var save = function () {};
var cancel = function () {
	var msg = 'Are you sure you want to cancel editing this event?';
	if (confirm(msg)) {
		clearForm();
	}
};
var del = function () {};

var fillForm = function (obj) {
	'use strict';
	$('#inputTitle').val(obj.title);
	$('#inputUrl').val(obj.url);
	$('#inputLocation').val(obj.location);
	$('#inputDescription').val(obj.description);
	$('#inputCategory option[value="' + obj.category + '"]').prop('selected', true);
	if (obj.mute == 0) {
		$('#inputMute').prop('checked', true);
	} else if (obj.mute == 1) {
		$('#inputMute').prop('checked', false);
	}
};

var clearForm = function () {
	'use strict';
	$('#inputTitle').val('');
	$('#inputUrl').val('');
	$('#inputLocation').val('');
	$('#inputDescription').val('');
	$('#inputCategory option:eq(0)').prop('selected', true);
	$('#inputMute').prop('checked', false);
};