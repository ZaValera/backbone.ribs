//JSHint settings
/* globals QUnit: false */
/* globals Backbone: false */

QUnit.module('GET', function () {
    'use strict';

    QUnit.test('Simple GET', function (assert) {
        var ar = [],
            obj = {},
            fn = function () {},
            data = {
                '': 'empty',
                num: 123,
                str: 'string',
                ar: ar,
                obj: obj,
                bool: true,
                nl: null,
                ndf: undefined,
                fn: fn
            },
            model = new Backbone.Model(data),
            ribsModel = new Backbone.Ribs.Model(data);

        assert.equal(ribsModel.get(), model.get(), 'Get undefined');
        assert.equal(ribsModel.get(''), model.get(''), 'Get Empty name');
        assert.equal(ribsModel.get('num'), model.get('num'), 'Get Number');
        assert.equal(ribsModel.get('str'), model.get('str'), 'Get String');
        assert.equal(ribsModel.get('ar'), model.get('ar'), 'Get Array');
        assert.equal(ribsModel.get('obj'), model.get('obj'), 'Get Object');
        assert.equal(ribsModel.get('bool'), model.get('bool'), 'Get Boolean');
        assert.equal(ribsModel.get('nl'), model.get('nl'), 'Get Null');
        assert.equal(ribsModel.get('ndf'), model.get('ndf'), 'Get Undefined');
        assert.equal(ribsModel.get('fn'), model.get('fn'), 'Get Function');
    });

    QUnit.test('Deep GET', function (assert) {
        var model = new Backbone.Ribs.Model({
            'foo.foo': 'bar',
            ar: [0, 1, {foo: 'bar1'}],
            obj: {
                foo: 'bar2',
                foo2: {
                    foo3: 'bar3'
                },
                ar: [0, 1],
                '': {'': 'bar4'},
                '.': '.bar5',
                'foo.bar': '.bar6',
                'foo..bar': '.bar7',
                '.foo': '.bar8',
                '..foo': '.bar9',
                'foo.': '.bar10',
                'foo..': '.bar11',
                'foo!bar': '!bar12',
                '!foo': '!bar13',
                'foo!': '!bar14',
                'foo!.bar': '!.bar15',
                '!.foo': '!.bar16',
                'foo!.': '!.bar17'
            }
        });

        assert.equal(model.get('foo!.foo'), 'bar', 'Get Default Element with comma');
        assert.equal(model.get('ar.1'), 1, 'Get Array Element');
        assert.equal(model.get('ar.2.foo'), 'bar1', 'Get Object in Array Element');
        assert.equal(model.get('obj.foo'), 'bar2', 'Get Object First Level');
        assert.equal(model.get('obj.foo2.foo3'), 'bar3', 'Get Object Second Level');
        assert.equal(model.get('obj.ar.1'), 1, 'Get Array in Object Element');
        assert.deepEqual(model.get('obj.'), {'': 'bar4'}, 'Get Object Empty name');
        assert.equal(model.get('obj..'), 'bar4', 'Get Object Double Empty name');
        assert.equal(model.get('obj.!.'), '.bar5', 'Get Object Just Dot');
        assert.equal(model.get('obj.foo!.bar'), '.bar6', 'Get Object Dot in name');
        assert.equal(model.get('obj.foo!.!.bar'), '.bar7', 'Get Object Double Dot in name');
        assert.equal(model.get('obj.!.foo'), '.bar8', 'Get Object Dot at first');
        assert.equal(model.get('obj.!.!.foo'), '.bar9', 'Get Object Double Dot at first');
        assert.equal(model.get('obj.foo!.'), '.bar10', 'Get Object Dot at last');
        assert.equal(model.get('obj.foo!.!.'), '.bar11', 'Get Object Double Dot at last');
        assert.equal(model.get('obj.foo!bar'), '!bar12', 'Get Object Exclamation in name');
        assert.equal(model.get('obj.!foo'), '!bar13', 'Get Object Exclamation at first');
        assert.equal(model.get('obj.foo!'), '!bar14', 'Get Object Exclamation at last');
        assert.equal(model.get('obj.foo!!.bar'), '!.bar15', 'Get Object ExclamationDot in name');
        assert.equal(model.get('obj.!!.foo'), '!.bar16', 'Get Object ExclamationDot at first');
        assert.equal(model.get('obj.foo!!.'), '!.bar17', 'Get Object ExclamationDot at last');
    });

    QUnit.test('previousAttributes()', function (assert) {
        var first = {
                second: 'bar'
            },
            obj = {
                first: first
            },
            model = new (Backbone.Ribs.Model.extend({
                deepPrevious: true,

                defaults: {
                    foo: obj
                }
            }))();

        model.set('foo', 'bar');

        var prev = model.previousAttributes();

        assert.equal(prev.foo === obj, false, 'Deep clone previous');
        assert.equal(prev.foo.first === first, false, 'Deep clone previous second level');
    });
});