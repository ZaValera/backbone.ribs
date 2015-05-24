require.config({
    paths: {
        jquery: '../vendor/jquery-1.9.0.min',
        underscore: '../vendor/lodash.min',
        backbone: '../vendor/backbone',
        epoxy: '../vendor/backbone.epoxy',
        ribs: '../backbone.ribs'
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

        /*var ItemView = Backbone.Ribs.View.extend({

            bindings: {
                'span': {
                    text: {
                        data: 'model.a',
                        filter: function (val) {
                                return val + 'asdf';

                        }
                    }
                }
            },

            initialize: function () {
                this.setElement('<div class="item-view"><span></span></div>');
            }
        });



        var CollectionView = Backbone.Ribs.View.extend({

            bindings: {
                'el': {
                    'collection': {
                        col: 'col',
                        view: ItemView,
                        data: {
                            a: 123,
                            b: 'lala'
                        }
                    }
                }
            },

            filters: {
                colFilter: function (a) {
                    var sum = 0;

                    for (var i = 0; i < a.length; i++) {
                        sum += a[i];
                    }

                    return sum;
                }
            },

            initialize: function () {
                this.col = new Backbone.Collection([{a: 3},{a: 5},{a: 8}]);

                window.col = this.col;
                this.setElement('.col');
            }
        });



        var colView = window.colView = new CollectionView();*/


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





        /*var model = window.m2 =  new (Backbone.Ribs.Model.extend({
            computeds: {
                comp1: {
                    deps: ['bar1'],
                    get: function (bar1) {
                        return bar1 * 10;
                    },
                    set: function (val) {
                        return {
                            bar1: val/10
                        };
                    }
                },

                comp2: {
                    deps: ['comp1', 'comp3', 'comp4'],
                    get: function (comp1, comp3, comp4) {
                        return comp1 + ' ' + comp3 + ' ' + comp4;
                    }
                },

                comp3: {
                    deps: ['bar2'],
                    get: function (bar2) {
                        return bar2 * 10;
                    },
                    set: function (val) {
                        return {
                            bar2: val/10
                        };
                    }
                },

                comp4: function () {
                    return 5;
                }
            },

            defaults: {
                bar1: 10,
                bar2: 20
            }
        }));*/

        /*var TestView = Backbone.Ribs.View.extend({

            bindings: {
                'input': {
                    'file': {
                        data: 'model.text'
                    }
                }
            },

            handlers: {
                file: {
                    get: function ($el) {
                        return $el[0].files[0].name
                    }
                }
            },

            initialize: function () {
                window.m = this.model = new Backbone.Model({
                    text: 123
                });

                this.setElement('.filter');
            }
        });

        window.v =  new TestView();*/

        var View = Backbone.Ribs.View.extend({
            el: '<div class="toggle">' +
                    '<div class="indom">first</div>' +
                    '<input class="second">' +
                    '<div class="indom">third</div>' +
                '</div>',

            bindings: {
                'el': {
                    inDOM: 'model.main',
                    classes: {
                        'test-class': 'model.hasClass'
                    }
                },
                '.second': {
                    value: {
                        data: 'model.second',
                        filter: function (second) {
                            console.log('binding');
                            return second;
                        }
                    }
                }
            },

            initialize: function () {
                window.model = this.model = new Backbone.Ribs.Model({
                    second: 'tada',
                    hasClass: true,
                    main: true,
                    'la.la': {
                        foo: 'bar'
                    }
                });

                this.model.on('change:second', function () {
                    console.log('change');
                });

                this.appendTo($('body'));

                //this.setElement('.toggle');
            }
        });

        window.view = new View();

        /*window.view.removeBindings2({
            el: 'classes'
        });*/

        //window.view.appendTo($('body'));
    });
});