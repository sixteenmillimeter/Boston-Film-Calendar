

$(function() {
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

	var shortMonths = [
		'blank',
		'jan',
		'feb',
		'mar',
		'apr',
		'may',
		'jun',
		'jul',
		'aug',
		'sept',
		'oct',
		'nov',
		'dec'
	];

	var MONTHS = function (monthName) {
		'use strict';
		var index
		if ($(window).width() < 880) {
			index = months.indexOf(monthName.toLowerCase())
			return shortMonths[index]
		} 
		return monthName
	}

	var cal = $( '#calendar' ).calendario( {
			onDayClick : function( $el, $contentEl, dateProperties ) {
				for( var key in dateProperties ) {
					//console.log( key + ' = ' + dateProperties[ key ] );
				}
			},
			caldata : {}
		} ),
		$month = $( '#custom-month' ).html( MONTHS(cal.getMonthName()) ),
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
		$month.html( MONTHS(month) );
		$year.html( year );
		getThisMonth(month, year);
	}

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
					$('.spinner').hide();
				},
				error : function (xhr, status, error) {
					console.log('ERROR GETTING CALENDAR');
					console.log(error);
					$('.spinner').hide();
				}
			}
			$('.spinner').show();
			$.ajax(req); 
		}
	};

	var addToCalendar = function (arr) {
		'use strict';
		var obj = {},
			elem = [],
			date,
			dateNo,
			dateStr,
			i,
			days = {},
			dayKeys,
			lastDay = 1;
		arr.sort(function (a, b) {
			var dateA = new Date(Math.round(a.start_date)),
				dateB = new Date(Math.round(b.start_date));
			return dateA.getDate() - dateB.getDate();
		});
		console.log(arr);
		for (i = 0; i < arr.length; i++) {
			date = new Date(Math.round(arr[i].start_date));
			dateNo = date.getDate();
			if (lastDay !== dateNo) {
				if (elem.length !== 0) {
					days[lastDay] = elem;
				}
				lastDay = dateNo;
				elem = [];
			}	
			
			elem.push(arr[i]);

			if (i === arr.length - 1 
				&& elem.length > 0) { //unnecessary
				days[lastDay] = elem;
			}
		}
		dayKeys = Object.keys(days);
		for (i = 0; i < dayKeys.length; i++) {
			obj = groupEvent(days[dayKeys[i]]);
			cal.setData(obj);
		}
	};

	var groupEvent = function (events) {
		var obj = {},
			html = '',
			i;
		if (typeof events === 'undefined') return false;

		date = new Date(Math.round(events[0].start_date)); 
		dateStr = dateToMDY(date);

		for (i = 0; i < events.length; i++) {
			html +='<span id="event_' + events[i].event_id + '" class="eventViewable" title="' + events[i].title + '"><i>' + dateToTimeRedux(new Date(Math.round(events[i].start_date))) + ' - </i>' + events[i].title + '</span>';
			ev['event_' + events[i].event_id] = events[i];
		}

		obj[dateStr] = html;
		return obj;
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

	var opts = {
		lines: 9 // The number of lines to draw
		, length: 5 // The length of each line
		, width: 5 // The line thickness
		, radius: 8 // The radius of the inner circle
		, scale: 0.75 // Scales overall size of the spinner
		, corners: 1 // Corner roundness (0..1)
		, color: '#fff' // #rgb or #rrggbb or array of colors
		, opacity: 0.1 // Opacity of the lines
		, rotate: 11 // The rotation offset
		, direction: 1 // 1: clockwise, -1: counterclockwise
		, speed: 0.8 // Rounds per second
		, trail: 60 // Afterglow percentage
		, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
		, zIndex: 2e9 // The z-index (defaults to 2000000000)
		, className: 'spinner' // The CSS class to assign to the spinner
		, top: '0' // Top position relative to parent
		, left: '0' // Left position relative to parent
		, shadow: false // Whether to render a shadow
		, hwaccel: false // Whether to use hardware acceleration
		, position: 'relative' // Element positioning
	};
	var target = document.getElementById('spin');
	var spinner = new Spinner(opts).spin(target);

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