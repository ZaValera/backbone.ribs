define([
    'backbone'
], function (Backbone) {

    return Backbone.Ribs.Model.extend({
        computeds: {
            foo: {
                deps: ['bogus.pokus'],
                get: function (bar) {
                    return 'comp: ' + bar;
                }
            }
        },

        initialize: function() {
            this.set('bar', 'baaaaar');
        }

    });
});