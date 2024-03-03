

js_tablesorter.parsers.no_parser = class {
	id		= 'no-parser';
	type	= 'text';
	is		() { return false; }
	format	() { return '';	}
	}

js_tablesorter.parsers.text = class extends js_tablesorter.parser {
	id		= 'text';
	type	= 'text';
	is		() { return true; }
	format	( str, table ) {
		if ( str ) {
			str = str.trim( this.config.ignoreCase ? str.toLocaleLowerCase() : str );
			str = this.config.sortLocaleCompare ? this.replaceAccents( str ) : str;
			}
		return str;
		}
	}

js_tablesorter.parsers.digit = class extends js_tablesorter.parser {
	id		= 'digit';
	type	= 'numeric';
	is		( str ) { return this.isDigit( str ); }
	format	( str, table ) {
		let regex_nondigit = /[^\w,. \-()]/g;
		let num = this.formatFloat( ( str || '' ).replace( regex_nondigit, '' ), table );
		return str && typeof num === 'number' ? num :
			str ? str.trim( str && table.config.ignoreCase ? str.toLocaleLowerCase() : str ) : str;
		}
	};

js_tablesorter.parsers.currency = class extends js_tablesorter.parser {
	id		= 'currency';
	type	= 'numeric';
	is ( str ) {
		this.regex.currencyReplace = /[+\-,. ]/g;
		this.regex.currencyTest = /^\(?\d+[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]|[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]\d+\)?$/;
		str = ( str || '' ).replace( this.regex.currencyReplace, '' );
		// test for £$€¤¥¢
		return this.regex.currencyTest.test( str );
		}
	format ( str, table ) {
		let num = this.formatFloat( ( str || '' ).replace( this.regex.nondigit, '' ), table );
		return str && typeof num === 'number' ? num :
			str ? $.trim( str && table.config.ignoreCase ? str.toLocaleLowerCase() : str ) : str;
		}
	};
	
js_tablesorter.parsers.url = class extends js_tablesorter.parser {
	// too many protocols to add them all https://en.wikipedia.org/wiki/URI_scheme
	// now, this regex can be updated before initialization
	id		= 'url';
	type	= 'text';
	is ( str ) {
		this.regex.urlProtocolTest = /^(https?|ftp|file):\/\//;
		return this.regex.urlProtocolTest.test( str );
		}
	format ( str ) {
		this.regex.urlProtocolReplace = /(https?|ftp|file):\/\/(www\.)?/;
		return str ? $.trim( str.replace( ts.regex.urlProtocolReplace, '' ) ) : str;
		}
	
	};
	
js_tablesorter.parsers.isoDate = class extends js_tablesorter.parser {
	id		= 'isoDate';
	type	= 'numeric';

	dash	= /-/g;
	isoDate	= /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/;

	is ( str ) {
		return this.isoDate.test( str );
		}
	format ( str ) {
		let date = str ? new Date( str.replace( this.dash, '/' ) ) : str;
		return date instanceof Date && isFinite( date ) ? date.getTime() : str;
		}
	};

js_tablesorter.parsers.percent = class extends js_tablesorter.parser {
	id		= 'percent';
	type	= 'numeric';

	percentTest	= /(\d\s*?%|%\s*?\d)/;
	percent		= /%/g;

	is ( str ) {
		return this.percentTest.test( str ) && str.length < 15;
		}
	format ( str, table ) {
		return str ? ts.formatFloat( str.replace( this.percent, '' ), table ) : str;
		}
	};

js_tablesorter.parsers.image = class extends js_tablesorter.parser {
	id		= 'image';
	type 	= 'text';

	parsed	= true; // filter widget flag

	is ( str, table, node, $node ) {
		return $node.find( 'img' ).length > 0;
		};
	format ( str, table, cell ) {
		return $( cell ).find( 'img' ).attr( table.config.imgAttr || 'alt' ) || str;
		};
	};



