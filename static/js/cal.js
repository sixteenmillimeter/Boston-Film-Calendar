

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
		store = [];

	$( '#custom-next' ).on( 'click', function() {
		cal.gotoNextMonth( updateMonthYear );
	} );
	$( '#custom-prev' ).on( 'click', function() {
		cal.gotoPreviousMonth( updateMonthYear );
	} );
	$( '#custom-current' ).on( 'click', function() {
		cal.gotoNow( updateMonthYear );
	} );

	function updateMonthYear() {	
		var month = cal.getMonthName(),
			year = cal.getYear();
		$month.html( month );
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
				url : '/calendar',
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
			obj = {};
			date = new Date(Math.round(arr[i].start_date));
			dateStr = date.toString('MM-dd-yy');
			obj[dateStr] = arr[i].title;
			console.log(obj);
			cal.setData(obj);
		}
	};

	updateMonthYear();

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