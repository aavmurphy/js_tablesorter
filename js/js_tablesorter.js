/*!
js_tablesorter - client side html <table> sorter
Copyright (c) 2024 Andrew Murphy. Extends the work of Rob Garrison and Christian Bach
*/
/*
* Examples and original docs at: http://tablesorter.com
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
* @name tablesorter (FORK)
* @author Christian Bach - christian.bach@polyester.se
* @contributor Rob Garrison - https://github.com/Mottie/tablesorter
* @docs (fork) - https://mottie.github.io/tablesorter/docs/
*/

window.js_tablesorter = {

	/* namespaces*/
	widgets	: {},
	parsers	: {},
	extras	: {},

	auto_init	: () => {
		console.group( 'js_tablesorter auto-init' );

		let tables = document.querySelectorAll( '[data-ts-auto-init]' );

		console.info( `js_tablesorter : auto init ${ tables.length } tables` );

		tables.forEach( ( ele, i ) => {
			let tablesorter = new js_tablesorter.table( { ele: ele, name: `table # ${ i }`, auto_init : true } );
			} );

		console.groupEnd();
		}
};

document.addEventListener( "DOMContentLoaded", js_tablesorter.auto_init );



