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
    'ribs',
    'epoxy'
], function() {
    $(document).ready(function() {
        var extend = {
            defaults: {
                bar: 10,
                foo: 20
            },

            computeds: {
                simpleComp: function () {
                    return 'simple';
                },
                barComp: {
                    deps: ['bar', 'foo'],
                    get: function (bar, foo) {
                        return bar + '-' + foo;
                    },
                    set: function (val) {
                        val = val.split('-');

                        return {
                            bar:  parseInt(val[0]),
                            foo: parseInt(val[1])
                        }
                    }
                }
            }
        };


        var model = window.model = new (Backbone.Ribs.Model.extend(_.cloneDeep(extend)));

        var epModel = window.epModel = new (Backbone.Epoxy.Model.extend(_.cloneDeep(extend)));

        var bModel = window.bModel = new (Backbone.Model.extend(_.cloneDeep(extend)));

        var BindingView = Backbone.Ribs.View.extend({
            bindings: {
                '.bind-span': 'text:model.foo',
                '.bind-input': 'value:model.foo,events:[keyup,change]'
            },

            initialize: function () {
                this.setElement('.content');

                this.model = window.bindModel = new Backbone.Ribs.Model({
                    'foo': 'bar'
                });
            }
        });

        var view = window.bindView = new BindingView();






        /*var Binding = function ($el, model, get, set) {
            var self = this;

            this.$el = $el;
            this.model = model;

            this.onchange = function (model, value) {
                get.call(self, value);
            };

            this.handler = function () {
                console.log('tada');
                set.call(self, 'bar');
            };

            model.on('change:bar', this.onchange);
            $el.on('keyup', this.handler);
        };

        Binding.prototype.unbind = function () {
            this.$el.off('keyup', this.handler);
            this.model.off('change:bar', this.onchange);
        };

        var binding = window.binding = new Binding($('.bind-input'), model,
            function (value) {
                this.$el.val(value);
            },
            function (attr) {
                this.model.set(attr, this.$el.val());
            }
        );*/











    });
});