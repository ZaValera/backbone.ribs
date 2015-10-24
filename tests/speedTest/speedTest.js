define([

], function () {
    var iterations = 500,
        testCounts = 5;

    var test = function () {
        var ItemModel = Backbone.Ribs.Model.extend({
            defaults: {
                foo: 'foo',
                bar: {
                    foo: {
                        bar: 'bar'
                    }
                }
            },

            computeds: {
                text: {
                    deps: ['first', 'second'],
                    get: function (first, second) {
                        return first + second;
                    }
                },
                inputText: {
                    deps: ['first', 'second'],
                    get: function (first, second) {
                        return first + ' ' + second;
                    },
                    set: function (val) {
                        val = val.split(' ');
                        return {
                            first: val[0],
                            second: val[1]
                        }
                    }
                }
            }
        });

        var Col = Backbone.Collection.extend({
            model: ItemModel,

            initialize: function () {
                for (var i = 0; i < iterations; i++) {
                    this.add({
                        first: i,
                        second: i + 10,
                        active: !!Math.round(Math.random()),
                        checked: !!Math.round(Math.random())
                    });
                }
            }
        });

        var ItemView = Backbone.Ribs.View.extend({
            el: '<div class="item">' +
                    '<input type="checkbox"/>' +
                    '<span class="span-text"></span>' +
                    '<span class="span-second">span</span>' +
                    '<input class="simple-input"/>' +
                '</div>',

            bindings: {
                'input[type="checkbox"]': {
                    checked: 'model.checked',
                    attr: {'data-text': 'model.text'}
                },
                '.span-text': {
                    text: {filter: 'mlt', data: 'model.text'},
                    classes: {'span-text__active': 'model.active'}
                },
                '.span-second': {toggle: 'model.active'},
                '.simple-input': {
                    disabled: {
                        filter: 'not',
                        data: 'model.active'
                    },
                    value: {
                        data: 'model.inputText',
                        events: 'keyup change'
                    },
                    inDOM: 'model.active'
                }
            },

            filters: {
                mlt: function (a) {
                    return a * 2;
                }
            }
        });

        var CollectionView = Backbone.Ribs.View.extend({
            el: '<div>' +
                    '<div class="item-views"></div>' +
                '</div>',

            bindings: {
                '.item-views': {
                    collection: {col: 'collection', view: ItemView}
                }
            },

            initialize: function () {
                this.collection = new Col();
                $('.content').append(this.$el);
            }
        });

        $('.content').empty();

        var models = [];

        var start = +new Date(),
            colView = new CollectionView(),
            model;

        for (var i = 0; i < iterations; i++) {
            models.push({
                first: i,
                second: i + 10,
                active: !!Math.round(Math.random()),
                checked: !!Math.round(Math.random())
            });
        }

        colView.collection.add(models);

        for (var i = 0; i < colView.collection.length; i++) {
            model = colView.collection.at(i);
            model.set('foo', model.get('foo') + '_');
            model.set('bar.foo.bar', model.get('bar.foo.bar') + '_');
        }

        return (+new Date() - start);
    };

    return function () {
        var time = 0,
            min,
            max,
            result,
            t;

        for (var i = 0; i < testCounts; i++) {
            t = test();

            min = min || t;
            max = max || t;

            if (t < min) {
                min = t;
            }

            if (t > max) {
                max = t;
            }

            time += t;
        }

        result = 'min: ' + min + '\r\nmax: ' + max + '\r\naverage: ' + time/testCounts;

        alert(result);
    }
});