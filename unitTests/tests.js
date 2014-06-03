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
        equal(model.previous('foo1'), 'bar1', 'Set field previous');
        equal(model.changed.foo1, 'bar11', 'Set field changed');

        //Сетим новое поле
        model.set('foo2', 'bar22');

        equal(model.attributes.foo2, 'bar22', 'Set new field');
        equal(model.previous('foo2'), undefined, 'Set new field previous');
        equal(model.changed.foo2, 'bar22', 'Set new field changed');

        //Сети два поля одновременно (объект)
        model.set({foo1: 'bar111', foo3: 'bar333'});

        equal(model.attributes.foo1, 'bar111', 'Set object field');
        equal(model.previous('foo1'), 'bar11', 'Set object field previous');
        equal(model.changed.foo1, 'bar111', 'Set object field changed');

        equal(model.attributes.foo3, 'bar333', 'Set object new field');
        equal(model.previous('foo3'), undefined, 'Set object new field previous');
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
        equal(model.previous('foo1'), 'bar11', 'Unset field previous');
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
        equal(model.previous('foo').bar, 'bar11', 'Set field previous');
        equal(model.changed['foo.bar'], 'bar11', 'Set field changed');

        //Сетим новое поле
        model.set('foo.bar2', 'bar2');

        equal(model.attributes.foo.bar2, 'bar2', 'Set new field');
        equal(model.previous('foo').bar2, 'bar2', 'Set new field previous');
        equal(model.changed['foo.bar2'], 'bar2', 'Set new field changed');

        //Сетим два поля одновременно (объект)
        model.set({'foo.bar': 'bar111', 'foo.bar3': 'bar333'});

        equal(model.attributes.foo.bar, 'bar111', 'Set object field');
        equal(model.previous('foo').bar, 'bar111', 'Set object field previous');
        equal(model.changed['foo.bar'], 'bar111', 'Set object field changed');

        equal(model.attributes.foo.bar3, 'bar333', 'Set object new field');
        equal(model.previous('foo').bar3, 'bar333', 'Set object new field previous');
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
        deepEqual(model.previous('foo'), {bar2:'bar2', bar3: 'bar333'}, 'Unset field previous');
        equal(model.changed['foo.bar'], 'bar111', 'Unset field changed');
    });

    module('Computeds');
    test('Get', function () {
        var model = new (Backbone.Ribs.Model.extend({
            computeds: {
                comp1: {
                    deps: ['bar1'],
                    get: function (bar1) {
                        return bar1 * 10;
                    }
                },

                comp2: {
                    deps: ['comp1', 'comp3', 'comp4', 'bar2'],
                    get: function (comp1, comp3, comp4, bar2) {
                        return comp1 + ' ' + comp3 + ' ' + comp4 + ' ' + bar2;
                    }
                },

                comp3: {
                    deps: ['bar2'],
                    get: function (bar2) {
                        return bar2 * 10;
                    }
                },

                comp4: function () {
                    return this.get('bar1')/10;
                },

                comp5: {
                    deps: ['bar!.bar.subBar.deepBar'],
                    get: function (deepBar) {
                        return deepBar * 10;
                    }
                },

                comp6: {
                    deps: ['bar3'],
                    get: function (bar3) {
                        return bar3.subBar * 10;
                    }
                }
            },

            defaults: {
                bar1: 10,
                bar2: 20,
                'bar.bar': {
                    subBar: {
                        deepBar: 50
                    }
                },
                bar3: {
                    subBar: 20
                }
            }
        }));

        equal(model.get('comp4'), 1, 'Get Simple Computed first time');
        equal(model.get('comp2'), '100 200 1 20', 'Get Computed deps on other computed after init');
        equal(model.get('comp1'), 100, 'Get Deps Computed after init');
        equal(model.get('comp3'), 200, 'Get Deps Computed after init 2');

        equal(model.previous('comp4'), undefined, 'Previous Simple Computed after init');
        equal(model.previous('comp2'), undefined, 'Previous Computed deps on other computed after init');
        equal(model.previous('comp1'), undefined, 'Previous Deps Computed after init');
        equal(model.previous('comp3'), undefined, 'Previous Deps Computed after init 2');

        model.set('bar1', 30);
        equal(model.get('comp4'), 3, 'Get Simple Computed after set');
        equal(model.get('comp1'), 300, 'Get Deps Computed after set');
        equal(model.get('comp2'), '300 200 3 20', 'Get Computed deps on other computed after set');

        model.set('bar2', 40, {silent: true});
        equal(model.get('comp3'), 400, 'Get Deps Computed after silent set');

        model.attributes.bar1 = 60;
        model.trigger('change:bar1');
        equal(model.get('comp1'), 600, 'Get Deps Computed after trigger after change attributes');

        equal(model.get('comp5'), 500, 'Get Deps Computed deep');


        model.set('bar!.bar.subBar.deepBar', 60);

        equal(model.get('comp5'), 600, 'Get Deps Computed deep after set first level');

        model.set('bar!.bar.subBar', {
            deepBar: 70
        });

        equal(model.get('comp5'), 700, 'Get Deps Computed deep after set second level');

        model.set('bar!.bar', {
            subBar: {
                deepBar: 80
            }
        });

        equal(model.get('comp5'), 800, 'Get Deps Computed deep after set third level');

        equal(model.get('comp6'), 200, 'Get Deep Deps');
        model.set('bar3.subBar', 30, {bubble: true});
        equal(model.get('comp6'), 300, 'Get Deep Deps after set');
    });
    test('SET', function () {
        var model = new (Backbone.Ribs.Model.extend({
            computeds: {
                comp1: {
                    deps: ['bar1'],
                    get: function (bar1) {
                        return bar1 * 10;
                    },
                    set: function (val) {
                        return {
                            bar1:  val/10
                        }
                    }
                },

                comp2: {
                    deps: ['bar1', 'bar2'],
                    get: function (bar1, bar2) {
                        return bar1 + ' ' + bar2;
                    },
                    set: function (val) {
                        val = val.split(' ');

                        return {
                            bar1:  parseInt(val[0]),
                            bar2: parseInt(val[1])
                        }
                    }
                },

                comp3: {
                    deps: ['bar2', 'comp2'],
                    get: function (bar1, comp2) {
                        return bar1 + '-' + comp2;
                    },
                    set: function (val) {
                        val = val.split('-');

                        return {
                            bar1:  parseInt(val[0]),
                            comp2: val[1]
                        }
                    }
                }
            },

            defaults: {
                bar1: 10,
                bar2: 20
            }
        }));

        model.set('comp1', 300);

        equal(model.get('comp1'), 300, 'Get updated computed');
        equal(model.previous('comp1'), 100, 'Previous computed');
        equal(model.get('bar1'), 30, 'Get deps');
        equal(model.previous('bar1'), 10, 'Previous deps');
        equal(model.get('comp2'), '30 20', 'Get computed deps');
        equal(model.previous('comp2'), '10 20', 'Previous computed deps');

        model.set('comp2', '40 50');

        equal(model.get('comp2'), '40 50', 'Get updated computed 2');

        equal(model.previous('comp2'), '30 20', 'Previous computed 2');

        equal(model.get('bar1'), 40, 'Get deps 2');
        equal(model.get('bar2'), 50, 'Get second deps 2');
        equal(model.previous('bar1'), 30, 'Previous deps 2');
        equal(model.previous('bar2'), 20, 'Previous second deps 2');
        equal(model.get('comp1'), 400, 'Get computed deps 2');
        equal(model.previous('comp1'), 300, 'Previous computed deps 2');
        equal(model.get('comp3'), '50-40 50', 'Get another computed deps 2');

        equal(model.previous('comp3'), '20-30 20', 'Previous computed deps 3');

        model.set('comp3', '60-70 60');
        equal(model.get('comp3'), '60-70 60', 'Get updated computed 3');
        equal(model.previous('comp3'), '50-40 50', 'Previous updated computed 3');
        equal(model.get('bar2'), 60, 'Get deps 3');
        equal(model.previous('bar2'), 50, 'Previous deps 3');
        equal(model.get('comp2'), '70 60', 'Get deps computed 3');
        equal(model.previous('comp2'), '40 50', 'Previous deps computed 3');
        equal(model.get('bar1'), 70, 'Get deps deps 3');
        equal(model.previous('bar1'), 40, 'Previous deps deps 3');
        equal(model.get('comp1'), 700, 'Get deps deps deps 3');
        equal(model.previous('comp1'), 400, 'Previous deps deps deps 3');

        var counter = 0;
        model.on('change:comp1', function () {counter++});
        model.on('change:comp2', function () {counter++});
        model.on('change:comp3', function () {counter++});
        model.on('change:bar1', function () {counter++});
        model.on('change:bar2', function () {counter++});

        model.set('comp3', '80-90 80', {silent: true});
        equal(model.get('comp3'), '80-90 80', 'Get updated computed after silent');
        equal(model.previous('comp3'), '60-70 60', 'Previous updated computed after silent');
        equal(model.get('bar2'), 80, 'Get deps after silent');
        equal(model.previous('bar2'), 60, 'Previous deps after silent');
        equal(model.get('comp2'), '90 80', 'Get deps computed after silent');
        equal(model.previous('comp2'), '70 60', 'Previous deps computed after silent');
        equal(model.get('bar1'), 90, 'Get deps deps after silent');
        equal(model.previous('bar1'), 70, 'Previous deps deps after silent');
        equal(model.get('comp1'), 900, 'Get deps deps deps after silent');
        equal(model.previous('comp1'), 700, 'Previous deps deps deps after silent');
        equal(counter, 0, 'Silent!!!');

        model.set('comp3', '100-110 100', {unset: true});
        equal(model.get('comp3'), undefined, 'Get updated computed after unset');
        equal(model.previous('comp3'), '80-90 80', 'Previous updated computed after unset');
        equal(model.get('bar2'), 100, 'Get deps after unset');
        equal(model.previous('bar2'), 80, 'Previous deps after unset');
        equal(model.get('comp2'), '110 100', 'Get deps computed after unset');
        equal(model.previous('comp2'), '90 80', 'Previous deps computed after unset');
        equal(model.get('bar1'), 110, 'Get deps deps after unset');
        equal(model.previous('bar1'), 90, 'Previous deps deps after unset');
        equal(model.get('comp1'), 1100, 'Get deps deps deps after unset');
        equal(model.previous('comp1'), 900, 'Previous deps deps deps after unset');
    });
    test('Methods', function () {
        var model = new (Backbone.Ribs.Model.extend({
            computeds: {
                comp1: {
                    deps: ['bar1'],
                    get: function (bar1) {
                        return bar1 * 10;
                    }
                },

                comp2: function () {
                    return 5;
                }
            },

            defaults: {
                bar1: 10,
                bar2: 20
            }
        }));

        model.addComputed('comp3', {
            deps: ['bar2'],
            get: function (bar2) {
                return bar2/10;
            }
        });

        equal(model.get('comp3'), '2', 'addComputed');
        model.removeComputed('comp1');
        model.set('bar1', 30);
        equal(model.get('comp1'), undefined, 'removeComputed');
        model.set('comp1', 40);
        equal(model.attributes.comp1, 40, 'Set attr after removeComputed');
        model.set('comp1', 50, {unset: true});
        model.addComputed('comp1', {
            deps: ['bar1'],
            get: function (bar1) {
                return bar1 * 10;
            }
        });
        equal(model.get('comp1'), 300, 'addComputed after unset attr');

        var error = '';

        try {
            model.addComputed('bar1', {
                deps: ['bar2'],
                get: function (bar2) {
                    return bar2 * 10;
                }
            });
        } catch (e) {
            error = e.message;
        }

        equal(error, 'addComputed: computed name "bar1" is already used', 'addComputed - already used attr error');

        error = '';

        try {
            model.addComputed('comp2', {
                deps: ['bar2'],
                get: function (bar2) {
                    return bar2 * 10;
                }
            });
        } catch (e) {
            error = e.message;
        }

        equal(error, 'addComputed: computed name "comp2" is already used', 'addComputed - already used computed error');
    });

    test('Computed Methods', function () {
        var model = new (Backbone.Ribs.Model.extend({
            computeds: {
                fooComp: {
                    deps: ['barComp'],
                    get: function (barComp) {
                        return barComp;
                    }
                },
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
                }
            },

            defaults: {
                foo1: 10,
                foo2: 20
            }
        }));

        //model.removeComputed('barComp');
        //console.log(model.get('fooComp'));

        equal(1, 1, 'Init 3');
    });

    module('Bindings');
    test('Simple Bindings', function () {
        var model = window.m = new Backbone.Ribs.Model({
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
            num: 15,
            num2: 10,
            mod: 'start',
            mod2: {
                subMod: 'full'
            }
        });

        var model2 = new Backbone.Ribs.Model({
            num: 13,
            weight: 900,
            id: 13,
            passive: false,
            mod: 'active'
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
                '.bind-with-filter':'text:summ(model.num,model.num2,model2.num)',
                '.bind-col-filter':'text:colFilter(col.a,col2.b)',
                '.bind-mod1':'mod:{bind-mod1_:model.mod,bind-mod_:model.mod2.subMod}',
                '.bind-mod2':'mod:[{bind-mod2_:model.mod},{bind-mod2_:model.mod2.subMod},{bind-mod2_:model2.mod}]'
            },

            filters: {
                summ: function (a, b, c) {
                    return a + b + c;
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

        equal($('.bind-mod1').hasClass('bind-mod1_start'), true, 'Single Mod 1');
        equal($('.bind-mod1').hasClass('bind-mod_full'), true, 'Single Mod 2');
        equal($('.bind-mod2').hasClass('bind-mod2_start'), true, 'Multi Mod 1');
        equal($('.bind-mod2').hasClass('bind-mod2_full'), true, 'Multi Mod 2');
        equal($('.bind-mod2').hasClass('bind-mod2_active'), true, 'Multi Mod 3');

        model.set('mod', 'stop');
        model.set('mod2.subMod', 'empty');
        model2.set('mod', 'blocked');

        equal($('.bind-mod1').hasClass('bind-mod1_start'), false, 'Single Mod remove');
        equal($('.bind-mod1').hasClass('bind-mod_full'), false, 'Single Mod 2 remove');
        equal($('.bind-mod2').hasClass('bind-mod2_start'), false, 'Multi Mod 1 remove');
        equal($('.bind-mod2').hasClass('bind-mod2_full'), false, 'Multi Mod 2 remove');
        equal($('.bind-mod2').hasClass('bind-mod2_active'), false, 'Multi Mod 3 remove');

        equal($('.bind-mod1').hasClass('bind-mod1_stop'), true, 'Single Mod changed');
        equal($('.bind-mod1').hasClass('bind-mod_empty'), true, 'Single Mod 2 changed');
        equal($('.bind-mod2').hasClass('bind-mod2_stop'), true, 'Multi Mod 1 changed');
        equal($('.bind-mod2').hasClass('bind-mod2_empty'), true, 'Multi Mod 2 changed');
        equal($('.bind-mod2').hasClass('bind-mod2_blocked'), true, 'Multi Mod 3 changed');

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

        equal($('.bind-with-filter').text(), '38', 'Filter');
        model.set('num', 21);
        model.set('num2', 14);
        model2.set('num', 35);
        equal($('.bind-with-filter').text(), '70', 'Filter changed');

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

        var colView = new CollectionView();

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

        var col = new Backbone.Collection([{a: 2}]);

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

        var bindingView = new BindingView();

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
});