js_tablesorter.parsers.shortDate = class extends js_tablesorter.parser {
	id		= 'shortDate'; // 'mmddyyyy', 'ddmmyyyy' or 'yyyymmdd'
	type	= 'numeric';

	// testing for ##-##-#### or ####-##-##, so it's not perfect; time can be included
	shortDateTest = /(^\d{1,2}[\/\s]\d{1,2}[\/\s]\d{4})|(^\d{4}[\/\s]\d{1,2}[\/\s]\d{1,2})/;
	// escaped "-" because JSHint in Firefox was showing it as an error
	shortDateReplace = /[\-.,]/g;
	// XXY covers MDY & DMY formats
	shortDateXXY = /(\d{1,2})[\/\s](\d{1,2})[\/\s](\d{4})/;
	shortDateYMD = /(\d{4})[\/\s](\d{1,2})[\/\s](\d{1,2})/;

	convertFormat ( dateString, format ) {
		dateString = ( dateString || '' )
			.replace( ts.regex.spaces, ' ' )
			.replace( shortDateReplace, '/' );
		if ( format === 'mmddyyyy' ) {
			dateString = dateString.replace( shortDateXXY, '$3/$1/$2' );
		} else if ( format === 'ddmmyyyy' ) {
			dateString = dateString.replace( shortDateXXY, '$3/$2/$1' );
		} else if ( format === 'yyyymmdd' ) {
			dateString = dateString.replace( shortDateYMD, '$1/$2/$3' );
		}
		let date = new Date( dateString );
		return date instanceof Date && isFinite( date ) ? date.getTime() : '';
	}

	is ( str ) {
		str = ( str || '' ).replace( ts.regex.spaces, ' ' ).replace( shortDateReplace, '/' );
		return ts.regex.shortDateTest.test( str );
	}
	format ( str, table, cell, cellIndex ) {
		if ( str ) {
			let c = table.config,
				$header = c.$headerIndexed[ cellIndex ],
				format = $header.length && $header.data( 'dateFormat' ) ||
					this.getData( $header, this.getColumnData( table, c.headers, cellIndex ), 'dateFormat' ) ||
					c.dateFormat;
			// save format because getData can be slow...
			if ( $header.length ) {
				$header.data( 'dateFormat', format );
				}
			return ts.convertFormat( str, format ) || str;
			}
		return str;
		}
	};


js_tablesorter.parsers.time = class extends js_tablesorter.parser {
	id		= 'time';
	type	= 'numeric';

	// match 24 hour time & 12 hours time + am/pm - see http://regexr.com/3c3tk
	timeTest	= /^(0?[1-9]|1[0-2]):([0-5]\d)(\s[AP]M)$|^((?:[01]\d|[2][0-4]):[0-5]\d)$/i;
	timeMatch	= /(0?[1-9]|1[0-2]):([0-5]\d)(\s[AP]M)|((?:[01]\d|[2][0-4]):[0-5]\d)/i;

	is ( str ) {
		return this.timeTest.test( str );
		}
	format ( str ) {
		// isolate time... ignore month, day and year
		let temp,
			timePart = ( str || '' ).match( this.timeMatch ),
			orig = new Date( str ),
			// no time component? default to 00:00 by leaving it out, but only if str is defined
			time = str && ( timePart !== null ? timePart[ 0 ] : '00:00 AM' ),
			date = time ? new Date( '2000/01/01 ' + time.replace( ts.regex.dateReplace, '$1 $2' ) ) : time;
		if ( date instanceof Date && isFinite( date ) ) {
			temp = orig instanceof Date && isFinite( orig ) ? orig.getTime() : 0;
			// if original string was a valid date, add it to the decimal so the column sorts in some kind of order
			// luckily new Date() ignores the decimals
			return temp ? parseFloat( date.getTime() + '.' + orig.getTime() ) : date.getTime();
			}
		return str;
		}
	
	};

js_tablesorter.parsers.metadata = class extends js_tablesorter.parser {
	id		= 'metadata';
	type	= 'numeric';
	is 		() { return false; }
	format ( str, table, cell ) {
		let p = ( ! this.config.parserMetadataName ) ? 'sortValue' : this.config.parserMetadataName;
		return $( cell ).metadata()[ p ];
		}
	};
