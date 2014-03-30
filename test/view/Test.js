define([
    'backbone',
    'test/model/TestModel'
], function (Backbone, TestModel) {

    return Backbone.View.extend({

        initialize: function() {
            var model = window.model = new TestModel();

            /*model.on('change:bogus.pokus', function () {
                console.dir(arguments);
            });

            model.on('change:bogus', function () {
                console.log('change:bogus');
            });

            model.on('change:pokus', function () {
                console.log('change:pokus');
            });

            model.on('change:bogus.lokus', function () {
                console.log('change:bogus.lokus');
            });*/

            //window.model.set('bogus.pokus', 10);
            //window.model.set('pokus', 20);
        }

    });
});