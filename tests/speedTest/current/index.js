require.config({
    paths: {
        jquery: '../../vendor/jquery-1.9.0.min',
        underscore: '../../vendor/lodash.min',
        backbone: '../../vendor/backbone',
        ribs: '../../backbone.ribs',
        speedTest: '../speedTest'
    }
});

require([
    'speedTest',
    'ribs'
], function(speedTest) {
    $(document).ready(function() {
        speedTest();
    });
});