window.js_tablesorter.table = class extends window.js_tablesorter.utils {

VERSION		= '3.0.alpha_1';

CONFIG	= {
	init	: false,
	widgets	: {},
	};
	
debug		= true;

defaults	= {

	// *** appearance
	theme            : 'default',  // adds tablesorter-{theme} to the table for styling
	widthFixed       : false,      // adds colgroup to fix widths of columns
	showProcessing   : false,      // show an indeterminate timer icon in the header when the table is sorted or filtered.

	headerTemplate   : '{content}',// header layout template (HTML ok); {content} = innerHTML, {icon} = <i/> // class from cssIcon
	onRenderTemplate : null,       // function( index, template ) { return template; }, // template is a string
	onRenderHeader   : null,       // function( index ) {}, // nothing to return

	// *** functionality
	cancelSelection  : true,       // prevent text selection in the header
	tabIndex         : true,       // add tabindex to header for keyboard accessibility
	dateFormat       : 'mmddyyyy', // other options: 'ddmmyyy' or 'yyyymmdd'
	sortMultiSortKey : 'shiftKey', // key used to select additional columns
	sortResetKey     : 'ctrlKey',  // key used to remove sorting on a column
	usNumberFormat   : true,       // false for German '1.234.567,89' or French '1 234 567,89'
	delayInit        : false,      // if false, the parsed table contents will not update until the first sort
	serverSideSorting: false,      // if true, server-side sorting should be performed because client-side sorting will be disabled, but the ui and events will still be used.
	resort           : true,       // default setting to trigger a resort after an 'update', 'addRows', 'updateCell', etc has completed

	// *** sort options
	headers          : {},         // set sorter, string, empty, locked order, sortInitialOrder, filter, etc.
	ignoreCase       : true,       // ignore case while sorting
	sortForce        : null,       // column(s) first sorted; always applied
	sortList         : [],         // Initial sort order; applied initially; updated when manually sorted
	sortAppend       : null,       // column(s) sorted last; always applied
	sortStable       : false,      // when sorting two rows with exactly the same content, the original sort order is maintained

	sortInitialOrder : 'asc',      // sort direction on first click
	sortLocaleCompare: false,      // replace equivalent character (accented characters)
	sortReset        : false,      // third click on the header will reset column to default - unsorted
	sortRestart      : false,      // restart sort to 'sortInitialOrder' when clicking on previously unsorted columns

	emptyTo          : 'bottom',   // sort empty cell to bottom, top, none, zero, emptyMax, emptyMin
	stringTo         : 'max',      // sort strings in numerical column as max, min, top, bottom, zero
	duplicateSpan    : true,       // colspan cells in the tbody will have duplicated content in the cache for each spanned column
	textExtraction   : 'basic',    // text extraction method/function - function( node, table, cellIndex ) {}
	textAttribute    : 'data-text',// data-attribute that contains alternate cell text (used in default textExtraction function)
	textSorter       : null,       // choose overall or specific column sorter function( a, b, direction, table, columnIndex ) [alt: ts.sortText]
	numberSorter     : null,       // choose overall numeric sorter function( a, b, direction, maxColumnValue )

	// *** widget options
	initWidgets      : true,       // apply widgets on tablesorter initialization
	widgetClass      : 'widget-{name}', // table class name template to match to include a widget
	widgets          : [],         // method to add widgets, e.g. widgets: ['zebra']
	widgetOptions    : {
		zebra : [ 'even', 'odd' ]  // zebra widget alternating row class names
	},

	// *** callbacks
	initialized      : null,       // function( table ) {},

	// *** extra css class names
	tableClass       : '',
	cssAsc           : '',
	cssDesc          : '',
	cssNone          : '',
	cssHeader        : '',
	cssHeaderRow     : '',
	cssProcessing    : '', // processing icon applied to header during sort/filter

	cssChildRow      : 'tablesorter-childRow', // class name indiciating that a row is to be attached to its parent
	cssInfoBlock     : 'tablesorter-infoOnly', // don't sort tbody with this class name (only one class name allowed here!)
	cssNoSort        : 'tablesorter-noSort',   // class name added to element inside header; clicking on it won't cause a sort
	cssIgnoreRow     : 'tablesorter-ignoreRow',// header row to ignore; cells within this row will not be added to c.$headers

	cssIcon          : 'tablesorter-icon', // if this class does not exist, the {icon} will not be added from the headerTemplate
	cssIconNone      : '', // class name added to the icon when there is no column sort
	cssIconAsc       : '', // class name added to the icon when the column has an ascending sort
	cssIconDesc      : '', // class name added to the icon when the column has a descending sort
	cssIconDisabled  : '', // class name added to the icon when the column has a disabled sort

	// *** events
	pointerClick     : 'click',
	pointerDown      : 'mousedown',
	pointerUp        : 'mouseup',

	// *** selectors
	selectorHeaders  : ':scope > thead th, :scope > thead td',
	selectorSort     : 'th, td', // jQuery selector of content within selectorHeaders that is clickable to trigger a sort
	selectorRemove   : '.remove-me',

	// *** advanced
	debug            : true,

	// *** Internal variables
	headerList: [],
	empties: {},
	strings: {},
	parsers: [],

	// *** parser options for validator; values must be falsy!
	globalize: 0,
	imgAttr: 0

	// removed: widgetZebra: { css: ['even', 'odd'] }
	};

css			= {
	// internal css classes - these will ALWAYS be added to
	// the table and MUST only contain one class name - fixes #381

	table      : 'tablesorter',
	cssHasChild: 'tablesorter-hasChildRow',
	childRow   : 'tablesorter-childRow',
	colgroup   : 'tablesorter-colgroup',
	header     : 'tablesorter-header',
	headerRow  : 'tablesorter-headerRow',
	headerIn   : 'tablesorter-header-inner',
	icon       : 'tablesorter-icon',
	processing : 'tablesorter-processing',
	sortAsc    : 'tablesorter-headerAsc',
	sortDesc   : 'tablesorter-headerDesc',
	sortNone   : 'tablesorter-headerUnSorted'
	};

language	= {
	// labels applied to sortable headers for accessibility (aria) support

	sortAsc      : 'Ascending sort applied, ',
	sortDesc     : 'Descending sort applied, ',
	sortNone     : 'No sort applied, ',
	sortDisabled : 'sorting is disabled',
	nextAsc      : 'activate to apply an ascending sort',
	nextDesc     : 'activate to apply a descending sort',
	nextNone     : 'activate to remove the sort'
	};

regex		= {
	templateContent : /\{content\}/g,
	templateIcon    : /\{icon\}/g,
	templateName    : /\{name\}/i,
	spaces          : /\s+/g,
	nonWord         : /\W/g,
	formElements    : /(input|select|button|textarea)/i,

	// *** sort functions ***
	// regex used in natural sort
	// chunk/tokenize numbers & letters
	chunk  : /(^([+\-]?(?:\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?)?$|^0x[0-9a-f]+$|\d+)/gi,
	// replace chunks @ ends
	chunks : /(^\\0|\\0$)/,
	hex    : /^0x[0-9a-f]+$/i,

	// *** formatFloat ***
	comma                : /,/g,
	digitNonUS           : /[\s|\.]/g,
	digitNegativeTest    : /^\s*\([.\d]+\)/,
	digitNegativeReplace : /^\s*\(([.\d]+)\)/,

	// *** isDigit ***
	digitTest    : /^[\-+(]?\d+[)]?$/,
	digitReplace : /[,.'"\s]/g
	};

string		= {
	// digit sort, text location
	max      : 1,
	min      : -1,
	emptymin : 1,
	emptymax : -1,
	zero     : 0,
	none     : 0,
	'null'   : 0,
	'top'     : true,
	bottom   : false
	};

keyCodes	= {
	enter : 13
	};

// placeholder date parser data (globalize)
dates		= {};

// These methods can be applied on table.config instance
instanceMethods = {};

//
constructor ( params )
	{
	super();

	let { ele, name, is_auto_init, config } = params;
 
	if ( this.debug ) console.group( `tablesorter ${ this.VERSION } ${ name || '' }` );

	this.utils		= new js_tablesorter.utils();

	this.ele		= null;		// the table wrapper's element id (ele)
	this.id			= null;		// and it's id=""

	this.table_ele	= null;		// the table's ele
	
	this.state		= { is_init_done: false }; 
	this.config		= {};
	this.headers	= [];
	this.rows		= {};

	this.parsers	= {};
	this.widgets	= {};

	//
	this.config				= { ... this.defaults, ... config, ... this.instanceMethods };
	this.original_config	= config;	// save initial settings

	//
	if ( ! this.verify( ele ) ) return false;

	this.aria();
	
	this.parser_load();

	this.widget_load();

	this.init( config );

	if ( this.debug ) console.groupEnd();
	}

init ( config )
	{
	if ( this.debug ) console.info( 'config', this.config );

	// create a table from data (build table widget)
	//if ( ! this.state.hasInitialized && this.state.buildTable && this.ele.nodeName !== 'TABLE' ) {
	//	// return the table (in case the original target is the table's container)
	//	this.buildTable(); //table,c
	//	}
	//else {
	this.setup();
	//}

	}

/*
▄█████ ██████ ██████ ██  ██ █████▄
▀█▄    ██▄▄     ██   ██  ██ ██▄▄██
   ▀█▄ ██▀▀     ██   ██  ██ ██▀▀▀
█████▀ ██████   ██   ▀████▀ ██
*/

verify ( ele ) {
	
	if ( this.debug ) console.info( `verify wrapper and table` );

	// check passed the getElementById of the table wrapper

	if ( ! ele )
		{
		console.error ( 'Need to be passed the document element id of the <div> wrapping the <table>' );
		return false;
		}

	if ( ele instanceof String )
		{
		ele = document.getElementById( ele ); // just in case passed an id, not an ele
		}

	if ( ! ele || ! ele?.isConnected )
		{
		console.error( 'Need to be passed the document element id of the <div> wrapping the <table>' );
		return false;
		}

	this.ele = ele;

	if ( this.debug ) console.info( '. wrapper has an ele' );

	// check it has an id, if not give it one

	let id = this.ele.id || '';

	if ( ! id )
		{
		id = `ts-${ Math.random().toString().substr(2) }`;
		this.ele.id = id; 
		}

	this.id = id;

	if ( this.debug ) console.info( `. wrapper has an id : ${ id }` );

	// check has a table
	let tables = document.querySelectorAll( ':scope table' );

	if ( tables.length !== 1 )
		{
		console.error( 'Wrapper <div> needs to contain 1 and only 1 table', tables );
		return false;
		}
	
	this.table_ele = tables[ 0 ];

	//
	if ( ! this.table_ele.tHead === 1 )
		{
		console.error( 'Table needs 1 and only 1 <thead>', this.table_ele );
		return false;
		}

	if ( ! this.table_ele.tBodies.length === 1  ) {
		console.error( 'Table needs 1 and only 1 <thead>', this.table_ele  );
		return false;
		}

	if ( this.debug ) console.info( `. there is a <table> with one <thead> and 1 <tbody>` );

	return true;
	}

	// add namespace to table to allow bindings on extra elements to target
	// the parent table (e.g. parser-input-select)
	//this.ele.classList.add( theme
	//	? [ this.css.table, this.config.tableClass, theme,	this.config.namespace.slice(1) ]
	//	: [ this.css.table, this.config.tableClass,    		this.config.namespace.slice(1) ] );


aria () {
	if ( this.debug ) console.info( `aria` );

	//
	this.table_ele.setAttribute( 'role', 'grid' );

	//
	//this.headers = this.ele.querySelectorAll( this.config.selectorHeaders );

	this.table_ele.querySelectorAll( ':scope thead tr, :scope tbody tr' ).forEach( ( ele ) => {
		ele.setAttribute( 'scope', 'row' );
		} );

	let tbody = this.table_ele.querySelector( `:scope tbody` );

	tbody.setAttribute( 'aria-live', 'polite' );
	tbody.setAttribute( 'aria-relevant', 'all' );
	
	//
	let caption_ele = this.table_ele.querySelector( ':scope > caption' );

	if ( caption_ele ) {
		if ( ! caption_ele.id ) { caption_ele.id = `${ this.id }-caption`; }
		this.table_ele.setAttribute( 'aria-labelledby', caption_ele.id );
		}

	}

parser_load () {
	if ( this.debug ) console.groupCollapsed( 'parsers' );

	for ( let parser in js_tablesorter.parsers )
		{
		if ( this.debug ) console.info( `. parser: ${ parser }` );
		}
	if ( this.debug ) console.groupEnd();
	}

widget_load () {
	if ( this.debug ) console.info( 'widgets' );

	for ( let widget in js_tablesorter.widgets )
		{
		if ( this.debug ) console.info( `. widget: ${ widget }` );
		}
	}

setup() {
	// if no thead or tbody, or tablesorter is already present, quit
	if ( this.state.hasInitialized === true )
		{
		if ( this.debug ) console.warn( 'Stopping initialization. Tablesorter has already been initialized' );
		return;
		}

	

	if ( this.debug ) console.group( `Initializing tablesorter v${ this.version }` );

	this.state.hasInitialized		= false;		// initialization flag
	this.state.isProcessing			= true;			// table is being processed flag
	this.state.startoveralltimer	= new Date();

	// removing this in version 3 (only supports jQuery 1.7+)
	//c.supportsDataObject = ( function( version ) {
	//	version[ 0 ] = parseInt( version[ 0 ], 10 );
	//	return ( version[ 0 ] > 1 ) || ( version[ 0 ] === 1 && parseInt( version[ 1 ], 10 ) >= 4 );
	//})( $.fn.jquery.split( '.' ) );

	// ensure case insensitivity
	//this.config.emptyTo				= this.config.emptyTo.toLowerCase();
	//this.config.stringTo			= this.config.stringTo.toLowerCase();

	//
	this.config.last				= { sortList : [], clickedIndex : -1 };

	// add table theme class only if there isn't already one there
	let theme = ( ! this.ele.classList.value.match( /tablesorter-/u ) && this.config.theme )
				? `tablesorter-${ this.config.theme }` : '';






	this.config.widgetInit = {}; // keep a list of initialized widgets
	// change textExtraction via data-attribute
	this.config.textExtraction = this.ele.getAttribute( 'data-text-extraction' ) || this.config.textExtraction || 'basic';
	// build headers
	this.buildHeaders();
	// fixate columns if the users supplies the fixedWidth option
	// do this after theme has been applied
	this.fixColumnWidth( table );
	// add widgets from class name
	this.addWidgetFromClass( table );
	// add widget options before parsing (e.g. grouping widget has parser settings)
	this.applyWidgetOptions( table );
	// try to auto detect column type, and store in tables config
	this.setupParsers( c );
	// start total row count at zero
	this.config.totalRows = 0;
	// only validate options while debugging. See #1528
	if ( this.debug) this.validateOptions();

	// build the cache for the tbody cells
	// delayInit will delay building the cache until the user starts a sort
	if ( !c.delayInit ) { ts.buildCache( c ); }
	// bind all header events and methods
	ts.bindEvents( table, c.$headers, true );
	ts.bindMethods( c );
	// get sort list from jQuery data or metadata
	// in jQuery < 1.4, an error occurs when calling $table.data()
	if ( this.ele.dataset.sortlist ) {
		this.config.sortList = this.ele.dataset.sortlist;
	} else if ( meta && ( $table.metadata() && $table.metadata().sortlist ) ) {
		c.sortList = $table.metadata().sortlist;
	}
	// apply widget init code
	this.applyWidget( table, true );
	// if user has supplied a sort list to constructor
	if ( this.config.sortList.length > 0 ) {
		// save sortList before any sortAppend is added
		c.last.sortList = c.sortList;
		ts.sortOn( c, c.sortList, {}, !c.initWidgets );
	} else {
		this.setHeadersCss( c );
		if ( c.initWidgets ) {
			// apply widget format
			ts.applyWidget( table, false );
		}
	}

	// show processesing icon
	if ( this.config.showProcessing ) {
		$table
		.unbind( 'sortBegin' + c.namespace + ' sortEnd' + c.namespace )
		.bind( 'sortBegin' + c.namespace + ' sortEnd' + c.namespace, function( e ) {
			clearTimeout( c.timerProcessing );
			ts.isProcessing( table );
			if ( e.type === 'sortBegin' ) {
				c.timerProcessing = setTimeout( function() {
					ts.isProcessing( table, true );
				}, 500 );
			}
		});
	}

	// initialized
	this.state.hasInitialized	= true;
	this.state.isProcessing		= false;

	if ( this.debug ) {
		console.log( 'Overall initialization time:' + this.benchmark( $.data( table, 'startoveralltimer' ) ) );
		console.groupEnd();
		}

	$table.triggerHandler( 'tablesorter-initialized', table );
	if ( typeof c.initialized === 'function' ) {
		c.initialized( table );
	}
}

bindMethods ( c ) {
	let $table = c.$table,
		namespace = c.namespace,
		events = ( 'sortReset update updateRows updateAll updateHeaders addRows updateCell updateComplete ' +
			'sorton appendCache updateCache applyWidgetId applyWidgets refreshWidgets destroy mouseup ' +
			'mouseleave ' ).split( ' ' )
			.join( namespace + ' ' );
	// apply easy methods that trigger bound events
	$table
	.unbind( events.replace( ts.regex.spaces, ' ' ) )
	.bind( 'sortReset' + namespace, function( e, callback ) {
		e.stopPropagation();
		// using this.config to ensure functions are getting a non-cached version of the config
		ts.sortReset( this.config, function( table ) {
			if (table.isApplyingWidgets) {
				// multiple triggers in a row... filterReset, then sortReset - see #1361
				// wait to update widgets
				setTimeout( function() {
					ts.applyWidget( table, '', callback );
				}, 100 );
			} else {
				ts.applyWidget( table, '', callback );
			}
		});
	})
	.bind( 'updateAll' + namespace, function( e, resort, callback ) {
		e.stopPropagation();
		ts.updateAll( this.config, resort, callback );
	})
	.bind( 'update' + namespace + ' updateRows' + namespace, function( e, resort, callback ) {
		e.stopPropagation();
		ts.update( this.config, resort, callback );
	})
	.bind( 'updateHeaders' + namespace, function( e, callback ) {
		e.stopPropagation();
		ts.updateHeaders( this.config, callback );
	})
	.bind( 'updateCell' + namespace, function( e, cell, resort, callback ) {
		e.stopPropagation();
		ts.updateCell( this.config, cell, resort, callback );
	})
	.bind( 'addRows' + namespace, function( e, $row, resort, callback ) {
		e.stopPropagation();
		ts.addRows( this.config, $row, resort, callback );
	})
	.bind( 'updateComplete' + namespace, function() {
		this.isUpdating = false;
	})
	.bind( 'sorton' + namespace, function( e, list, callback, init ) {
		e.stopPropagation();
		ts.sortOn( this.config, list, callback, init );
	})
	.bind( 'appendCache' + namespace, function( e, callback, init ) {
		e.stopPropagation();
		ts.appendCache( this.config, init );
		if ( $.isFunction( callback ) ) {
			callback( this );
		}
	})
	// $tbodies variable is used by the tbody sorting widget
	.bind( 'updateCache' + namespace, function( e, callback, $tbodies ) {
		e.stopPropagation();
		ts.updateCache( this.config, callback, $tbodies );
	})
	.bind( 'applyWidgetId' + namespace, function( e, id ) {
		e.stopPropagation();
		ts.applyWidgetId( this, id );
	})
	.bind( 'applyWidgets' + namespace, function( e, callback ) {
		e.stopPropagation();
		// apply widgets (false = not initializing)
		ts.applyWidget( this, false, callback );
	})
	.bind( 'refreshWidgets' + namespace, function( e, all, dontapply ) {
		e.stopPropagation();
		ts.refreshWidgets( this, all, dontapply );
	})
	.bind( 'removeWidget' + namespace, function( e, name, refreshing ) {
		e.stopPropagation();
		ts.removeWidget( this, name, refreshing );
	})
	.bind( 'destroy' + namespace, function( e, removeClasses, callback ) {
		e.stopPropagation();
		ts.destroy( this, removeClasses, callback );
	})
	.bind( 'resetToLoadState' + namespace, function( e ) {
		e.stopPropagation();
		// remove all widgets
		ts.removeWidget( this, true, false );
		let tmp = $.extend( true, {}, c.originalSettings );
		// restore original settings; this clears out current settings, but does not clear
		// values saved to storage.
		c = $.extend( true, {}, ts.defaults, tmp );
		c.originalSettings = tmp;
		this.hasInitialized = false;
		// setup the entire table again
		ts.setup( this, c );
	});
}

bindEvents ( table, $headers, core ) {
	table = $( table )[ 0 ];
	let tmp,
		c = table.config,
		namespace = c.namespace,
		downTarget = null;
	if ( core !== true ) {
		$headers.addClass( namespace.slice( 1 ) + '_extra_headers' );
		tmp = ts.getClosest( $headers, 'table' );
		if ( tmp.length && tmp[ 0 ].nodeName === 'TABLE' && tmp[ 0 ] !== table ) {
			$( tmp[ 0 ] ).addClass( namespace.slice( 1 ) + '_extra_table' );
		}
	}
	tmp = ( c.pointerDown + ' ' + c.pointerUp + ' ' + c.pointerClick + ' sort keyup ' )
		.replace( ts.regex.spaces, ' ' )
		.split( ' ' )
		.join( namespace + ' ' );
	// apply event handling to headers and/or additional headers (stickyheaders, scroller, etc)
	$headers
	// http://stackoverflow.com/questions/5312849/jquery-find-self;
	.find( c.selectorSort )
	.add( $headers.filter( c.selectorSort ) )
	.unbind( tmp )
	.bind( tmp, function( e, external ) {
		let $cell, cell, temp,
			$target = $( e.target ),
			// wrap event type in spaces, so the match doesn't trigger on inner words
			type = ' ' + e.type + ' ';
		// only recognize left clicks
		if ( ( ( e.which || e.button ) !== 1 && !type.match( ' ' + c.pointerClick + ' | sort | keyup ' ) ) ||
			// allow pressing enter
			( type === ' keyup ' && e.which !== ts.keyCodes.enter ) ||
			// allow triggering a click event (e.which is undefined) & ignore physical clicks
			( type.match( ' ' + c.pointerClick + ' ' ) && typeof e.which !== 'undefined' ) ) {
			return;
		}
		// ignore mouseup if mousedown wasn't on the same target
		if ( type.match( ' ' + c.pointerUp + ' ' ) && downTarget !== e.target && external !== true ) {
			return;
		}
		// set target on mousedown
		if ( type.match( ' ' + c.pointerDown + ' ' ) ) {
			downTarget = e.target;
			// preventDefault needed or jQuery v1.3.2 and older throws an
			// "Uncaught TypeError: handler.apply is not a function" error
			temp = $target.jquery.split( '.' );
			if ( temp[ 0 ] === '1' && temp[ 1 ] < 4 ) { e.preventDefault(); }
			return;
		}
		downTarget = null;
		$cell = ts.getClosest( $( this ), '.' + ts.css.header );
		// prevent sort being triggered on form elements
		if ( ts.regex.formElements.test( e.target.nodeName ) ||
			// nosort class name, or elements within a nosort container
			$target.hasClass( c.cssNoSort ) || $target.parents( '.' + c.cssNoSort ).length > 0 ||
			// disabled cell directly clicked
			$cell.hasClass( 'sorter-false' ) ||
			// elements within a button
			$target.parents( 'button' ).length > 0 ) {
			return !c.cancelSelection;
		}
		if ( c.delayInit && ts.isEmptyObject( c.cache ) ) {
			ts.buildCache( c );
		}
		// use column index from data-attribute or index of current row; fixes #1116
		c.last.clickedIndex = $cell.attr( 'data-column' ) || $cell.index();
		cell = c.$headerIndexed[ c.last.clickedIndex ][0];
		if ( cell && !cell.sortDisabled ) {
			ts.initSort( c, cell, e );
		}
	});
	if ( c.cancelSelection ) {
		// cancel selection
		$headers
			.attr( 'unselectable', 'on' )
			.bind( 'selectstart', false )
			.css({
				'user-select' : 'none',
				'MozUserSelect' : 'none' // not needed for jQuery 1.8+
			});
	}
}

buildHeaders() {
	if ( this.debug ) console.info( 'build headers' );

	let $temp, icon, timer, indx;
	this.config.headerList = [];
	this.config.headerContent = [];
	this.config.sortVars = [];
	if ( this.debug  ) timer = new Date();
	// children tr in tfoot - see issue #196 & #547
	// don't pass table.config to computeColumnIndex here - widgets (math) pass it to "quickly" index tbody cells
	this.config.columns = this.set_th_column_indexes();
	// add icon if cssIcon option exists
	icon = this.config.cssIcon ?
		'<i class="' + ( this.config.cssIcon === this.css.icon ? this.css.icon : `${ this.config.cssIcon } ${ this.css.icon }` ) + '"></i>' :
		'';
	// redefine this.config.$headers here in case of an updateAll that replaces or adds an entire header cell - see #683
	//this.config.headers = [];

	for( let i = 0; i < this.column_count; i++ )
		{
		let ele = this.table_ele.querySelector( `:scope > thead > tr > th[data-ts-column="${ i }"]` );

		if ( this.debug ) console.info( `. th: ${ ele.innerText }` );

		let header, column, template, tmp;

		// transfer data-column to element if not th/td - #1459
		//if ( !/(th|td)/i.test( ele.nodeName ) ) {
		//	tmp = ele.closest( ele, 'th, td' );
		//	ele.dataset( 'column', tmp.dataset( 'column' ) );
		//	}

		this.headers[ i ] = { ele, html: ele.innerHTML, name: ele.innerText };

		// make sure to get header cell & not column indexed cell
		//let configHeaders = this.getColumnData( this.config.table, this.config.headers, index, true );
		// save original header content
		//this.config.headerContent[ index ] = ele.innerHTML;

		// if headerTemplate is empty, don't reformat the header cell
		if ( this.config.headerTemplate && ! ele.innerHTML.match( /class="${this.css.headerIn }"/ ) ) {
			// set up header template
			template = this.config.headerTemplate
				.replace( /{content}/, ele.innerHTML )
				.replace( /{icon}/, this.css.icon || '' );

			//if ( this.config.onRenderTemplate ) {
			//	header = this.config.onRenderTemplate.apply( ele, [ index, template ] );
			//	// only change t if something is returned
			//	if ( header && typeof header === 'string' ) {
					template = header;
			//		}
			//	}
			ele.innerHTML = `<div class="${ this.css.headerIn }">${ template }</div>`;
			}
		//if ( this.config.onRenderHeader ) {
		//	this.config.onRenderHeader.apply( ele, [ index, c, this.config.$table ] );
		//	}
		//column = parseInt( ele.dataset.column, 10 );
		//ele.column = column;
		let initial_order = this.get_config( ele, i, 'sort_initial_order' ) || this.config.sort_initial_order; // data-ts-sort-initial-order
		// this may get updated numerous times if there are multiple rows
		this.config.sortVars[ i ] = {
			count : -1, // set to -1 because clicking on the header automatically adds one
			order : initial_order ?
				( this.config.sortReset ? [ 1, 0, 2 ] : [ 1, 0 ] ) : // desc, asc, unsorted
				( this.config.sortReset ? [ 0, 1, 2 ] : [ 0, 1 ] ),  // asc, desc, unsorted
			locked_order : false,
			sortedBy : ''
			};
		let locked_order = this.get_config( ele, i, 'locked_order' ) || false;
		if ( locked_order ) {
			this.config.sortVars[ i ].locked_order = true;
			this.config.sortVars[ i ].order = this.getOrder( locked_order ) ? [ 1, 1 ] : [ 0, 0 ];
			}
		// add cell to headerList
		//this.config.headerList[ index ] = elem;
		// add to parent in case there are multiple rows
		let closest = ele.closest( 'tr' );

		if ( this.css.header ) 	{
			ele.classList.add( this.css.header );
			closest.classList.add( this.css.header );
			}

		if ( this.config.cssHeader ) {
			ele.classList.add( this.config.cssHeader );
			closest.classList.add( this.config.cssHeader );
			}

		closest.setAttribute( 'role', 'row' );
		// allow keyboard cursor to focus on element
		if ( this.config.tabIndex ) {
			ele.setAttribute( 'tabindex', 0 );
			}

		ele.setAttribute( 'scope', 'col' );
		ele.setAttribute( 'role', 'columnheader' );
		};

	// cache headers per column
	this.config.headerIndexed = [];
	for ( indx = 0; indx < this.config.columns; indx++ ) {
		// colspan in header making a column undefined
		if ( this.isEmptyObject( this.config.sortVars[ indx ] ) ) {
			this.config.sortVars[ indx ] = {};
		}
		// Use this.config.$headers.parent() in case selectorHeaders doesn't point to the th/td
		let temp = this.config.headers.filter( '[data-column="' + indx + '"]' );
		// target sortable column cells, unless there are none, then use non-sortable cells
		// .last() added in jQuery 1.4; use .filter(':last') to maintain compatibility with jQuery v1.2.6
		this.config.$headerIndexed[ indx ] = $temp.length ?
			$temp.not( '.sorter-false' ).length ?
				$temp.not( '.sorter-false' ).filter( ':last' ) :
				$temp.filter( ':last' ) :
			$();
	}


	// enable/disable sorting
	this.updateHeader();
	if ( this.debug ) {
		console.log( 'Built headers:' + this.benchmark( timer ) );
		console.log( this.config.headers );
	}
}

set_th_column_indexes () {
	// takes account of colspan and rowspan
	// computeTableHeaderCellIndexes from:
	// http://www.javascripttoolbox.com/lib/table/examples.php
	// http://www.javascripttoolbox.com/temp/table_cellindex.html

	if ( this.debug ) console.groupCollapsed( 'set th data-column={index}' );
 
	let thead_tr_eles = this.table_ele.querySelectorAll( ":scope > thead > tr:not([data-ts-ignore])" );

	if (this.debug ) console.info( `. thead tr (not data-ts-ignore) rows: ${ thead_tr_eles.length }` );

	let i, j, k, l, cell, cells, rowIndex, rowSpan, colSpan, firstAvailCol,
		// total columns has been calculated, use it to set the matrixrow
		columns = 0,
		matrix = [],
		matrixrow = [];

	for ( i = 0; i < thead_tr_eles.length; i++ ) {
		cells = thead_tr_eles[ i ].cells;
		for ( j = 0; j < cells.length; j++ ) {
			cell = cells[ j ];
			rowIndex = i;
			rowSpan = cell.rowSpan || 1;
			colSpan = cell.colSpan || 1;
			if ( typeof matrix[ rowIndex ] === 'undefined' ) {
				matrix[ rowIndex ] = [];
			}
			// Find first available column in the first row
			for ( k = 0; k < matrix[ rowIndex ].length + 1; k++ ) {
				if ( typeof matrix[ rowIndex ][ k ] === 'undefined' ) {
					firstAvailCol = k;
					break;
					}
				}
			// jscs:disable disallowEmptyBlocks
			if ( columns && cell.cellIndex === firstAvailCol ) {
				// don't to anything
				}
			else {
				this.set_data_attr( cell, 'column', firstAvailCol );
				}

			for ( k = rowIndex; k < rowIndex + rowSpan; k++ ) {
				if ( typeof matrix[ k ] === 'undefined' ) {
					matrix[ k ] = [];
					}
				matrixrow = matrix[ k ];
				for ( l = firstAvailCol; l < firstAvailCol + colSpan; l++ ) {
					matrixrow[ l ] = 'x';
					}
				}
			}
		}

	//
	this.check_column_count( thead_tr_eles, matrix, matrixrow.length );

	//
	if ( this.debug ) console.info(  `. table columns: `, matrixrow.length );

	this.column_count = matrixrow.length;
	
	if ( this.debug ) console.groupEnd();	
	}

check_column_count ( thead_tr_eles, matrix, columns) {
	// this DOES NOT report any tbody column issues, except for the math and
	// and column selector widgets
	let i, len,
		valid = true,
		cells = [];

	for ( i = 0; i < matrix.length; i++ ) {
		// some matrix entries are undefined when testing the footer because
		// it is using the rowIndex property
		if ( matrix[i] ) {
			len = matrix[i].length;
			if ( matrix[i].length !== columns ) {
				valid = false;
				break;
				}
			}
		}

	if ( ! valid ) {
		this.thead_tr_eles.forEach( (ele ) => {
			let cell = ele.parentElement.nodeName;
			if ( cells.indexOf( cell ) < 0 ) {
				cells.push( cell );
				}
			});
		console.error(
			'Invalid or incorrect number of columns in the ' +
			cells.join( ' or ' ) + '; expected ' + columns +
			', but found ' + len + ' columns'
			);
		return false;
		}

	if ( this.debug ) console.info( '. check ok' );
	return true;
	}

// Use it to add a set of methods to table.config which will be available for all tables.
// This should be done before table initialization
addInstanceMethods ( methods ) {
	$.extend( ts.instanceMethods, methods );
}

/*
█████▄ ▄████▄ █████▄ ▄█████ ██████ █████▄ ▄█████
██▄▄██ ██▄▄██ ██▄▄██ ▀█▄    ██▄▄   ██▄▄██ ▀█▄
██▀▀▀  ██▀▀██ ██▀██     ▀█▄ ██▀▀   ██▀██     ▀█▄
██     ██  ██ ██  ██ █████▀ ██████ ██  ██ █████▀
*/

setupParsers ( c, $tbodies ) {
	let rows, list, span, max, colIndex, indx, header, configHeaders,
		noParser, parser, extractor, time, tbody, len,
		table = c.table,
		tbodyIndex = 0,
		debug = ts.debug(c, 'core'),
		debugOutput = {};
	// update table bodies in case we start with an empty table
	c.$tbodies = c.$table.children( 'tbody:not(.' + c.cssInfoBlock + ')' );
	tbody = typeof $tbodies === 'undefined' ? c.$tbodies : $tbodies;
	len = tbody.length;
	if ( len === 0 ) {
		return debug ? console.warn( 'Warning: *Empty table!* Not building a parser cache' ) : '';
	} else if ( debug ) {
		time = new Date();
		console[ console.group ? 'group' : 'log' ]( 'Detecting parsers for each column' );
	}
	list = {
		extractors: [],
		parsers: []
	};
	while ( tbodyIndex < len ) {
		rows = tbody[ tbodyIndex ].rows;
		if ( rows.length ) {
			colIndex = 0;
			max = c.columns;
			for ( indx = 0; indx < max; indx++ ) {
				header = c.$headerIndexed[ colIndex ];
				if ( header && header.length ) {
					// get column indexed table cell; adding true parameter fixes #1362 but
					// it would break backwards compatibility...
					configHeaders = ts.getColumnData( table, c.headers, colIndex ); // , true );
					// get column parser/extractor
					extractor = ts.getParserById( ts.getData( header, configHeaders, 'extractor' ) );
					parser = ts.getParserById( ts.getData( header, configHeaders, 'sorter' ) );
					noParser = ts.getData( header, configHeaders, 'parser' ) === 'false';
					// empty cells behaviour - keeping emptyToBottom for backwards compatibility
					c.empties[colIndex] = (
						ts.getData( header, configHeaders, 'empty' ) ||
						c.emptyTo || ( c.emptyToBottom ? 'bottom' : 'top' ) ).toLowerCase();
					// text strings behaviour in numerical sorts
					c.strings[colIndex] = (
						ts.getData( header, configHeaders, 'string' ) ||
						c.stringTo ||
						'max' ).toLowerCase();
					if ( noParser ) {
						parser = ts.getParserById( 'no-parser' );
					}
					if ( !extractor ) {
						// For now, maybe detect someday
						extractor = false;
					}
					if ( !parser ) {
						parser = ts.detectParserForColumn( c, rows, -1, colIndex );
					}
					if ( debug ) {
						debugOutput[ '(' + colIndex + ') ' + header.text() ] = {
							parser : parser.id,
							extractor : extractor ? extractor.id : 'none',
							string : c.strings[ colIndex ],
							empty  : c.empties[ colIndex ]
						};
					}
					list.parsers[ colIndex ] = parser;
					list.extractors[ colIndex ] = extractor;
					span = header[ 0 ].colSpan - 1;
					if ( span > 0 ) {
						colIndex += span;
						max += span;
						while ( span + 1 > 0 ) {
							// set colspan columns to use the same parsers & extractors
							list.parsers[ colIndex - span ] = parser;
							list.extractors[ colIndex - span ] = extractor;
							span--;
						}
					}
				}
				colIndex++;
			}
		}
		tbodyIndex += ( list.parsers.length ) ? len : 1;
	}
	if ( debug ) {
		if ( !ts.isEmptyObject( debugOutput ) ) {
			console[ console.table ? 'table' : 'log' ]( debugOutput );
		} else {
			console.warn( '  No parsers detected!' );
		}
		console.log( 'Completed detecting parsers' + ts.benchmark( time ) );
		if ( console.groupEnd ) { console.groupEnd(); }
	}
	c.parsers = list.parsers;
	c.extractors = list.extractors;
}

addParser ( parser ) {
	let indx,
		len = this.parsers.length,
		add = true;
	for ( indx = 0; indx < len; indx++ ) {
		if ( this.parsers[ indx ].id.toLowerCase() === parser.id.toLowerCase() ) {
			add = false;
		}
	}
	if ( add ) {
		console.info( `. add parser : ${ parser.id }` );
		this.parsers[ this.parsers.length ] = parser;
	}
}

getParserById ( name ) {
	/*jshint eqeqeq:false */ // eslint-disable-next-line eqeqeq
	if ( name == 'false' ) { return false; }
	let indx,
		len = ts.parsers.length;
	for ( indx = 0; indx < len; indx++ ) {
		if ( ts.parsers[ indx ].id.toLowerCase() === ( name.toString() ).toLowerCase() ) {
			return ts.parsers[ indx ];
		}
	}
	return false;
}

detectParserForColumn ( c, rows, rowIndex, cellIndex ) {
	let cur, $node, row,
		indx = ts.parsers.length,
		node = false,
		nodeValue = '',
		debug = ts.debug(c, 'core'),
		keepLooking = true;
	while ( nodeValue === '' && keepLooking ) {
		rowIndex++;
		row = rows[ rowIndex ];
		// stop looking after 50 empty rows
		if ( row && rowIndex < 50 ) {
			if ( row.className.indexOf( ts.cssIgnoreRow ) < 0 ) {
				node = rows[ rowIndex ].cells[ cellIndex ];
				nodeValue = ts.getElementText( c, node, cellIndex );
				$node = $( node );
				if ( debug ) {
					console.log( 'Checking if value was empty on row ' + rowIndex + ', column: ' +
						cellIndex + ': "' + nodeValue + '"' );
				}
			}
		} else {
			keepLooking = false;
		}
	}
	while ( --indx >= 0 ) {
		cur = ts.parsers[ indx ];
		// ignore the default text parser because it will always be true
		if ( cur && cur.id !== 'text' && cur.is && cur.is( nodeValue, c.table, node, $node ) ) {
			return cur;
		}
	}
	// nothing found, return the generic parser (text)
	return ts.getParserById( 'text' );
}

getElementText ( c, node, cellIndex ) {
	if ( !node ) { return ''; }
	let tmp,
		extract = c.textExtraction || '',
		// node could be a jquery object
		// http://jsperf.com/jquery-vs-instanceof-jquery/2
		$node = node.jquery ? node : $( node );
	if ( typeof extract === 'string' ) {
		// check data-attribute first when set to 'basic'; don't use node.innerText - it's really slow!
		// http://www.kellegous.com/j/2013/02/27/innertext-vs-textcontent/
		if ( extract === 'basic' && typeof ( tmp = $node.attr( c.textAttribute ) ) !== 'undefined' ) {
			return $.trim( tmp );
		}
		return $.trim( node.textContent || $node.text() );
	} else {
		if ( typeof extract === 'function' ) {
			return $.trim( extract( $node[ 0 ], c.table, cellIndex ) );
		} else if ( typeof ( tmp = ts.getColumnData( c.table, extract, cellIndex ) ) === 'function' ) {
			return $.trim( tmp( $node[ 0 ], c.table, cellIndex ) );
		}
	}
	// fallback
	return $.trim( $node[ 0 ].textContent || $node.text() );
}

// centralized function to extract/parse cell contents
getParsedText ( c, cell, colIndex, txt ) {
	if ( typeof txt === 'undefined' ) {
		txt = ts.getElementText( c, cell, colIndex );
	}
	// if no parser, make sure to return the txt
	let val = '' + txt,
		parser = c.parsers[ colIndex ],
		extractor = c.extractors[ colIndex ];
	if ( parser ) {
		// do extract before parsing, if there is one
		if ( extractor && typeof extractor.format === 'function' ) {
			txt = extractor.format( txt, c.table, cell, colIndex );
		}
		// allow parsing if the string is empty, previously parsing would change it to zero,
		// in case the parser needs to extract data from the table cell attributes
		val = parser.id === 'no-parser' ? '' :
			// make sure txt is a string (extractor may have converted it)
			parser.format( '' + txt, c.table, cell, colIndex );
		if ( c.ignoreCase && typeof val === 'string' ) {
			val = val.toLowerCase();
		}
	}
	return val;
}

/*
▄████▄ ▄████▄ ▄████▄ ██  ██ ██████
██  ▀▀ ██▄▄██ ██  ▀▀ ██▄▄██ ██▄▄
██  ▄▄ ██▀▀██ ██  ▄▄ ██▀▀██ ██▀▀
▀████▀ ██  ██ ▀████▀ ██  ██ ██████
*/

buildCache ( c, callback, $tbodies ) {
			let cache, val, txt, rowIndex, colIndex, tbodyIndex, $tbody, $row,
				cols, $cells, cell, cacheTime, totalRows, rowData, prevRowData,
				colMax, span, cacheIndex, hasParser, max, len, index,
				table = c.table,
				parsers = c.parsers,
				debug = ts.debug(c, 'core');
			// update tbody variable
			c.$tbodies = c.$table.children( 'tbody:not(.' + c.cssInfoBlock + ')' );
			$tbody = typeof $tbodies === 'undefined' ? c.$tbodies : $tbodies,
			c.cache = {};
			c.totalRows = 0;
			// if no parsers found, return - it's an empty table.
			if ( !parsers ) {
				return debug ? console.warn( 'Warning: *Empty table!* Not building a cache' ) : '';
			}
			if ( debug ) {
				cacheTime = new Date();
			}
			// processing icon
			if ( c.showProcessing ) {
				ts.isProcessing( table, true );
			}
			for ( tbodyIndex = 0; tbodyIndex < $tbody.length; tbodyIndex++ ) {
				colMax = []; // column max value per tbody
				cache = c.cache[ tbodyIndex ] = {
					normalized: [] // array of normalized row data; last entry contains 'rowData' above
					// colMax: #   // added at the end
				};

				totalRows = ( $tbody[ tbodyIndex ] && $tbody[ tbodyIndex ].rows.length ) || 0;
				for ( rowIndex = 0; rowIndex < totalRows; ++rowIndex ) {
					rowData = {
						// order: original row order #
						// $row : jQuery Object[]
						child: [], // child row text (filter widget)
						raw: []    // original row text
					};
					/** Add the table data to main data array */
					$row = $( $tbody[ tbodyIndex ].rows[ rowIndex ] );
					cols = [];
					// ignore "remove-me" rows
					if ( $row.hasClass( c.selectorRemove.slice(1) ) ) {
						continue;
					}
					// if this is a child row, add it to the last row's children and continue to the next row
					// ignore child row class, if it is the first row
					if ( $row.hasClass( c.cssChildRow ) && rowIndex !== 0 ) {
						len = cache.normalized.length - 1;
						prevRowData = cache.normalized[ len ][ c.columns ];
						prevRowData.$row = prevRowData.$row.add( $row );
						// add 'hasChild' class name to parent row
						if ( !$row.prev().hasClass( c.cssChildRow ) ) {
							$row.prev().addClass( ts.css.cssHasChild );
						}
						// save child row content (un-parsed!)
						$cells = $row.children( 'th, td' );
						len = prevRowData.child.length;
						prevRowData.child[ len ] = [];
						// child row content does not account for colspans/rowspans; so indexing may be off
						cacheIndex = 0;
						max = c.columns;
						for ( colIndex = 0; colIndex < max; colIndex++ ) {
							cell = $cells[ colIndex ];
							if ( cell ) {
								prevRowData.child[ len ][ colIndex ] = ts.getParsedText( c, cell, colIndex );
								span = $cells[ colIndex ].colSpan - 1;
								if ( span > 0 ) {
									cacheIndex += span;
									max += span;
								}
							}
							cacheIndex++;
						}
						// go to the next for loop
						continue;
					}
					rowData.$row = $row;
					rowData.order = rowIndex; // add original row position to rowCache
					cacheIndex = 0;
					max = c.columns;
					for ( colIndex = 0; colIndex < max; ++colIndex ) {
						cell = $row[ 0 ].cells[ colIndex ];
						if ( cell && cacheIndex < c.columns ) {
							hasParser = typeof parsers[ cacheIndex ] !== 'undefined';
							if ( !hasParser && debug ) {
								console.warn( 'No parser found for row: ' + rowIndex + ', column: ' + colIndex +
									'; cell containing: "' + $(cell).text() + '"; does it have a header?' );
							}
							val = ts.getElementText( c, cell, cacheIndex );
							rowData.raw[ cacheIndex ] = val; // save original row text
							// save raw column text even if there is no parser set
							txt = ts.getParsedText( c, cell, cacheIndex, val );
							cols[ cacheIndex ] = txt;
							if ( hasParser && ( parsers[ cacheIndex ].type || '' ).toLowerCase() === 'numeric' ) {
								// determine column max value (ignore sign)
								colMax[ cacheIndex ] = Math.max( Math.abs( txt ) || 0, colMax[ cacheIndex ] || 0 );
							}
							// allow colSpan in tbody
							span = cell.colSpan - 1;
							if ( span > 0 ) {
								index = 0;
								while ( index <= span ) {
									// duplicate text (or not) to spanned columns
									// instead of setting duplicate span to empty string, use textExtraction to try to get a value
									// see http://stackoverflow.com/q/36449711/145346
									txt = c.duplicateSpan || index === 0 ?
										txt :
										typeof c.textExtraction !== 'string' ?
											ts.getElementText( c, cell, cacheIndex + index ) || '' :
											'';
									rowData.raw[ cacheIndex + index ] = txt;
									cols[ cacheIndex + index ] = txt;
									index++;
								}
								cacheIndex += span;
								max += span;
							}
						}
						cacheIndex++;
					}
					// ensure rowData is always in the same location (after the last column)
					cols[ c.columns ] = rowData;
					cache.normalized[ cache.normalized.length ] = cols;
				}
				cache.colMax = colMax;
				// total up rows, not including child rows
				c.totalRows += cache.normalized.length;

			}
			if ( c.showProcessing ) {
				ts.isProcessing( table ); // remove processing icon
			}
			if ( debug ) {
				len = Math.min( 5, c.cache[ 0 ].normalized.length );
				console[ console.group ? 'group' : 'log' ]( 'Building cache for ' + c.totalRows +
					' rows (showing ' + len + ' rows in log) and ' + c.columns + ' columns' +
					ts.benchmark( cacheTime ) );
				val = {};
				for ( colIndex = 0; colIndex < c.columns; colIndex++ ) {
					for ( cacheIndex = 0; cacheIndex < len; cacheIndex++ ) {
						if ( !val[ 'row: ' + cacheIndex ] ) {
							val[ 'row: ' + cacheIndex ] = {};
						}
						val[ 'row: ' + cacheIndex ][ c.$headerIndexed[ colIndex ].text() ] =
							c.cache[ 0 ].normalized[ cacheIndex ][ colIndex ];
					}
				}
				console[ console.table ? 'table' : 'log' ]( val );
				if ( console.groupEnd ) { console.groupEnd(); }
			}
			if ( $.isFunction( callback ) ) {
				callback( table );
			}
		}

getColumnText ( table, column, callback, rowFilter ) {
			table = $( table )[0];
			let tbodyIndex, rowIndex, cache, row, tbodyLen, rowLen, raw, parsed, $cell, result,
				hasCallback = typeof callback === 'function',
				allColumns = column === 'all',
				data = { raw : [], parsed: [], $cell: [] },
				c = table.config;
			if ( ts.isEmptyObject( c ) ) {
				if ( ts.debug(c, 'core') ) {
					console.warn( 'No cache found - aborting getColumnText function!' );
				}
			} else {
				tbodyLen = c.$tbodies.length;
				for ( tbodyIndex = 0; tbodyIndex < tbodyLen; tbodyIndex++ ) {
					cache = c.cache[ tbodyIndex ].normalized;
					rowLen = cache.length;
					for ( rowIndex = 0; rowIndex < rowLen; rowIndex++ ) {
						row = cache[ rowIndex ];
						if ( rowFilter && !row[ c.columns ].$row.is( rowFilter ) ) {
							continue;
						}
						result = true;
						parsed = ( allColumns ) ? row.slice( 0, c.columns ) : row[ column ];
						row = row[ c.columns ];
						raw = ( allColumns ) ? row.raw : row.raw[ column ];
						$cell = ( allColumns ) ? row.$row.children() : row.$row.children().eq( column );
						if ( hasCallback ) {
							result = callback({
								tbodyIndex : tbodyIndex,
								rowIndex : rowIndex,
								parsed : parsed,
								raw : raw,
								$row : row.$row,
								$cell : $cell
							});
						}
						if ( result !== false ) {
							data.parsed[ data.parsed.length ] = parsed;
							data.raw[ data.raw.length ] = raw;
							data.$cell[ data.$cell.length ] = $cell;
						}
					}
				}
				// return everything
				return data;
			}
		}

/*
██  ██ █████▄ █████▄ ▄████▄ ██████ ██████
██  ██ ██▄▄██ ██  ██ ██▄▄██   ██   ██▄▄
██  ██ ██▀▀▀  ██  ██ ██▀▀██   ██   ██▀▀
▀████▀ ██     █████▀ ██  ██   ██   ██████
*/

setHeadersCss ( c ) {
			let indx, column,
				list = c.sortList,
				len = list.length,
				none = ts.css.sortNone + ' ' + c.cssNone,
				css = [ ts.css.sortAsc + ' ' + c.cssAsc, ts.css.sortDesc + ' ' + c.cssDesc ],
				cssIcon = [ c.cssIconAsc, c.cssIconDesc, c.cssIconNone ],
				aria = [ 'ascending', 'descending' ],
				updateColumnSort = function($el, index) {
					$el
						.removeClass( none )
						.addClass( css[ index ] )
						.attr( 'aria-sort', aria[ index ] )
						.find( '.' + ts.css.icon )
						.removeClass( cssIcon[ 2 ] )
						.addClass( cssIcon[ index ] );
				},
				// find the footer
				$extras = c.$table
					.find( 'tfoot tr' )
					.children( 'td, th' )
					.add( $( c.namespace + '_extra_headers' ) )
					.removeClass( css.join( ' ' ) ),
				// remove all header information
				$sorted = c.$headers
					.add( $( 'thead ' + c.namespace + '_extra_headers' ) )
					.removeClass( css.join( ' ' ) )
					.addClass( none )
					.attr( 'aria-sort', 'none' )
					.find( '.' + ts.css.icon )
					.removeClass( cssIcon.join( ' ' ) )
					.end();
			// add css none to all sortable headers
			$sorted
				.not( '.sorter-false' )
				.find( '.' + ts.css.icon )
				.addClass( cssIcon[ 2 ] );
			// add disabled css icon class
			if ( c.cssIconDisabled ) {
				$sorted
					.filter( '.sorter-false' )
					.find( '.' + ts.css.icon )
					.addClass( c.cssIconDisabled );
			}
			for ( indx = 0; indx < len; indx++ ) {
				// direction = 2 means reset!
				if ( list[ indx ][ 1 ] !== 2 ) {
					// multicolumn sorting updating - see #1005
					// .not(function() {}) needs jQuery 1.4
					// filter(function(i, el) {}) <- el is undefined in jQuery v1.2.6
					$sorted = c.$headers.filter( function( i ) {
						// only include headers that are in the sortList (this includes colspans)
						let include = true,
							$el = c.$headers.eq( i ),
							col = parseInt( $el.attr( 'data-column' ), 10 ),
							end = col + ts.getClosest( $el, 'th, td' )[0].colSpan;
						for ( ; col < end; col++ ) {
							include = include ? include || ts.isValueInArray( col, c.sortList ) > -1 : false;
						}
						return include;
					});

					// choose the :last in case there are nested columns
					$sorted = $sorted
						.not( '.sorter-false' )
						.filter( '[data-column="' + list[ indx ][ 0 ] + '"]' + ( len === 1 ? ':last' : '' ) );
					if ( $sorted.length ) {
						for ( column = 0; column < $sorted.length; column++ ) {
							if ( !$sorted[ column ].sortDisabled ) {
								updateColumnSort( $sorted.eq( column ), list[ indx ][ 1 ] );
							}
						}
					}
					// add sorted class to footer & extra headers, if they exist
					if ( $extras.length ) {
						updateColumnSort( $extras.filter( '[data-column="' + list[ indx ][ 0 ] + '"]' ), list[ indx ][ 1 ] );
					}
				}
			}
			// add verbose aria labels
			len = c.$headers.length;
			for ( indx = 0; indx < len; indx++ ) {
				ts.setColumnAriaLabel( c, c.$headers.eq( indx ) );
			}
		}

get_closest ( ele, selector ) {
	
	return ele.closest( selector );
	}

// nextSort (optional), lets you disable next sort text
setColumnAriaLabel ( c, $header, nextSort ) {
			if ( $header.length ) {
				let column = parseInt( $header.attr( 'data-column' ), 10 ),
					vars = c.sortVars[ column ],
					tmp = $header.hasClass( ts.css.sortAsc ) ?
						'sortAsc' :
						$header.hasClass( ts.css.sortDesc ) ? 'sortDesc' : 'sortNone',
					txt = $.trim( $header.text() ) + ': ' + ts.language[ tmp ];
				if ( $header.hasClass( 'sorter-false' ) || nextSort === false ) {
					txt += ts.language.sortDisabled;
				} else {
					tmp = ( vars.count + 1 ) % vars.order.length;
					nextSort = vars.order[ tmp ];
					// if nextSort
					txt += ts.language[ nextSort === 0 ? 'nextAsc' : nextSort === 1 ? 'nextDesc' : 'nextNone' ];
				}
				$header.attr( 'aria-label', txt );
				if (vars.sortedBy) {
					$header.attr( 'data-sortedBy', vars.sortedBy );
				} else {
					$header.removeAttr('data-sortedBy');
				}
			}
		}

updateHeader ( c ) {
			let index, isDisabled, $header, col,
				table = c.table,
				len = c.$headers.length;
			for ( index = 0; index < len; index++ ) {
				$header = c.$headers.eq( index );
				col = ts.getColumnData( table, c.headers, index, true );
				// add 'sorter-false' class if 'parser-false' is set
				isDisabled = ts.getData( $header, col, 'sorter' ) === 'false' || ts.getData( $header, col, 'parser' ) === 'false';
				ts.setColumnSort( c, $header, isDisabled );
			}
		}

setColumnSort ( c, $header, isDisabled ) {
			let id = c.table.id;
			$header[ 0 ].sortDisabled = isDisabled;
			$header[ isDisabled ? 'addClass' : 'removeClass' ]( 'sorter-false' )
				.attr( 'aria-disabled', '' + isDisabled );
			// disable tab index on disabled cells
			if ( c.tabIndex ) {
				if ( isDisabled ) {
					$header.removeAttr( 'tabindex' );
				} else {
					$header.attr( 'tabindex', '0' );
				}
			}
			// aria-controls - requires table ID
			if ( id ) {
				if ( isDisabled ) {
					$header.removeAttr( 'aria-controls' );
				} else {
					$header.attr( 'aria-controls', id );
				}
			}
		}

updateHeaderSortCount ( c, list ) {
			let col, dir, group, indx, primary, temp, val, order,
				sortList = list || c.sortList,
				len = sortList.length;
			c.sortList = [];
			for ( indx = 0; indx < len; indx++ ) {
				val = sortList[ indx ];
				// ensure all sortList values are numeric - fixes #127
				col = parseInt( val[ 0 ], 10 );
				// prevents error if sorton array is wrong
				if ( col < c.columns ) {

					// set order if not already defined - due to colspan header without associated header cell
					// adding this check prevents a javascript error
					if ( !c.sortVars[ col ].order ) {
						if ( ts.getOrder( c.sortInitialOrder ) ) {
							order = c.sortReset ? [ 1, 0, 2 ] : [ 1, 0 ];
						} else {
							order = c.sortReset ? [ 0, 1, 2 ] : [ 0, 1 ];
						}
						c.sortVars[ col ].order = order;
						c.sortVars[ col ].count = 0;
					}

					order = c.sortVars[ col ].order;
					dir = ( '' + val[ 1 ] ).match( /^(1|d|s|o|n)/ );
					dir = dir ? dir[ 0 ] : '';
					// 0/(a)sc (default), 1/(d)esc, (s)ame, (o)pposite, (n)ext
					switch ( dir ) {
						case '1' : case 'd' : // descending
							dir = 1;
							break;
						case 's' : // same direction (as primary column)
							// if primary sort is set to 's', make it ascending
							dir = primary || 0;
							break;
						case 'o' :
							temp = order[ ( primary || 0 ) % order.length ];
							// opposite of primary column; but resets if primary resets
							dir = temp === 0 ? 1 : temp === 1 ? 0 : 2;
							break;
						case 'n' :
							dir = order[ ( ++c.sortVars[ col ].count ) % order.length ];
							break;
						default : // ascending
							dir = 0;
							break;
					}
					primary = indx === 0 ? dir : primary;
					group = [ col, parseInt( dir, 10 ) || 0 ];
					c.sortList[ c.sortList.length ] = group;
					dir = $.inArray( group[ 1 ], order ); // fixes issue #167
					c.sortVars[ col ].count = dir >= 0 ? dir : group[ 1 ] % order.length;
				}
			}
		}

updateAll ( c, resort, callback ) {
			let table = c.table;
			table.isUpdating = true;
			ts.refreshWidgets( table, true, true );
			ts.buildHeaders( c );
			ts.bindEvents( table, c.$headers, true );
			ts.bindMethods( c );
			ts.commonUpdate( c, resort, callback );
		}

update ( c, resort, callback ) {
			let table = c.table;
			table.isUpdating = true;
			// update sorting (if enabled/disabled)
			ts.updateHeader( c );
			ts.commonUpdate( c, resort, callback );
		}

// simple header update - see #989
updateHeaders ( c, callback ) {
			c.table.isUpdating = true;
			ts.buildHeaders( c );
			ts.bindEvents( c.table, c.$headers, true );
			ts.resortComplete( c, callback );
		}

updateCell( c, cell, resort, callback ) {
			// updateCell for child rows is a mess - we'll ignore them for now
			// eventually I'll break out the "update" row cache code to make everything consistent
			if ( $( cell ).closest( 'tr' ).hasClass( c.cssChildRow ) ) {
				console.warn('Tablesorter Warning! "updateCell" for child row content has been disabled, use "update" instead');
				return;
			}
			if ( ts.isEmptyObject( c.cache ) ) {
				// empty table, do an update instead - fixes #1099
				ts.updateHeader( c );
				ts.commonUpdate( c, resort, callback );
				return;
			}
			c.table.isUpdating = true;
			c.$table.find( c.selectorRemove ).remove();
			// get position from the dom
			let tmp, indx, row, icell, cache, len,
				$tbodies = c.$tbodies,
				$cell = $( cell ),
				// update cache - format: function( s, table, cell, cellIndex )
				// no closest in jQuery v1.2.6
				tbodyIndex = $tbodies.index( ts.getClosest( $cell, 'tbody' ) ),
				tbcache = c.cache[ tbodyIndex ],
				$row = ts.getClosest( $cell, 'tr' );
			cell = $cell[ 0 ]; // in case cell is a jQuery object
			// tbody may not exist if update is initialized while tbody is removed for processing
			if ( $tbodies.length && tbodyIndex >= 0 ) {
				row = $tbodies.eq( tbodyIndex ).find( 'tr' ).not( '.' + c.cssChildRow ).index( $row );
				cache = tbcache.normalized[ row ];
				len = $row[ 0 ].cells.length;
				if ( len !== c.columns ) {
					// colspan in here somewhere!
					icell = 0;
					tmp = false;
					for ( indx = 0; indx < len; indx++ ) {
						if ( !tmp && $row[ 0 ].cells[ indx ] !== cell ) {
							icell += $row[ 0 ].cells[ indx ].colSpan;
						} else {
							tmp = true;
						}
					}
				} else {
					icell = $cell.index();
				}
				tmp = ts.getElementText( c, cell, icell ); // raw
				cache[ c.columns ].raw[ icell ] = tmp;
				tmp = ts.getParsedText( c, cell, icell, tmp );
				cache[ icell ] = tmp; // parsed
				if ( ( c.parsers[ icell ].type || '' ).toLowerCase() === 'numeric' ) {
					// update column max value (ignore sign)
					tbcache.colMax[ icell ] = Math.max( Math.abs( tmp ) || 0, tbcache.colMax[ icell ] || 0 );
				}
				tmp = resort !== 'undefined' ? resort : c.resort;
				if ( tmp !== false ) {
					// widgets will be reapplied
					ts.checkResort( c, tmp, callback );
				} else {
					// don't reapply widgets is resort is false, just in case it causes
					// problems with element focus
					ts.resortComplete( c, callback );
				}
			} else {
				if ( ts.debug(c, 'core') ) {
					console.error( 'updateCell aborted, tbody missing or not within the indicated table' );
				}
				c.table.isUpdating = false;
			}
		}

addRows ( c, $row, resort, callback ) {
			let txt, val, tbodyIndex, rowIndex, rows, cellIndex, len, order,
				cacheIndex, rowData, cells, cell, span,
				// allow passing a row string if only one non-info tbody exists in the table
				valid = typeof $row === 'string' && c.$tbodies.length === 1 && /<tr/.test( $row || '' ),
				table = c.table;
			if ( valid ) {
				$row = $( $row );
				c.$tbodies.append( $row );
			} else if (
				!$row ||
				// row is a jQuery object?
				!( $row instanceof $ ) ||
				// row contained in the table?
				( ts.getClosest( $row, 'table' )[ 0 ] !== c.table )
			) {
				if ( ts.debug(c, 'core') ) {
					console.error( 'addRows method requires (1) a jQuery selector reference to rows that have already ' +
						'been added to the table, or (2) row HTML string to be added to a table with only one tbody' );
				}
				return false;
			}
			table.isUpdating = true;
			if ( ts.isEmptyObject( c.cache ) ) {
				// empty table, do an update instead - fixes #450
				ts.updateHeader( c );
				ts.commonUpdate( c, resort, callback );
			} else {
				rows = $row.filter( 'tr' ).attr( 'role', 'row' ).length;
				tbodyIndex = c.$tbodies.index( $row.parents( 'tbody' ).filter( ':first' ) );
				// fixes adding rows to an empty table - see issue #179
				if ( !( c.parsers && c.parsers.length ) ) {
					ts.setupParsers( c );
				}
				// add each row
				for ( rowIndex = 0; rowIndex < rows; rowIndex++ ) {
					cacheIndex = 0;
					len = $row[ rowIndex ].cells.length;
					order = c.cache[ tbodyIndex ].normalized.length;
					cells = [];
					rowData = {
						child : [],
						raw : [],
						$row : $row.eq( rowIndex ),
						order : order
					};
					// add each cell
					for ( cellIndex = 0; cellIndex < len; cellIndex++ ) {
						cell = $row[ rowIndex ].cells[ cellIndex ];
						txt = ts.getElementText( c, cell, cacheIndex );
						rowData.raw[ cacheIndex ] = txt;
						val = ts.getParsedText( c, cell, cacheIndex, txt );
						cells[ cacheIndex ] = val;
						if ( ( c.parsers[ cacheIndex ].type || '' ).toLowerCase() === 'numeric' ) {
							// update column max value (ignore sign)
							c.cache[ tbodyIndex ].colMax[ cacheIndex ] =
								Math.max( Math.abs( val ) || 0, c.cache[ tbodyIndex ].colMax[ cacheIndex ] || 0 );
						}
						span = cell.colSpan - 1;
						if ( span > 0 ) {
							cacheIndex += span;
						}
						cacheIndex++;
					}
					// add the row data to the end
					cells[ c.columns ] = rowData;
					// update cache
					c.cache[ tbodyIndex ].normalized[ order ] = cells;
				}
				// resort using current settings
				ts.checkResort( c, resort, callback );
			}
		}

updateCache ( c, callback, $tbodies ) {
			// rebuild parsers
			if ( !( c.parsers && c.parsers.length ) ) {
				ts.setupParsers( c, $tbodies );
			}
			// rebuild the cache map
			ts.buildCache( c, callback, $tbodies );
		}

// init flag (true) used by pager plugin to prevent widget application
// renamed from appendToTable
appendCache( c, init ) {
			let parsed, totalRows, $tbody, $curTbody, rowIndex, tbodyIndex, appendTime,
				table = c.table,
				$tbodies = c.$tbodies,
				rows = [],
				cache = c.cache;
			// empty table - fixes #206/#346
			if ( ts.isEmptyObject( cache ) ) {
				// run pager appender in case the table was just emptied
				return c.appender ? c.appender( table, rows ) :
					table.isUpdating ? c.$table.triggerHandler( 'updateComplete', table ) : ''; // Fixes #532
			}
			if ( ts.debug(c, 'core') ) {
				appendTime = new Date();
			}
			for ( tbodyIndex = 0; tbodyIndex < $tbodies.length; tbodyIndex++ ) {
				$tbody = $tbodies.eq( tbodyIndex );
				if ( $tbody.length ) {
					// detach tbody for manipulation
					$curTbody = ts.processTbody( table, $tbody, true );
					parsed = cache[ tbodyIndex ].normalized;
					totalRows = parsed.length;
					for ( rowIndex = 0; rowIndex < totalRows; rowIndex++ ) {
						rows[rows.length] = parsed[ rowIndex ][ c.columns ].$row;
						// removeRows used by the pager plugin; don't render if using ajax - fixes #411
						if ( !c.appender || ( c.pager && !c.pager.removeRows && !c.pager.ajax ) ) {
							$curTbody.append( parsed[ rowIndex ][ c.columns ].$row );
						}
					}
					// restore tbody
					ts.processTbody( table, $curTbody, false );
				}
			}
			if ( c.appender ) {
				c.appender( table, rows );
			}
			if ( ts.debug(c, 'core') ) {
				console.log( 'Rebuilt table' + ts.benchmark( appendTime ) );
			}
			// apply table widgets; but not before ajax completes
			if ( !init && !c.appender ) {
				ts.applyWidget( table );
			}
			if ( table.isUpdating ) {
				c.$table.triggerHandler( 'updateComplete', table );
			}
		}

commonUpdate ( c, resort, callback ) {
			// remove rows/elements before update
			c.$table.find( c.selectorRemove ).remove();
			// rebuild parsers
			ts.setupParsers( c );
			// rebuild the cache map
			ts.buildCache( c );
			ts.checkResort( c, resort, callback );
		}

/*
▄█████ ▄████▄ █████▄ ██████ ██ █████▄ ▄████▄
▀█▄    ██  ██ ██▄▄██   ██   ██ ██  ██ ██ ▄▄▄
   ▀█▄ ██  ██ ██▀██    ██   ██ ██  ██ ██ ▀██
█████▀ ▀████▀ ██  ██   ██   ██ ██  ██ ▀████▀
*/

initSort ( c, cell, event ) {
			if ( c.table.isUpdating ) {
				// let any updates complete before initializing a sort
				return setTimeout( function() {
					ts.initSort( c, cell, event );
				}, 50 );
			}

			let arry, indx, headerIndx, dir, temp, tmp, $header,
				notMultiSort = !event[ c.sortMultiSortKey ],
				table = c.table,
				len = c.$headers.length,
				th = ts.getClosest( $( cell ), 'th, td' ),
				col = parseInt( th.attr( 'data-column' ), 10 ),
				sortedBy = event.type === 'mouseup' ? 'user' : event.type,
				order = c.sortVars[ col ].order;
			th = th[0];
			// Only call sortStart if sorting is enabled
			c.$table.triggerHandler( 'sortStart', table );
			// get current column sort order
			tmp = ( c.sortVars[ col ].count + 1 ) % order.length;
			c.sortVars[ col ].count = event[ c.sortResetKey ] ? 2 : tmp;
			// reset all sorts on non-current column - issue #30
			if ( c.sortRestart ) {
				for ( headerIndx = 0; headerIndx < len; headerIndx++ ) {
					$header = c.$headers.eq( headerIndx );
					tmp = parseInt( $header.attr( 'data-column' ), 10 );
					// only reset counts on columns that weren't just clicked on and if not included in a multisort
					if ( col !== tmp && ( notMultiSort || $header.hasClass( ts.css.sortNone ) ) ) {
						c.sortVars[ tmp ].count = -1;
					}
				}
			}
			// user only wants to sort on one column
			if ( notMultiSort ) {
				$.each( c.sortVars, function( i ) {
					c.sortVars[ i ].sortedBy = '';
				});
				// flush the sort list
				c.sortList = [];
				c.last.sortList = [];
				if ( c.sortForce !== null ) {
					arry = c.sortForce;
					for ( indx = 0; indx < arry.length; indx++ ) {
						if ( arry[ indx ][ 0 ] !== col ) {
							c.sortList[ c.sortList.length ] = arry[ indx ];
							c.sortVars[ arry[ indx ][ 0 ] ].sortedBy = 'sortForce';
						}
					}
				}
				// add column to sort list
				dir = order[ c.sortVars[ col ].count ];
				if ( dir < 2 ) {
					c.sortList[ c.sortList.length ] = [ col, dir ];
					c.sortVars[ col ].sortedBy = sortedBy;
					// add other columns if header spans across multiple
					if ( th.colSpan > 1 ) {
						for ( indx = 1; indx < th.colSpan; indx++ ) {
							c.sortList[ c.sortList.length ] = [ col + indx, dir ];
							// update count on columns in colSpan
							c.sortVars[ col + indx ].count = $.inArray( dir, order );
							c.sortVars[ col + indx ].sortedBy = sortedBy;
						}
					}
				}
				// multi column sorting
			} else {
				// get rid of the sortAppend before adding more - fixes issue #115 & #523
				c.sortList = $.extend( [], c.last.sortList );

				// the user has clicked on an already sorted column
				if ( ts.isValueInArray( col, c.sortList ) >= 0 ) {
					// reverse the sorting direction
					c.sortVars[ col ].sortedBy = sortedBy;
					for ( indx = 0; indx < c.sortList.length; indx++ ) {
						tmp = c.sortList[ indx ];
						if ( tmp[ 0 ] === col ) {
							// order.count seems to be incorrect when compared to cell.count
							tmp[ 1 ] = order[ c.sortVars[ col ].count ];
							if ( tmp[1] === 2 ) {
								c.sortList.splice( indx, 1 );
								c.sortVars[ col ].count = -1;
							}
						}
					}
				} else {
					// add column to sort list array
					dir = order[ c.sortVars[ col ].count ];
					c.sortVars[ col ].sortedBy = sortedBy;
					if ( dir < 2 ) {
						c.sortList[ c.sortList.length ] = [ col, dir ];
						// add other columns if header spans across multiple
						if ( th.colSpan > 1 ) {
							for ( indx = 1; indx < th.colSpan; indx++ ) {
								c.sortList[ c.sortList.length ] = [ col + indx, dir ];
								// update count on columns in colSpan
								c.sortVars[ col + indx ].count = $.inArray( dir, order );
								c.sortVars[ col + indx ].sortedBy = sortedBy;
							}
						}
					}
				}
			}
			// save sort before applying sortAppend
			c.last.sortList = $.extend( [], c.sortList );
			if ( c.sortList.length && c.sortAppend ) {
				arry = $.isArray( c.sortAppend ) ? c.sortAppend : c.sortAppend[ c.sortList[ 0 ][ 0 ] ];
				if ( !ts.isEmptyObject( arry ) ) {
					for ( indx = 0; indx < arry.length; indx++ ) {
						if ( arry[ indx ][ 0 ] !== col && ts.isValueInArray( arry[ indx ][ 0 ], c.sortList ) < 0 ) {
							dir = arry[ indx ][ 1 ];
							temp = ( '' + dir ).match( /^(a|d|s|o|n)/ );
							if ( temp ) {
								tmp = c.sortList[ 0 ][ 1 ];
								switch ( temp[ 0 ] ) {
									case 'd' :
										dir = 1;
										break;
									case 's' :
										dir = tmp;
										break;
									case 'o' :
										dir = tmp === 0 ? 1 : 0;
										break;
									case 'n' :
										dir = ( tmp + 1 ) % order.length;
										break;
									default:
										dir = 0;
										break;
								}
							}
							c.sortList[ c.sortList.length ] = [ arry[ indx ][ 0 ], dir ];
							c.sortVars[ arry[ indx ][ 0 ] ].sortedBy = 'sortAppend';
						}
					}
				}
			}
			// sortBegin event triggered immediately before the sort
			c.$table.triggerHandler( 'sortBegin', table );
			// setTimeout needed so the processing icon shows up
			setTimeout( function() {
				// set css for headers
				ts.setHeadersCss( c );
				ts.multisort( c );
				ts.appendCache( c );
				c.$table.triggerHandler( 'sortBeforeEnd', table );
				c.$table.triggerHandler( 'sortEnd', table );
			}, 1 );
		}

// sort multiple columns
multisort ( c ) { /*jshint loopfunc:true */
			let tbodyIndex, sortTime, colMax, rows, tmp,
				table = c.table,
				sorter = [],
				dir = 0,
				textSorter = c.textSorter || '',
				sortList = c.sortList,
				sortLen = sortList.length,
				len = c.$tbodies.length;
			if ( c.serverSideSorting || ts.isEmptyObject( c.cache ) ) {
				// empty table - fixes #206/#346
				return;
			}
			if ( ts.debug(c, 'core') ) { sortTime = new Date(); }
			// cache textSorter to optimize speed
			if ( typeof textSorter === 'object' ) {
				colMax = c.columns;
				while ( colMax-- ) {
					tmp = ts.getColumnData( table, textSorter, colMax );
					if ( typeof tmp === 'function' ) {
						sorter[ colMax ] = tmp;
					}
				}
			}
			for ( tbodyIndex = 0; tbodyIndex < len; tbodyIndex++ ) {
				colMax = c.cache[ tbodyIndex ].colMax;
				rows = c.cache[ tbodyIndex ].normalized;

				rows.sort( function( a, b ) {
					let sortIndex, num, col, order, sort, x, y;
					// rows is undefined here in IE, so don't use it!
					for ( sortIndex = 0; sortIndex < sortLen; sortIndex++ ) {
						col = sortList[ sortIndex ][ 0 ];
						order = sortList[ sortIndex ][ 1 ];
						// sort direction, true = asc, false = desc
						dir = order === 0;

						if ( c.sortStable && a[ col ] === b[ col ] && sortLen === 1 ) {
							return a[ c.columns ].order - b[ c.columns ].order;
						}

						// fallback to natural sort since it is more robust
						num = /n/i.test( ts.getSortType( c.parsers, col ) );
						if ( num && c.strings[ col ] ) {
							// sort strings in numerical columns
							if ( typeof ( ts.string[ c.strings[ col ] ] ) === 'boolean' ) {
								num = ( dir ? 1 : -1 ) * ( ts.string[ c.strings[ col ] ] ? -1 : 1 );
							} else {
								num = ( c.strings[ col ] ) ? ts.string[ c.strings[ col ] ] || 0 : 0;
							}
							// fall back to built-in numeric sort
							// let sort = $.tablesorter['sort' + s]( a[col], b[col], dir, colMax[col], table );
							sort = c.numberSorter ? c.numberSorter( a[ col ], b[ col ], dir, colMax[ col ], table ) :
								ts[ 'sortNumeric' + ( dir ? 'Asc' : 'Desc' ) ]( a[ col ], b[ col ], num, colMax[ col ], col, c );
						} else {
							// set a & b depending on sort direction
							x = dir ? a : b;
							y = dir ? b : a;
							// text sort function
							if ( typeof textSorter === 'function' ) {
								// custom OVERALL text sorter
								sort = textSorter( x[ col ], y[ col ], dir, col, table );
							} else if ( typeof sorter[ col ] === 'function' ) {
								// custom text sorter for a SPECIFIC COLUMN
								sort = sorter[ col ]( x[ col ], y[ col ], dir, col, table );
							} else {
								// fall back to natural sort
								sort = ts[ 'sortNatural' + ( dir ? 'Asc' : 'Desc' ) ]( a[ col ] || '', b[ col ] || '', col, c );
							}
						}
						if ( sort ) { return sort; }
					}
					return a[ c.columns ].order - b[ c.columns ].order;
				});
			}
			if ( ts.debug(c, 'core') ) {
				console.log( 'Applying sort ' + sortList.toString() + ts.benchmark( sortTime ) );
			}
		}

resortComplete ( c, callback ) {
			if ( c.table.isUpdating ) {
				c.$table.triggerHandler( 'updateComplete', c.table );
			}
			if ( $.isFunction( callback ) ) {
				callback( c.table );
			}
		}

checkResort ( c, resort, callback ) {
			let sortList = $.isArray( resort ) ? resort : c.sortList,
				// if no resort parameter is passed, fallback to config.resort (true by default)
				resrt = typeof resort === 'undefined' ? c.resort : resort;
			// don't try to resort if the table is still processing
			// this will catch spamming of the updateCell method
			if ( resrt !== false && !c.serverSideSorting && !c.table.isProcessing ) {
				if ( sortList.length ) {
					ts.sortOn( c, sortList, function() {
						ts.resortComplete( c, callback );
					}, true );
				} else {
					ts.sortReset( c, function() {
						ts.resortComplete( c, callback );
						ts.applyWidget( c.table, false );
					} );
				}
			} else {
				ts.resortComplete( c, callback );
				ts.applyWidget( c.table, false );
			}
		}

sortOn ( c, list, callback, init ) {
			let indx,
				table = c.table;
			c.$table.triggerHandler( 'sortStart', table );
			for (indx = 0; indx < c.columns; indx++) {
				c.sortVars[ indx ].sortedBy = ts.isValueInArray( indx, list ) > -1 ? 'sorton' : '';
			}
			// update header count index
			ts.updateHeaderSortCount( c, list );
			// set css for headers
			ts.setHeadersCss( c );
			// fixes #346
			if ( c.delayInit && ts.isEmptyObject( c.cache ) ) {
				ts.buildCache( c );
			}
			c.$table.triggerHandler( 'sortBegin', table );
			// sort the table and append it to the dom
			ts.multisort( c );
			ts.appendCache( c, init );
			c.$table.triggerHandler( 'sortBeforeEnd', table );
			c.$table.triggerHandler( 'sortEnd', table );
			ts.applyWidget( table );
			if ( $.isFunction( callback ) ) {
				callback( table );
			}
		}

sortReset( c, callback ) {
			c.sortList = [];
			let indx;
			for (indx = 0; indx < c.columns; indx++) {
				c.sortVars[ indx ].count = -1;
				c.sortVars[ indx ].sortedBy = '';
			}
			ts.setHeadersCss( c );
			ts.multisort( c );
			ts.appendCache( c );
			if ( $.isFunction( callback ) ) {
				callback( c.table );
			}
		}

getSortType( parsers, column ) {
			return ( parsers && parsers[ column ] ) ? parsers[ column ].type || '' : '';
		}

getOrder ( val ) {
			// look for 'd' in 'desc' order; return true
			return ( /^d/i.test( val ) || val === 1 );
		}

// Natural sort - https://github.com/overset/javascript-natural-sort (date sorting removed)
sortNatural ( a, b ) {
			if ( a === b ) { return 0; }
			a = ( a || '' ).toString();
			b = ( b || '' ).toString();
			let aNum, bNum, aFloat, bFloat, indx, max,
				regex = ts.regex;
			// first try and sort Hex codes
			if ( regex.hex.test( b ) ) {
				aNum = parseInt( a.match( regex.hex ), 16 );
				bNum = parseInt( b.match( regex.hex ), 16 );
				if ( aNum < bNum ) { return -1; }
				if ( aNum > bNum ) { return 1; }
			}
			// chunk/tokenize
			aNum = a.replace( regex.chunk, '\\0$1\\0' ).replace( regex.chunks, '' ).split( '\\0' );
			bNum = b.replace( regex.chunk, '\\0$1\\0' ).replace( regex.chunks, '' ).split( '\\0' );
			max = Math.max( aNum.length, bNum.length );
			// natural sorting through split numeric strings and default strings
			for ( indx = 0; indx < max; indx++ ) {
				// find floats not starting with '0', string or 0 if not defined
				aFloat = isNaN( aNum[ indx ] ) ? aNum[ indx ] || 0 : parseFloat( aNum[ indx ] ) || 0;
				bFloat = isNaN( bNum[ indx ] ) ? bNum[ indx ] || 0 : parseFloat( bNum[ indx ] ) || 0;
				// handle numeric vs string comparison - number < string - (Kyle Adams)
				if ( isNaN( aFloat ) !== isNaN( bFloat ) ) { return isNaN( aFloat ) ? 1 : -1; }
				// rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
				if ( typeof aFloat !== typeof bFloat ) {
					aFloat += '';
					bFloat += '';
				}
				if ( aFloat < bFloat ) { return -1; }
				if ( aFloat > bFloat ) { return 1; }
			}
			return 0;
		}

sortNaturalAsc ( a, b, col, c ) {
			if ( a === b ) { return 0; }
			let empty = ts.string[ ( c.empties[ col ] || c.emptyTo ) ];
			if ( a === '' && empty !== 0 ) { return typeof empty === 'boolean' ? ( empty ? -1 : 1 ) : -empty || -1; }
			if ( b === '' && empty !== 0 ) { return typeof empty === 'boolean' ? ( empty ? 1 : -1 ) : empty || 1; }
			return ts.sortNatural( a, b );
		}

sortNaturalDesc( a, b, col, c ) {
			if ( a === b ) { return 0; }
			let empty = ts.string[ ( c.empties[ col ] || c.emptyTo ) ];
			if ( a === '' && empty !== 0 ) { return typeof empty === 'boolean' ? ( empty ? -1 : 1 ) : empty || 1; }
			if ( b === '' && empty !== 0 ) { return typeof empty === 'boolean' ? ( empty ? 1 : -1 ) : -empty || -1; }
			return ts.sortNatural( b, a );
		}

// basic alphabetical sort
sortText ( a, b ) {
			return a > b ? 1 : ( a < b ? -1 : 0 );
		}

// return text string value by adding up ascii value
// so the text is somewhat sorted when using a digital sort
// this is NOT an alphanumeric sort
getTextValue ( val, num, max ) {
			if ( max ) {
				// make sure the text value is greater than the max numerical value (max)
				let indx,
					len = val ? val.length : 0,
					n = max + num;
				for ( indx = 0; indx < len; indx++ ) {
					n += val.charCodeAt( indx );
				}
				return num * n;
			}
			return 0;
		}

sortNumericAsc ( a, b, num, max, col, c ) {
			if ( a === b ) { return 0; }
			let empty = ts.string[ ( c.empties[ col ] || c.emptyTo ) ];
			if ( a === '' && empty !== 0 ) { return typeof empty === 'boolean' ? ( empty ? -1 : 1 ) : -empty || -1; }
			if ( b === '' && empty !== 0 ) { return typeof empty === 'boolean' ? ( empty ? 1 : -1 ) : empty || 1; }
			if ( isNaN( a ) ) { a = ts.getTextValue( a, num, max ); }
			if ( isNaN( b ) ) { b = ts.getTextValue( b, num, max ); }
			return a - b;
		}

sortNumericDesc ( a, b, num, max, col, c ) {
			if ( a === b ) { return 0; }
			let empty = ts.string[ ( c.empties[ col ] || c.emptyTo ) ];
			if ( a === '' && empty !== 0 ) { return typeof empty === 'boolean' ? ( empty ? -1 : 1 ) : empty || 1; }
			if ( b === '' && empty !== 0 ) { return typeof empty === 'boolean' ? ( empty ? 1 : -1 ) : -empty || -1; }
			if ( isNaN( a ) ) { a = ts.getTextValue( a, num, max ); }
			if ( isNaN( b ) ) { b = ts.getTextValue( b, num, max ); }
			return b - a;
		}

sortNumeric ( a, b ) {
			return a - b;
		}

/*
██ ██ ██ ██ █████▄ ▄████▄ ██████ ██████ ▄█████
██ ██ ██ ██ ██  ██ ██ ▄▄▄ ██▄▄     ██   ▀█▄
██ ██ ██ ██ ██  ██ ██ ▀██ ██▀▀     ██      ▀█▄
███████▀ ██ █████▀ ▀████▀ ██████   ██   █████▀
*/



addWidget ( widget ) {
	if ( widget.id && !this.isEmptyObject( this.getWidgetById( widget.id ) ) ) {
		console.warn( '"' + widget.id + '" widget was loaded more than once!' );
	}
	console.info( `. load widget : ${ widget.id }` );
	this.widgets[ this.widgets.length ] = widget;
}

hasWidget ( $table, name ) {
	$table = $( $table );
	return $table.length && $table[ 0 ].config && $table[ 0 ].config.widgetInit[ name ] || false;
}

getWidgetById ( name ) {
	let indx, widget,
		len = this.widgets.length;
	for ( indx = 0; indx < len; indx++ ) {
		widget = this.widgets[ indx ];
		if ( widget && widget.id && widget.id.toLowerCase() === name.toLowerCase() ) {
			return widget;
		}
	}
}

applyWidgetOptions ( table ) {
	let indx, widget, wo,
		c = table.config,
		len = c.widgets.length;
	if ( len ) {
		for ( indx = 0; indx < len; indx++ ) {
			widget = ts.getWidgetById( c.widgets[ indx ] );
			if ( widget && widget.options ) {
				wo = $.extend( true, {}, widget.options );
				c.widgetOptions = $.extend( true, wo, c.widgetOptions );
				// add widgetOptions to defaults for option validator
				$.extend( true, ts.defaults.widgetOptions, widget.options );
			}
		}
	}
}

addWidgetFromClass ( table ) {
	let len, indx,
		c = table.config,
		// look for widgets to apply from table class
		// don't match from 'ui-widget-content'; use \S instead of \w to include widgets
		// with dashes in the name, e.g. "widget-test-2" extracts out "test-2"
		regex = '^' + c.widgetClass.replace( ts.regex.templateName, '(\\S+)+' ) + '$',
		widgetClass = new RegExp( regex, 'g' ),
		// split up table class (widget id's can include dashes) - stop using match
		// otherwise only one widget gets extracted, see #1109
		widgets = ( table.className || '' ).split( ts.regex.spaces );
	if ( widgets.length ) {
		len = widgets.length;
		for ( indx = 0; indx < len; indx++ ) {
			if ( widgets[ indx ].match( widgetClass ) ) {
				c.widgets[ c.widgets.length ] = widgets[ indx ].replace( widgetClass, '$1' );
			}
		}
	}
}

applyWidgetId ( table, id, init ) {
	table = $(table)[0];
	let applied, time, name,
		c = table.config,
		wo = c.widgetOptions,
		debug = ts.debug(c, 'core'),
		widget = ts.getWidgetById( id );
	if ( widget ) {
		name = widget.id;
		applied = false;
		// add widget name to option list so it gets reapplied after sorting, filtering, etc
		if ( $.inArray( name, c.widgets ) < 0 ) {
			c.widgets[ c.widgets.length ] = name;
		}
		if ( debug ) { time = new Date(); }

		if ( init || !( c.widgetInit[ name ] ) ) {
			// set init flag first to prevent calling init more than once (e.g. pager)
			c.widgetInit[ name ] = true;
			if ( table.hasInitialized ) {
				// don't reapply widget options on tablesorter init
				ts.applyWidgetOptions( table );
			}
			if ( typeof widget.init === 'function' ) {
				applied = true;
				if ( debug ) {
					console[ console.group ? 'group' : 'log' ]( 'Initializing ' + name + ' widget' );
				}
				widget.init( table, widget, c, wo );
			}
		}
		if ( !init && typeof widget.format === 'function' ) {
			applied = true;
			if ( debug ) {
				console[ console.group ? 'group' : 'log' ]( 'Updating ' + name + ' widget' );
			}
			widget.format( table, c, wo, false );
		}
		if ( debug ) {
			if ( applied ) {
				console.log( 'Completed ' + ( init ? 'initializing ' : 'applying ' ) + name + ' widget' + ts.benchmark( time ) );
				if ( console.groupEnd ) { console.groupEnd(); }
			}
		}
	}
}

applyWidget ( table, init, callback ) {
	table = $( table )[ 0 ]; // in case this is called externally
	let indx, len, names, widget, time,
		c = table.config,
		debug = ts.debug(c, 'core'),
		widgets = [];
	// prevent numerous consecutive widget applications
	if ( init !== false && table.hasInitialized && ( table.isApplyingWidgets || table.isUpdating ) ) {
		return;
	}
	if ( debug ) { time = new Date(); }
	ts.addWidgetFromClass( table );
	// prevent "tablesorter-ready" from firing multiple times in a row
	clearTimeout( c.timerReady );
	if ( c.widgets.length ) {
		table.isApplyingWidgets = true;
		// ensure unique widget ids
		c.widgets = $.grep( c.widgets, function( val, index ) {
			return $.inArray( val, c.widgets ) === index;
		});
		names = c.widgets || [];
		len = names.length;
		// build widget array & add priority as needed
		for ( indx = 0; indx < len; indx++ ) {
			widget = ts.getWidgetById( names[ indx ] );
			if ( widget && widget.id ) {
				// set priority to 10 if not defined
				if ( !widget.priority ) { widget.priority = 10; }
				widgets[ indx ] = widget;
			} else if ( debug ) {
				console.warn( '"' + names[ indx ] + '" was enabled, but the widget code has not been loaded!' );
			}
		}
		// sort widgets by priority
		widgets.sort( function( a, b ) {
			return a.priority < b.priority ? -1 : a.priority === b.priority ? 0 : 1;
		});
		// add/update selected widgets
		len = widgets.length;
		if ( debug ) {
			console[ console.group ? 'group' : 'log' ]( 'Start ' + ( init ? 'initializing' : 'applying' ) + ' widgets' );
		}
		for ( indx = 0; indx < len; indx++ ) {
			widget = widgets[ indx ];
			if ( widget && widget.id ) {
				ts.applyWidgetId( table, widget.id, init );
			}
		}
		if ( debug && console.groupEnd ) { console.groupEnd(); }
	}
	c.timerReady = setTimeout( function() {
		table.isApplyingWidgets = false;
		$.data( table, 'lastWidgetApplication', new Date() );
		c.$table.triggerHandler( 'tablesorter-ready' );
		// callback executed on init only
		if ( !init && typeof callback === 'function' ) {
			callback( table );
		}
		if ( debug ) {
			widget = c.widgets.length;
			console.log( 'Completed ' +
				( init === true ? 'initializing ' : 'applying ' ) + widget +
				' widget' + ( widget !== 1 ? 's' : '' ) + ts.benchmark( time ) );
		}
	}, 10 );
}

removeWidget ( table, name, refreshing ) {
	table = $( table )[ 0 ];
	let index, widget, indx, len,
		c = table.config;
	// if name === true, add all widgets from $.tablesorter.widgets
	if ( name === true ) {
		name = [];
		len = ts.widgets.length;
		for ( indx = 0; indx < len; indx++ ) {
			widget = ts.widgets[ indx ];
			if ( widget && widget.id ) {
				name[ name.length ] = widget.id;
			}
		}
	} else {
		// name can be either an array of widgets names,
		// or a space/comma separated list of widget names
		name = ( $.isArray( name ) ? name.join( ',' ) : name || '' ).toLowerCase().split( /[\s,]+/ );
	}
	len = name.length;
	for ( index = 0; index < len; index++ ) {
		widget = ts.getWidgetById( name[ index ] );
		indx = $.inArray( name[ index ], c.widgets );
		// don't remove the widget from config.widget if refreshing
		if ( indx >= 0 && refreshing !== true ) {
			c.widgets.splice( indx, 1 );
		}
		if ( widget && widget.remove ) {
			if ( ts.debug(c, 'core') ) {
				console.log( ( refreshing ? 'Refreshing' : 'Removing' ) + ' "' + name[ index ] + '" widget' );
			}
			widget.remove( table, c, c.widgetOptions, refreshing );
			c.widgetInit[ name[ index ] ] = false;
		}
	}
	c.$table.triggerHandler( 'widgetRemoveEnd', table );
}

refreshWidgets ( table, doAll, dontapply ) {
	table = $( table )[ 0 ]; // see issue #243
	let indx, widget,
		c = table.config,
		curWidgets = c.widgets,
		widgets = ts.widgets,
		len = widgets.length,
		list = [],
		callback = function( table ) {
			$( table ).triggerHandler( 'refreshComplete' );
		};
	// remove widgets not defined in config.widgets, unless doAll is true
	for ( indx = 0; indx < len; indx++ ) {
		widget = widgets[ indx ];
		if ( widget && widget.id && ( doAll || $.inArray( widget.id, curWidgets ) < 0 ) ) {
			list[ list.length ] = widget.id;
		}
	}
	ts.removeWidget( table, list.join( ',' ), true );
	if ( dontapply !== true ) {
		// call widget init if
		ts.applyWidget( table, doAll || false, callback );
		if ( doAll ) {
			// apply widget format
			ts.applyWidget( table, false, callback );
		}
	} else {
		callback( table );
	}
}

// restore headers
restoreHeaders ( table ) {
	let index, $cell,
		c = $( table )[ 0 ].config,
		$headers = c.$table.find( c.selectorHeaders ),
		len = $headers.length;
	// don't use c.$headers here in case header cells were swapped
	for ( index = 0; index < len; index++ ) {
		$cell = $headers.eq( index );
		// only restore header cells if it is wrapped
		// because this is also used by the updateAll method
		if ( $cell.find( '.' + ts.css.headerIn ).length ) {
			$cell.html( c.headerContent[ index ] );
		}
	}
}

destroy ( table, removeClasses, callback ) {
	table = $( table )[ 0 ];
	if ( !table.hasInitialized ) { return; }
	// remove all widgets
	ts.removeWidget( table, true, false );
	let events,
		$t = $( table ),
		c = table.config,
		$h = $t.find( 'thead:first' ),
		$r = $h.find( 'tr.' + ts.css.headerRow ).removeClass( ts.css.headerRow + ' ' + c.cssHeaderRow ),
		$f = $t.find( 'tfoot:first > tr' ).children( 'th, td' );
	if ( removeClasses === false && $.inArray( 'uitheme', c.widgets ) >= 0 ) {
		// reapply uitheme classes, in case we want to maintain appearance
		$t.triggerHandler( 'applyWidgetId', [ 'uitheme' ] );
		$t.triggerHandler( 'applyWidgetId', [ 'zebra' ] );
	}
	// remove widget added rows, just in case
	$h.find( 'tr' ).not( $r ).remove();
	// disable tablesorter - not using .unbind( namespace ) because namespacing was
	// added in jQuery v1.4.3 - see http://api.jquery.com/event.namespace/
	events = 'sortReset update updateRows updateAll updateHeaders updateCell addRows updateComplete sorton ' +
		'appendCache updateCache applyWidgetId applyWidgets refreshWidgets removeWidget destroy mouseup mouseleave ' +
		'keypress sortBegin sortEnd resetToLoadState '.split( ' ' )
		.join( c.namespace + ' ' );
	$t
		.removeData( 'tablesorter' )
		.unbind( events.replace( ts.regex.spaces, ' ' ) );
	c.$headers
		.add( $f )
		.removeClass( [ ts.css.header, c.cssHeader, c.cssAsc, c.cssDesc, ts.css.sortAsc, ts.css.sortDesc, ts.css.sortNone ].join( ' ' ) )
		.removeAttr( 'data-column' )
		.removeAttr( 'aria-label' )
		.attr( 'aria-disabled', 'true' );
	$r
		.find( c.selectorSort )
		.unbind( ( 'mousedown mouseup keypress '.split( ' ' ).join( c.namespace + ' ' ) ).replace( ts.regex.spaces, ' ' ) );
	ts.restoreHeaders( table );
	$t.toggleClass( ts.css.table + ' ' + c.tableClass + ' tablesorter-' + c.theme, removeClasses === false );
	$t.removeClass(c.namespace.slice(1));
	// clear flag in case the plugin is initialized again
	table.hasInitialized = false;
	delete table.config.cache;
	if ( typeof callback === 'function' ) {
		callback( table );
	}
	if ( ts.debug(c, 'core') ) {
		console.log( 'tablesorter has been removed' );
	}
}

};



