require.config({
    paths: {
        jquery: '../../vendor/jquery-1.9.0.min',
        underscore: '../../vendor/lodash.min',
        backbone: '../../vendor/backbone',
        epoxy: '../../vendor/backbone.epoxy',
        ribs: '../../backbone.ribs'
    }
});

require([
    '../speedTest/0.2.8/ribs',
    'epoxy'
], function() {
    $(document).ready(function() {
        var ItemModel = Backbone.Epoxy.Model.extend({
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

        var ItemView = Backbone.Epoxy.View.extend({
            el: '<div class="item"><input type="checkbox"/><span class="span-text"></span><span class="span-second">span</span><input class="simple-input"/></div>',

            bindings: {
                'input[type="checkbox"]': 'checked:checked,attr:{"data-time":time}',
                '.span-text': 'text:mlt(text),classes:{"span-text__active":active}',
                '.span-second': 'toggle:active',
                '.simple-input': 'disabled:not(active),value:inputText,events:["keyup","change"]'
            },

            bindingFilters: {
                mlt: {
                    get: function (a) {
                        return a * 2;
                    }
                }
            }
        });

        var Col = Backbone.Collection.extend({
            model: ItemModel,
            view: ItemView,

            initialize: function () {
                for (var i = 0; i < 5000; i++) {
                    this.add({
                        first: i,
                        second: i + 10,
                        active: !!Math.round(Math.random()),
                        checked: !!Math.round(Math.random())
                    });
                }
            }
        });

        var CollectionView = Backbone.Epoxy.View.extend({
            el: '<div><div class="item-views"></div></div>',

            bindings: {
                '.item-views': 'collection:$collection'
            },

            initialize: function () {
                window.col = this.collection = new Col();

                $('.content').append(this.$el);
            }
        });

        var start = +new Date();
        //console.time('test');
        var colView = new CollectionView(),
            items = [];

        /*for (var i = 0; i < 5000; i++) {
            items.push({
                first: i,
                second: i + 10,
                active: !!Math.round(Math.random()),
                checked: !!Math.round(Math.random())
            });
        }*/

        colView.collection.add(items);
        alert(+new Date() - start);
        //console.timeEnd('test');
    });
});