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
	$('#Save').on('click', save);
	$('#Cancel').on('click', cancel);
	$('#Delete').on('click', del);
	$('#newEvent').on('click', newEvent);
	$('#editOrgs').on('click', editOrgs);

	$(document).on('change', '#org_list', orgForm);

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
			url : '/admin/orgs',
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
	container.empty();
	elem = $('<option>').text(' - Select Org - ');
	container.append(elem);
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
			elem.append($('<td>').append($('<input type="checkbox" disabled />')));
		} else if (cal[i].mute == 0) {
			elem.append($('<td>').append($('<input type="checkbox" checked disabled />')));
		}
		table.append(elem);
	}
};

var save = function () {
	'use strict';
	var type = 'new',
		obj = {
			url : '/admin/event',
			data : getForm(),
			error : function (err) {
				console.error(err);
				alert('Error adding event');
			}
		};
	if ($('#eventForm').hasClass('existing')) {
		type = 'existing';
	}
	if (type === 'new') {
		obj.type = 'POST';
		obj.success = function (data) {
			console.dir(data);
			clearForm();
			getMonth();
		};
	} else if (type === 'existing') {
		obj.type = 'PUT';
		obj.success = function (data) {
			console.dir(data);
			clearForm();
			getMonth();
		};
	}
	$.ajax(obj);
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
		$('#inputOrgId').val(uuid.v4());
		$('#eventForm').removeClass('existing').addClass('new');
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
	$('#inputOrg option[value="' + obj.org + '"]').prop('selected', true);
	$('#inputLocation').val(obj.location);
	$('#inputDescription').val(obj.description);
	$('#inputCategory option[value="' + obj.category + '"]').prop('selected', true);
	if (obj.mute == 1) {
		$('#inputMute').prop('checked', false);
	} else if (obj.mute == 0) {
		$('#inputMute').prop('checked', true);
	}
	$('#inputOrgId').val(obj.org_id);
	$('#inputEventId').val(obj.event_id);
	$('body').scrollTop(0);

	$('#eventForm').removeClass('new').addClass('existing');

	showForm();
};

var clearForm = function () {
	'use strict';
	var now = new Date();
	$('#inputTitle').val('');
	$('#inputUrl').val('');

	$('#inputStart').datepicker('setDate', now);
	$('#inputEnd').datepicker('setDate', now);
	$('#inputStartTime').timepicker('setTime', now);
	$('#inputEndTime').timepicker('setTime', now);

	$('#inputOrg option:eq(0)').prop('selected', true);
	$('#inputLocation').val('');
	$('#inputDescription').val('');
	$('#inputCategory option:eq(0)').prop('selected', true);
	$('#inputMute').prop('checked', false);
	$('#inputOrgId').val('');
	$('#inputEventId').val('blank');

	$('#eventForm').removeClass('new existing');

	hideForm();
};

var getForm = function () {
	'use strict';
	var start,
		startTime,
		end,
		endTime,
		obj = {};

	start = $('#inputStart').datepicker('getDate');
	end = $('#inputEnd').datepicker('getDate');
	startTime = $('#inputStartTime').timepicker('getTime');
	endTime = $('#inputEndTime').timepicker('getTime');

	start.setHours(startTime.getHours());
	start.setMinutes(startTime.getMinutes());
	end.setHours(endTime.getHours());
	end.setMinutes(endTime.getMinutes());

	obj.start_date = +start;
	obj.end_date = +end;

	obj.title = $('#inputTitle').val();
	obj.url = $('#inputUrl').val();
	obj.org = $('#inputOrg').val();
	obj.org_id = $('#inputOrgId').val();
	obj.location = $('#inputLocation').val();
	obj.description = $('#inputDescription').val();
	obj.category = $('#inputCategory').val();

	if ($('#inputMute').is(':checked')) {
		obj.mute = 0;
	} else{
		obj.mute = 1;
	}
	if ($('#inputEventId').val() !== 'blank') {
		obj.event_id = $('#inputEventId').val();
	}
	return obj;
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
	                			getOrgs();
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
	setTimeout(function () {
		var org_list = $('#org_list'),
			elem;
		org_list.empty();
		org_list.append($('<option>').text('- New Org -'));
		for (var i = 0; i < orgs.length; i++) {
			elem = $('<option>').attr('value', orgs[i].org_id).text(orgs[i].name);
			elem.data('item', orgs[i]);
			org_list.append(elem);
		}
	}, 500);

};

var orgForm = function () {
	'use strict';
	var selector = $('#org_list').val(),
		item = $('#org_list option[value=' + selector + ']'),
		obj = item.data('item');
	console.log(selector);
	console.log(item);
	console.log(obj);
	$('#org_id').val(obj.org_id);
	$('#org_name').val(obj.name);
	$('#org_site').val(obj.site);
	$('#org_contact_name').val(obj.contact_name);
	$('#org_contact_email').val(obj.contact_email); 
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

var s4  = function () {
	'use strict';
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};
var uuid = {};
uuid.v4 = function () {
    'use strict';
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};