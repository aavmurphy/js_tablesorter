js_tablesorter.parsers.usLongDate = class extends js_tablesorter.parser {
	id		= 'usLongDate';
	type	= 'numeric';

	dateReplace		= /(\S)([AP]M)$/i; // used by usLongDate & time parser
	usLongDateTest1	= /^[A-Z]{3,10}\.?\s+\d{1,2},?\s+(\d{4})(\s+\d{1,2}:\d{2}(:\d{2})?(\s+[AP]M)?)?$/i;
	usLongDateTest2	= /^\d{1,2}\s+[A-Z]{3,10}\s+\d{4}/i;

	is ( str ) {
		// two digit years are not allowed cross-browser
		// Jan 01, 2013 12:34:56 PM or 01 Jan 2013
		return this.usLongDateTest1.test( str ) || this.usLongDateTest2.test( str );
		}
	format ( str )  {
		let date = str ? new Date( str.replace( this.dateReplace, '$1 $2' ) ) : str;
		return date instanceof Date && isFinite( date ) ? date.getTime() : str;
		}
	};