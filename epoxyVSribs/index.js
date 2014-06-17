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
        /*var extend = {
            defaults: {
                bar: 10,
                foo: 20
            },

            computeds: {
                simpleComp: function () {
                    return 'simple';
                },
                barComp: {
                    deps: ['bar', 'foo'],
                    get: function (bar, foo) {
                        return bar + '-' + foo;
                    },
                    set: function (val) {
                        val = val.split('-');

                        return {
                            bar:  parseInt(val[0]),
                            foo: parseInt(val[1])
                        }
                    }
                }
            }
        };*/

        var Col = Backbone.Collection.extend({
            initialize: function () {
                
            }
        });

        var ItemView = Backbone.Epoxy.View.extend({
            el: '<div><input type="checkbox"><span class="span-text"></span></div>',

            bindings: {
                'input': 'checked:model.checked',
                '.span-text': 'text:model.text,classes:{span-text__active:model.active}'
            },

            initialize: function () {

            }
        });

        var CollectionView = Backbone.Epoxy.View.extend({
            el: '<div class="item-views"></div>',

            ItemView: ItemView,

            bindings: {
                '.item-views': 'collection:{col:collection,view:ItemView}'
            },

            initialize: function () {
                this.setElement('content');

                this.collection = new Backbone
            }
        });

        /*var View = Backbone.View.extend({
            el: '<div><span class="la-la">asdfasdf</span></div>',

            events: {
                'click .la-la': 'la'
            },

            la: function () {
                console.log('la');
            },

            initialize: function () {


                $('.content').append(this.$el);

                this.undelegateEvents();
            }
        });*/

        new View();
    });
});