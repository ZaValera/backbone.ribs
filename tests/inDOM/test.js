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
], function(Ribs) {
    $(document).ready(function() {
        var View = Backbone.Ribs.View.extend({
            el: '<div class="toggle" style="display: inline-block;">' +
                '<div class="first">first</div>' +
                '<div class="parent"><div class="second"><span class="text"></span></div></div>' +
                '<span class="second">second</span>' +
                '<div class="third">third</div>' +
            '</div>',

            bindings: {
                /*'el': {
                    inDOM: 'model.main'
                },
                '.first': {
                    inDOM: 'model.first'
                 },*/
                '.text': {
                    text: 'model.text'
                },
                '.second': {
                    toggle: 'model.second'
                }/*,
                '.third': {
                    inDOM: 'model.third'
                }*/
            },

            initialize: function () {
                window.model = this.model = new Backbone.Ribs.Model({
                    first: true,
                    second: false,
                    third: true,
                    main: true,
                    text: 0
                });

                this.appendTo($('body'));
            }
        });

        window.view = new View();


        var res = window.res = [];

        /*var start = Date.now();
        setTimeout(function () {

        for (var i = 0; i < 20000; i++) {
            $('.first').width(80*(i%2));
            $('.toggle').width();
            res.push(view.$('.text').text());
        }

        alert(Date.now() - start);

        },100);*/


        /*var start = Date.now();
        setTimeout(function () {

            for (var i = 0; i < 20000; i++) {
                $('.first').width(80*(i%2));
                res = $('.toggle').width();

                //view.model.set('second', !(i%2));
                view.model.set('text', i);
                //res.push(view.$('.text').text());
            }

            alert('toggle' + (Date.now() - start));

        },100);*/


        //console.log(res);
    })
});