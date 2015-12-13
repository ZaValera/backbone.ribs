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
v1.0.0
* Ribs.Collection
* Set and Get: in `handlers, computeds and processors` method `set` return value, which will be set to model. `get` participates in the inverse operation.
* Binding's `filter` renamed to `processor`

v0.5.8 - 12.12.2015
* Bindings: bug fixes
* Bindings: using `Backbone.Model` for bindings is deprecated (**will be deleted in v1.0.0**)

v0.5.7 - 11.12.2015
* Bindings: binding `toggleByClass` - added `!important` declarations
* Bindings: `inDOM` binding bug fixes (**will be deleted in v1.0.0**)

v0.5.6 - 05.12.2015
* Bindings: new binding type - `toggleByClass`
* Bindings: `inDOM` binding bug fixes

v0.5.5 - 02.12.2015
* Computed attributes: fixed `model.clone()` bug

v0.5.4 - 29.11.2015
* Computed attributes: returned computed attribute without `deps` for backward compatibility (**will be deleted in v1.0.0**)
* Computed attributes: returned update computed attributes by triggering 'change' event

v0.5.3 - 04.11.2015
* Model: pass changed attribute's name into event's callback

v0.5.2 - 31.10.2015
* Computeds: `toJSON` flag in declaration
* Bindings: some optimizations
* Deep get/set: bug fix

v0.5.1 - 29.10.2015
* Bindings: `bindings`, `handlers` and `filters` can be a function
* Bindings: custom `events` in custom `handlers`

v0.5.0 - 25.10.2015
* Compatibility with Backbone 1.2.3
* Computed attributes: computed attributes in `model.attributes` hash (**significant change**)
* Computed attributes: deprecate computed attribute without `deps` (**significant change**)
* Computed attributes: fixed problem with triggering excess `change` events
* Computed attributes: new method `isComputed`
* Bindings: binding callback
* Bindings: updated bindings earlier than other handlers
* Bindings: `inDOM` - fixed many problems. And now you can use it ;)
* Binding Collection: allow waterfall adding views to DOM
* Allow to get previous model's attributes on any depth by `deepPrevious` flag (this slows down the `model.set`, be careful)

v0.4.6 - 25.03.2015
* forwarding event object into `get` binding handler

v0.4.5 - 16.03.2015
* `inDOM` binding bug fixes

v0.4.4 - 11.03.2015
* passing `options` to `set` binding handler

v0.4.3 - 04.03.2015
* `set` and `get` in `not` filter

v0.4.2 - 03.12.2014
* bug fixes

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
