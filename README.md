### **[Backbone.ribs - Wiki](https://github.com/ZaValera/backbone.ribs/wiki)**
Backbone.ribs expands capabilities of Backbone.
#### Deep Get & Set
Ribs allow to get and set model attributes on any depth.

    var model = new Backbone.Ribs.Model({
        foo: {
            bar: 'test'
        }
    });

    model.get('foo.bar'); //"test"
    model.set('foo.bar', 'newValue');

#### Computed attributes
With Ribs you can add computed model attributes.

    var CompModel = Backbone.Ribs.Model.extend({
        defaults: {
            bar: 10,
            foo: 20
        },

        computeds: {
            fooBarComp: {
                deps: ['bar', 'foo'],
                get: function (bar, foo) {
                    return bar + '-' + foo;
                }
            }
        }
    });

    var compModel = new CompModel();

    compModel.set('bar', 30);
    compModel.get('fooBarComp'); //30-20

#### Bindings
Bindings allow you to set a one-way or two-way binging between the models and the DOM elements.

#### Binding Collection
Binding collection is useful in cases when you need to create a view for a collection - tables, lists and other structures with multiple similar items.

During applying binding, for each model in the collection will be created its own instance of ItemView. The root element of the newly created view will be added inside the element, which selector was described in binding.

### Change Log
v0.4.1 - 16.11.2014
* no more sorting collection in applying binding collection
* optimize rendering binding collection when adding new models to the collection
* new view method signature of `renderCollection`

v0.4.0 - 14.11.2014
* new model method `addComputeds`
* new model method signature of `removeComputeds`
* model method `addComputed` is redundant, use `addComputeds` (**will be deleted in v1.0.0**)
* bug fixes

v0.3.1 - 11.11.2014
* new binding type `inDOM`
* new view method `getEl`
* new view method `appendTo`
* new view method `addBindings`
* new view method signature of `updateBindings`
* new view method signature of `renderCollection` (**incompatible with v0.2.10**)
* new view method `getCollectionViews`
* view method `addBinding` is redundant, use `addBindings` (**will be deleted in v1.0.0**)
* view method `applyCollection` is redundant, use `addBindings` (**will be deleted in v1.0.0**)
* bug fixes and optimisation
