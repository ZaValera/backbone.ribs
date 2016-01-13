//JSHint settings
/* globals $: false */
/* globals QUnit: false */
/* globals Backbone: false */

QUnit.module('Common', function () {
    'use strict';

    QUnit.test('Model with collection', function (assert) {
        var col = new Backbone.Collection();

        var model = new Backbone.Ribs.Model({foo: 'bar'}, {
            collection: col
        });

        assert.equal(model.collection, col);
    });

    QUnit.test('Model with parse', function (assert) {
        var error = false;

        try {
            var model = new Backbone.Ribs.Model({foo: 'bar'}, {
                parse: true
            });

            var model2 = new (Backbone.Ribs.Model.extend({
                parse: function () {
                }
            }))({foo: 'bar'}, {
                parse: true
            });
        } catch (e) {
            error = true;
        }

        assert.equal(error, false);
    });

    QUnit.test('empty set', function (assert) {
        var model = new Backbone.Ribs.Model();

        assert.equal(model.set(), model);
    });

    QUnit.test('validation with error', function (assert) {
        var model = new (Backbone.Ribs.Model.extend({
            validate: function(attrs) {
                if (attrs.foo > 10) {
                    return 'error';
                }
            }
        }))();

        assert.equal(model.set('foo', 20, {validate: true}), false);
    });

    QUnit.test('style', function (assert) {
        assert.equal($('style')[0].innerText, '.__ribs-hidden {display: none !important;}');
    });
});