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
                    linesThresholdPct: 100,
                    statementsThresholdPct: 100,
                    functionsThresholdPct: 100,
                    branchesThresholdPct: 90
                }
            },
            all: [
                'unitTests/unitTests.html',
                'unitTests/commonJSTest.html',
                'unitTests/amd.html',
                'unitTests/node.html',
                'unitTests/ie10.html'
            ]
        }
    });

    grunt.registerTask('default', ['qunit']);
};