//JSHint settings
/* globals QUnit: false */

QUnit.test('AMD', function (assert) {
    'use strict';

    assert.equal(typeof window.Ribs.Model, 'function');
});