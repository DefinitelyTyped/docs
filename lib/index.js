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
	console.log('');

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

		queue.sort();
		var start = Date.now();

		var pages = [];
		var active = [];
		var max = Math.round(os.cpus().length * 0.75);

		console.log('queued %s pages', dirs.length);
		console.log('running %s paralel', max);
		console.log('');


		return new Promise(function (resolve, reject) {
			var step = function () {
				var next = queue.shift();
				var slug = next.replace(/\.d\.ts$/, '').replace(/[\\\/]/g, '--');
				pages.push({
					def: next,
					slug: slug
				});
				active.push(next);
				// console.log('-> ' + next);
				var cmd = [
					'node',
					dronePath,
					'--slug', slug,
					'--def', path.join(dtPath, next),
					'--out', path.join(outDir, slug)
				];
				var opts = {};
				childProcess.exec(cmd.join(' '), opts, function (err, stdout, stderr) {
					console.log('>> ' + next);
					stdout = String(stdout).trim();
					stderr = String(stderr).trim();
					if (stdout !== '') {
						console.log(stdout);
					}
					if (stderr !== '') {
						console.log(stderr);
					}
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
			console.log('');
			console.log('got %s pages', pages.length);
			console.log('');
			console.log('done in %ss', ((Date.now() - start) / 1000).toFixed(1));
			var data = {
				title: 'DT Index',
				chapters: pages.map(function(page) {
					return {
						label: page.def,
						page: page.slug + '/index.html'
					};
				})
			};
			fs.writeFile(path.join(outDir, 'data.json'), JSON.stringify(data, null, '   '), 'utf8');
			return output.render(outDir, data).return(dirs);
		});
	});
}

module.exports = {
	bulk: bulk
};
