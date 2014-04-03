define([
    'backbone'
], function (Backbone) {

    return Backbone.Ribs.Model.extend({
        defaults: {
            bar: 10
        },

        computeds: {
            bar: {
                deps: ['bar'],
                get: function (bar) {
                    return '$' + bar;
                },
                set: function (val) {
                    return {
                        bar:  parseInt(val.slice(1))
                    }
                }
            }
        },

        initialize: function() {

        }

    });
});