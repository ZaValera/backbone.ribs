(function(root, factory) {

    if (typeof exports !== 'undefined') {
        // Define as CommonJS export:
        module.exports = factory(require('underscore'), require('backbone'));
    } else if (typeof define === 'function' && define.amd) {
        // Define as AMD:
        define(['underscore', 'backbone'], factory);
    } else {
        // Just run it:
        factory(root._, root.Backbone);
    }

}(this, function(_, Backbone) {
    var Ribs = Backbone.Ribs = {
        version: '1.0.1'
    };

    var _super = function (self, method, args) {
        return self._super.prototype[method].apply(self, args);
    };

    var _split = function (str) {
        if (str.indexOf('!.') === -1) {
            return str.split('.');
        }

        var path = [],
            item = '',
            ch = str.charAt(0),
            pch;

        for (var i = 0, l = str.length; i < l; i++) {
            nch = str.charAt(i + 1);

            if (ch === '.' && pch === '!') {
                item += '.';
            } else if (ch === '.' && pch !== '!') {
                path.push(item);
                item = '';
            } else if (ch !== '!' || nch !== '.') {
                item += ch;
            }

            pch = ch;
            ch = nch;
        }

        path.push(item);

        return path;
    };

    var _join = function (path) {
        var newPath = [];

        for (i = 0; i < path.length; i++) {
            newPath.push(path[i].replace('.', '!.'));
        }

        return newPath.join('.');
    };

    var getPath = function (path, obj) {
        var p;

        if (typeof path === 'string') {
            path = _split(path);
        } else {
            path = path.slice();
        }

        while (path.length) {
            p = path.shift();

            if (obj.hasOwnProperty(p)) {
                obj = obj[p];
            } else {
                if (path.length) {
                    throw new Error('can\'t get "' + path.shift() + '" of "' + p + '", "' + p +'" is undefined');
                } else {
                    return undefined;
                }
            }
        }

        return obj;
    };

    var deletePath = function (path, obj) {
        var p;

        path = path.slice();

        while (path.length) {
            p = path.shift();

            if (!path.length) {
                delete obj[p];
            } else {
                if (obj.hasOwnProperty(p)) {
                    obj = obj[p];
                } else {
                    break;
                }
            }
        }
    };

    var parseBinding = function (str) {
        try {
            return JSON.parse(('{' + str + '}').replace(/([^\{\}\[\]\,\:]+)/ig,'"$1"'));
        } catch (e) {
            throw new Error('wrong binding format "' + str + '"');
        }
    };

    var parseModelAttr = function (ModelAttr) {
        var attrs = ModelAttr.match(/^(?:\!\.|[^.])+/),
            model,
            attr;

        try {
            model = attrs[0];
            attr = ModelAttr.slice(model.length + 1);
            if (!attr.length) {
                throw '';
            }
        } catch (e) {
            throw new Error('wrong binging "' + ModelAttr + '"');
        }

        return {
            model: model,
            attr: attr
        }
    };

    var Computed = function (data, name, model) {
        this.name = name;

        if (typeof data === 'function') {
            this.get = function () {return data.apply(model, arguments)};
            this.set = function () {
                throw new Error('set: computed "' + name + '" has no set method');
            };
            this._simple = true;
            return this;
        }

        this._deps = data.deps;
        this._get = data.get;
        this.set = function () {return data.set.apply(model, arguments)};
        this._model = model;

        return this;
    };

    Computed.prototype.update = function () {
        if (this._simple) {
            return;
        }

        var deps = [],
            val;

        this._previous = this.value;

        if (this._deps instanceof Array) {
            for (var i = 0; i < this._deps.length; i++) {
                try {
                    val = this._model.get(this._deps[i]);
                } catch (e) {
                    val = undefined;
                }

                deps.push(val);
            }
        }

        this.value = this._get.apply(this._model, deps);
    };

    Computed.prototype.get = function () {
        return this.value;
    };

    var Binding = function (view, $el, bindings) {
        this.$el = $el;
        this.view = view;

        if (bindings.events) {
            this.events = bindings.events.join(' ');
            delete bindings.events;
        } else {
            this.events = 'change';
        }

        this.handlers = [];

        for (var type in bindings) {
            if (bindings.hasOwnProperty(type)) {
                HANDLERS[type].call(this, bindings[type]);
            }
        }
    };

    Binding.prototype.unbind = function () {
        var handlers = this.handlers,
            handler;

        for (var i = 0; i < handlers.length; i++) {
            handler = handlers[i];
            if (handler.get) {
                this.$el.off(handler.events, handler.get);
            }

            this.view[handler.model].off('change:' + handler.attr, handler.set);
        }
    };

    var HANDLERS = {
        text: function (binding) {
            binding = parseModelAttr(binding);

            var self = this,
                model = binding.model,
                attr = binding.attr;

            var set = function (model, value) {
                self.$el.text(value);
            };

            this.handlers.push({
                set: set,
                model: model,
                attr: attr
            });

            this.$el.text(this.view[model].get(attr));

            this.view[model].on('change:' + attr, set);
        },
        value: function (binding) {
            binding = parseModelAttr(binding);

            var events = this.events,
                self = this,
                model = binding.model,
                attr = binding.attr;

            var set = function (model, value) {
                self.$el.val(value);
            };

            var get = function () {
                self.view[model].set(attr, self.$el.val());
            };

            this.handlers.push({
                set: set,
                get: get,
                model: model,
                attr: attr,
                events: events
            });

            this.$el.val(this.view[model].get(attr));

            this.view[model].on('change:' + attr, set);
            this.$el.on(events, get);
        },
        css: function (binding) {
            var self = this,
                curStyle,
                model,
                attr,
                set;

            for (var style in binding) {
                if (binding.hasOwnProperty(style)) {
                    curStyle = parseModelAttr(binding[style]);
                    model = curStyle.model;
                    attr = curStyle.attr;

                    set = (function (style) {
                        return function (model, value) {
                            self.$el.css(style, value);
                        }
                    })(style);

                    this.handlers.push({
                        set: set,
                        model: model,
                        attr: attr
                    });

                    this.$el.css(style, this.view[model].get(attr));

                    this.view[model].on('change:' + attr, set);
                }
            }
        },
        attr: function (binding) {
            var self = this,
                curAttr,
                model,
                attr,
                set;

            for (var attrName in binding) {
                if (binding.hasOwnProperty(attrName)) {
                    curAttr = parseModelAttr(binding[attrName]);
                    model = curAttr.model;
                    attr = curAttr.attr;

                    set = (function (attrName) {
                        return function (model, value) {
                            self.$el.attr(attrName, value);
                        }
                    })(attrName);

                    this.handlers.push({
                        set: set,
                        model: model,
                        attr: attr
                    });

                    this.$el.attr(attrName, this.view[model].get(attr));

                    this.view[model].on('change:' + attr, set);
                }
            }
        },
        classes: function (binding) {
            var self = this,
                curClass,
                model,
                attr,
                set;

            for (var clas in binding) {
                if (binding.hasOwnProperty(clas)) {
                    curClass = parseModelAttr(binding[clas]);
                    model = curClass.model;
                    attr = curClass.attr;

                    set = (function (clas) {
                        return function (model, value) {
                            self.$el.toggleClass(clas, !!value);
                        }
                    })(clas);

                    this.handlers.push({
                        set: set,
                        model: model,
                        attr: attr
                    });

                    this.$el.toggleClass(clas, !!this.view[model].get(attr));

                    this.view[model].on('change:' + attr, set);
                }
            }
        }
    };

    Ribs.Model = Backbone.Model.extend({
        _super: Backbone.Model,

        constructor: function(attributes, options) {
            this._ribs = {
                computeds: {},
                computedsDeps: {}
            };

            var attrs = attributes || {};
            options || (options = {});
            this.cid = _.uniqueId('c');
            this.attributes = {};
            if (options.collection) this.collection = options.collection;
            if (options.parse) attrs = this.parse(attrs, options) || {};
            attrs = _.defaults({}, attrs, _.result(this, 'defaults'));

            var escapedAttrs = {};

            for (var attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    escapedAttrs[attr.replace('.', '!.')] = attrs[attr];
                }
            }

            this.set(escapedAttrs, options);
            this.changed = {};
            this.initialize.apply(this, arguments);




            this.initComputeds();
        },

        get: function (attr) {
            var computeds = this._ribs.computeds;

            if (attr in computeds) {
                return computeds[attr].get();
            }

            var path = _split(attr);

            if (path.length === 1) {
                return _super(this, 'get', [path[0]]);
            } else {
                return getPath(path, this.attributes);
            }
        },

        set: function (key, val, options) {
            if (key == null) {
                return this;
            }

            var attrs,changes,changing,current,prev,silent,unset,path,attr;

            if (typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                attrs = {};
                attrs[key] = val;
            }

            options || (options = {});

            if (!this._validate(attrs, options)) {
                return false;
            }

            unset           = options.unset;
            silent          = options.silent;
            changes         = [];
            changing        = this._changing;
            this._changing  = true;

            //new from Ribs
            var computeds = this._ribs.computeds,
                realAttrs = _.clone(attrs),
                computedsAttrs = {},
                newAttrs;

            for (attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    if (attr in computeds) {
                        newAttrs = computeds[attr].set(attrs[attr]);
                        computedsAttrs[attr] = attrs[attr];
                        delete attrs[attr];

                        _.extend(attrs, newAttrs);
                    }
                }
            }
            ////////////////////////

            if (!changing) {
                this._previousAttributes = _.clone(this.attributes);
                //new from Ribs
                for (attr in computeds) {
                    if (computeds.hasOwnProperty(attr)) {
                        this._previousAttributes[attr] = computeds[attr].value;
                    }
                }
                ////////////////////////

                this.changed = {};
            }

            current = this.attributes;
            prev = this._previousAttributes;

            if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

            //new from Ribs
            for (attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    val = attrs[attr];
                    path = _split(attr);
                    if (!_.isEqual(getPath(path, current), val)) {
                        changes.push({
                            path: path,
                            attr: attr,
                            val: val
                        });
                    }

                    if (!_.isEqual(getPath(path, prev), val)) {
                        this.changed[attr] = val;
                    } else {
                        delete this.changed[attr];
                    }

                    if (unset && (attr in realAttrs)) {
                        deletePath(path, current);
                    } else {
                        this._setPath(path, val);
                    }
                }
            }

            //Update computeds, which depend on changed attributes
            var l = changes.length,
                computedsDeps = this._ribs.computedsDeps,
                computedsToUpdate = [],
                deps,
                dep,
                i, j;

            for (i = 0; i < l; i++) {
                attr = changes[i].attr;
                deps = computedsDeps[attr];
                if (deps) {
                    for (j = 0; j < deps.length; j++) {
                        dep = deps[j];
                        if (computedsToUpdate.indexOf(dep) === -1) {
                            computedsToUpdate.push(dep);
                        }
                    }
                }
            }

            for (i = 0; i < computedsToUpdate.length; i++) {
                attr = computedsToUpdate[i];
                computeds[attr].update();
                val = computeds[attr].value;

                if (!_.isEqual(computeds[attr]._previous, val)) {
                    changes.push({
                        attr: attr,
                        val: val
                    });
                }

                if (!_.isEqual(prev[attr], val)) {
                    this.changed[attr] = val;
                } else {
                    delete this.changed[attr];
                }
            }
            ////////////////////////////////////////////////////////

            for (attr in computedsAttrs) {
                if (computedsAttrs.hasOwnProperty(attr)) {
                    if (unset) {
                        this.removeComputed(attr);
                    }
                }
            }

            if (!silent) {
                l = changes.length;

                if (l) {
                    this._pending = options;
                }

                for (i = 0; i < l; i++) {
                    this.trigger('change:' + changes[i].attr, this, changes[i].val, options);
                    //ToDo: maybe trigger change all items in path
                }
            }
            /////////////////////////////

            if (changing) {
                return this;
            }

            if (!silent) {
                while (this._pending) {
                    options = this._pending;
                    this._pending = false;
                    this.trigger('change', this, options);
                }
            }
            this._pending = false;
            this._changing = false;
            return this;
        },

        _setPath: function (path, val) {
            var attr = this.attributes,
                p;

            path = path.slice();

            while (path.length) {
                p = path.shift();

                if (path.length) {
                    if (!(attr.hasOwnProperty(p) && attr[p] instanceof Object)) {
                        //attr[p] = {};

                        throw new Error('set: can\'t set anything to "' + p + '", typeof == "' + typeof attr[p] + '"');
                    }

                    attr = attr[p];
                } else {
                    attr[p] = val;
                }
            }
        },

        initComputeds: function () {
            var computeds = this.computeds;

            for (var name in computeds) {
                if (computeds.hasOwnProperty(name)) {
                    this.addComputed(name, computeds[name]);
                }
            }
        },

        addComputed: function (name, computed) {
            if (name in this.attributes) {
                throw new Error('addComputed: computed name "' + name + '" is already used');
            }

            var deps = computed.deps,
                computedsDeps = this._ribs.computedsDeps,
                depArr,
                dep;

            if (deps instanceof Array) {
                for (var i = 0; i < deps.length; i++) {
                    dep = deps[i];
                    depArr = _split(dep);
                    depArr[depArr.length - 1] = dep;

                    for (var j = 0; j < depArr.length; j++) {
                        dep = depArr[j];
                        if (dep in computedsDeps) {
                            if (computedsDeps[dep].indexOf(name) === -1) {
                                computedsDeps[dep].push(name);
                            }
                        } else {
                            computedsDeps[dep] = [name];
                        }
                    }


                }
            }

            this._ribs.computeds[name] = new Computed(computed, name, this);
            this._ribs.computeds[name].update();
            return this;
        },

        removeComputed: function (name) {
            var computedsDeps = this._ribs.computedsDeps,
                dep,
                attr,
                index;

            for (attr in computedsDeps) {
                if (computedsDeps.hasOwnProperty(attr)) {
                    dep = computedsDeps[attr];
                    index = dep.indexOf(name);

                    if (index !== -1) {
                        dep.splice(index, 1);
                    }

                    if (!dep.length) {
                        delete computedsDeps[attr];
                    }
                }
            }

            delete this._ribs.computeds[name];
            return this;
        }
    });

    Ribs.View = Backbone.View.extend({
        _super: Backbone.View,

        constructor: function(attributes, options) {
            this._ribs = {
                bindings: []
            };
            _super(this, 'constructor', arguments);
            this.initBindings();
        },

        initBindings: function () {
            var bindings = this.bindings;

            for (var s in bindings) {
                if (bindings.hasOwnProperty(s)) {
                    this.addBinding(s, bindings[s]);
                }
            }
        },

        addBinding: function (selector, binding) {
            var $el;

            if (selector === 'el') {
                $el = this.$el;
            } else {
                $el = this.$(selector);
            }

            binding = parseBinding(binding);

            this._ribs.bindings.push(new Binding(this, $el, binding));
        },

        removeBindings: function () {
            var bindings = this._ribs.bindings;

            for (var i = 0; i < bindings.length; i++) {
                bindings[i].unbind();
            }

            this._ribs.bindings = [];
        }
    });

    return Ribs;
}));