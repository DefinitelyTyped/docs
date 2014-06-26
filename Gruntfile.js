/* jshint -W098 */

module.exports = function (grunt) {
	'use strict';

	var path = require('path');

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
	grunt.loadNpmTasks('grunt-gh-pages');

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
		var all = (process.env.TRAVIS === 'true');
		runner.bulk('./repo', './docs', function(dir) {
			if (all) {
				// return true;
			}
			var allow = [
				/^angular/,
				/^jquery/,
				/^node/
			];
			var base = path.basename(dir);
			return allow.some(function(exp) {
				return exp.test(base);
			});
		}).then(function() {
			done();
		}).catch(function(err) {
			console.log(err);
			done(false);
		});
	});

	grunt.registerTask('check-deploy', function() {
		this.requires(['build']);

		if (process.env.TRAVIS === 'true' && process.env.TRAVIS_SECURE_ENV_VARS === 'true' && process.env.TRAVIS_PULL_REQUEST === 'false') {
			grunt.log.writeln('executing deployment');
			grunt.task.run('gh-pages:deploy');
		}
		else {
			grunt.log.writeln('skipping deployment');
		}
	});

	grunt.registerTask('lint', [
		'jshint'
	]);

	grunt.registerTask('prep', [
		'clean:tmp',
		'jshint'
	]);

	grunt.registerTask('build', [
		'prep',
		'jshint:support',
		'exec'
	]);

	grunt.registerTask('publish', 'Build and push to master using CLI.', [
		'build',
		'gh-pages:publish'
	]);

	grunt.registerTask('deploy', 'Build with production env for bot.', [
		'build',
		'check-deploy'
	]);

	grunt.registerTask('sweep', [
		'clean:tmp'
	]);

	grunt.registerTask('default', ['build']);
};
