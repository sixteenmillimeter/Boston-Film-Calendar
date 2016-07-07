$(function() {

	var cal = $( '#calendar' ).calendario( {
			onDayClick : function( $el, $contentEl, dateProperties ) {

				for( var key in dateProperties ) {
					console.log( key + ' = ' + dateProperties[ key ] );
				}

			},
			caldata : codropsEvents
		} ),
		$month = $( '#custom-month' ).html( cal.getMonthName() ),
		$year = $( '#custom-year' ).html( cal.getYear() );

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
		$month.html( cal.getMonthName() );
		$year.html( cal.getYear() );
	}

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