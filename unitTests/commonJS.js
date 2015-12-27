//JSHint settings
/* globals QUnit: false */

QUnit.test('CommonJS', function (assert) {
    'use strict';

    assert.equal(typeof window.module.exports.Model, 'function');
});