'use strict';

/* jshint -W098 */

var argv = require('optimist')
	.demand('def')
	.demand('out')
	.argv;

var fs = require('fs');
var util = require('util');
var path = require('path');

var typeDocPath = path.resolve(__dirname, '..', 'node_modules', 'typedoc', 'bin');

var TypeDoc = require(path.join(typeDocPath, 'typedoc.js'));

var app = new TypeDoc.Application();
app.settings.name = 'DefinitelyTyped';
app.settings.theme = path.join(typeDocPath, 'themes', 'default');
app.settings.includeDeclarations = true;
app.generate(
	[argv.def],
	path.join(argv.out)
);
