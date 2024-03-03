/*
	eslint has no output - it just lints each file in turn
	YAML config ported to flat-config
*/

import globals	from "globals";
import js		from "@eslint/js";

export default [

	js.configs.all,

	{
	ignores	: [ "**/_unused/*.js", "**/.DAV/*.js" ],
	},

	{
	files	: [ "**/*.js" ],

	languageOptions: {
		ecmaVersion	: "latest",
		sourceType	: "script",
		globals: {
			...globals.browser,

			swc				: "writable",
			cablechip		: "writable",

			addeventatc		: "readonly",
			adsbygoogle		: "readonly",
			bootstrap		: "readonly",
			ga				: "readonly",
			gapi			: "readonly",
			google			: "readonly",
			grecaptcha		: "readonly",
			jQuery			: "readonly",
			L				: "readonly",
			Microsoft		: "readonly",
			MarkerClusterer	: "readonly",										// need to change when migrating to new google lib
			showdown		: "readonly",
			},
		},

	linterOptions: {
		reportUnusedDisableDirectives	: true,
		},

	rules: {

		// over-ride
		"comma-dangle"					: [ "error", "always-multiline" ],
		"comma-style"					: [ "error", "last" ],				// ,x makes more sense than x,
		"no-lonely-if"					: "off",							// so can do: if () { something } else { if ( //DEBUG ) console.info }
		"no-mixed-spaces-and-tabs"		: [ "error", "smart-tabs" ],		// spaces after tabs for alignment only
		"func-names"					: [ "error", "as-needed" ],			// a.b = function b (), so b shows up in dev tools (as-needed = can be mostly inferred now)

		//"object-shorthand"			: [ "warn", "always" ]				// { x, y} = { x: x, y: y} (too many places where it doesn't help)

		"no-unused-vars"				: [ "error", {
			args							: "none",
			destructuredArrayIgnorePattern	: "^_",
			} ],

		"id-length"						: [ "error", {
			exceptions: [	
				"i", "j", "k",												// loops
				"x", "y",													// coords
				"e",														// events
				"a", "b",													// sort
			] } ],

		"space-unary-ops"				: [ "error", {						// ! fred rather than !fred except -6 (i.e. not - 6)
			words		: true,
			nonwords	: true,
			overrides	: { '-': false }
			} ],

		"lines-between-class-members"	: [ "error", "always", {			// so class-variables don't need a blank line after
			exceptAfterSingleLine: true,
			}],

		// ------------------------------------------------------------------------------------------------

		// over-ride: complexity... to fix another day
		"complexity"					: [ "warn", 25 ], 														// def=20, allows for a few if ( debug ) console()
		"max-statements"				: [ "warn", 30 ], 														// def=10
		"max-lines"						: [ "warn", { skipBlankLines: true, skipComments: true, max: 400 } ],	// def=300
		"max-lines-per-function"		: [ "warn", { skipBlankLines: true, skipComments: true, max: 100 } ],	// def=50

		// ------------------------------------------------------------------------------------------------

		// to half do (enable for checking once in a while)
		"prefer-const"					: "off",					// but wants const a = { b:1 }, can do it temp - lots of errs to track down
		"no-param-reassign"				: "off",					// function ( d ) { d++ } ... end up having to do lots of sill stuff to fix it

		// to fix one day
		"new-cap"						: "off",					// new swc.Geometry... just like perl :)

		// to think about
		"class-methods-use-this"		: "off",					// should be a static fn ?
		"no-new"						: "off", 					// must have x = new x(), not just new x() .... static fn  ... mainly swc/pages

		// to fix one day (style and spacing),
		//	but too much like hard work
		"nonblock-statement-body-position": "off",					// if ( a ) b ; b should be on the same line
		"operator-linebreak"			: "off",					// \n + xxx makes more sense than xxx + \n
		"prefer-template"				: "off",					// should fix one day
		"semi-spacing"					: "off", 					// should fix one day
		"space-infix-ops"				: "off",					// 2 * 3 not 2*3
		"template-curly-spacing"		: "off", 					// maybe space

		// do not agree with
		"arrow-body-style"				: "off",					// () => { return x } is OK if x is complicated

		"prefer-destructuring"			: [							// let [a, b, c] = array, or, {a,b,c] = object
			"warn", {
				"VariableDeclarator"	: { array: true, object: true },
				"AssignmentExpression"	: { array: true, object: false },
				} ],

		// ------------------------------------------------------------------------------------------------

		// to never do - too much like hard work
		"no-magic-numbers"				: "off",

		// ------------------------------------------------------------------------------------------------

		// language
		"guard-for-in"					: "off",					// check .hasOwnProperty()
		"no-console"					: "off",
		"no-continue"					: "off",
		"no-plusplus"					: "off",					// no x++
		"no-ternary"					: "off",					// a ? b : c
		"no-undefined"					: "off",					// don't use x = undefined as peeps can redefine it
		"operator-assignment"			: "off",					// x += 1 or x = x + 1

		// style
		"camelcase"						: "off",
		"capitalized-comments"			: "off",
		"curly"							: "off",					// if ( ) one_statement
		"max-len"						: "off",					// maybe 160
		"max-params"					: "off",					// in a fn call
		"max-statements-per-line"		: "off",
		"multiline-comment-style"		: "off",
		"no-extra-parens"				: "off",
		"no-inline-comments"			: "off",					// comments inline rather than above/below
		"no-mixed-operators"			: "off",					// 2 * 3 + 5 needs brackets
		"no-negated-condition"			: "off",
		"no-unneeded-ternary"			: "off",					// ( condition ) ? true : false 
		"no-warning-comments"			: "off",					// eg TODO
		"quote-props"					: "off",
		"quotes"						: "off",					// enforce backticks
		"sort-keys"						: "off",					// e.g. let {a:..., b:..., c:... } 
		"sort-vars"						: "off",					// e.g. let a,b,c

		// consistent spacing
		"array-bracket-newline"			: "off",
		"array-bracket-spacing"			: "off",					// (fred) or ( fred )
		"array-element-newline"			: "off",
		"brace-style"					: "off",
		"computed-property-spacing"		: "off",					// a.[b] or a.[ b ] ... makes sense to be consistent 
		"function-call-argument-newline": "off",  
		"function-paren-newline"		: "off",
		"indent"						: "off",					// [""error"", "tab"] causes '00s of "error"s!
		"key-spacing"					: "off",					// foo:bar or foo : bar 
		"line-comment-position"			: "off",
		"lines-around-comment"			: "off",
		"multiline-ternary"				: "off",
		"newline-per-chained-call"		: "off",
		"no-multi-spaces"				: "off",					// ( a =   b) hard, lots are "error"s, but many are code spacing, and fixing doesnt add much value
		"no-multiple-empty-lines"		: "off",
		"no-tabs"						: "off",
		"no-whitespace-before-property"	: "off",
		"object-curly-newline"			: "off",
		"object-curly-spacing"			: "off",					// {x;y} or { x:y }
		"object-property-newline"		: "off",
		"one-var"						: "off",
		"one-var-declaration-per-line"	: "off",
		"padded-blocks"					: "off",
		"space-before-function-paren"	: "off",
		"space-in-parens"				: "off",
		"spaced-comment"				: "off",
		"switch-colon-spacing"			: "off",
		},
	},
];