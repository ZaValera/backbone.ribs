//JSHint settings
/* globals QUnit: false */

QUnit.test('IE10', function (assert) {
    'use strict';

    assert.equal(typeof window.Ribs.Model, 'function');
});