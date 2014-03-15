(function() {
    window.bgs = {
        views: {},
        models: {}
    };
})();

require.config({
    paths: {
        jquery: 'vendor/jquery-1.9.0.min',
        underscore: 'vendor/lodash.min',
        backbone: 'vendor/backbone',
        epoxy: 'vendor/backbone.epoxy',
        ribs: 'backbone.ribs'
    }/*,
    shim: {
        'backbone': {
            deps: ['jquery', 'lodash'],
            exports: 'Backbone'
        }
    }*/
});

require([
    'test/view/Test',
    'ribs'
], function(Test) {
    $(document).ready(function() {
        window.bgs.views.test = new Test();
    });
});