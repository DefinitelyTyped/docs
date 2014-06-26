'use strict';

/* jshint -W098 */
/* jshint -W079 */

var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var Handlebars = require('handlebars');
var fs = Promise.promisifyAll(require('fs'));

function render(outDir, data) {
	return Promise.attempt(function () {
		var assetPath = path.resolve(__dirname, '..', 'assets');
		var source = fs.readFileSync(path.join(assetPath, 'index.hbs'), 'utf8');
		var template = Handlebars.compile(source);

		var output = template(data);

		fs.writeFileSync(path.join(outDir, 'index.html'), output, 'utf8');
	});
}

module.exports = {
	render: render
};
