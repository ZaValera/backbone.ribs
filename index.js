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


        /*var model = window.model = new (Backbone.Ribs.Model.extend(_.cloneDeep(extend)));

        var epModel = window.epModel = new (Backbone.Epoxy.Model.extend(_.cloneDeep(extend)));

        var bModel = window.bModel = new (Backbone.Model.extend(_.cloneDeep(extend)));

        var BindingView = Backbone.Ribs.View.extend({
            bindings: {
                //'.bind-span': 'text:model.foo,css:{color:model.col,font-weight:model.weight},attr:{data-type:model.type},classes:{active:model.active,passive:model.passive},toggle:model.active',
                //'.bind-span': 'classes:{active:not(model.active),passive:model.passive},toggle:not(model.active)',
                '.bind-span': 'text:summ(model.num1,model.num2),css:{color:model.col,font-weight:model.weight}'
                //'.bind-input': 'value:model.foo,events:[keyup,change]',
                //'.bind-textarea': 'value:model.text',
                //'.bind-checkbox': 'checked:model.ch',
                //'.bind-checkbox-single': 'checked:model.chs,enabled:model.active',
                //'.bind-radio': 'checked:model.rad,disabled:model.active'
            },

            filters: {
                summ: function (a, b) {
                    return a + b;
                }
            },

            initialize: function () {
                this.setElement('.content');

                this.model = window.bindModel = new Backbone.Ribs.Model({
                    'foo': 'bar',
                    'col': 'red',
                    'weight': 900,
                    'type': 'asdf',
                    ch: ['la1', 'la3'],
                    chs: true,
                    rad: 'la2',
                    text: '2l4hl12h4l12h4',
                    active: true,
                    passive: false,
                    num1: '15',
                    num2: '13'
                });
            }
        });

        var view = window.bindView = new BindingView();*/

        var ItemView = Backbone.View.extend({

            initialize: function () {
                this.setElement('<div class="item-view">' + this.model.get('a') + '</div>');
            }
        });



        var CollectionView = Backbone.Ribs.View.extend({

            bindings: {
                'el': 'collection:{col:col2,view:ItemView},css:{color:model.col}'
            },

            initialize: function () {
                this.col2 = new Backbone.Collection([{a: 2},{a: 4},{a: 3}]);

                this.ItemView = ItemView;

                this.model = new Backbone.Model({col: 'red'});

                this.col2.comparator = 'a';

                window.col = this.col2;

                this.setElement('<div class="col-view"></div>');

                //this.applyCollection(this.$el, collection, ItemView);

                $('body').append(this.$el);
            }
        });



        var colView = window.colView = new CollectionView();

        //colView.removeBindings();






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


        /*var model = new Backbone.Ribs.Model({
            foo: {
                bar: 'test',
                deepFoo: {
                    deepBar: 'deepTest'
                }
            },
            'foo.bar': 'dot'
        });

        window.model = model;

        model.on('change:foo.bar', function () {console.log('tada');});
        model.on('change:foo!.bar', function () {console.log('ta!!!da');});

        console.log(model.get('foo.bar')); //"test"

        console.log(model.get('foo.deepFoo.deepBar')); //"deepTest"

        console.log(model.get('foo!.bar')); //"dot"*/










    });
});

/*
var BindingView = Backbone.Ribs.View.extend({
    bindings: {
        'el': 'toggle:model.visible',
        '.bind-text':'text:model.foo',
        '.bind-value':'value:model.bar',
        '.bind-css':'css:{color:model.col,font-weight:model.weight}',
        '.bind-attr':'attr:{data-type:model.type}',
        '.bind-classes':'classes:{bind-classes_active:model.active',
        '.bind-html':'html:model.template',
        '.bind-disabled':'disabled:model.disabled',
        '.bind-enabled':'enabled:model.enabled',
        '.bind-checked':'checked:model.checkedItems',
        '.bind-with-filter':'text:summ(model.num1,model.num2)'
    },

    filters: {
        summ: function (a, b) {
            return a + b;
        }
    },

    initialize: function () {
        this.setElement('.bind');

        this.model = window.bindModel = new Backbone.Ribs.Model({
            visible: true,
            foo: 'foo',
            bar: 123,
            col: 'red',
            weight: 900,
            type: 'someType',
            active: true,
            template: '<div class="bind-template">fooBar</div>',
            disabled: true,
            enabled: true,
            checked: [1, 2, 3],
            num1: 15,
            num2: 13
        });
    }
});

var bindingView = new BindingView();


Backbone.Ribs.View.extend({
    bindings: {

    },

    initialize: function () {
        this.preventBindings();
    }
});

var bindingView = new BindingView();*/
