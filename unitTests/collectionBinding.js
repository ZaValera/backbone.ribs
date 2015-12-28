//JSHint settings
/* globals $: false */
/* globals QUnit: false */
/* globals Backbone: false */

QUnit.module('Collection binding', {
    afterEach: function () {
        'use strict';

        this.colView.remove();
    }
}, function () {
    'use strict';

    QUnit.module('Init and work', {
        beforeEach: function () {

        }
    }, function () {
        QUnit.test('init with string names', function (assert) {
            var col = new Backbone.Collection([{},{}]);

            var ItemView = Backbone.View.extend({
                el: '<div class="item"></div>'
            });

            var CollectionView = Backbone.Ribs.View.extend({
                className: 'col-bind',

                bindings: {
                    'el': {
                        collection:{
                            col: 'collection',
                            view: 'ItemView'
                        }
                    }
                },

                initialize: function () {
                    this.ItemView = ItemView;
                    this.collection = col;
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            assert.equal($('.col-bind .item').length, 2);
        });

        QUnit.test('init with references', function (assert) {
            var col = new Backbone.Collection([{},{}]);

            var ItemView = Backbone.Ribs.View.extend({
                initialize: function () {
                    this.setElement('<div class="item"></div>');
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                className: 'col-bind',

                bindings: {
                    'el': {
                        collection:{
                            col: col,
                            view: ItemView
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            assert.equal($('.col-bind .item').length, 2);
        });

        QUnit.test('creation sub views', function (assert) {
            var col = new Backbone.Collection([{a: 1},{a: 2},{a: 3}]);

            var ItemView = Backbone.View.extend({
                initialize: function () {
                    this.setElement('<div class="item">' + this.model.get('a') + '</div>');
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                el: '<div class="col-bind"><div class="items"></div></div>',

                bindings: {
                    '.items': {
                        collection:{
                            col: col,
                            view: ItemView
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            var $items = $('.items .item');

            assert.equal($items.length, 3);

            assert.equal($items.filter(':eq(0)').text(), 1, 'Init 1');
            assert.equal($items.filter(':eq(1)').text(), 2, 'Init 2');
            assert.equal($items.filter(':eq(2)').text(), 3, 'Init 3');
        });

        QUnit.test('sort views', function (assert) {
            var col = new Backbone.Collection([{a: 1},{a: 3},{a: 2}]);

            var ItemView = Backbone.View.extend({
                initialize: function () {
                    this.setElement('<div class="item">' + this.model.get('a') + '</div>');
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                className: 'col-bind',

                bindings: {
                    'el': {
                        collection:{
                            col: col,
                            view: ItemView
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            var $items = $('.col-bind .item');

            assert.equal($items.length, 3);

            assert.equal($items.filter(':eq(0)').text(), 1, 'Init 1');
            assert.equal($items.filter(':eq(1)').text(), 3, 'Init 2');
            assert.equal($items.filter(':eq(2)').text(), 2, 'Init 3');

            col.comparator = 'a';
            col.sort();

            $items = $('.col-bind .item');

            assert.equal($items.length, 3);

            assert.equal($items.filter(':eq(0)').text(), 1, 'Sort 1');
            assert.equal($items.filter(':eq(1)').text(), 2, 'Sort 2');
            assert.equal($items.filter(':eq(2)').text(), 3, 'Sort 3');
        });

        QUnit.test('reset views', function (assert) {
            var col = new Backbone.Collection([{},{},{},{}]);

            var ItemView = Backbone.View.extend({
                initialize: function () {
                    this.setElement('<div class="item"></div>');
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                className: 'col-bind',

                bindings: {
                    'el': {
                        collection:{
                            col: col,
                            view: ItemView
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            assert.equal($('.col-bind .item').length, 4);

            col.reset();
            assert.equal($('.col-bind .item').length, 0);

            col.reset([{},{}]);
            assert.equal($('.col-bind .item').length, 2);
        });

        QUnit.test('add views', function (assert) {
            var col = new Backbone.Collection([{a: 2},{a: 6},{a: 4}]);

            var ItemView = Backbone.View.extend({
                initialize: function () {
                    this.setElement('<div class="item">' + this.model.get('a') + '</div>');
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                className: 'col-bind',

                bindings: {
                    'el': {
                        collection:{
                            col: col,
                            view: ItemView
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            col.add({a: 5}, {at: 1});
            assert.equal($('.col-bind .item').filter(':eq(1)').text(), 5, 'Add to specific position');

            col.add([{a: 3}, {a: 7}]);
            assert.equal($('.col-bind .item').filter(':eq(4)').text(), 3, 'Multi add 1');
            assert.equal($('.col-bind .item').filter(':eq(5)').text(), 7, 'Multi add 2');

            col.comparator = 'a';
            col.add({a: 1});
            assert.equal($('.col-bind .item').filter(':eq(0)').text(), 1, 'Add with sort');
        });

        QUnit.test('remove view', function (assert) {
            var col = new Backbone.Collection([{id: 0, a: 2},{id: 1, a: 6},{id: 2, a: 4}]);

            var ItemView = Backbone.View.extend({
                initialize: function () {
                    this.setElement('<div class="item">' + this.model.get('a') + '</div>');
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                className: 'col-bind',

                bindings: {
                    'el': {
                        collection:{
                            col: col,
                            view: ItemView
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            assert.equal($('.col-bind .item').length, 3, 'Init');

            col.remove(1);

            var $items = $('.col-bind .item');

            assert.equal($items.length, 2, 'After remove');
            assert.equal($items.filter(':eq(0)').text(), 2, 'Remove 1');
            assert.equal($items.filter(':eq(1)').text(), 4, 'Remove 2');
        });

        QUnit.test('init without "waterfallAdding"', function (assert) {
            var col = new Backbone.Collection(),
                res = '';

            var ItemView = Backbone.View.extend({
                initialize: function () {
                    this.setElement('<div class="item" data-id="' + this.model.id + '"></div>');

                    var prevId = this.model.id - 1;

                    if (prevId >= 0) {
                        res += prevId + '-' + $('.item[data-id="' + (prevId) + '"]').length;
                    }
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                className: 'col-bind',

                bindings: {
                    'el': {
                        collection:{
                            col: col,
                            view: ItemView
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            col.add([{id: 0, a: 2},{id: 1, a: 6},{id: 2, a: 4}]);

            assert.equal(res, '0-01-0');
        });

        QUnit.test('init with "waterfallAdding"', function (assert) {
            var col = new Backbone.Collection(),
                res = '';

            var ItemView = Backbone.View.extend({
                initialize: function () {
                    this.setElement('<div class="item" data-id="' + this.model.id + '"></div>');

                    var prevId = this.model.id + 1;

                    if (prevId < 3) {
                        res += prevId + '-' + $('.item[data-id="' + (prevId) + '"]').length;
                    }
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                className: 'col-bind',

                bindings: {
                    'el': {
                        collection:{
                            col: col,
                            view: ItemView,
                            waterfallAdding: true
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            col.add([{id: 0, a: 2},{id: 1, a: 6},{id: 2, a: 4}]);

            assert.equal(res, '2-11-1');
        });

        QUnit.test('init with "waterfallAdding" in add', function (assert) {
            var col = new Backbone.Collection(),
                res = '';

            var ItemView = Backbone.Ribs.View.extend({
                initialize: function () {
                    this.setElement('<div class="item" data-id="' + this.model.id + '"></div>');

                    var prevId = this.model.id + 1;

                    if (prevId < 3) {
                        res += prevId + '-' + $('.item[data-id="' + (prevId) + '"]').length;
                    }
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                className: 'col-bind',

                bindings: {
                    'el': {
                        collection:{
                            col: col,
                            view: ItemView
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            col.add([{id: 0, a: 2},{id: 1, a: 6},{id: 2, a: 4}], {
                waterfallAdding: true
            });

            assert.equal(res, '2-11-1');
        });

        QUnit.test('init with "waterfallAdding" in add with comparator', function (assert) {
            var col = new Backbone.Collection();

            var ItemView = Backbone.Ribs.View.extend({
                initialize: function () {
                    this.setElement('<div class="item">' + this.model.get('a') + '</div>');
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                className: 'col-bind',

                bindings: {
                    'el': {
                        collection:{
                            col: col,
                            view: ItemView
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            col.comparator = 'a';

            col.add([{id: 0, a: 2},{id: 1, a: 6},{id: 2, a: 4}], {
                waterfallAdding: true
            });

            var $items = $('.col-bind .item');

            assert.equal($items.filter(':eq(0)').text(), 2);
            assert.equal($items.filter(':eq(1)').text(), 4);
            assert.equal($items.filter(':eq(2)').text(), 6);
        });
    });

    QUnit.module('Methods', function () {
        QUnit.test('getCollectionViews()', function (assert) {
            var col = new Backbone.Collection([{id: 0, a: 2},{id: 1, a: 6},{id: 2, a: 4}]),
                views = {};

            var ItemView = Backbone.View.extend({
                initialize: function () {
                    views[this.model.cid] = this;
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                className: 'col-bind',

                bindings: {
                    'el': {
                        collection:{
                            col: col,
                            view: ItemView
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            var colViews = this.colView.getCollectionViews('el'),
                flag = true;

            for (var cid in views) {
                if (views.hasOwnProperty(cid)) {
                    if (views[cid] !== colViews[cid]) {
                        flag = false;
                        break;
                    }
                }
            }

            assert.equal(flag, true);
        });

        QUnit.test('getCollectionViews() two girls one cup', function (assert) {
            var col = new Backbone.Collection([{id: 0, a: 2},{id: 1, a: 6},{id: 2, a: 4}]),
                views1 = {},
                views2 = {};

            var ItemView1 = Backbone.View.extend({
                initialize: function () {
                    views1[this.model.cid] = this;
                }
            });

            var ItemView2 = Backbone.View.extend({
                initialize: function () {
                    views2[this.model.cid] = this;
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                el: '<div class="col">' +
                    '<div class="items1"></div>' +
                    '<div class="items2"></div>' +
                '</div>',

                bindings: {
                    'items1': {
                        collection:{
                            col: col,
                            view: ItemView1
                        }
                    },
                    'items2': {
                        collection:{
                            col: col,
                            view: ItemView2
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            var colViews1 = this.colView.getCollectionViews('items1'),
                colViews2 = this.colView.getCollectionViews('items2'),
                flag1 = true,
                flag2 = true,
                cid;

            for (cid in views1) {
                if (views1.hasOwnProperty(cid)) {
                    if (views1[cid] !== colViews1[cid]) {
                        flag1 = false;
                        break;
                    }
                }
            }

            for (cid in views2) {
                if (views2.hasOwnProperty(cid)) {
                    if (views2[cid] !== colViews2[cid]) {
                        flag2 = false;
                        break;
                    }
                }
            }

            assert.equal(flag1, true);
            assert.equal(flag2, true);
        });

        QUnit.test('getCollectionViews() without binding', function (assert) {
            var CollectionView = Backbone.Ribs.View.extend({
                className: 'col-bind',

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            assert.equal(this.colView.getCollectionViews('el'), undefined);
        });

        QUnit.test('renderCollection()', function (assert) {
            var col = new Backbone.Collection([{id: 0, a: 2},{id: 1, a: 6}]);

            var ItemView = Backbone.View.extend({
                initialize: function () {
                    this.setElement('<div class="item">' + this.model.get('a') + '</div>');
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                className: 'col-bind',

                bindings: {
                    'el': {
                        collection:{
                            col: col,
                            view: ItemView
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            assert.equal($('.item').length, 2, 'init');

            col.add({id: 2, a: 4}, {silent: true});
            assert.equal($('.item').length, 2, 'silent add');

            this.colView.renderCollection();
            assert.equal($('.item').length, 3, 'after renderCollection');
        });

        QUnit.test('renderCollection() by collection', function (assert) {
            var col1 = new Backbone.Collection([{id: 0, a: 2},{id: 1, a: 6}]);
            var col2 = new Backbone.Collection([{id: 0, a: 3},{id: 1, a: 5}]);

            var ItemView = Backbone.View.extend({
                initialize: function () {
                    this.setElement('<div class="item">' + this.model.get('a') + '</div>');
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                el: '<div class="col">' +
                    '<div class="items1"></div>' +
                    '<div class="items2"></div>' +
                '</div>',

                bindings: {
                    '.items1': {
                        collection:{
                            col: col1,
                            view: ItemView
                        }
                    },
                    '.items2': {
                        collection:{
                            col: col2,
                            view: ItemView
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            assert.equal($('.items1 > .item').length, 2, 'init1');
            assert.equal($('.items2 > .item').length, 2, 'init2');

            col1.add({id: 2, a: 4}, {silent: true});
            col2.add({id: 2, a: 4}, {silent: true});
            assert.equal($('.items1 > .item').length, 2, 'silent add1');
            assert.equal($('.items2 > .item').length, 2, 'silent add2');

            this.colView.renderCollection(col2);
            assert.equal($('.items1 > .item').length, 2, 'after renderCollection1');
            assert.equal($('.items2 > .item').length, 3, 'after renderCollection2');
        });

        QUnit.test('renderCollection() by selector', function (assert) {
            var col1 = new Backbone.Collection([{id: 0, a: 2},{id: 1, a: 6}]);
            var col2 = new Backbone.Collection([{id: 0, a: 3},{id: 1, a: 5}]);

            var ItemView = Backbone.View.extend({
                initialize: function () {
                    this.setElement('<div class="item">' + this.model.get('a') + '</div>');
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                el: '<div class="col">' +
                    '<div class="items1"></div>' +
                    '<div class="items2"></div>' +
                '</div>',

                bindings: {
                    '.items1': {
                        collection:{
                            col: col1,
                            view: ItemView
                        }
                    },
                    '.items2': {
                        collection:{
                            col: col2,
                            view: ItemView
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            assert.equal($('.items1 > .item').length, 2, 'init1');
            assert.equal($('.items2 > .item').length, 2, 'init2');

            col1.add({id: 2, a: 4}, {silent: true});
            col2.add({id: 2, a: 4}, {silent: true});
            assert.equal($('.items1 > .item').length, 2, 'silent add1');
            assert.equal($('.items2 > .item').length, 2, 'silent add2');

            this.colView.renderCollection('.items1');
            assert.equal($('.items1 > .item').length, 3, 'after renderCollection1');
            assert.equal($('.items2 > .item').length, 2, 'after renderCollection2');

            this.colView.renderCollection(null, '.items2');
            assert.equal($('.items1 > .item').length, 3, 'after renderCollection1');
            assert.equal($('.items2 > .item').length, 3, 'after renderCollection2');
        });

        QUnit.test('renderCollection() by collection and selector', function (assert) {
            var col1 = new Backbone.Collection([{id: 0, a: 2},{id: 1, a: 6}]);
            var col2 = new Backbone.Collection([{id: 0, a: 3},{id: 1, a: 5}]);

            var ItemView = Backbone.View.extend({
                initialize: function () {
                    this.setElement('<div class="item">' + this.model.get('a') + '</div>');
                }
            });

            var CollectionView = Backbone.Ribs.View.extend({
                el: '<div class="col">' +
                    '<div class="items1"></div>' +
                    '<div class="items2"></div>' +
                    '<div class="items3"></div>' +
                '</div>',

                bindings: {
                    '.items1': {
                        collection:{
                            col: col1,
                            view: ItemView
                        }
                    },
                    '.items2': {
                        collection:{
                            col: col2,
                            view: ItemView
                        }
                    },
                    '.items3': {
                        collection:{
                            col: col1,
                            view: ItemView
                        }
                    }
                },

                initialize: function () {
                    this.$el.appendTo('body');
                }
            });

            this.colView = new CollectionView();

            assert.equal($('.items1 > .item').length, 2, 'init1');
            assert.equal($('.items2 > .item').length, 2, 'init2');
            assert.equal($('.items3 > .item').length, 2, 'init3');

            col1.add({id: 2, a: 4}, {silent: true});
            col2.add({id: 2, a: 4}, {silent: true});
            assert.equal($('.items1 > .item').length, 2, 'silent add1');
            assert.equal($('.items2 > .item').length, 2, 'silent add2');
            assert.equal($('.items3 > .item').length, 2, 'silent add3');

            this.colView.renderCollection(col1, '.items3');
            assert.equal($('.items1 > .item').length, 2, 'after renderCollection1');
            assert.equal($('.items2 > .item').length, 2, 'after renderCollection2');
            assert.equal($('.items3 > .item').length, 3, 'after renderCollection3');
        });
    });
});