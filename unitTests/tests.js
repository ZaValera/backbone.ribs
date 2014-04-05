$(function () {
    var Model = Backbone.Ribs.Model.extend(),
        ar = [0, 1, {foo: 'bar1'}],
        obj = {
            '': {
                '': 'bar2'
            },
            'foo': 'bar3',
            '.': '.bar1',
            'foo.bar': '.bar2',
            'foo..bar': '.bar3',
            '.foo': '.bar4',
            '..foo': '.bar5',
            'foo.': '.bar6',
            'foo..': '.bar7',
            'foo!bar': '!bar1',
            '!foo': '!bar2',
            'foo!': '!bar3',
            'foo!.bar': '!.bar1',
            '!.foo': '!.bar2',
            'foo!.': '!.bar3',
            subObj: {
                subFoo: 'subBar'
            },
            subAr: [0, 1, 2]
        },
        fn = function () {return true;},
        model = new Model({
            '': 'bar6',
            ar: ar,
            obj: obj,
            str: 'testString',
            num: 123,
            bool: true,
            nl: null,
            ndf: undefined,
            fn: fn
        });

    //window.testModel = model;
    //window.testBackboneModel = backboneModel;

    module('GET');
    test('Simple GET', function () {
        equal(model.get('ar'), ar, 'Get Array');

        equal(model.get('obj'), obj, 'Get Object');

        equal(model.get('str'), 'testString', 'Get String');

        equal(model.get('num'), 123, 'Get Number');

        equal(model.get('bool'), true, 'Get Boolean');

        equal(model.get('nl'), null, 'Get Null');

        equal(model.get('ndf'), undefined, 'Get Undefined');

        equal(model.get('fn'), fn, 'Get Function');

        equal(model.get(''), 'bar6', 'Get Empty name');
    });

    test('Deep GET', function () {
        equal(model.get('ar.1'), 1, 'Get Array Element');

        equal(model.get('ar.2.foo'), 'bar1', 'Get Object in Array Element');

        equal(model.get('obj.foo'), 'bar3', 'Get Object First Level');

        equal(model.get('obj.subObj.subFoo'), 'subBar', 'Get Object Second Level');

        equal(model.get('obj.subAr.1'), 1, 'Get Array in Object Element');

        deepEqual(model.get('obj.'), {'': 'bar2'}, 'Get Object Empty name');

        equal(model.get('obj..'), 'bar2', 'Get Object Double Empty name');

        equal(model.get('obj.!.'), '.bar1', 'Get Object Just Dot');

        equal(model.get('obj.foo!.bar'), '.bar2', 'Get Object Dot in name');

        equal(model.get('obj.foo!.!.bar'), '.bar3', 'Get Object Double Dot in name');

        equal(model.get('obj.!.foo'), '.bar4', 'Get Object Dot at first');

        equal(model.get('obj.!.!.foo'), '.bar5', 'Get Object Double Dot at first');

        equal(model.get('obj.foo!.'), '.bar6', 'Get Object Dot at last');

        equal(model.get('obj.foo!.!.'), '.bar7', 'Get Object Double Dot at last');

        equal(model.get('obj.foo!bar'), '!bar1', 'Get Object Exclamation in name');

        equal(model.get('obj.!foo'), '!bar2', 'Get Object Exclamation at first');

        equal(model.get('obj.foo!'), '!bar3', 'Get Object Exclamation at last');

        equal(model.get('obj.foo!!.bar'), '!.bar1', 'Get Object ExclamationDot in name');

        equal(model.get('obj.!!.foo'), '!.bar2', 'Get Object ExclamationDot at first');

        equal(model.get('obj.foo!!.'), '!.bar3', 'Get Object ExclamationDot at last');
    });

    test('Computed GET', function () {
        var compGetCounter,
            model = new (Backbone.Ribs.Model.extend({
                computeds: {
                    compFoo1: function () {
                        compGetCounter++;
                        return 'computed:' + this.get('foo1');
                    },

                    compFoo2: {
                        deps: ['foo2'],
                        get: function (foo2) {
                            compGetCounter++;
                            return 'computed:' + foo2;
                        }
                    },

                    compFoo3: {
                        deps: ['foo3.subFoo.deepFoo'],
                        get: function (deepFoo) {
                            compGetCounter++;
                            return 'computed:' + deepFoo;
                        }
                    }
                },

                defaults: {
                    foo1: 'bar1',
                    foo2: 'bar2',
                    foo3: {
                        subFoo: {
                            deepFoo: 'bar3'
                        }
                    }
                }
            }));

        compGetCounter = 0;
        equal(model.get('compFoo1'), 'computed:bar1', 'Get Simple Computed first time');
        model.set('foo1', 'bar11');
        equal(model.get('compFoo1'), 'computed:bar11', 'Get Simple Computed after set');
        equal(compGetCounter, 2, 'Is Computed was get twice');

        compGetCounter = 0;
        equal(model.get('compFoo2'), 'computed:bar2', 'Get Deps Computed first time');
        equal(model.get('compFoo2'), 'computed:bar2', 'Get Deps Computed second time');
        model.set('foo2', 'bar22');
        equal(model.get('compFoo2'), 'computed:bar22', 'Get Deps Computed after set');
        equal(compGetCounter, 1, 'Is Computed wasn\'t get');
        model.set('foo2', 'bar222', {silent: true});
        equal(model.get('compFoo2'), 'computed:bar222', 'Get Deps Computed after silent set');

        equal(model.get('compFoo3'), 'computed:bar3', 'Get Deps Computed deep');
        model.set('foo3', {
            subFoo: {
                deepFoo: 'bar33'
            }
        });
        equal(model.get('compFoo3'), 'computed:bar33', 'Get Deps Computed deep after set');
        model.set('foo3', 'bar333');
        equal(model.get('compFoo3'), 'computed:undefined', 'Get Deps Computed deep after set up level');
    });

    module('SET');
    test('Simple SET', function () {
        var model = new (Backbone.Ribs.Model.extend({
            defaults: {
                foo1: 'bar1'
            }
        }));

        //Сетим существующее поле
        model.set('foo1', 'bar11');

        equal(model.attributes.foo1, 'bar11', 'Set field');
        equal(model._previousAttributes.foo1, 'bar1', 'Set field _previousAttributes');
        equal(model.changed.foo1, 'bar11', 'Set field changed');

        //Сетим новое поле
        model.set('foo2', 'bar22');

        equal(model.attributes.foo2, 'bar22', 'Set new field');
        equal(model._previousAttributes.foo2, undefined, 'Set new field _previousAttributes');
        equal(model.changed.foo2, 'bar22', 'Set new field changed');

        //Сети два поля одновременно (объект)
        model.set({foo1: 'bar111', foo3: 'bar333'});

        equal(model.attributes.foo1, 'bar111', 'Set object field');
        equal(model._previousAttributes.foo1, 'bar11', 'Set object field _previousAttributes');
        equal(model.changed.foo1, 'bar111', 'Set object field changed');

        equal(model.attributes.foo3, 'bar333', 'Set object new field');
        equal(model._previousAttributes.foo3, undefined, 'Set object new field _previousAttributes');
        equal(model.changed.foo3, 'bar333', 'Set object new field changed');

        //Работа обработчика onchange
        var flag = false;

        model.on('change:foo1', function (model, val) {flag = val;});
        model.set('foo1', 'bar1');
        equal(flag, 'bar1', 'onchange');

        //Работа обработчика onchange с {silent: true}
        flag = false;

        model.set('foo1', 'bar11', {silent: true});
        equal(flag, false, 'onchange silent');

        //Работа флага {unset: true}
        model.set('foo1', 'bar111', {unset: true});

        equal(model.attributes.foo1, undefined, 'Unset field');
        equal(model._previousAttributes.foo1, 'bar11', 'Unset field _previousAttributes');
        equal(model.changed.foo1, 'bar111', 'Unset field changed');
    });

    test('Deep SET', function () {
        var model = new (Backbone.Ribs.Model.extend({
            defaults: {
                foo: {bar: 'bar1'}
            }
        }));

        //Сетим существующее поле
        model.set('foo.bar', 'bar11');

        equal(model.attributes.foo.bar, 'bar11', 'Set field');
        equal(model._previousAttributes.foo.bar, 'bar11', 'Set field _previousAttributes');
        equal(model.changed['foo.bar'], 'bar11', 'Set field changed');

        //Сетим новое поле
        model.set('foo.bar2', 'bar2');

        equal(model.attributes.foo.bar2, 'bar2', 'Set new field');
        equal(model._previousAttributes.foo.bar2, 'bar2', 'Set new field _previousAttributes');
        equal(model.changed['foo.bar2'], 'bar2', 'Set new field changed');

        //Сети два поля одновременно (объект)
        model.set({'foo.bar': 'bar111', 'foo.bar3': 'bar333'});

        equal(model.attributes.foo.bar, 'bar111', 'Set object field');
        equal(model._previousAttributes.foo.bar, 'bar111', 'Set object field _previousAttributes');
        equal(model.changed['foo.bar'], 'bar111', 'Set object field changed');

        equal(model.attributes.foo.bar3, 'bar333', 'Set object new field');
        equal(model._previousAttributes.foo.bar3, 'bar333', 'Set object new field _previousAttributes');
        equal(model.changed['foo.bar3'], 'bar333', 'Set object new field changed');

        //Работа обработчика onchange
        var flag = false;

        model.on('change:foo.bar', function (model, val) {flag = val;});
        model.set('foo.bar', 'bar1');
        equal(flag, 'bar1', 'onchange');

        //Работа обработчика onchange с {silent: true}
        flag = false;

        model.set('foo.bar', 'bar11', {silent: true});
        equal(flag, false, 'onchange silent');

        //Работа флага {unset: true}
        model.set('foo.bar', 'bar111', {unset: true});

        deepEqual(model.attributes.foo, {bar2:'bar2', bar3: 'bar333'}, 'Unset field');
        deepEqual(model._previousAttributes.foo, {bar2:'bar2', bar3: 'bar333'}, 'Unset field _previousAttributes');
        equal(model.changed['foo.bar'], 'bar111', 'Unset field changed');
    });

    test('Computed SET', function () {
        var model = new (Backbone.Ribs.Model.extend({
            computeds: {
                barComp: {
                    deps: ['foo1', 'foo2'],
                    get: function (foo1, foo2) {
                        return foo1 + '-' + foo2;
                    },
                    set: function (val) {
                        val = val.split('-');

                        return {
                            foo1:  parseInt(val[0]),
                            foo2: parseInt(val[1])
                        }
                    }
                },

                barComp2: {
                    deps: ['foo2', 'foo1'],
                    get: function (foo2, foo1) {
                        return foo2 + '-' + foo1;
                    },
                    set: function (val) {
                        val = val.split('-');

                        return {
                            foo1:  parseInt(val[1]),
                            foo2: parseInt(val[0])
                        }
                    }
                }
            },

            defaults: {
                foo1: 10,
                foo2: 20
            }
        }));

        var counter = 0;

        model.on('change:barComp', function () {counter++});
        model.on('change:foo1', function () {counter++});
        model.on('change:foo2', function () {counter++});

        model.set('barComp', '30-40');
        deepEqual(model.attributes, {foo1: 30, foo2: 40}, 'Set deps');
        equal(model.get('barComp'), '30-40', 'Get updated computed');
        deepEqual(model._previousAttributes, {foo1: 10, foo2: 20, barComp: '10-20', barComp2: '20-10'}, '_previousAttributes');
        deepEqual(model.changed, {foo1: 30, foo2: 40, barComp: '30-40', barComp2: '40-30'}, 'changed');
        equal(counter, 3, 'onchange');

        counter = 0;
        model.set('barComp', '50-60', {silent: true});
        deepEqual(model.attributes, {foo1: 50, foo2: 60}, 'Set deps silent');
        equal(model.get('barComp'), '50-60', 'Get updated computed silent');
        deepEqual(model._previousAttributes, {foo1: 30, foo2: 40, barComp: '30-40', barComp2: '40-30'}, '_previousAttributes silent');
        deepEqual(model.changed, {foo1: 50, foo2: 60, barComp: '50-60', barComp2: '60-50'}, 'changed silent');
        equal(counter, 0, 'onchange silent');

        model.set('barComp', '70-80', {unset: true});
        deepEqual(model.attributes, {foo1: 70, foo2: 80}, 'Set deps unset');
        equal(model.get('barComp'), undefined, 'Get updated computed unset');
        deepEqual(model._ribs.computeds.barComp, undefined, 'computeds unset');
        deepEqual(model._ribs.computedsDeps, {foo1: ['barComp2'], foo2: ['barComp2']}, 'computedsDeps unset');
        deepEqual(model._previousAttributes, {foo1: 50, foo2: 60, barComp: '50-60', barComp2: '60-50'}, '_previousAttributes unset');
        deepEqual(model.changed, {foo1: 70, foo2: 80, barComp: '70-80', barComp2: '80-70'}, 'changed unset');
        equal(counter, 3, 'onchange unset');
    })
});