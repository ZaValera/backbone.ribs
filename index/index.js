﻿//JSHint settings
/* globals $: false */
/* globals require: false */

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
    'use strict';

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
                        };
                    }
                }
            }
        };

        /*var model = window.model = new Backbone.Ribs.Model();

        model.on('change:foo', function () {
            model.set('foo.first.second', 2);
        });

        model.set('foo', {first: {second: 1}});*/

        /*var Model = Backbone.Ribs.Model.extend({
            defaults: {
                objects: {
                    id967: {
                        status: null,
                    },
                    id963: {
                        status: null,
                    },
                }
            },

            initialize: function () {
                this.on('change:objects', this.onChangeObjects, this);
            },

            onChangeObjects: function () {
                if (window.QQ) {
                    this.set('objects.id963.status', 'q');
                }
            },
        });

        var model = new Model();

        model.set('objects', {
            id967: {
                status: null,
            },
        });

        window.QQ = true;

        model.set('objects', {
            id967: {
                status: null,
            },
            id963: {
                status: null,
            },
        });*/



/*        var MMM = Backbone.Ribs.Model.extend({
            defaults: {
                foo: 'a',
                bar: 'b'
            },

            computeds: {
                comp: {
                    deps: 'foo',
                    get: function (foo) {
                        return foo + '_comp';
                    },
                    set: function (val) {
                        return val.split('_')[0];
                    }
                },
                comp2: {
                    deps: ['foo', 'bar'],
                    get: function (foo, bar) {
                        return foo + '_' + bar;
                    },
                    set: function (val) {
                        return null;//val.split('_');
                    }
                }
            }
        });

        window.mmm = new MMM();

        mmm.on('change:foo', function (model, value) {console.log('foo:', value)});
        mmm.on('change:bar', function (model, value) {console.log('bar:', value)});
        mmm.on('change:comp', function (model, value) {console.log('comp:', value)});
        mmm.on('change:comp2', function (model, value) {console.log('comp2:', value)});*/


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

        /*window.m1 =  new (Backbone.Ribs.Model.extend({
            computeds: {
                comp1: {
                    deps: ['bar1.foo', 'comp2'],
                    get: function (bar1, comp2) {
                        return bar1 + '-' + comp2;
                    },
                    set: function (val) {
                        var res = val.split('-');

                        return {
                            bar1: res[0],
                            comp2: res[1]
                        };
                    }
                },

                comp2: {
                    deps: ['bar2.foo', 'comp3'],
                    get: function (bar2, comp1) {
                        return bar2 + ';' + comp1;
                    },
                    set: function (val) {
                        var res = val.split(';');

                        return {
                            bar2: res[0],
                            comp1: res[1]
                        };
                    }
                },
                comp3: {
                    deps: ['comp1'],
                    get: function (comp1) {
                        return comp1;
                    },
                    set: function (val) {
                        return {
                            comp1: val
                        };
                    }
                }
            },

            defaults: {
                bar1: {
                    foo: 10
                },
                bar2: {
                    foo: 20
                }
            }
        }));*/

        /*var model = window.m2 = new (Backbone.Ribs.Model.extend({
            defaults: {
                bar1: 10,
                bar2: 20
            },

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

                comp3: {
                    deps: ['comp1', 'comp2', 'bar1'],
                    get: function (comp1, comp3, bar1) {
                        return comp1 + ' ' + comp3 + ' ' + bar1;
                    },
                    set: function (val) {
                        var res = val.split(' ');
                        return {
                            comp1: parseInt(res[0]),
                            comp2: parseInt(res[1]),
                            bar1: parseInt(res[2])
                        };
                    }
                },

                comp4: {
                    deps: ['comp3'],
                    get: function (comp3) {
                        return comp3 + 'bla';
                    },
                    set: function (val) {
                        return {
                            comp3: val.slice(0, -3)
                        };
                    }
                },

                comp5: {
                    deps: ['comp3', 'comp4'],
                    get: function (comp3, comp4) {
                        return comp3 + 'zzz' + comp4;
                    },
                    set: function (val) {
                        var res = val.split('zzz');

                        return {
                            comp3: res[0],
                            comp4: res[1]
                        };
                    }
                }
            }
        }));

        m2.on('change:bar1', function (model, value) {console.log('bar1:', value)});
        m2.on('change:bar2', function (model, value) {console.log('bar2:', value)});
        m2.on('change:comp1', function (model, value) {console.log('comp1:', value)});
        m2.on('change:comp2', function (model, value) {console.log('comp2:', value)});
        m2.on('change:comp3', function (model, value) {console.log('comp3:', value)});
        m2.on('change:comp4', function (model, value) {console.log('comp4:', value)});
        m2.on('change:comp5', function (model, value) {console.log('comp5:', value)});*/

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

        /*var View = Backbone.Ribs.View.extend({
            el: '<div class="toggle" style="display: inline-block;">' +
                    '<div class="first">first</div>' +
                    '<div class="parent"><div class="second"><span class="text"></span></div></div>' +
                    '<span class="second">second</span>' +
                    '<div class="third">third</div>' +
                '</div>',

            bindings: {
                'el': {
                    inDOM: 'model.main'
                },
                '.first': {
                    inDOM: 'model.first'
                },
                '.second': {
                    inDOM: 'model.second'
                },
                '.third': {
                    inDOM: 'model.third'
                }
            },

            initialize: function () {
                window.model = this.model = new Backbone.Ribs.Model({
                    first: true,
                    second: false,
                    third: true,
                    main: false,
                    text: 'asdfasdf'
                });

                this.model.on('change:second', function () {
                    console.log('change');
                });

                this.appendTo($('body'));
            }
        });

        window.view = new View();*/

        /*window.view.removeBindings2({
            el: 'classes'
        });*/

        //window.view.appendTo($('body'));


        /*var v = window.v = new Backbone.Ribs.View();

        v.model = new Backbone.Ribs.Model();

        v.addBindings({
            '.test': {
                text: 'model.text',
                toggle: 'model.active'
            },
            '.foo': {
                text: 'model.text',
                toggle: 'model.active'
            }
        });

        v.updateBindings('.foo', ['text']);

        v.removeBindings('.foo', ['text']);*/

        var ItemView = Backbone.Ribs.View.extend({
            bindings: {
                '.bind-input': {
                    value: {
                        data: ['model.first', 'model.second'],
                        processor: {
                            get: function (first, second) {
                                return first + ';' + second;
                            },
                            set: function (val) {
                                val = val.split(';');

                                return null; //[val[0], val[1]];
                            }
                        }
                    }
                }
            },

            el: '<span><input class="bind-in"></span>',

            initialize: function () {
                window.m = this.model = new Backbone.Ribs.Model({
                    test: '123'
                });

                this.addBindings('.bind-in', {
                    value: 'model.test'
                });

                this.$el.appendTo('body');
            }
        });

        var Mts = Backbone.Ribs.Model.extend({
            defaults: {
                //foo: 123
            },

            computeds: {
                comp: {
                    deps: ['foo'],
                    get: function (foo) {
                        return foo || 'bar';
                    }
                }
            }
        });

        window.m = new Mts();

       /* var View = Backbone.Ribs.View.extend({
            el: '<div></div>',

            initialize: function (col) {
                /!*window.m = this.model = new Backbone.Ribs.Model({
                    visible: false
                });*!/

                this.$el.appendTo('body');

                this.addBindings('el', {
                    collection: {
                        col: col,
                        view: ItemView
                    }
                });


            }
        });

        var col = window.col =  new Backbone.Collection([{id: 1, visible: false}]);*/

        //window.view = new ItemView();
    });
});