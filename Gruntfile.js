module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-qunit-istanbul');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        qunit: {
            options: {
                '--web-security': 'no',
                coverage: {
                    src: ['backbone.ribs.js'],
                    instrumentedFiles: 'temp/',
                    htmlReport: 'report/coverage',
                    linesThresholdPct: 90
                }
            },
            all: ['unitTestsNew/unitTests.html']
        }
    });

    grunt.registerTask('default', ['qunit']);
};