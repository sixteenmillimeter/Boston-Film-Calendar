

$(function() {

	var cal = $( '#calendar' ).calendario( {
			onDayClick : function( $el, $contentEl, dateProperties ) {
				for( var key in dateProperties ) {
					//console.log( key + ' = ' + dateProperties[ key ] );
				}
			},
			caldata : {}
		} ),
		$month = $( '#custom-month' ).html( cal.getMonthName() ),
		$year = $( '#custom-year' ).html( cal.getYear() ),
		store = [],
		orgs = {},
		ev = {};

	console.log(cal.setData + '');
	console.log(cal._generateTemplate + '');

	$( '#custom-next' ).on( 'click', function() {
		cal.gotoNextMonth( updateMonthYear );
	} );
	$( '#custom-prev' ).on( 'click', function() {
		cal.gotoPreviousMonth( updateMonthYear );
	} );
	$( '#custom-current' ).on( 'click', function() {
		cal.gotoNow( updateMonthYear );
	} );

	$(document).on('click', '.eventViewable', function () {
		var id = $(this).attr('id'),
			obj = ev[id];
		displayEvent(obj);
	});

	function updateMonthYear() {	
		var month = cal.getMonthName(),
			year = cal.getYear();
		$month.html( month );
		$year.html( year );
		getThisMonth(month, year);
	}

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

	var getThisMonth = function (month, year) {
		'use strict';
		var req;
		if (store.indexOf(month + '_' + year) !== -1) {
			console.log('Month already loaded');
			return false;
		} else {
			store.push(month + '_' + year);
			console.log('Adding ' + month + ', ' + year);
			req = {
				url : '/calendar/' + months.indexOf(month.toLowerCase()) + '/' + year,
				type : 'GET',
				dataType : 'json',
				success : function (data) {
					console.log(data);
					addToCalendar(data.calendar);
				},
				error : function (xhr, status, error) {
					console.log('ERROR GETTING CALENDAR');
					console.log(error);
				}
			}
			$.ajax(req); 
		}
	};

	var addToCalendar = function (arr) {
		'use strict';
		var obj = {},
			date,
			dateStr,
			i;
		for (i = 0; i < arr.length; i++) {
			if (arr[i].mute == 1) continue;
			obj = {};
			date = new Date(Math.round(arr[i].start_date));
			dateStr = dateToMDY(date);
			//obj[dateStr] = dateToTime(date) + ' - ' + arr[i].title;
			obj[dateStr] = '<span id="event_' + arr[i].event_id + '" class="eventViewable" title="' + arr[i].title + '"><i>' + dateToTimeRedux(date) + ' - </i>' + arr[i].title + '</span>';
			ev['event_' + arr[i].event_id] = arr[i];
			//console.log(obj);
			cal.setData(obj);
		}
	};

	var dateToMDY = function (date) {
	    var d = date.getDate(),
	    	m = date.getMonth() + 1,
	    	y = date.getFullYear();
	    return '' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d) + '-'  + y;
	};

	var dateToTime = function (date) {
		var h = date.getHours(),
			m = date.getMinutes(),
			p = h < 13 ? 'AM' : 'PM';
		return '' + (h < 13 ? h : h - 12) + ':' + ( m <= 9 ? '0' + m : m) + p;
	};

	var dateToTimeRedux = function (date) {
		var h = date.getHours(),
			m = date.getMinutes(),
			p = h < 13 ? 'A' : 'P';
		return '' + (h < 13 ? h : h - 12) + ( m == 0 ? '' : ':' + m) + p;
	};

	var displayEvent = function (obj) {
		'use strict';
		var html = '<div class="eventModal">';
		if (obj.url && obj.url !== '' && obj.url !== undefined) {
			html += '<a href="' + obj.url + '" target="_blank">';
				html += '<h2>' + obj.title + '</h2>';
			html += '</a>';
		} else {
			html += '<h2>' + obj.title + '</h2>';
		}
			html += '<div class="eventTimes lead">';
				html += moment(Math.round(obj.start_date)).format('MMM D, ');
				html += '  ';
				html += '<span>';
				html += moment(Math.round(obj.start_date)).format('h:mmA');
				html += '</span>';
				html += ' - ';
				html += '<span>';
				html += moment(Math.round(obj.end_date)).format('h:mmA');
				html += '</span>';
			html += '</div>';

			html += '<div class="eventLocation"><strong>';
			html += obj.location;
			html += '</strong></div>';

			html += '<p class="eventDescription">';
			html += obj.description.replace(new RegExp('\n', 'g'), '<br />');
			html += '</p>';

			html += '<span class="eventOrg label label-default">';
			html += orgs[obj.org];
			html += '</span>';

			html += '<span class="eventType label label-default">';
			html += obj.category;
			html += '</span>';
		html += '</div>';
		bootbox.dialog({
	        title: moment(Math.round(obj.start_date)).format('dddd, MMMM Do YYYY'),
	        message: html,
	        buttons: {
	        }
	    });
	};

	var getOrgs = function () {
		'use strict';
		var obj = {
			url : '/orgs',
			type : 'GET',
			success : function (data) {
				for (var i = 0; i < data.orgs.length; i++) {
					orgs[data.orgs[i].org_id] = data.orgs[i].name;
				}
				console.log(orgs);
			},
			error : function (err) {
				console.error(err);
			}
		};
		$.ajax(obj);
	};

	getOrgs();
	updateMonthYear();
	//displayEvent({title:'title'});

	// you can also add more data later on. As an example:
	/*
	someElement.on( 'click', function() {
		
		cal.setData( {
			'03-01-2013' : '<a href="#">testing</a>',
			'03-10-2013' : '<a href="#">testing</a>',
			'03-12-2013' : '<a href="#">testing</a>'
		} );
		// goes to a specific month/year
		cal.goto( 3, 2013, updateMonthYear );

	} );
	*/

});