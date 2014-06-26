module.exports = function (grunt) {
	'use strict';

	function getDeployMessage() {
		var ret = '\n\n';
		if (process.env.TRAVIS !== 'true') {
			ret += 'did not run on travis-ci';
			return ret;
		}
		ret += 'branch: ' + process.env.TRAVIS_BRANCH + '\n';
		ret += 'SHA: ' + process.env.TRAVIS_COMMIT + '\n';
		ret += 'range SHA: ' + process.env.TRAVIS_COMMIT_RANGE + '\n';
		ret += 'build id: ' + process.env.TRAVIS_BUILD_ID + '\n';
		ret += 'build number: ' + process.env.TRAVIS_BUILD_NUMBER + '\n';
		return ret;
	}

	var runner = require('./lib/index');

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: grunt.util._.extend(grunt.file.readJSON('.jshintrc'), {
				reporter: './node_modules/jshint-path-reporter'
			}),
			support: {
				src: ['Gruntfile.js']
			},
			lib: {
				src: ['lib/**/*.js', 'tasks/**/*.js' ]
			}
		},
		clean: {
			tmp: {
				dot: true,
				src: [
					'tmp/**/*'
				]
			}
		},
		'gh-pages': {
			options: {
				base: 'docs',
				branch: 'gh-pages'
			},
			publish: {
				options: {
					repo: 'https://github.com/DefinitelyTyped/docs.git',
					message: 'publish (cli)'
				},
				src: ['**']
			},
			deploy: {
				options: {
					repo: 'https://' + process.env.GH_TOKEN + '@github.com/DefinitelyTyped/docs.git',
					message: 'publish (auto)' + getDeployMessage(),
					silent: true,
					user: {
						name: 'dt-bot',
						email: 'definitelytypedbot@gmail.com'
					}
				},
				src: ['**']
			}
		}
	});


	grunt.registerTask('exec', function() {
		var done = this.async();
		var all = (process.env.TRAVIS !== 'true');
		runner.bulk('./repo', './docs', function(dir) {
			if (all) {
				return /$a/.test(dir) || /$j/.test(dir) || /$node/.test(dir);
			}
			return /node\.d\.ts$/.test(dir) || /jquery\.d\.ts$/.test(dir);
		}).then(function() {
			done();
		}).catch(function(err) {
			console.log(err);
			done(false);
		});
	});

	grunt.registerTask('prep', [
		'clean:tmp',
		'jshint:support',
		'jshint:lib'
	]);

	grunt.registerTask('build', [
		'clean:tmp',
		'jshint:support',
		'exec'
	]);

	grunt.registerTask('prepublish', [
		'prep'
	]);

	grunt.registerTask('sweep', [
		'clean:tmp'
	]);

	grunt.registerTask('default', ['build']);
};
