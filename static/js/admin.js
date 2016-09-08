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

	$('#year').text(moment().format('YYYY'));

	$('#next').on('click', next);
	$('#prev').on('click', prev);
	$('#Save').on('click', cancel);
	$('#Cancel').on('click', cancel);
	$('#Delete').on('click', del);
	$('#newEvent').on('click', newEvent);
	$('#editOrgs').on('click', editOrgs);

	$('#inputStart').datepicker();
	$('#inputEnd').datepicker();

	$('#inputStart').datepicker('setDate', new Date());
	$('#inputEnd').datepicker('setDate', new Date());

	$('#inputStartTime').timepicker();
	$('#inputEndTime').timepicker();

	$('#inputStartTime').timepicker('setTime', new Date());
	$('#inputEndTime').timepicker('setTime', new Date());

	/*$(document).on('change', '#org_name', function () {
		var t = $('#org_name');
		$('#org_id').val(org_name(t.val()));
	});*/
	$(document).on('input', '#org_name', function () {
		var t = $('#org_name');
		$('#org_id').val(org_name(t.val()));
	});
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
	cal.sort(dateSort);
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
		if (cal[i].mute == 1) {
			elem.append($('<td>').append($('<input type="checkbox" readonly />')));
		} else if (cal[i].mute == 0) {
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
	//maybe ui action here
	clearForm();
};

var del = function () {
	'use strict';
	var msg = 'Are you sure you want to delete this event?';
	if (confirm(msg)) {
		
		//
		clearForm();
	}
};

var newEvent = function () {
	'use strict';
	var doit = true;
	if ($('#inputTitle').val() !== '') {
		doit = confirm('Are you sure you want to clear the current event?');
	}
	if (doit) {
		clearForm();
		showForm();
		$('#inputTitle').focus();
	}
};

var showForm = function () {
	'use strict';
	$('#eventForm').addClass('editing');
};

var hideForm = function () {
	'use strict';
	$('#eventForm').removeClass('editing');
};

var fillForm = function (obj) {
	'use strict';
	var start = moment(Math.round(obj.start_date)).toDate(),
		end = moment(Math.round(obj.end_date)).toDate();

	$('#inputStart').datepicker('setDate', start);
	$('#inputEnd').datepicker('setDate', end);
	$('#inputStartTime').timepicker('setTime', start);
	$('#inputEndTime').timepicker('setTime', end);

	$('#inputTitle').val(obj.title);
	$('#inputUrl').val(obj.url);
	$('#inputCategory option[value="' + obj.org_id + '"]').prop('selected', true);
	$('#inputLocation').val(obj.location);
	$('#inputDescription').val(obj.description);
	$('#inputCategory option[value="' + obj.category + '"]').prop('selected', true);
	if (obj.mute == 1) {
		$('#inputMute').prop('checked', true);
	} else if (obj.mute == 0) {
		$('#inputMute').prop('checked', false);
	}
	$('body').scrollTop(0);
	showForm();
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
	hideForm();
};

var getForm = function () {
	'use strict';

};

var dateSort = function (a, b) {
	'use strict';
	return Math.round(a.start_date) - Math.round(b.start_date);
};

var editOrgs = function () {
	'use strict';
	bootbox.dialog({
        title: "Edit Orgs",
        message:
        	'<div class="row">' + 
        		'<div class="col-xs-9" style="margin: 0 auto 30px; float: none;"> ' +
        			'<select id="org_list" class="form-control"><option>- New Org -</option></select>' + 
        		'</div>' +
        	'</div>' +
        	'<div class="row">  ' +
            	'<div class="col-xs-8" style="margin: 0 auto; float: none;"> ' +
            		'<form class="form-horizontal" id="login"> ' +
            		    '<div class="form-group"> ' +
            				'<label for="org_name">Org Name</label>' +
            				'<input type="text" id="org_name" class="form-control"/>' +
            			'</div> ' +
            			'<div class="form-group"> ' +
            				'<label for="org_id">Org ID</label>' +
            				'<input type="text" id="org_id" class="form-control" readonly/>' +
            			'</div> ' +
            			'<div class="form-group"> ' +
            				'<label for="org_site">Site</label>' +
            				'<input type="text" id="org_site" class="form-control"/>' +
            			'</div> ' +
            			'<div class="form-group"> ' +
            				'<label for="org_contact_name">Contact Name</label>' +
            				'<input type="text" id="org_contact_name" class="form-control"/>' +
            			'</div> ' +
            			'<div class="form-group"> ' +
            				'<label for="org_contact_email">Contact Email</label>' +
            				'<input type="text" id="org_contact_email" class="form-control"/>' +
            			'</div> ' +
            		'</form> </div> </div>',
        buttons: {
            success: {
                label: "Save",
                className: "btn btn-success",
                callback: function () {
                	var data = getOrg(),
                		obj = {
	                		url : '/admin/org',
	                		type : 'POST',
	                		data : data,
	                		success : function () {
	                			bootbox.hideAll();
	                		},
	                		error : function () {
	                			alert('Error creating org entry');
	                		}
	                	};
	                $.ajax(obj);
                    return false;
                }
            }
        }
    });
};

var getOrg = function () {
	'use strict';
	var data = {
		org_id : $('#org_id').val(),
		name : $('#org_name').val(),
		site : $('#org_site').val(),
		contact_name : $('#org_contact_name').val(),
		contact_email : $('#org_contact_email').val()
	};
	return data;
};

var org_name = function (val) {
	'use strict';
	var str = val.toLowerCase().trim(),
		spaceRe = new RegExp(' ', 'g');
	str = str.replace(spaceRe, '_');
	return str;
};