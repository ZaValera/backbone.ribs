//JSHint settings
/* globals $: false */
/* globals QUnit: false */

QUnit.test('Node', function (assert) {
    'use strict';

    assert.equal($('style').length, 0);
});