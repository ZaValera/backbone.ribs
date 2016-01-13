//JSHint settings
/* globals QUnit: false */
/* globals Backbone: false */

QUnit.module('SET', function () {
    'use strict';

    QUnit.test('Simple SET', function (assert) {
        var model = new Backbone.Ribs.Model({
            foo1: 'bar1'
        });

        //Сетим существующее поле
        model.set('foo1', 'bar11');

        assert.equal(model.attributes.foo1, 'bar11', 'Set field');
        assert.equal(model.previous('foo1'), 'bar1', 'Set field previous');
        assert.equal(model.changed.foo1, 'bar11', 'Set field changed');

        //Сетим новое поле
        model.set('foo2', 'bar22');

        assert.equal(model.attributes.foo2, 'bar22', 'Set new field');
        assert.equal(model.previous('foo2'), undefined, 'Set new field previous');
        assert.equal(model.changed.foo2, 'bar22', 'Set new field changed');

        //Сетим два поля одновременно (объект)
        model.set({foo1: 'bar111', foo3: 'bar333'});

        assert.equal(model.attributes.foo1, 'bar111', 'Set object field');
        assert.equal(model.previous('foo1'), 'bar11', 'Set object field previous');
        assert.equal(model.changed.foo1, 'bar111', 'Set object field changed');

        assert.equal(model.attributes.foo3, 'bar333', 'Set object new field');
        assert.equal(model.previous('foo3'), undefined, 'Set object new field previous');
        assert.equal(model.changed.foo3, 'bar333', 'Set object new field changed');

        //Работа обработчика onchange
        var flag = false;

        model.on('change:foo1', function (model, val) {flag = val;});
        model.set('foo1', 'bar1');
        assert.equal(flag, 'bar1', 'onchange');

        //Работа обработчика onchange с {silent: true}
        flag = false;

        model.set('foo1', 'bar11', {silent: true});
        assert.equal(flag, false, 'onchange silent');

        //Работа флага {unset: true}
        model.set('foo1', 'bar111', {unset: true});

        assert.equal(model.attributes.foo1, undefined, 'Unset field');
        assert.equal(model.previous('foo1'), 'bar11', 'Unset field previous');
        assert.equal(model.changed.foo1, 'bar111', 'Unset field changed');
    });

    QUnit.test('Deep SET', function (assert) {
        var model = new Backbone.Ribs.Model({
            foo: {bar: 'bar1'},
            bar: {'foo.bar': 1},
            bar1: {'foo!bar': 4},
            bar2: {'foo!.bar': 7}
        });

        assert.equal(model.previous(), null, 'previous of undefined');

        //Сетим существующее поле
        model.set('foo.bar', 'bar11');

        assert.equal(model.attributes.foo.bar, 'bar11', 'Set field');
        assert.equal(model.previous('foo').bar, 'bar11', 'Set field previous');
        assert.equal(model.changed['foo.bar'], 'bar11', 'Set field changed');

        //Сетим существующее поле c "."
        model.set('bar.foo!.bar', 2);

        assert.equal(model.attributes.bar['foo.bar'], 2, 'Set field with dot');
        assert.equal(model.previous('bar')['foo.bar'], 2, 'Set field with dot previous');
        assert.equal(model.changed['bar.foo!.bar'], 2, 'Set field with dot changed');

        //Сетим существующее поле c "!"
        model.set('bar1.foo!bar', 5);

        assert.equal(model.attributes.bar1['foo!bar'], 5, 'Set field with exclamation');
        assert.equal(model.previous('bar1')['foo!bar'], 5, 'Set field with exclamation previous');
        assert.equal(model.changed['bar1.foo!bar'], 5, 'Set field with exclamation changed');

        //Сетим существующее поле c "!."
        model.set('bar2.foo!!.bar', 8);

        assert.equal(model.attributes.bar2['foo!.bar'], 8, 'Set field with exclamationDot');
        assert.equal(model.previous('bar2')['foo!.bar'], 8, 'Set field with exclamationDot previous');
        assert.equal(model.changed['bar2.foo!!.bar'], 8, 'Set field with exclamationDot changed');

        //Сетим новое поле
        model.set('foo.bar2', 'bar2');

        assert.equal(model.attributes.foo.bar2, 'bar2', 'Set new field');
        assert.equal(model.previous('foo').bar2, 'bar2', 'Set new field previous');
        assert.equal(model.changed['foo.bar2'], 'bar2', 'Set new field changed');

        //Сетим новое поле c "."
        model.set('bar.bar!.foo', 3);

        assert.equal(model.attributes.bar['bar.foo'], 3, 'Set new field with dot');
        assert.equal(model.previous('bar')['bar.foo'], 3, 'Set new field with dot previous');
        assert.equal(model.changed['bar.bar!.foo'], 3, 'Set new field with dot changed');

        //Сетим новое поле c "!"
        model.set('bar1.foo1!bar', 6);

        assert.equal(model.attributes.bar1['foo1!bar'], 6, 'Set new field with exclamation');
        assert.equal(model.previous('bar1')['foo1!bar'], 6, 'Set new field with exclamation previous');
        assert.equal(model.changed['bar1.foo1!bar'], 6, 'Set new field with exclamation changed');

        //Сетим новое поле c "!."
        model.set('bar2.foo1!!.bar', 9);

        assert.equal(model.attributes.bar2['foo1!.bar'], 9, 'Set new field with exclamationDot');
        assert.equal(model.previous('bar2')['foo1!.bar'], 9, 'Set new field with exclamationDot previous');
        assert.equal(model.changed['bar2.foo1!!.bar'], 9, 'Set new field with exclamationDot changed');

        //Сетим два поля одновременно (объект)
        model.set({'foo.bar': 'bar111', 'foo.bar3': 'bar333'});

        assert.equal(model.attributes.foo.bar, 'bar111', 'Set object field');
        assert.equal(model.previous('foo').bar, 'bar111', 'Set object field previous');
        assert.equal(model.changed['foo.bar'], 'bar111', 'Set object field changed');

        assert.equal(model.attributes.foo.bar3, 'bar333', 'Set object new field');
        assert.equal(model.previous('foo').bar3, 'bar333', 'Set object new field previous');
        assert.equal(model.changed['foo.bar3'], 'bar333', 'Set object new field changed');

        //Работа обработчика onchange
        var flag = false;

        model.on('change:foo.bar', function (model, val) {flag = val;});
        model.set('foo.bar', 'bar1');
        assert.equal(flag, 'bar1', 'onchange');

        //Работа обработчика onchange с {silent: true}
        flag = false;

        model.set('foo.bar', 'bar11', {silent: true});
        assert.equal(flag, false, 'onchange silent');

        //Работа флага {unset: true}
        model.set('foo.bar', 'bar111', {unset: true});

        assert.deepEqual(model.attributes.foo, {bar2:'bar2', bar3: 'bar333'}, 'Unset field');
        assert.deepEqual(model.previous('foo'), {bar2:'bar2', bar3: 'bar333'}, 'Unset field previous');
        assert.equal(model.changed['foo.bar'], 'bar111', 'Unset field changed');
    });

    QUnit.test('Deep SET deepPrevious', function (assert) {
        var model = new (Backbone.Ribs.Model.extend({
            deepPrevious: true,
            defaults: {
                foo: {bar: 1},
                arr: [1, 2]
            }
        }))();

        model.set('foo.bar', 2);

        assert.equal(model.attributes.foo.bar, 2, 'Set field');
        assert.equal(model.previous('foo.bar'), 1, 'Set field previous');
        assert.equal(model.changed['foo.bar'], 2, 'Set field changed');

        model.set('foo.bar2', 3);

        assert.equal(model.attributes.foo.bar2, 3, 'Set new field');
        assert.equal(model.previous('foo.bar2'), undefined, 'Set new field previous');
        assert.equal(model.changed['foo.bar2'], 3, 'Set new field changed');

        model.set('arr.1', 4);

        assert.equal(model.attributes.arr[1], 4, 'Set array item');
        assert.equal(model.previous('arr.1'), 2, 'Set array item previous');
        assert.equal(model.changed['arr.1'], 4, 'Set array item changed');
    });

    QUnit.test('Deep SET propagation', function (assert) {
        var model = new (Backbone.Ribs.Model.extend({
            defaults: {
                foo: {bar: 1}
            }
        }))();

        var flag = false;

        model.on('change:foo', function () {flag = true;});

        model.set('foo.bar', 2);

        assert.equal(flag, false, 'Set without propagation');

        flag = false;
        model.set('foo.bar2', 3, {propagation: true});

        assert.equal(flag, true, 'Set with propagation');
    });

    QUnit.test('Deep SET in handler', function (assert) {
        var model = new Backbone.Ribs.Model();

        model.on('change:foo', function () {
            model.set('foo.first.second', 2);
        });

        model.set('foo', {first: {second: 1}});

        assert.deepEqual(model.get('foo'), {first: {second: 2}});
        assert.deepEqual(model.changed.foo, {first: {second: 2}});
        assert.equal(model.get('foo.first.second'), 2);
        assert.equal(model.changed['foo.first.second'], 2);
    });

    QUnit.module('Errors', function () {
        QUnit.test('deep set', function (assert) {
            var error;

            try {
                var model = new Backbone.Ribs.Model();

                model.set('foo.bar', 'ribs');
            } catch (e) {
                error = e.message;
            }

            assert.deepEqual(error, "can't set `bar` to `foo`, `foo` is undefined");
        });

        QUnit.test('set to elementary', function (assert) {
            var error;

            try {
                var model = new Backbone.Ribs.Model({
                    foo: 'bar'
                });

                model.set('foo.bar', 'ribs');
            } catch (e) {
                error = e.message;
            }

            assert.deepEqual(error, 'set: can\'t set anything to "foo", typeof == "string"');
        });
    });
});