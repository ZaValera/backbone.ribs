//JSHint settings
/* globals $: false */
/* globals QUnit: false */
/* globals Backbone: false */
$(function () {
    'use strict';

});

$(function () {
    module('Bindings');

    test('Collection Bindings', function () {
        var col = new Backbone.Collection([{a: 2},{a: 6},{a: 4}]);

        var ItemView = Backbone.View.extend({

            initialize: function () {
                this.setElement('<div class="item-view">' + this.model.get('a') + '</div>');
            }
        });

        var CollectionView = Backbone.Ribs.View.extend({

            bindings: {
                'el': {
                    collection:{
                        col: 'collection',
                        view: 'ItemView'
                    }
                }
            },

            ItemView: ItemView,

            initialize: function () {
                this.collection = col;
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

        col.reset();
        col.comparator = 'a';
        col.add([{a: 4}, {a: 2}, {a: 5}]);
        $items = colView.$el.children('.item-view');
        equal($items.length, 3, 'Coll Length After multi add');
        equal($items.filter(':eq(0)').text(), 2, 'Multi add 1');
        equal($items.filter(':eq(1)').text(), 4, 'Multi add 2');
        equal($items.filter(':eq(2)').text(), 5, 'Multi add 3');
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
                '.met-bind-text': {
                    text: 'model.foo'
                },
                '.met-remove-bind-text': {
                    text: 'model.foo'
                },
                '.met-bind-col': {
                    collection: {
                        col: 'col',
                        view: 'ItemView'
                    }
                }
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


        bindingView.addBindings('.met-apply-col', {collection: {
            col: col,
            view: ItemView,
            data: {
                foo: 'bar'
            }
        }});

        equal(typeof bindingView.getCollectionViews('.met-apply-col'), 'object', 'getCollectionViews return object');

        $items = bindingView.$('.met-apply-col').children('.item-view');
        equal($items.length, 1, 'Apply collection');

        col.add({a: 5}, {silent: true});
        bindingView.renderCollection(col, '.met-apply-col');
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

        bindingView.appendTo($('.wrapper'));
        strictEqual($('.wrapper').find('.met-bind')[0], bindingView.el, 'appendTo method');
    });
});
