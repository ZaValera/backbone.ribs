$(function () {
    var Model = Backbone.Ribs.Model.extend({
            defaults: {
                'foo1.foo1': 'bar1'
            }
        }),
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
            fn: fn,
            'foo2.foo2': 'bar2'
        });

    //window.testModel = model;
    //window.testBackboneModel = backboneModel;

    module('GET');
    test('Simple GET', function () {
        equal(model.get(), undefined, 'Get undefined');

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
        equal(model.get('foo1!.foo1'), 'bar1', 'Get Default Element with comma');

        equal(model.get('foo2!.foo2'), 'bar2', 'Get Element with comma');

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
    });

    module('Bindings');
    test('Simple Bindings', function () {
        var model = new Backbone.Ribs.Model({
            toggle1: true,
            toggle2: false,
            foo: 'foo',
            bar: 123,
            color: 'red',
            type: 'someType',
            active: true,
            template: '<div class="bind-template">fooBar</div>',
            disabled1: true,
            disabled2: false,
            enabled1: false,
            enabled2: true,
            singleChecked: true,
            checked: ['second', 'third'],
            radio: 'second',
            num: 15
        });

        var model2 = new Backbone.Ribs.Model({
            num: 13,
            weight: 900,
            id: 13,
            passive: false
        });

        var col = new Backbone.Collection([{a: 2},{a: 4},{a: 3}]);
        var col2 = new Backbone.Collection([{b: 7},{b: 5},{b: 6}]);


        /*var col  = new Backbone.Collection([{a: 3},{a: 4},{a: 5}]);
        var col2 = new Backbone.Collection([{b: 2},{b: 3},{b: 7}]);*/

        var BindingView = Backbone.Ribs.View.extend({
            bindings: {
                '.bind-toggle1': 'toggle:model.toggle1',
                '.bind-toggle2': 'toggle:model.toggle2',
                '.bind-text':'text:model.foo',
                '.bind-value':'value:model.bar',
                '.bind-css':'css:{color:model.color,font-weight:model2.weight}',
                '.bind-attr':'attr:{data-type:model.type,data-id:model2.id}',
                '.bind-classes':'classes:{bind-classes_active:model.active,bind-classes_passive:model2.passive}',
                '.bind-html':'html:model.template',
                '.bind-disabled1':'disabled:model.disabled1',
                '.bind-disabled2':'disabled:model.disabled2',
                '.bind-enabled1':'enabled:model.enabled1',
                '.bind-enabled2':'enabled:model.enabled2',
                '.bind-single-checked':'checked:model.singleChecked',
                '.bind-mlt-checked':'checked:model.checked',
                '.bind-radio-checked':'checked:model.radio',
                '.bind-with-filter':'text:summ(model.num,model2.num)',
                '.bind-col-filter':'text:colFilter(col.a,col2.b)'
            },

            filters: {
                summ: function (a, b) {
                    return a + b;
                },

                colFilter: function (a, b) {
                    var sum = 0,
                        l = a.length > b.length ? a.length : b.length;

                    for (var i = 0; i < l; i++) {
                        sum += (a[i] || 1)*(b[i] || 1);
                    }

                    return sum;
                }
            },

            initialize: function () {
                this.setElement('.bind');

                this.model = model;
                this.model2 = model2;

                this.col = col;
                this.col2 = col2;
            }
        });

        var bindingView = new BindingView();

        equal($('.bind-toggle1:visible').length, 1, 'ToggleTrue');
        model.set('toggle1', false);
        equal($('.bind-toggle1:hidden').length, 1, 'ToggleTrue changed');

        equal($('.bind-toggle2:hidden').length, 1, 'ToggleFalse');
        model.set('toggle2', true);
        equal($('.bind-toggle2:visible').length, 1, 'ToggleFalse changed');

        equal($('.bind-text').text(), 'foo', 'Text');
        model.set('foo', 'newfoo');
        equal($('.bind-text').text(), 'newfoo', 'Text changed');

        equal($('.bind-value').val(), '123', 'Value');
        model.set('bar', 321);
        equal($('.bind-value').val(), '321', 'Value model changed');
        $('.bind-value').val(333).change();
        equal(model.get('bar'), '333', 'Value input changed');

        equal($('.bind-css').attr('style'), 'color: red; font-weight: 900;', 'Css');
        model.set('color', 'blue');
        model2.set('weight', 300);
        equal($('.bind-css').attr('style'), 'color: blue; font-weight: 300;', 'Css changed');

        equal($('.bind-attr').attr('data-type'), 'someType', 'Attr Type');
        equal($('.bind-attr').attr('data-id'), '13', 'Attr Id');
        model.set('type', 'someNewType');
        model2.set('id', '31');
        equal($('.bind-attr').attr('data-type'), 'someNewType', 'Attr Type changed');
        equal($('.bind-attr').attr('data-id'), '31', 'Attr Id changed');

        equal($('.bind-classes').hasClass('bind-classes_active'), true, 'Classes Active');
        equal($('.bind-classes').hasClass('bind-classes_passive'), false, 'Classes Passive');
        model.set('active', false);
        model2.set('passive', true);
        equal($('.bind-classes').hasClass('bind-classes_active'), false, 'Classes Active changed');
        equal($('.bind-classes').hasClass('bind-classes_passive'), true, 'Classes Passive changed');

        equal($('.bind-html').html(), '<div class="bind-template">fooBar</div>', 'Html');
        model.set('template', '<span class="bind-template">newfooBar</span>');
        equal($('.bind-html').html(), '<span class="bind-template">newfooBar</span>', 'Html changed');

        equal($('.bind-disabled1').prop('disabled'), true, 'DisabledTrue');
        model.set('disabled1', false);
        equal($('.bind-disabled1').prop('disabled'), false, 'DisabledTrue changed');
        equal($('.bind-disabled2').prop('disabled'), false, 'DisabledFalse');
        model.set('disabled2', true);
        equal($('.bind-disabled2').prop('disabled'), true, 'DisabledFalse changed');

        equal($('.bind-enabled1').prop('disabled'), true, 'EnabledTrue');
        model.set('enabled1', true);
        equal($('.bind-enabled1').prop('disabled'), false, 'EnabledTrue changed');
        equal($('.bind-enabled2').prop('disabled'), false, 'EnabledFalse');
        model.set('enabled2', false);
        equal($('.bind-enabled2').prop('disabled'), true, 'EnabledFalse changed');

        equal($('.bind-single-checked').prop('checked'), true, 'SingleChecked');
        model.set('singleChecked', false);
        equal($('.bind-single-checked').prop('checked'), false, 'SingleChecked model changed');
        $('.bind-single-checked').prop('checked', true).change();
        equal(model.get('singleChecked'), true, 'SingleChecked checkbox changed');

        equal($('.bind-mlt-checked[value="first"]').prop('checked'), false, 'MltChecked First');
        equal($('.bind-mlt-checked[value="second"]').prop('checked'), true, 'MltChecked Second');
        equal($('.bind-mlt-checked[value="third"]').prop('checked'), true, 'MltChecked Third');
        model.set('checked', ['first']);
        equal($('.bind-mlt-checked[value="first"]').prop('checked'), true, 'MltChecked First model changed');
        equal($('.bind-mlt-checked[value="second"]').prop('checked'), false, 'MltChecked Second model changed');
        equal($('.bind-mlt-checked[value="third"]').prop('checked'), false, 'MltChecked Third model changed');
        $('.bind-mlt-checked[value="first"]').prop('checked', false).change();
        $('.bind-mlt-checked[value="third"]').prop('checked', true).change();
        deepEqual(model.get('checked'), ['third'], 'MltChecked checkbox changed');

        equal($('.bind-radio-checked[value="first"]').prop('checked'), false, 'RadioChecked First');
        equal($('.bind-radio-checked[value="second"]').prop('checked'), true, 'RadioChecked Second');
        equal($('.bind-radio-checked[value="third"]').prop('checked'), false, 'RadioChecked Third');
        model.set('radio', 'first');
        equal($('.bind-radio-checked[value="first"]').prop('checked'), true, 'RadioChecked First model changed');
        equal($('.bind-radio-checked[value="second"]').prop('checked'), false, 'RadioChecked Second model changed');
        equal($('.bind-radio-checked[value="third"]').prop('checked'), false, 'RadioChecked Third model changed');
        $('.bind-radio-checked[value="third"]').prop('checked', true).change();
        equal(model.get('radio'), 'third', 'RadioChecked radio changed');

        equal($('.bind-with-filter').text(), '28', 'Filter');
        model.set('num', 21);
        model2.set('num', 35);
        equal($('.bind-with-filter').text(), '56', 'Filter changed');

        equal($('.bind-col-filter').text(), '52', 'Col Filter');
        col.at(1).set('a', 5);
        col2.at(2).set('b', 2);
        equal($('.bind-col-filter').text(), '45', 'Col Filter changed');
        col.add({'a': 4});
        equal($('.bind-col-filter').text(), '49', 'Col Filter add 1');
        col2.add({'b': 3});
        equal($('.bind-col-filter').text(), '57', 'Col Filter add 2');
        col.remove(col.at(0));
        equal($('.bind-col-filter').text(), '61', 'Col Filter remove 1');
        col2.remove(col2.at(1));
        equal($('.bind-col-filter').text(), '53', 'Col Filter remove 2');
        col.comparator = 'a';
        col.sort();
        equal($('.bind-col-filter').text(), '44', 'Col Filter sort 1');
        col2.comparator = 'b';
        col2.sort();
        equal($('.bind-col-filter').text(), '53', 'Col Filter sort 2');
        col.reset();
        equal($('.bind-col-filter').text(), '12', 'Col Filter reset 1');
        col2.reset();
        equal($('.bind-col-filter').text(), '0', 'Col Filter reset 2');
    });

    test('Collection Bindings', function () {
        var col = new Backbone.Collection([{a: 2},{a: 6},{a: 4}]);

        var ItemView = Backbone.View.extend({

            initialize: function () {
                this.setElement('<div class="item-view">' + this.model.get('a') + '</div>');
            }
        });

        var CollectionView = Backbone.Ribs.View.extend({

            bindings: {
                'el': 'collection:{col:collection,view:ItemView}'
            },

            ItemView: ItemView,

            initialize: function () {
                this.collection = col;
                this.collection;
                this.setElement('.bind-col');
            }
        });

        var colView = window.colView = new CollectionView();

        var $items = colView.$el.children('.item-view');

        equal($items.length, 3, 'Init Coll Length');

        equal($items.filter(':eq(0)').text(), 2, 'Init 1');
        equal($items.filter(':eq(1)').text(), 6, 'Init 2');
        equal($items.filter(':eq(2)').text(), 4, 'Init 3');

        col.comparator = 'a';
        col.sort();
        $items = colView.$el.children('.item-view');
        equal($items.filter(':eq(0)').text(), 2, 'Sort 1');
        equal($items.filter(':eq(1)').text(), 4, 'Sort 2');
        equal($items.filter(':eq(2)').text(), 6, 'Sort 3');

        col.reset();
        $items = colView.$el.children('.item-view');
        equal($items.length, 0, 'Coll Length After reset');

        col.add({a: 3});
        col.comparator = undefined;
        $items = colView.$el.children('.item-view');
        equal($items.length, 1, 'Coll Length After add first');
        equal($items.filter(':eq(0)').text(), 3, 'Add First');

        col.add({a: 2});
        $items = colView.$el.children('.item-view');
        equal($items.length, 2, 'Coll Length After add second');
        equal($items.filter(':eq(0)').text(), 3, 'Add Second 1');
        equal($items.filter(':eq(1)').text(), 2, 'Add Second 2');

        col.add({a: 4}, {at: 0});
        $items = colView.$el.children('.item-view');
        equal($items.length, 3, 'Coll Length After add at 0');
        equal($items.filter(':eq(0)').text(), 4, 'Add at 0 1');
        equal($items.filter(':eq(1)').text(), 3, 'Add at 0 2');
        equal($items.filter(':eq(2)').text(), 2, 'Add at 0 3');

        col.add({a: 5}, {at: 2});
        $items = colView.$el.children('.item-view');
        equal($items.length, 4, 'Coll Length After add at 2');
        equal($items.filter(':eq(0)').text(), 4, 'Add at 2 1');
        equal($items.filter(':eq(1)').text(), 3, 'Add at 2 2');
        equal($items.filter(':eq(2)').text(), 5, 'Add at 2 3');
        equal($items.filter(':eq(3)').text(), 2, 'Add at 2 4');

        col.add({a: 6});
        $items = colView.$el.children('.item-view');
        equal($items.length, 5, 'Coll Length After add last');
        equal($items.filter(':eq(0)').text(), 4, 'Add last 1');
        equal($items.filter(':eq(1)').text(), 3, 'Add last 2');
        equal($items.filter(':eq(2)').text(), 5, 'Add last 3');
        equal($items.filter(':eq(3)').text(), 2, 'Add last 4');
        equal($items.filter(':eq(4)').text(), 6, 'Add last 5');

        col.remove(col.at(3));
        $items = colView.$el.children('.item-view');
        equal($items.length, 4, 'Coll Length After remove');
        equal($items.filter(':eq(0)').text(), 4, 'Remove 1');
        equal($items.filter(':eq(1)').text(), 3, 'Remove 2');
        equal($items.filter(':eq(2)').text(), 5, 'Remove 3');
        equal($items.filter(':eq(3)').text(), 6, 'Remove 4');

        colView.removeBindings();
        $items = colView.$el.children('.item-view');
        equal($items.length, 0, 'Coll Length After removing bindings');

        colView.applyBindings();
        $items = colView.$el.children('.item-view');
        equal($items.length, 4, 'Coll Length After applying bindings');
    });

    test('Bindings methods', function () {
        var model = new Backbone.Ribs.Model({
            foo: 'foo',
            bar: 123
        });

        var col = window.col = new Backbone.Collection([{a: 2}]);

        var ItemView = Backbone.View.extend({
            initialize: function () {
                this.setElement('<div class="item-view">' + this.model.get('a') + '</div>');
            }
        });

        var BindingView = Backbone.Ribs.View.extend({
            bindings: {
                '.met-bind-text':'text:model.foo',
                '.met-remove-bind-text':'text:model.foo',
                '.met-bind-col': 'collection:{col:col,view:ItemView}'
            },

            initialize: function () {
                this.preventBindings();
                this.setElement('.met-bind');

                this.model = model;
                this.col = col;
                this.ItemView = ItemView;
            }
        });

        var bindingView = window.bindingView = new BindingView();

        equal($('.met-bind-text').text(), '', 'Prevent simple binding');

        var $items = bindingView.$('.met-bind-col').children('.item-view');
        equal($items.length, 0, 'Prevent col binding');

        bindingView.applyBindings();

        equal($('.met-bind-text').text(), 'foo', 'Apply simple binding');

        $items = bindingView.$('.met-bind-col').children('.item-view');
        equal($items.length, 1, 'Apply col binding');

        bindingView.addBinding('.met-add-bind-text','text:model.bar');
        equal($('.met-add-bind-text').text(), '123', 'Add binding');

        bindingView.$el.append('<span class="met-bind-text met-bind-text_added"></span>');
        bindingView.updateBindings();
        equal($('.met-bind-text_added').text(), 'foo', 'Update bindings');

        bindingView.applyCollection('.met-apply-col', col, ItemView);
        $items = bindingView.$('.met-apply-col').children('.item-view');
        equal($items.length, 1, 'Apply collection');

        col.add({a: 5}, {silent: true});
        bindingView.renderCollection(col, bindingView.$('.met-apply-col'));
        $items = bindingView.$('.met-apply-col').children('.item-view');
        equal($items.length, 2, 'Render certain collection 1');
        $items = bindingView.$('.met-bind-col').children('.item-view');
        equal($items.length, 1, 'Render certain collection 2');

        col.add({a: 3}, {silent: true});
        bindingView.renderCollection(col);
        $items = bindingView.$('.met-apply-col').children('.item-view');
        equal($items.length, 3, 'Render all collections 1');
        $items = bindingView.$('.met-bind-col').children('.item-view');
        equal($items.length, 3, 'Render all collections 2');

        bindingView.removeBindings();
        col.add({a: 8});
        col.reset([{a: 7}, {a: 9}, {a: 4}]);
        col.remove(col.at(0));
        col.comparator = 'a';
        col.sort();
        $items = bindingView.$('.met-apply-col').children('.item-view');
        equal($items.length, 0, 'Remove col binding 1');
        $items = bindingView.$('.met-bind-col').children('.item-view');
        equal($items.length, 0, 'Remove col binding 2');
        model.set('foo', 'remove');
        equal($('.met-remove-bind-text').text(), 'foo', 'Remove simple binding');
    });

    test('Computeds methods', function () {
        var model = window.m2 =  new (Backbone.Ribs.Model.extend({
            computeds: {
                comp1: {
                    deps: ['bar1'],
                    get: function (bar1) {
                        return bar1 * 10;
                    }
                },

                comp2: {
                    deps: ['comp1', 'comp3', 'comp4'],
                    get: function (comp1, comp3, comp4) {
                        return comp1 + ' ' + comp3 + ' ' + comp4;
                    }
                },

                comp3: {
                    deps: ['bar2'],
                    get: function (bar2) {
                        return bar2 * 10;
                    }
                },

                comp4: function () {
                    return 5;
                }
            },

            defaults: {
                bar1: 10,
                bar2: 20
            }
        }));

        equal(model.get('comp2'), '100 200 5', 'Computed deps other computeds');

        model.set('bar2', 25);

        equal(model.get('comp2'), '100 250 5', 'Set deps');

        model.set('bar1', 15, {silent: true});
        equal(model.get('comp1'), 100, 'Silent set deps');

        model.trigger('change:bar1');
        equal(model.get('comp1'), 150, 'Trigger after silent');

        model.attributes.bar2 = 30;
        model.trigger('change:bar2');
        equal(model.get('comp3'), 300, 'Trigger after change attributes');
    });
});