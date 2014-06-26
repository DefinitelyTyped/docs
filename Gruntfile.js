module.exports = function (grunt) {
	'use strict';

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
		}
	});


	grunt.registerTask('exec', function() {
		var done = this.async();
		runner.bulk('./repo', './tmp', function(dir) {
			// return true;
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
