require.config({
    paths: {
        jquery: '../../vendor/jquery-1.9.0.min',
        underscore: '../../vendor/lodash.min',
        backbone: '../../vendor/backbone',
        ribs: '../../backbone.ribs'
    }
});

require([
    'ribs'
], function() {
    $(document).ready(function() {

        var ItemView = Backbone.Ribs.View.extend({

            bindings: {
                'span': {
                    text: 'model.a'
                }
            },

            initialize: function () {
                this.setElement('<div class="item-view"><span></span></div>');
            }
        });



        var CollectionView = Backbone.Ribs.View.extend({

            bindings: {
                'el': {
                    'collection': {
                        col: 'col',
                        view: ItemView
                    }
                }
            },

            initialize: function () {
                this.col = new Backbone.Collection([{a: 5},{a: 3},{a: 8}]);

                this.col.comparator = 'a';

                window.col = this.col;
                this.setElement('.content');
            }
        });



        var colView = window.colView = new CollectionView();

    });
});