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
                //'.bind-span': 'text:summ(model.num1,model.num2),css:{color:model.col,font-weight:model.weight}'
                //'.bind-input': 'value:model.foo,events:[keyup,change]',
                //'.bind-textarea': 'value:model.text',
                //'.bind-checkbox': 'checked:model.ch',
                //'.bind-checkbox-single': 'checked:model.chs,enabled:model.active',
                //'.bind-radio': 'checked:model.rad,disabled:model.active'
                '.bind-span': 'text:model.foo.bar'
            },

            filters: {
                summ: function (a, b) {
                    return a + b;
                }
            },

            initialize: function () {
                this.setElement('.content');

                this.model = window.bindModel = new Backbone.Ribs.Model({
                    foo: {
                        bar: 456
                    },
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
                this.preventBindings();

                this.col2 = new Backbone.Collection([{a: 2},{a: 4},{a: 3}]);



                this.ItemView = ItemView;

                this.model = new Backbone.Model({col: 'red'});

                this.col2.comparator = 'a';

                window.col = this.col2;

                this.setElement('<div class="col-view"></div>');

                //this.applyCollection(this.$el, collection, ItemView);

                $('body').append(this.$el);

                this.applyCollection('el', this.col2, ItemView);

                this.col2.on('change:a', this.tada, this);

                this.applyBindings();
            },

            tada: function () {
                console.log('tada');
            }
        });



        var colView = window.colView = new CollectionView();


        /*var Model = Backbone.Ribs.Model.extend({
            computeds: {
                a: {
                    deps: ['foo.bar'],
                    get: function (a) {
                        return 'comp ' + a;
                    }
                }
            },

            defaults: {
                foo: {
                    bar: 'test',
                    deepFoo: {
                        deepBar: 'deepTest'
                    }
                },
                'foo.bar': 'dot'
            }
        });

        window.model = new Model();*/

        /*model.on('change:foo.bar', function () {console.log('tada');});
        model.on('change:foo!.bar', function () {console.log('ta!!!da');});

        console.log(model.get('foo.bar')); //"test"

        console.log(model.get('foo.deepFoo.deepBar')); //"deepTest"

        console.log(model.get('foo!.bar')); //"dot"*/










    });
});