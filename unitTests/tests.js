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
        }),
        backboneModel = new Backbone.Model();

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

    /*module('SET');
    test('Simple SET', function () {

    });

    test('Deep SET', function () {

    });

    test('Computed SET', function () {

    });*/
});