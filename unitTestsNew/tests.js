//JSHint settings
/* globals $: false */
/* globals QUnit: false */
/* globals Backbone: false */
$(function () {
    'use strict';

});

$(function () {

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
