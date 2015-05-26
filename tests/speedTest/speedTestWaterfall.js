define([

], function () {
    var iterations = 2000;

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
                },
                time: function () {
                    return (+new Date());
                }
            }
        });

        var Col = Backbone.Collection.extend({
            model: ItemModel,

            initialize: function () {
                /*for (var i = 0; i < iterations; i++) {
                    this.add({
                        first: i,
                        second: i + 10,
                        active: !!Math.round(Math.random()),
                        checked: !!Math.round(Math.random())
                    });
                }*/
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
                    attr: {'data-time': 'model.time'}
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
                    }
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
                    collection: {col: 'collection', view: ItemView, waterfallAdding: false}
                }
            },

            initialize: function () {
                window.col = this.collection = new Col();
                $('.content').append(this.$el);
            }
        });

        $('.content').empty();

        var start = +new Date(),
            colView = new CollectionView(),
            model;

        for (var i = 0; i < iterations; i++) {
            setTimeout(function () {
                colView.collection.add({
                    first: 1,
                    second: 2,
                    active: !!Math.round(Math.random()),
                    checked: !!Math.round(Math.random())
                });

                if (colView.collection.length === iterations) {
                    console.log(+new Date() - start);
                }
            }, 20);
        }
    };

    return function () {
        test();
    }
});