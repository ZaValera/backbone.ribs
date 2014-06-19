require.config({
    paths: {
        jquery: '../vendor/jquery-1.9.0.min',
        underscore: '../vendor/lodash.min',
        backbone: '../vendor/backbone',
        epoxy: '../vendor/backbone.epoxy',
        ribs: '../backbone.ribs'
    }
});

require([
    'ribs',
    'epoxy'
], function() {
    $(document).ready(function() {
        var ItemModel = Backbone.Ribs.Model.extend({
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
                for (var i = 0; i < 10000; i++) {
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
            el: '<div class="item"><input type="checkbox"/><span class="span-text"></span><span class="span-second">span</span><input class="simple-input"/></div>',

            bindings: {
                'input[type="checkbox"]': 'checked:model.checked,attr:{data-time:model.time}',
                '.span-text': 'text:mlt(model.text),classes:{span-text__active:model.active}',
                '.span-second': 'toggle:model.active',
                '.simple-input': 'disabled:not(model.active),value:model.inputText'
            },

            filters: {
                mlt: function (a) {
                    return a * 2;
                }
            }
        });

        var CollectionView = Backbone.Ribs.View.extend({
            el: '<div><div class="item-views"></div></div>',

            ItemView: ItemView,

            bindings: {
                '.item-views': 'collection:{col:collection,view:ItemView}'
            },

            initialize: function () {
                window.col = this.collection = new Col();

                $('.content').append(this.$el);
            }
        });

        console.time('test');
        new CollectionView();
        console.timeEnd('test');
    });
});