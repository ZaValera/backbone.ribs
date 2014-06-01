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
        version: '0.0.6'
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
            var newStr = '',
                substr,
                openBr = str.indexOf('(') + 1,
                closeBr = str.indexOf(')') + 1;

            if (openBr) {
                while (str.length) {
                    openBr = str.indexOf('(') + 1;
                    closeBr = str.indexOf(')') + 1 || str.length;

                    newStr += str.slice(0, openBr);
                    substr = str.slice(openBr, closeBr);
                    if (openBr) {
                        newStr += substr.replace(',', ' ');
                    } else {
                        newStr += substr;
                    }

                    str = str.slice(closeBr);
                }
            } else {
                newStr = str;
            }

            return JSON.parse(('{' + newStr + '}').replace(/([^\{\}\[\]\,\:]+)/ig,'"$1"'));
        } catch (e) {
            throw new Error('wrong binding format "' + str + '"');
        }
    };

    var parseModelAttr = function (modelAttrs) {
        var parsed = modelAttrs.match(/^([^\(]+)\(([^\)]+)\)/),
            res = {
                paths: []
            },
            paths,
            path,
            model,
            attr,
            filter;

        if (parsed) {
            filter = parsed[1];
            paths = parsed[2].split(' ');
        } else {
            paths = modelAttrs.split(' ');
        }

        res.filter = filter;

        if (filter && !filters.hasOwnProperty(filter)) {
            throw new Error('unknown filter "' + filter + '"');
        }

        if (!filter && paths.length > 1) {
            throw new Error('wrong binging "' + modelAttrs + '"');
        }

        for (var i = 0; i < paths.length; i++) {
            path = paths[i];
            parsed = path.match(/^(?:\!\.|[^.])+/);

            try {
                model = parsed[0];
                attr = paths[i].slice(model.length + 1);
                if (!attr.length) {
                    throw '';
                }
            } catch (e) {
                throw new Error('wrong binging "' + modelAttrs + '"');
            }

            res.paths.push({
                model: model,
                attr: attr
            });
        }

        return res;
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

    Computed.prototype.update = function (options) {
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

        if (!_.isEqual(this._previous, this.value)) {
            this._model.trigger('change:' + this.name, this.value, this._model, options);
        }
    };

    Computed.prototype.get = function () {
        return this.value;
    };

    var Binding = function (view, selector, bindings) {
        this.selector = selector;
        this.view = view;

        this._setEl();

        if (bindings.events) {
            this.events = bindings.events.join(' ');
            delete bindings.events;
        } else {
            this.events = 'change';
        }

        this.handlers = [];

        var binding;

        for (var type in bindings) {
            if (bindings.hasOwnProperty(type)) {
                binding = bindings[type];

                if (typeof binding === 'string') {
                    this.addHandler(type, binding);
                } else {
                    for (var attr in binding) {
                        if (binding.hasOwnProperty(attr)) {
                            this.addHandler(type, binding[attr], attr);
                        }
                    }
                }
            }
        }
    };

    Binding.prototype.unbind = function () {
        var handlers = this.handlers,
            col = [],
            paths,
            path,
            model,
            attrArray,
            ch,
            handler,
            i, j, k;

        for (i = 0; i < handlers.length; i++) {
            handler = handlers[i];
            if (handler.get) {
                this.$el.off(handler.events, handler.get);
            }

            paths = handler.paths;

            for (j = 0; j < paths.length; j++) {
                path = paths[j];
                attrArray = _split(path.attr);
                model = path.model;
                ch = '';

                if (this.view[model] instanceof Backbone.Collection) {
                    if (col.indexOf(model) === -1) {
                        col.push(model);
                        this.view[model].off('add remove reset sort', handler.set);
                    }
                }

                for (k = 0; k < attrArray.length; k++) {
                    if (ch) {
                        ch += '.';
                    }
                    
                    ch += attrArray[k];
                    this.view[model].off('change:' + ch, handler.set);
                }
            }
        }
    };

    Binding.prototype.addHandler = function (type, binding, bindAttr) {
        binding = parseModelAttr(binding);

        var paths = binding.paths,
            attrs = [],
            col = [],
            self = this,
            path,
            model,
            attr,
            attrArray,
            ch,
            modelAttr,
            handler = {
                paths: paths
            },
            set = handlers[type],
            get;

        if (typeof set !== 'function') {
            get = set.get;
            set = set.set;
        }

        if (binding.filter) {
            var filter = filters[binding.filter];
        }

        var setter = function () {
            var attrs = [],
                attr,
                path;

            for (var i = 0; i < paths.length; i++) {
                path = paths[i];

                if (self.view[path.model] instanceof Backbone.Collection) {
                    attrs.push(self.view[path.model].pluck(path.attr));
                } else {
                    attrs.push(self.view[path.model].get(path.attr));
                }
            }

            if (filter) {
                attr = filter.apply(self.view, attrs);
            } else {
                attr = attrs[0];
            }

            set.call(self, attr, bindAttr);
        };

        for (var i = 0; i < paths.length; i++) {
            path = paths[i];
            model = path.model;
            attr = path.attr;
            attrArray = _split(attr);
            ch = '';

            if (this.view[model] instanceof Backbone.Collection) {
                attrs.push(this.view[model].pluck(attr));
                if (col.indexOf(model) === -1) {
                    col.push(model);
                    this.view[model].on('add remove reset sort', setter);
                }
            } else {
                attrs.push(this.view[model].get(attr));
            }

            for (var j = 0; j < attrArray.length; j++) {
                if (ch) {
                    ch += '.';
                }

                ch += attrArray[j];
                this.view[model].on('change:' + ch, setter);
            }
        }

        if (filter) {
            modelAttr = filter.apply(this.view, attrs);
        } else {
            modelAttr = attrs[0];
        }

        set.call(this, modelAttr, bindAttr);

        if (get) {
            var events = this.events,
                getter = function () {
                    self.view[model].set(attr, get.call(self));
                };

            this.$el.on(events, getter);

            handler.events = events;
            handler.get = getter;
        }

        handler.set = setter;
        this.handlers.push(handler);
    };

    Binding.prototype._setEl = function () {
        var selector = this.selector;

        if (selector === 'el') {
            this.$el = this.view.$el;
        } else {
            this.$el = this.view.$(selector);
        }
    };

    var filters = {
        not: function (val) {
            return !val;
        }
    };

    var handlers = {
        text: function (value) {
            this.$el.text(value);
        },

        value: {
            set: function (value) {
                if (this.$el.val() !== value) {
                    this.$el.val(value);
                }
            },
            get: function () {
                return this.$el.val();
            }
        },

        css: function (value, style) {
            this.$el.css(style, value);
        },

        attr: function (value, attr) {
            this.$el.attr(attr, value);
        },

        classes: function (value, cl) {
            this.$el.toggleClass(cl, !!value);
        },

        html: function (value) {
            this.$el.html(value);
        },

        toggle: function (value) {
            this.$el.toggle(!!value);
        },

        disabled: function (value) {
            this.$el.prop('disabled', !!value);
        },

        enabled: function (value) {
            this.$el.prop('disabled', !value);
        },

        checked: {
            set: function (value) {
                this.$el.prop('checked', false);

                if (value instanceof Array) {
                    for (var i = 0; i < value.length; i++) {
                        this.$el.filter('[value="' + value[i] + '"]').prop('checked', true);
                    }
                } else if (typeof value === 'boolean') {
                    this.$el.prop('checked', value);
                } else {
                    this.$el.filter('[value="' + value + '"]').prop('checked', true);
                }
            },

            get: function () {
                var type = this.$el.attr('type'),
                    checkedEl = this.$el.filter(':checked');

                if (type === 'checkbox') {
                    var checked = [];

                    if (this.$el.length === 1) {
                        return !!checkedEl.length;
                    } else {
                        checkedEl.each(function (i, el) {
                            checked.push($(el).val());
                        });

                        return checked;
                    }
                } else {
                    return checkedEl.val();
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

            this._initComputeds();
            this.initialize.apply(this, arguments);
        },

        get: function (attr) {
            if (typeof attr !== 'string') {
                return undefined;
            }

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

            var attrs,changes,changing,current,prev,silent,unset,path,attr,i,j,l;

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
            //Заменяем все computeds на обычные аргументы
            var computeds = this._ribs.computeds,
                realAttrs = _.clone(attrs),
                computedsAttrs = {},
                newAttrs,
                hasComputed = true,
                firstLoop = true;


            while (hasComputed) {
                hasComputed = false;
                newAttrs = {};

                for (attr in attrs) {
                    if (attrs.hasOwnProperty(attr)) {
                        if (attr in computeds) {
                            hasComputed = true;
                            _.extend(newAttrs, computeds[attr].set(attrs[attr]));
                            if (firstLoop) {
                                computedsAttrs[attr] = attrs[attr];
                            }

                            delete attrs[attr];
                            _.extend(attrs, newAttrs);
                        }
                    }
                }

                firstLoop = false;
            }
            ////////////////////////

            if (!changing) {
                this._previousAttributes = _.clone(this.attributes);

                var previousComputeds = {};

                for (attr in computeds) {
                    if (computeds.hasOwnProperty(attr)) {
                        previousComputeds[attr] = computeds[attr].value;
                    }
                }

                _.extend(this._previousAttributes, previousComputeds);

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

            //Если передан флаг unset удаляем computed
            for (attr in computedsAttrs) {
                if (computedsAttrs.hasOwnProperty(attr) && unset) {
                    this.removeComputed(attr);
                    delete computedsAttrs[attr];
                }
            }



            var computedsDeps = this._ribs.computedsDeps,
                computedsToUpdate = [],
                deps,
                dep;

            for (i = 0, l = changes.length; i < l; i++) {
                attr = changes[i].attr;
                deps = computedsDeps['change:' + attr];
                if (deps) {
                    for (j = 0; j < deps.length; j++) {
                        dep = deps[j];
                        if (computedsToUpdate.indexOf(dep) === -1) {
                            computedsToUpdate.push(dep);
                        }
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
            } else {
                //Обновляем computeds, который только что засетили
                /*for (attr in computedsAttrs) {
                    if (computedsAttrs.hasOwnProperty(attr)) {
                        computeds[attr].update(options);
                    }
                }*/
            }



            for (i = 0; i < computedsToUpdate.length; i++) {
                attr = computedsToUpdate[i];

                //if (!options.silent || attr in computedsAttrs) {
                    computeds[attr].update(options);
                //}
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

        trigger: function(name) {
            var computedsDeps = this._ribs.computedsDeps,
                options = arguments[3],
                i;

            if (typeof name === 'string' && name in computedsDeps) {
                var computeds = this._ribs.computeds,
                    deps = computedsDeps[name],
                    computed;

                for (i = 0; i < deps.length; i++) {
                    computed = computeds[deps[i]];
                    computed.update(options);
                }
            }

            if (options && options.silent) {
                return this;
            }

            return _super(this, 'trigger', arguments);
        },

        _setPath: function (path, val) {
            var attr = this.attributes,
                p;

            path = path.slice();

            while (path.length) {
                p = path.shift();

                if (path.length) {
                    if (!(attr.hasOwnProperty(p) && attr[p] instanceof Object)) {
                        throw new Error('set: can\'t set anything to "' + p + '", typeof == "' + typeof attr[p] + '"');
                    }

                    attr = attr[p];
                } else {
                    attr[p] = val;
                }
            }
        },

        _initComputeds: function () {
            var computeds = this.computeds,
                name;

            for (name in computeds) {
                if (computeds.hasOwnProperty(name)) {
                    this.addComputed(name, computeds[name], {silent: true});
                }
            }

            //Это не ошибка, сначала создаем все computeds, а потом обновляем
            for (name in computeds) {
                if (computeds.hasOwnProperty(name)) {
                    this._ribs.computeds[name].update();
                }
            }
        },

        addComputed: function (name, computed) {
            if (name in this.attributes || name in this._ribs.computeds) {
                throw new Error('addComputed: computed name "' + name + '" is already used');
            }

            var deps = computed.deps,
                computedsDeps = this._ribs.computedsDeps,
                depArr,
                dep;

            if (deps instanceof Array) {
                for (var i = 0; i < deps.length; i++) {
                    depArr = _split(deps[i]);
                    dep = 'change:' + depArr[0].replace('.', '!.');

                    for (var j = 0; j < depArr.length; j++) {
                        if (dep in computedsDeps) {
                            if (computedsDeps[dep].indexOf(name) === -1) {
                                computedsDeps[dep].push(name);
                            }
                        } else {
                            computedsDeps[dep] = [name];
                        }

                        if (depArr[j + 1]) {
                            dep += '.' + depArr[j + 1].replace('.', '!.');
                        }
                    }
                }
            }

            this._ribs.computeds[name] = new Computed(computed, name, this);

            var options = arguments[2] || {};

            if (!options.silent) {
                this._ribs.computeds[name].update();
            }
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
                _bindings: this.bindings || {},
                bindings: [],
                collections: {}
            };

            if (this.filters) {
                _.extend(filters, this.filters);
            }

            _super(this, 'constructor', arguments);

            if (!this._ribs.preventBindings) {
                this.applyBindings();
            }
        },

        preventBindings: function () {
            this._ribs.preventBindings = true;
        },

        applyBindings: function () {
            this.removeBindings();

            var _bindings = this._ribs._bindings;

            for (var s in _bindings) {
                if (_bindings.hasOwnProperty(s)) {
                    this.addBinding(s, _bindings[s]);
                }
            }
        },

        addBinding: function (selector, bindings) {
            var _bindings = this._ribs._bindings;

            if (!_bindings.hasOwnProperty(selector)) {
                _bindings[selector] = bindings;
            }

            bindings = parseBinding(bindings);

            if (bindings.collection) {
                var colBind = bindings.collection;

                this.applyCollection(selector, this[colBind.col], this[colBind.view]);
                delete bindings.collection;
            }

            this._ribs.bindings.push(new Binding(this, selector, bindings));
        },

        removeBindings: function () {
            var bindings = this._ribs.bindings,
                collections = this._ribs.collections;

            for (var i = 0; i < bindings.length; i++) {
                bindings[i].unbind();
            }

            for (var cols in collections) {
                if (collections.hasOwnProperty(cols)) {
                    cols = collections[cols];

                    for (var ribsCol in cols) {
                        if (cols.hasOwnProperty(ribsCol)) {
                            ribsCol = cols[ribsCol];
                            ribsCol.collection.off('sort', this.renderCollection, this);
                            ribsCol.collection.off('add', this._onaddView, this);
                            ribsCol.collection.off('remove', this._removeView, this);
                            ribsCol.collection.off('reset', this._onReset, this);

                            for (var v in ribsCol.views) {
                                if (ribsCol.views.hasOwnProperty(v)) {
                                    ribsCol.views[v].remove();
                                }
                            }
                        }
                    }
                }
            }

            this._ribs.collections = {};
            this._ribs.bindings = [];
        },

        updateBindings: function () {
            var bindings = this._ribs.bindings,
                binding;

            for (var i = 0; i < bindings.length; i++) {
                binding = bindings[i];
                binding._setEl();

                for (var j = 0; j < binding.handlers.length; j++) {
                    binding.handlers[j].set();
                }
            }
        },

        applyCollection: function (selector, collection, View, data) {
            var col,
                $el;

            if (selector instanceof $) {
                $el = selector;
            } else if (selector === 'el') {
                $el = this.$el;
            } else {
                $el = this.$(selector);
            }

            selector = $el.selector;

            if (collection.comparator) {
                collection.sort();
            }

            if (!collection.cid) {
                collection.cid = _.uniqueId('col');

                collection.on('sort', this.renderCollection, this);
                collection.on('add', this._onaddView, this);
                collection.on('remove', this._removeView, this);
                collection.on('reset', this._onReset, this);
            }

            col = this._ribs.collections[collection.cid];

            if (!col) {
                col = this._ribs.collections[collection.cid] = {};
            }

            col[selector] = {
                collection: collection,
                $el: $el,
                View: View,
                data: data || {},
                views: {}
            };

            for (var i = 0; i < collection.length; i++) {
                this._addView(collection.at(i), collection, selector);
            }
        },

        renderCollection: function (collection, selector) {
            var cols = this._ribs.collections[collection.cid],
                $el,
                ribsCol,
                views,
                view;

            if (selector instanceof $) {
                $el = selector;
            } else if (selector === 'el') {
                $el = this.$el;
            } else {
                $el = this.$(selector);
            }

            selector = $el.selector;

            for (var c in cols) {
                if (cols.hasOwnProperty(c) && (!selector || c === selector)) {
                    ribsCol = cols[c];
                    if (!ribsCol) {
                        throw new Error('can\'t render collection without binding');
                    }

                    views = ribsCol.views;

                    for (view in views) {
                        if (views.hasOwnProperty(view)) {
                            views[view].$el.detach();
                        }
                    }

                    for (var i = 0; i < collection.length; i++) {
                        view = views[collection.at(i).cid];

                        if (!view) {
                            this._addView(collection.at(i), collection, c);
                        } else {
                            ribsCol.$el.append(view.$el);
                        }
                    }
                }
            }
        },

        _onaddView: function (model, collection) {
            this._addView(model, collection);
        },

        _addView: function (model, collection, selector) {
            var cols = this._ribs.collections[collection.cid],
                ribsCol,
                view,
                index;

            for (var c in cols) {
                if (cols.hasOwnProperty(c) && (!selector || c === selector)) {
                    ribsCol = cols[c];
                    view = new ribsCol.View(_.extend(ribsCol.data, {model: model, collection: collection}));

                    ribsCol.views[model.cid] = view;

                    index = collection.models.indexOf(model);

                    if (index) {
                        ribsCol.views[collection.at(index - 1).cid].$el.after(view.$el);
                    } else {
                        if (collection.length > 1) {
                            var nextView = ribsCol.views[collection.at(1).cid];

                            if (nextView) {
                                nextView.$el.before(view.$el);
                            } else {
                                ribsCol.$el.append(view.$el);
                            }
                        } else {
                            ribsCol.$el.append(view.$el);
                        }
                    }
                }
            }
        },

        _removeView: function (model, collection) {
            var cols = this._ribs.collections[collection.cid],
                ribsCol,
                view;

            for (var c in cols) {
                if (cols.hasOwnProperty(c)) {
                    ribsCol = cols[c];
                    view = ribsCol.views[model.cid];

                    view.remove();
                    delete ribsCol.views[model.cid];
                }
            }
        },

        _onReset: function (collection) {
            var cols = this._ribs.collections[collection.cid],
                ribsCol,
                views;

            for (var c in cols) {
                if (cols.hasOwnProperty(c)) {
                    ribsCol = cols[c];
                    views = ribsCol.views;

                    for (var view in views) {
                        if (views.hasOwnProperty(view)) {
                            view = views[view];
                            view.remove();
                        }
                    }

                    ribsCol.views = {};

                    for (var i = 0; i < collection.length; i++) {
                        this._addView(collection.at(i), collection);
                    }
                }
            }
        }
    });

    return Ribs;
}));