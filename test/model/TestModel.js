define([
    'backbone'
], function (Backbone) {

    return Backbone.Ribs.Model.extend({
        defaults: {
            bar: 10
        },

        computeds: {
            barComp: {
                deps: ['bar'],
                get: function (bar) {
                    return '$' + bar;
                },
                set: function (val) {
                    this.set('bar', parseInt(val.slice(1)));
                }
            }
        },

        initialize: function() {

        }

    });
});