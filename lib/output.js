'use strict';

/* jshint -W098 */
/* jshint -W079 */

var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var Handlebars = require('handlebars');
var fs = Promise.promisifyAll(require('fs'));

var colNumNames = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

function render(outDir, data) {
	return Promise.attempt(function () {
		var assetPath = path.resolve(__dirname, '..', 'assets');
		var source = fs.readFileSync(path.join(assetPath, 'index.hbs'), 'utf8');
		var template = Handlebars.compile(source);

		var cols = 2;
		cols = (data.chapters.length < cols ? data.chapters.length : cols);
		data.colName = colNumNames[cols];
		var part = Math.round(data.chapters.length / cols);

		data.columns = [];

		data.chapters.sort(function(aa, bb) {
			if (aa.label < bb.label) {
				return -1;
			}
			else if (aa.label > bb.label) {
				return 1;
			}
			return 0;
		});

		for (var i = 0; i < cols; i++) {
			data.columns.push({
				chapters: data.chapters.slice(i * part, Math.min((i + 1) * part, data.chapters.length))
			});
		}

		var output = template(data);

		fs.writeFileSync(path.join(outDir, 'index.html'), output, 'utf8');
	});
}

module.exports = {
	render: render
};
