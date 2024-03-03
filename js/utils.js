/*
██  ██ ██████ ██ ██     ██ ██████ ██ ██████ ▄█████
██  ██   ██   ██ ██     ██   ██   ██ ██▄▄   ▀█▄
██  ██   ██   ██ ██     ██   ██   ██ ██▀▀      ▀█▄
▀████▀   ██   ██ ██████ ██   ██   ██ ██████ █████▀
*/

js_tablesorter.utils = class {

benchmark ( diff ) {
	return ( ' (' + ( new Date().getTime() - diff.getTime() ) + ' ms)' );
	}

debug (c, name) {
	return c && (
		c.debug === true ||
		typeof c.debug === 'string' && c.debug.indexOf(name) > -1
		);
	}

// $.isEmptyObject from jQuery v1.4
isEmptyObject( obj ) {
	/*jshint forin: false */
	for ( let name in obj ) {
		return false;
	}
	return true;
}

isValueInArray ( column, arry ) {
	let indx,
		len = arry && arry.length || 0;
	for ( indx = 0; indx < len; indx++ ) {
		if ( arry[ indx ][ 0 ] === column ) {
			return indx;
		}
	}
	return -1;
}

formatFloat( str, table ) {
	if ( typeof str !== 'string' || str === '' ) { return str; }
	// allow using formatFloat without a table; defaults to US number format
	let num,
		usFormat = table && table.config ? table.config.usNumberFormat !== false :
			typeof table !== 'undefined' ? table : true;
	if ( usFormat ) {
		// US Format - 1,234,567.89 -> 1234567.89
		str = str.replace( ts.regex.comma, '' );
	} else {
		// German Format = 1.234.567,89 -> 1234567.89
		// French Format = 1 234 567,89 -> 1234567.89
		str = str.replace( ts.regex.digitNonUS, '' ).replace( ts.regex.comma, '.' );
	}
	if ( ts.regex.digitNegativeTest.test( str ) ) {
		// make (#) into a negative number -> (10) = -10
		str = str.replace( ts.regex.digitNegativeReplace, '-$1' );
	}
	num = parseFloat( str );
	// return the text instead of zero
	return isNaN( num ) ? $.trim( str ) : num;
}

isDigit () {
	// replace all unwanted chars and match
	return isNaN( str ) ?
		ts.regex.digitTest.test( str.toString().replace( this.regex.digitReplace, '' ) ) :
		str !== '';
	}

// automatically add a colgroup with col elements set to a percentage width
fixColumnWidth ( table ) {
	table = $( table )[ 0 ];
	let overallWidth, percent, $tbodies, len, index,
		colgroup = this.ele.table.children( 'colgroup' );
	// remove plugin-added colgroup, in case we need to refresh the widths
	if ( colgroup.length && colgroup.hasClass( this.css.colgroup ) ) {
		$colgroup.remove();
	}
	if ( c.widthFixed && c.$table.children( 'colgroup' ).length === 0 ) {
		$colgroup = $( '<colgroup class="' + ts.css.colgroup + '">' );
		overallWidth = c.$table.width();
		// only add col for visible columns - fixes #371
		$tbodies = c.$tbodies.find( 'tr:first' ).children( ':visible' );
		len = $tbodies.length;
		for ( index = 0; index < len; index++ ) {
			percent = parseInt( ( $tbodies.eq( index ).width() / overallWidth ) * 1000, 10 ) / 10 + '%';
			$colgroup.append( $( '<col>' ).css( 'width', percent ) );
		}
		c.$table.prepend( $colgroup );
	}
}

set_data_attr( ele, key, value )
	{
	// just makes it more obvious that is 'set' not 'get'
	this.data_attr( ele, key, value )
	}

data_attr( ele, key, value )
	{
	// key is aaa_bbb_ccc, need to convert to read/write tsAaaBbbCcc
	let data_key = `ts_${ key }`.replace( /_(\w)/g, ( match, letter ) => { return letter.toUpperCase(); } );

	if ( value !== undefined )
		{
		if ( this.debug ) console.info( `. . set ${ key } / ${ data_key } = ${ value }` );
		ele.dataset[ data_key ] = value;
		}
	else
		{
		value = ele.dataset[ data_key ];

		if ( this.debug ) console.info( `. . get ${ key } / ${ data_key } = ${ value }` );
		}
	
	return value;
	}

// get sorter, string, empty, etc options for each column from
// jQuery data, metadata, header option or header class name ('sorter-false')
// priority = jQuery data > meta > headers option > header class name
get_config ( ele, column_no , key ) {
	let value;

	if ( value = this.config?.headers?.[ column_no ]?.[ key ] )
		{
		return value;
		}

	if ( value = this.data_attr( ele, key ) )
		{
		return value;
		}
	return '';
	}

	/*
	let meta, cl4ss,
		val = '',
		$header = $( header );
	if ( !$header.length ) { return ''; }
	meta = $.metadata ? $header.metadata() : false;
	cl4ss = ' ' + ( $header.attr( 'class' ) || '' );
	if ( typeof $header.data( key ) !== 'undefined' ||
		typeof $header.data( key.toLowerCase() ) !== 'undefined' ) {
		// 'data-lockedOrder' is assigned to 'lockedorder'; but 'data-locked-order' is assigned to 'lockedOrder'
		// 'data-sort-initial-order' is assigned to 'sortInitialOrder'
		val += $header.data( key ) || $header.data( key.toLowerCase() );
	} else if ( meta && typeof meta[ key ] !== 'undefined' ) {
		val += meta[ key ];
	} else if ( configHeader && typeof configHeader[ key ] !== 'undefined' ) {
		val += configHeader[ key ];
	} else if ( cl4ss !== ' ' && cl4ss.match( ' ' + key + '-' ) ) {
		// include sorter class name 'sorter-text', etc; now works with 'sorter-my-custom-parser'
		val = cl4ss.match( new RegExp( '\\s' + key + '-([\\w-]+)' ) )[ 1 ] || '';
	}
	return $.trim( val );
	}
	*/


/* i'm guessing, loop thru to find data-column={index}, uss css selector instead
getColumnData ( table, obj, indx, getCell, $headers ) {
	if ( typeof obj !== 'object' || obj === null ) {
		return obj;
	}
	table = $( table )[ 0 ];
	let $header, key,
		c = table.config,
		$cells = ( $headers || c.$headers ),
		// c.$headerIndexed is not defined initially
		$cell = c.$headerIndexed && c.$headerIndexed[ indx ] ||
			$cells.find( '[data-column="' + indx + '"]:last' );
	if ( typeof obj[ indx ] !== 'undefined' ) {
		return getCell ? obj[ indx ] : obj[ $cells.index( $cell ) ];
	}
	for ( key in obj ) {
		if ( typeof key === 'string' ) {
			$header = $cell
				// header cell with class/id
				.filter( key )
				// find elements within the header cell with cell/id
				.add( $cell.find( key ) );
			if ( $header.length ) {
				return obj[ key ];
			}
		}
	}
	return;
} */

// *** Process table ***
// add processing indicator
isProcessing ( $table, toggle, $headers ) {
	$table = $( $table );
	let c = $table[ 0 ].config,
		// default to all headers
		$header = $headers || $table.find( '.' + ts.css.header );
	if ( toggle ) {
		// don't use sortList if custom $headers used
		if ( typeof $headers !== 'undefined' && c.sortList.length > 0 ) {
			// get headers from the sortList
			$header = $header.filter( function() {
				// get data-column from attr to keep compatibility with jQuery 1.2.6
				return this.sortDisabled ?
					false :
					ts.isValueInArray( parseFloat( $( this ).attr( 'data-column' ) ), c.sortList ) >= 0;
			});
		}
		$table.add( $header ).addClass( ts.css.processing + ' ' + c.cssProcessing );
	} else {
		$table.add( $header ).removeClass( ts.css.processing + ' ' + c.cssProcessing );
	}
}

// detach tbody but save the position
// don't use tbody because there are portions that look for a tbody index (updateCell)
processTbody ( table, $tb, getIt ) {
	table = $( table )[ 0 ];
	if ( getIt ) {
		table.isProcessing = true;
		$tb.before( '<colgroup class="tablesorter-savemyplace"/>' );
		return $.fn.detach ? $tb.detach() : $tb.remove();
	}
	let holdr = $( table ).find( 'colgroup.tablesorter-savemyplace' );
	$tb.insertAfter( holdr );
	holdr.remove();
	table.isProcessing = false;
}

clearTableBody ( table ) {
	$( table )[ 0 ].config.$tbodies.children().detach();
}

// used when replacing accented characters during sorting
CHARACTER_EQUIVALENTS = {
	'a' : '\u00e1\u00e0\u00e2\u00e3\u00e4\u0105\u00e5', // áàâãäąå
	'A' : '\u00c1\u00c0\u00c2\u00c3\u00c4\u0104\u00c5', // ÁÀÂÃÄĄÅ
	'c' : '\u00e7\u0107\u010d', // çćč
	'C' : '\u00c7\u0106\u010c', // ÇĆČ
	'e' : '\u00e9\u00e8\u00ea\u00eb\u011b\u0119', // éèêëěę
	'E' : '\u00c9\u00c8\u00ca\u00cb\u011a\u0118', // ÉÈÊËĚĘ
	'i' : '\u00ed\u00ec\u0130\u00ee\u00ef\u0131', // íìİîïı
	'I' : '\u00cd\u00cc\u0130\u00ce\u00cf', // ÍÌİÎÏ
	'o' : '\u00f3\u00f2\u00f4\u00f5\u00f6\u014d', // óòôõöō
	'O' : '\u00d3\u00d2\u00d4\u00d5\u00d6\u014c', // ÓÒÔÕÖŌ
	'ss': '\u00df', // ß (s sharp)
	'SS': '\u1e9e', // ẞ (Capital sharp s)
	'u' : '\u00fa\u00f9\u00fb\u00fc\u016f', // úùûüů
	'U' : '\u00da\u00d9\u00db\u00dc\u016e' // ÚÙÛÜŮ
};

replaceAccents ( str ) {
	let chr,
		acc = '[',
		eq = this.CHARACTE_REQUIVALENTS;

	if ( ! this.characterRegex ) {
		this.characterRegexArray = {};
		for ( chr in eq ) {
			if ( typeof chr === 'string' ) {
				acc += eq[ chr ];
				this.characterRegexArray[ chr ] = new RegExp( '[' + eq[ chr ] + ']', 'g' );
			}
		}
		this.characterRegex = new RegExp( acc + ']' );
	}
	if ( this.characterRegex.test( str ) ) {
		for ( chr in eq ) {
			if ( typeof chr === 'string' ) {
				str = str.replace( this.characterRegexArray[ chr ], chr );
			}
		}
	}
	return str;
}

validateOptions ( c ) {
	let setting, setting2, typ, timer,
		// ignore options containing an array
		ignore = 'headers sortForce sortList sortAppend widgets'.split( ' ' ),
		orig = c.originalSettings;
	if ( orig ) {
		if ( ts.debug(c, 'core') ) {
			timer = new Date();
		}
		for ( setting in orig ) {
			typ = typeof ts.defaults[setting];
			if ( typ === 'undefined' ) {
				console.warn( 'Tablesorter Warning! "table.config.' + setting + '" option not recognized' );
			} else if ( typ === 'object' ) {
				for ( setting2 in orig[setting] ) {
					typ = ts.defaults[setting] && typeof ts.defaults[setting][setting2];
					if ( $.inArray( setting, ignore ) < 0 && typ === 'undefined' ) {
						console.warn( 'Tablesorter Warning! "table.config.' + setting + '.' + setting2 + '" option not recognized' );
					}
				}
			}
		}
		if ( ts.debug(c, 'core') ) {
			console.log( 'validate options time:' + ts.benchmark( timer ) );
		}
	}
}

};