

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
		if (store.indexOf(month + '_' + year) !== -1) {
			console.log('Month already loaded');
			return false;
		} else {
			store.push(month + '_' + year);
			console.log('Adding ' + month + ', ' + year);
			$.get('/calendar', function (data) {
				console.log(data);
			}, function (err) {
				console.error("Error getting /calendar");
				console.log(err);
			})
		}
	};

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