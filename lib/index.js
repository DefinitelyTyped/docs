'use strict';

/* jshint -W098 */
/* jshint -W079 */

var Promise = require('bluebird');
var childProcess = require('child_process');
var fs = Promise.promisifyAll(require('fs'));
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var os = require('os');
var path = require('path');
var glob = Promise.promisify(require('glob'));
var output = require('./output');

/* jshint +W079 */

function bulk(dtPath, outDir, filter) {
	dtPath = path.resolve(dtPath);
	outDir = path.resolve(outDir);

	var dronePath = path.resolve(__dirname, 'drone.js');

	console.log(dtPath);
	console.log(outDir);

	filter = filter || function () {
		return true;
	};

	if (fs.existsSync(outDir)) {
		rimraf.sync(outDir);
	}
	mkdirp.sync(outDir);

	return glob('*/*.d.ts', {
		cwd: dtPath
	}).then(function (defs) {
		return defs.filter(function (dir) {
			if (/^node_modules/.test(dir)) {
				return false;
			}
			return filter(dir);
		});
	}).then(function (dirs) {
		var queue = dirs.slice(0);

		var pages = [];
		var active = [];
		var max = Math.round(os.cpus().length * 0.75);

		return new Promise(function (resolve, reject) {
			var step = function () {
				var next = queue.shift();
				var slug = next.replace(/\.d\.ts$/, '').replace(/[\\\/]/g, '-');
				pages.push({
					def: next,
					slug: slug
				});
				active.push(next);
				console.log('-> ' + next);
				var cmd = [
					'node',
					dronePath,
					'--slug', slug,
					'--def', path.join(dtPath, next),
					'--out', path.join(outDir, slug)
				];
				var opts = {};
				childProcess.exec(cmd.join(' '), opts, function (err, stdout, stderr) {
					console.log(String(stdout));
					console.log(String(stderr));
					if (err) {
						reject(err);
					}
					else {
						var i = active.indexOf(next);
						if (i > -1) {
							active.splice(i, 1);
						}
						check();
					}
				});
			};
			var check = function () {
				if (active.length === 0 && queue.length === 0) {
					resolve(pages);
					return;
				}
				while (active.length < max && queue.length > 0) {
					step();
				}
			};
			check();
		}).then(function (pages) {
			console.log('done!');
			var data = {
				title: 'DT Index',
				chapters: pages.map(function(page) {
					return {
						label: page.def,
						page: page.slug + '/index.html'
					};
				})
			};
			return output.render(outDir, data).return(dirs);
		});
	});
}

module.exports = {
	bulk: bulk
};
