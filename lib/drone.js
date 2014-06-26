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
/*
if (app.settings.readFromCommandline(app)) {
	app.settings.theme = path.resolve('../../bin/themes/default');
	console.log(path.resolve('../../bin/themes/default'));
	app.settings.inputFiles.forEach(function(path) {
		var stat = fs.statSync(path);
		if (!stat.isDirectory()) {
			app.log(Util.format('%s is not a directory.', path), TypeDoc.LogLevel.Warn);
			return;
		}

		fs.readdirSync(path).forEach(function(moduleName) {
			var modulePath = path.join(path, moduleName);
			stat = fs.statSync(modulePath);
			if (!stat.isDirectory()) {
				return;
			}

			var definitionFile;
			fs.readdirSync(modulePath).forEach(function(fileName) {
				if (fileName.substr(-5) != '.d.ts') return;
				if (!definitionFile || fileName.length < definitionFile.length) {
					definitionFile = fileName;
				}
			});

			if (definitionFile) {
				console.log(Util.format('Generating docs for %s', moduleName));
				app.generate(
					[path.join(modulePath, definitionFile)],
					 path.join(app.settings.outputDirectory, moduleName)
				);
			}
		});
	});
}
*/
