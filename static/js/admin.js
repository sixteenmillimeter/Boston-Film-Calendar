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

var position,
	orgs = [];

$(document).ready(function () {
	position = moment();
	getMonth();
	getOrgs();
	$('#next').on('click', next);
	$('#prev').on('click', prev);
	$('#year').text(moment().format('YYYY'));
	$('#Save').on('click', cancel);
	$('#Cancel').on('click', cancel);
	$('#Delete').on('click', del);
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

var getOrgs = function () {
	'use strict';
	var obj = {
			url : '/orgs',
			method : 'GET',
			dataType : 'json',
			success : function (data) {
				orgs = data.orgs;
				layoutOrgs(orgs);
			},
			error : function (err) {
				console.error(err);
			}
 		};
 	$.ajax(obj);
};

var layoutOrgs = function (list) {
	'use strict';
	var i,
		elem,
		container = $('#inputOrg');
	for (i = 0; i < list.length; i++) {
		elem = $('<option>').attr('value', list[i].org_id).text(list[i].name);
		container.append(elem);
	}
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
		elem.append($('<td>').text(cal[i].category));
		elem.append($('<td>').text(cal[i].org));
		if (cal[i].mute == 0) {
			elem.append($('<td>').append($('<input type="checkbox" readonly />')));
		} else if (cal[i].mute == 1) {
			elem.append($('<td>').append($('<input type="checkbox" checked readonly />')));
		}
		//elem.append($('<td>').append($('<input type="checkbox">')));
		table.append(elem);
	}
};

var save = function () {
	'use strict';
};

var cancel = function () {
	'use strict';
	var msg = 'Are you sure you want to cancel editing this event?';
	if (confirm(msg)) {
		clearForm();
	}
};

var del = function () {
	'use strict';
	var msg = 'Are you sure you want to delete this event?';
	if (confirm(msg)) {
		
		//
		clearForm();
	}
};

var fillForm = function (obj) {
	'use strict';
	$('#inputTitle').val(obj.title);
	$('#inputUrl').val(obj.url);
	$('#inputCategory option[value="' + obj.org_id + '"]').prop('selected', true);
	$('#inputLocation').val(obj.location);
	$('#inputDescription').val(obj.description);
	$('#inputCategory option[value="' + obj.category + '"]').prop('selected', true);
	if (obj.mute == 0) {
		$('#inputMute').prop('checked', true);
	} else if (obj.mute == 1) {
		$('#inputMute').prop('checked', false);
	}
	$('body').scrollTop(0);
};

var clearForm = function () {
	'use strict';
	$('#inputTitle').val('');
	$('#inputUrl').val('');
	$('#inputOrg option:eq(0)').prop('selected', true);
	$('#inputLocation').val('');
	$('#inputDescription').val('');
	$('#inputCategory option:eq(0)').prop('selected', true);
	$('#inputMute').prop('checked', false);
};