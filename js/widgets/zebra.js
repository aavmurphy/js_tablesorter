/*
██████ ██████ █████▄ █████▄ ▄████▄
  ▄█▀  ██▄▄   ██▄▄██ ██▄▄██ ██▄▄██
▄█▀    ██▀▀   ██▀▀██ ██▀▀█  ██▀▀██
██████ ██████ █████▀ ██  ██ ██  ██
*/

js_tablesorter.widgets.zebra = class extends js_tablesorter.widget {
	id			= 'zebra';
	priority	= 90;

	format ( table, c, wo ) {
		let $visibleRows, $row, count, isEven, tbodyIndex, rowIndex, len,
			child = new RegExp( c.cssChildRow, 'i' ),
			$tbodies = c.$tbodies.add( $( c.namespace + '_extra_table' ).children( 'tbody:not(.' + c.cssInfoBlock + ')' ) );
		for ( tbodyIndex = 0; tbodyIndex < $tbodies.length; tbodyIndex++ ) {
			// loop through the visible rows
			count = 0;
			$visibleRows = $tbodies.eq( tbodyIndex ).children( 'tr:visible' ).not( c.selectorRemove );
			len = $visibleRows.length;
			for ( rowIndex = 0; rowIndex < len; rowIndex++ ) {
				$row = $visibleRows.eq( rowIndex );
				// style child rows the same way the parent row was styled
				if ( !child.test( $row[ 0 ].className ) ) { count++; }
				isEven = ( count % 2 === 0 );
				$row
					.removeClass( wo.zebra[ isEven ? 1 : 0 ] )
					.addClass( wo.zebra[ isEven ? 0 : 1 ] );
				}
			}
		}

	remove ( table, c, wo, refreshing ) {
		if ( refreshing ) { return; }
		let tbodyIndex, $tbody,
			$tbodies = c.$tbodies,
			toRemove = ( wo.zebra || [ 'even', 'odd' ] ).join( ' ' );
		for ( tbodyIndex = 0; tbodyIndex < $tbodies.length; tbodyIndex++ ) {
			$tbody = ts.processTbody( table, $tbodies.eq( tbodyIndex ), true ); // remove tbody
			$tbody.children().removeClass( toRemove );
			ts.processTbody( table, $tbody, false ); // restore tbody
			}
		}
	};


//
