//JSHint settings
/* globals $: false */
/* globals QUnit: false */
/* globals Backbone: false */

QUnit.module('Bindings', {
    afterEach: function () {
        'use strict';

        this.bindingView.remove();
    }
}, function () {
    'use strict';

    QUnit.module('Standart', function () {

        QUnit.test('toggle', function (assert) {
            var model = new Backbone.Model({
                toggle1: true,
                toggle2: false
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-toggle1': {
                        toggle: 'model.toggle1'
                    },
                    '.bind-toggle2': {
                        toggle: 'model.toggle2'
                    }
                },

                el: '<div class="bind">' +
                '<div class="bind-toggle1">1</div>' +
                '<div class="bind-toggle2">2</div>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            assert.equal($('.bind-toggle1:visible').length, 1, 'ToggleTrue');
            assert.equal($('.bind-toggle2:hidden').length, 1, 'ToggleFalse');

            model.set('toggle1', false);
            model.set('toggle2', true);

            assert.equal($('.bind-toggle1:hidden').length, 1, 'ToggleTrue changed');
            assert.equal($('.bind-toggle2:visible').length, 1, 'ToggleFalse changed');
        });

        QUnit.test('text', function (assert) {
            var model = new Backbone.Model({
                foo: 'bar'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-text': {
                        text: 'model.foo'
                    }
                },

                el: '<div class="bind">' +
                '<div class="bind-text">1</div>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-text');

            assert.equal($el.text(), 'bar', 'Text');

            model.set('foo', 'newbar');
            assert.equal($el.text(), 'newbar', 'Text changed');
        });

        QUnit.test('value', function (assert) {
            var model = new Backbone.Model({
                foo: 'bar'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-value': {
                        value: 'model.foo'
                    }
                },

                el: '<div class="bind">' +
                '<input class="bind-value" value="1"/>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-value');

            assert.equal($el.val(), 'bar', 'Text');

            model.set('foo', 'newbar');
            assert.equal($el.val(), 'newbar', 'Text changed');

            $el.val('barnew').change();
            assert.equal(model.get('foo'), 'barnew', 'Value input changed');
        });

        QUnit.test('css', function (assert) {
            var model = new Backbone.Model({
                color: 'red'
            });

            var model2 = new Backbone.Model({
                weight: 900
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-css': {
                        css: {
                            'color': 'model.color',
                            'font-weight': 'model2.weight'
                        }
                    }
                },

                el: '<div class="bind">' +
                '<div class="bind-css">1</div>' +
                '</div>',

                initialize: function () {
                    this.model = model;
                    this.model2 = model2;

                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-css');

            assert.equal($el.attr('style').trim(), 'color: red; font-weight: 900;', 'Css');

            model.set('color', 'blue');
            model2.set('weight', 300);
            assert.equal($el.attr('style').trim(), 'color: blue; font-weight: 300;', 'Css changed');
        });

        QUnit.test('attr', function (assert) {
            var model = new Backbone.Model({
                type: 'someType'
            });

            var model2 = new Backbone.Model({
                id: '13'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-attr': {
                        attr: {
                            'data-type': 'model.type',
                            'data-id': 'model2.id'
                        }
                    }
                },

                el: '<div class="bind">' +
                '<div class="bind-attr">1</div>' +
                '</div>',

                initialize: function () {
                    this.model = model;
                    this.model2 = model2;

                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-attr');

            assert.equal($el.attr('data-type'), 'someType', 'Attr Type');
            assert.equal($el.attr('data-id'), '13', 'Attr Id');

            model.set('type', 'someNewType');
            model2.set('id', '31');
            assert.equal($el.attr('data-type'), 'someNewType', 'Attr Type changed');
            assert.equal($el.attr('data-id'), '31', 'Attr Id changed');
        });

        QUnit.test('classes', function (assert) {
            var model = new Backbone.Model({
                active: true
            });

            var model2 = new Backbone.Model({
                passive: false
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-classes': {
                        classes: {
                            'bind-classes_active': 'model.active',
                            'bind-classes_passive': 'model2.passive'
                        }
                    }
                },

                el: '<div class="bind">' +
                '<div class="bind-classes">1</div>' +
                '</div>',

                initialize: function () {
                    this.model = model;
                    this.model2 = model2;

                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-classes');

            assert.equal($el.hasClass('bind-classes_active'), true, 'Classes Active');
            assert.equal($el.hasClass('bind-classes_passive'), false, 'Classes Passive');

            model.set('active', false);
            model2.set('passive', true);
            assert.equal($el.hasClass('bind-classes_active'), false, 'Classes Active changed');
            assert.equal($el.hasClass('bind-classes_passive'), true, 'Classes Passive changed');
        });

        QUnit.test('html', function (assert) {
            var model = new Backbone.Model({
                template: '<div class="bind-template">fooBar</div>'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-html': {
                        html: 'model.template'
                    }
                },

                el: '<div class="bind">' +
                '<div class="bind-html">1</div>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-html');

            assert.equal($el.html(), '<div class="bind-template">fooBar</div>', 'Html');

            model.set('template', '<span class="bind-template2">newfooBar</span>');
            assert.equal($el.html(), '<span class="bind-template2">newfooBar</span>', 'Html changed');
        });

        QUnit.test('disabled', function (assert) {
            var model = new Backbone.Model({
                disabled1: true,
                disabled2: false
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-disabled1': {
                        disabled: 'model.disabled1'
                    },
                    '.bind-disabled2': {
                        disabled: 'model.disabled2'
                    }
                },

                el: '<div class="bind">' +
                '<input type="button" class="bind-disabled1"/>' +
                '<input type="button" class="bind-disabled2"/>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            var $el1 = $('.bind-disabled1');
            var $el2 = $('.bind-disabled2');


            assert.equal($el1.prop('disabled'), true, 'DisabledTrue');
            assert.equal($el2.prop('disabled'), false, 'DisabledFalse');

            model.set('disabled1', false);
            model.set('disabled2', true);
            assert.equal($el1.prop('disabled'), false, 'DisabledTrue changed');
            assert.equal($el2.prop('disabled'), true, 'DisabledFalse changed');
        });

        QUnit.test('enabled', function (assert) {
            var model = new Backbone.Model({
                enabled1: false,
                enabled2: true
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-enabled1': {
                        enabled: 'model.enabled1'
                    },
                    '.bind-enabled2': {
                        enabled: 'model.enabled2'
                    }
                },

                el: '<div class="bind">' +
                '<input type="button" class="bind-enabled1"/>' +
                '<input type="button" class="bind-enabled2"/>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            var $el1 = $('.bind-enabled1');
            var $el2 = $('.bind-enabled2');

            assert.equal($el1.prop('disabled'), true, 'EnabledTrue');
            assert.equal($el2.prop('disabled'), false, 'EnabledFalse');

            model.set('enabled1', true);
            model.set('enabled2', false);
            assert.equal($el1.prop('disabled'), false, 'EnabledTrue changed');
            assert.equal($el2.prop('disabled'), true, 'EnabledFalse changed');
        });

        QUnit.test('checked single', function (assert) {
            var model = new Backbone.Model({
                checked: true
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-checked': {
                        checked: 'model.checked'
                    }
                },

                el: '<div class="bind">' +
                '<input type="checkbox" class="bind-checked"/>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-checked');

            assert.equal($el.prop('checked'), true, 'SingleChecked');

            model.set('checked', false);
            assert.equal($el.prop('checked'), false, 'SingleChecked model changed');

            $el.prop('checked', true).change();
            assert.equal(model.get('checked'), true, 'SingleChecked checkbox changed');
        });

        QUnit.test('checked multi', function (assert) {
            var model = new Backbone.Model({
                checked: ['second', 'third']
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-checked': {
                        checked: 'model.checked'
                    }
                },

                el: '<div class="bind">' +
                '<input type="checkbox" class="bind-checked" name="checkbox" value="first"/>' +
                '<input type="checkbox" class="bind-checked" name="checkbox" value="second"/>' +
                '<input type="checkbox" class="bind-checked" name="checkbox" value="third"/>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            var $first = $('.bind-checked[value="first"]');
            var $second = $('.bind-checked[value="second"]');
            var $third = $('.bind-checked[value="third"]');

            assert.equal($first.prop('checked'), false, 'MltChecked First');
            assert.equal($second.prop('checked'), true, 'MltChecked Second');
            assert.equal($third.prop('checked'), true, 'MltChecked Third');

            model.set('checked', ['first']);
            assert.equal($first.prop('checked'), true, 'MltChecked First model changed');
            assert.equal($second.prop('checked'), false, 'MltChecked Second model changed');
            assert.equal($third.prop('checked'), false, 'MltChecked Third model changed');

            $first.prop('checked', false).change();
            $third.prop('checked', true).change();
            assert.deepEqual(model.get('checked'), ['third'], 'MltChecked checkbox changed');
        });

        QUnit.test('checked radio', function (assert) {
            var model = new Backbone.Model({
                checked: 'second'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-checked': {
                        checked: 'model.checked'
                    }
                },

                el: '<div class="bind">' +
                '<input type="radio" class="bind-checked" name="radio" value="first"/>' +
                '<input type="radio" class="bind-checked" name="radio" value="second"/>' +
                '<input type="radio" class="bind-checked" name="radio" value="third"/>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            var $first = $('.bind-checked[value="first"]');
            var $second = $('.bind-checked[value="second"]');
            var $third = $('.bind-checked[value="third"]');

            assert.equal($first.prop('checked'), false, 'RadioChecked First');
            assert.equal($second.prop('checked'), true, 'RadioChecked Second');
            assert.equal($third.prop('checked'), false, 'RadioChecked Third');

            model.set('checked', 'first');
            assert.equal($first.prop('checked'), true, 'RadioChecked First model changed');
            assert.equal($second.prop('checked'), false, 'RadioChecked Second model changed');
            assert.equal($third.prop('checked'), false, 'RadioChecked Third model changed');

            $third.prop('checked', true).change();
            assert.equal(model.get('checked'), 'third', 'RadioChecked radio changed');
        });

        QUnit.test('mod', function (assert) {
            var model = new Backbone.Ribs.Model({
                mod: 'start',
                mod2: {
                    subMod: 'full'
                }
            });

            var model2 = new Backbone.Model({
                mod: 'active'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-mod1': {
                        mod: {
                            'bind-mod1_': 'model.mod',
                            'bind-mod_': 'model.mod2.subMod'
                        }
                    },
                    '.bind-mod2': {
                        mod: [
                            {'bind-mod2_': 'model.mod'},
                            {'bind-mod2_': 'model.mod2.subMod'},
                            {'bind-mod2_': 'model2.mod'}
                        ]
                    }
                },

                el: '<div class="bind">' +
                '<span class="bind-mod1"></span>' +
                '<span class="bind-mod2"></span>' +
                '</div>',

                initialize: function () {
                    this.model = model;
                    this.model2 = model2;

                    this.$el.appendTo('body');
                }
            }))();

            var $mod1 = $('.bind-mod1');
            var $mod2 = $('.bind-mod2');

            assert.equal($mod1.hasClass('bind-mod1_start'), true, 'Single Mod 1');
            assert.equal($mod1.hasClass('bind-mod_full'), true, 'Single Mod 2');
            assert.equal($mod2.hasClass('bind-mod2_start'), true, 'Multi Mod 1');
            assert.equal($mod2.hasClass('bind-mod2_full'), true, 'Multi Mod 2');
            assert.equal($mod2.hasClass('bind-mod2_active'), true, 'Multi Mod 3');

            model.set('mod', 'stop');
            model.set('mod2.subMod', 'empty');
            model2.set('mod', 'blocked');

            assert.equal($mod1.hasClass('bind-mod1_start'), false, 'Single Mod remove');
            assert.equal($mod1.hasClass('bind-mod_full'), false, 'Single Mod 2 remove');
            assert.equal($mod2.hasClass('bind-mod2_start'), false, 'Multi Mod 1 remove');
            assert.equal($mod2.hasClass('bind-mod2_full'), false, 'Multi Mod 2 remove');
            assert.equal($mod2.hasClass('bind-mod2_active'), false, 'Multi Mod 3 remove');

            assert.equal($mod1.hasClass('bind-mod1_stop'), true, 'Single Mod changed');
            assert.equal($mod1.hasClass('bind-mod_empty'), true, 'Single Mod 2 changed');
            assert.equal($mod2.hasClass('bind-mod2_stop'), true, 'Multi Mod 1 changed');
            assert.equal($mod2.hasClass('bind-mod2_empty'), true, 'Multi Mod 2 changed');
            assert.equal($mod2.hasClass('bind-mod2_blocked'), true, 'Multi Mod 3 changed');
        });

        QUnit.test('options', function (assert) {
            var model = new Backbone.Model({
                optionsSingle: '3',
                optionsMultiple: ['2', '4']
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-options-single': {
                        options: 'model.optionsSingle'
                    },
                    '.bind-options-multiple': {
                        options: 'model.optionsMultiple'
                    }
                },

                el: '<div class="bind">' +
                    '<select class="bind-options-single">' +
                        '<option value="1">1</option>' +
                        '<option value="2">2</option>' +
                        '<option value="3">3</option>' +
                        '<option value="4">4</option>' +
                    '</select>' +
                    '<select class="bind-options-multiple" multiple>' +
                        '<option value="1">a</option>' +
                        '<option value="2">b</option>' +
                        '<option value="3">c</option>' +
                        '<option value="4">d</option>' +
                    '</select>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            var $single = $('.bind-options-single');
            var $multiple = $('.bind-options-multiple');

            assert.equal($single.val(), '3', 'Single Options');
            assert.deepEqual($multiple.val(), ['2', '4'], 'Multiple Options');

            model.set('optionsSingle', '2');
            model.set('optionsMultiple', ['1', '3']);
            assert.equal($single.val(), '2', 'Single Options changed');
            assert.deepEqual($multiple.val(), ['1', '3'], 'Multiple Options changed');

            $multiple.val(['2']).change();
            assert.deepEqual($multiple.val(), ['2'], 'Multiple Options select changed');
        });

        QUnit.test('inDOM el', function (assert) {
            var model = new Backbone.Model({
                isVisible: false,
                text: 'foo'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    'el': {
                        inDOM: 'model.isVisible'
                    }
                },

                el: '<div class="in-dom">' +
                    '<div class="in-dom-first">' +
                        '<div class="in-dom-second">' +
                            '<span class="in-dom-third"></span>' +
                        '</div>' +
                    '</div>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.appendTo($('body'));
                }
            }))();

            assert.equal($('.in-dom').length, 0, 'el init');

            model.set('isVisible', true);
            assert.equal($('.in-dom').length, 1, 'el set visible');

            model.set('isVisible', false);
            assert.equal($('.in-dom').length, 0, 'el set invisible');

            this.bindingView.removeBindings();
            assert.equal($('.in-dom').length, 1, 'el set visible with removeBindings');

            this.bindingView.addBindings('el', {
                inDOM: 'model.isVisible'
            });
            assert.equal($('.in-dom').length, 0, 'el set invisible with addBindings');
            assert.equal(this.bindingView.$('.in-dom-first .in-dom-third').length, 1, 'select sub child in invisible el');

            this.bindingView.addBindings('.in-dom-third', {
                text: 'model.text'
            });
            model.set('isVisible', true);
            assert.equal($('.in-dom-third').text(), 'foo', 'add binding to sub child in invisible el');
        });

        QUnit.test('inDOM child el', function (assert) {
            var model = new Backbone.Model({
                second: false,
                text: 'foo'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.in-dom-second': {
                        inDOM: 'model.second'
                    }
                },

                el: '<div class="in-dom">' +
                    '<div class="in-dom-first">' +
                        '<div class="in-dom-second">' +
                            '<span class="in-dom-third"></span>' +
                        '</div>' +
                    '</div>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.appendTo($('body'));
                }
            }))();

            assert.equal($('.in-dom-second').length, 0, 'child el init');

            model.set('second', true);
            assert.equal($('.in-dom-second').length, 1, 'child el set visible');

            model.set('second', false);
            assert.equal($('.in-dom-second').length, 0, 'child el set invisible');

            this.bindingView.removeBindings();
            assert.equal($('.in-dom-second').length, 1, 'child el set visible with removeBindings');

            this.bindingView.addBindings('.in-dom-second', {
                inDOM: 'model.second'
            });
            assert.equal($('.in-dom-second').length, 0, 'child el set invisible with addBindings');
            assert.equal(this.bindingView.$('.in-dom-first .in-dom-third').length, 1, 'select sub child in invisible el');

            this.bindingView.addBindings('.in-dom-third', {
                text: 'model.text'
            });
            model.set('second', true);
            assert.equal($('.in-dom-third').text(), 'foo', 'add binding to sub child in invisible el');

        });

    });

    QUnit.module('Processors', function () {

        QUnit.test('not', function (assert) {
            var model = new Backbone.Model({
                toggle: true
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-not-processor': {
                        toggle: {
                            processor: 'not',
                            data: 'model.toggle'
                        }
                    }
                },

                el: '<div class="bind">' +
                    '<div class="bind-not-processor">1</div>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            assert.equal($('.bind-not-processor:hidden').length, 1, 'Toggle with not processor');

            model.set('toggle', false);
            assert.equal($('.bind-not-processor:visible').length, 1, 'Toggle changed with not processor');
        });

        QUnit.test('length', function (assert) {
            var model = new Backbone.Model({
                ar: [1, 2, 3]
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-length-processor': {
                        text: {
                            processor: 'length',
                            data: 'model.ar'
                        }
                    }
                },

                el: '<div class="bind">' +
                    '<span class="bind-length-processor">1</span>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-length-processor');

            assert.equal($el.text(), 3, 'Text with length processor');

            model.set('ar', [1, 2, 3, 4]);
            assert.equal($el.text(), 4, 'Text with length processor changed');

            model.set('ar', '12');
            assert.equal($el.text(), 2, 'Text with length processor changed to string');
        });

        QUnit.test('custom processor', function (assert) {
            var model = new Backbone.Model({
                num: 15,
                num2: 10
            });

            var model2 = new Backbone.Model({
                num: 13
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-with-processor': {
                        text: {
                            processor: 'summ',
                            data: ['model.num', 'model.num2', 'model2.num']
                        }
                    }
                },

                processors: {
                    summ: function (a, b, c) {
                        return a + b + c;
                    }
                },

                el: '<div class="bind">' +
                    '<span class="bind-with-processor">1</span>' +
                '</div>',

                initialize: function () {
                    this.model = model;
                    this.model2 = model2;

                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-with-processor');

            assert.equal($el.text(), '38', 'Processor');
            model.set({'num': 21, 'num2': 14});
            model2.set('num', 35);
            assert.equal($el.text(), '70', 'Processor changed');
        });

        QUnit.test('custom col processor', function (assert) {
            var col = new Backbone.Collection([{a: 2},{a: 4},{a: 3}]);
            var col2 = new Backbone.Collection([{b: 7},{b: 5},{b: 6}]);

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-with-col-processor': {
                        text: {
                            processor: 'colProc',
                            data: ['col.a', 'col2.b']
                        }
                    }
                },

                processors: {
                    colProc: function (a, b) {
                        var sum = 0,
                            l = a.length > b.length ? a.length : b.length;

                        for (var i = 0; i < l; i++) {
                            sum += (a[i] || 1)*(b[i] || 1);
                        }

                        return sum;
                    }
                },

                el: '<div class="bind">' +
                    '<span class="bind-with-col-processor">1</span>' +
                '</div>',

                initialize: function () {
                    this.col = col;
                    this.col2 = col2;

                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-with-col-processor');

            assert.equal($el.text(), '52', 'Col processor');

            col.at(1).set('a', 5);
            col2.at(2).set('b', 2);
            assert.equal($el.text(), '45', 'Col processor changed');

            col.add({'a': 4});
            assert.equal($el.text(), '49', 'Col processor add 1');

            col2.add({'b': 3});
            assert.equal($el.text(), '57', 'Col processor add 2');

            col.remove(col.at(0));
            assert.equal($el.text(), '61', 'Col processor remove 1');

            col2.remove(col2.at(1));
            assert.equal($el.text(), '53', 'Col processor remove 2');

            col.comparator = 'a';
            col.sort();
            assert.equal($el.text(), '44', 'Col processor sort 1');

            col2.comparator = 'b';
            col2.sort();
            assert.equal($el.text(), '53', 'Col processor sort 2');

            col.reset();
            assert.equal($el.text(), '12', 'Col processor reset 1');

            col2.reset();
            assert.equal($el.text(), '0', 'Col processor reset 2');
        });

        QUnit.test('get processor', function (assert) {
            var model = new Backbone.Model({
                lowerCase: 'bar'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-with-get-processor': {
                        text: {
                            data: 'model.lowerCase',
                            processor: function (val) {
                                return val.toUpperCase();
                            }
                        }
                    }
                },

                processors: {
                    summ: function (a, b, c) {
                        return a + b + c;
                    }
                },

                el: '<div class="bind">' +
                    '<span class="bind-with-get-processor">1</span>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-with-get-processor');

            assert.equal($el.text(), 'BAR', 'Text with get processor');

            model.set('lowerCase', 'foo');
            assert.equal($el.text(), 'FOO', 'Text with get processor changed');
        });

        QUnit.test('set processor', function (assert) {
            var model = new Backbone.Model({
                foo: 'ribs'
            });

            var model2 = new Backbone.Model({
                bar: 'test'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-with-get-set-processor': {
                        value: {
                            data: ['model.foo', 'model2.bar'],
                            processor: {
                                get: function (foo, bar) {
                                    return foo + '_' + bar;
                                },
                                set: function (val) {
                                    return val.split('_');
                                }
                            }
                        }
                    }
                },

                processors: {
                    summ: function (a, b, c) {
                        return a + b + c;
                    }
                },

                el: '<div class="bind">' +
                    '<input class="bind-with-get-set-processor"/>' +
                '</div>',

                initialize: function () {
                    this.model = model;
                    this.model2 = model2;

                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-with-get-set-processor');

            assert.equal($el.val(), 'ribs_test', 'Value input with get-set processor');

            model.set('foo', 'ribs2');
            assert.equal($el.val(), 'ribs2_test', 'Value input with get-set processor changed1');

            model2.set('bar', 'test2');
            assert.equal($el.val(), 'ribs2_test2', 'Value input with get-set processor changed2');

            $el.val('test_ribs').change();
            assert.equal(model.get('foo'), 'test', 'Value input with get-set processor changed1');
            assert.equal(model2.get('bar'), 'ribs', 'Value input with get-set processor changed2');
        });

    });

    QUnit.module('Handlers', function () {

        QUnit.test('single get', function (assert) {
            var model = new Backbone.Model({
                single: 'single-attr'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-custom-single': {
                        single: 'model.single'
                    }
                },

                handlers: {
                    single: function ($el, value) {
                        $el.attr('data-single', value);
                    }
                },

                el: '<div class="bind">' +
                    '<div class="bind-custom-single">1</div>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-custom-single');

            assert.equal($el.attr('data-single'), 'single-attr', 'Single custom handler');

            model.set('single', 'next-attr');
            assert.equal($el.attr('data-single'), 'next-attr', 'Single custom handler changed');
        });

        QUnit.test('single set', function (assert) {
            var model = new Backbone.Model({
                single: 'foo'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-custom-single': {
                        single: 'model.single'
                    }
                },

                handlers: {
                    single: {
                        get: function ($el, value) {
                            $el.val(value);
                        },
                        set: function ($el) {
                            return $el.val();
                        }
                    }
                },

                el: '<div class="bind">' +
                    '<input class="bind-custom-single"/>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-custom-single');

            assert.equal($el.val(), 'foo', 'Single custom handler set');

            model.set('single', 'bar');
            assert.equal($el.val(), 'bar', 'Single custom handler set changed');

            $el.val('ribs').change();
            assert.equal(model.get('single'), 'ribs', 'Single custom handler set changed 2');
        });

        QUnit.test('multiple', function (assert) {
            var model = new Backbone.Model({
                multiple1: 'foo',
                multiple2: 'bar'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-custom-multiple': {
                        multiple: {
                            first: 'model.multiple1',
                            second: 'model.multiple2'
                        }
                    }
                },

                handlers: {
                    multiple: {
                        get: function ($el, value, name) {
                            $el.attr('data-' + name, value);
                        },
                        multiple: true
                    }
                },

                el: '<div class="bind">' +
                    '<div class="bind-custom-multiple">1</div>' +
                '</div>',

                initialize: function () {
                    this.model = model;

                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-custom-multiple');

            assert.equal($el.attr('data-first'), 'foo', 'Multiple custom handler 1');
            assert.equal($el.attr('data-second'), 'bar', 'Multiple custom handler 2');

            model.set('multiple1', 'foo2');
            model.set('multiple2', 'bar2');
            assert.equal($el.attr('data-first'), 'foo2', 'Multiple custom handler 1 changed');
            assert.equal($el.attr('data-second'), 'bar2', 'Multiple custom handler 2 changed');
        });

    });

    QUnit.module('Methods', function () {
        QUnit.test('preventBindings() and applyBindings()', function (assert) {
            var model = new Backbone.Model({
                foo: 'bar'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-text': {
                        text: 'model.foo'
                    }
                },

                el: '<div class="bind">' +
                    '<span class="bind-text">ribs</span>' +
                '</div>',

                initialize: function () {
                    this.preventBindings();
                    this.model = model;
                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-text');

            assert.equal($el.text(), 'ribs', 'Text');

            this.bindingView.applyBindings();
            assert.equal($el.text(), 'bar', 'Text');
        });

        QUnit.test('addBindings()', function (assert) {
            var model = new Backbone.Model({
                foo: 'bar'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                el: '<div class="bind">' +
                    '<span class="bind-first"></span>' +
                    '<span class="bind-second"></span>' +
                '</div>',

                initialize: function () {
                    this.model = model;
                    this.$el.appendTo('body');
                }
            }))();

            var $first = $('.bind-first');
            var $second = $('.bind-second');

            assert.equal($first.text(), '', 'Text');
            assert.equal($second.text(), '', 'Text');

            this.bindingView.addBindings('.bind-first', {
                text: 'model.foo'
            });

            this.bindingView.addBindings({
                '.bind-second': {
                    text: 'model.foo'
                }
            });

            assert.equal($first.text(), 'bar', 'Text');
            assert.equal($second.text(), 'bar', 'Text');
        });

        QUnit.test('updateBindings()', function (assert) {
            var model = new Backbone.Model({
                foo: 'bar'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-text': {
                        text: 'model.foo'
                    }
                },

                el: '<div class="bind">' +
                    '<span class="bind-text">ribs</span>' +
                '</div>',

                initialize: function () {
                    this.model = model;
                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('<span class="bind-text">ribs</span>');
            this.bindingView.$el.append($el);
            assert.equal($el.text(), 'ribs', 'Text');

            this.bindingView.updateBindings();
            assert.equal($el.text(), 'bar', 'Text');
        });

        QUnit.test('removeBindings()', function (assert) {
            var model = new Backbone.Model({
                foo: 'bar'
            });

            this.bindingView = new (Backbone.Ribs.View.extend({
                bindings: {
                    '.bind-text': {
                        text: 'model.foo'
                    }
                },

                el: '<div class="bind">' +
                    '<span class="bind-text">ribs</span>' +
                '</div>',

                initialize: function () {
                    this.model = model;
                    this.$el.appendTo('body');
                }
            }))();

            var $el = $('.bind-text');

            assert.equal($el.text(), 'bar', 'Text');

            this.bindingView.removeBindings();
            model.set('foo', 'newBar');
            assert.equal($el.text(), 'bar', 'Text');
        });

        QUnit.test('$(), getEl() and appendTo()', function (assert) {

        });
    });
});