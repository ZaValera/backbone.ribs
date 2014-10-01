//     Backbone.Ribs.js 0.2.9

//     (c) 2014 Valeriy Zaytsev
//     Ribs may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/ZaValera/backbone.ribs

(function(root, factory) {
    'use strict';

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
    'use strict';

    var Ribs = Backbone.Ribs = {
        version: '0.2.9'
    };

    var _super = function (self, method, args) {
        return self._super.prototype[method].apply(self, args);
    };

    //optimized
    var _split = function (str) {
        if (str.indexOf('!.') === -1) {
            return str.split('.');
        }

        var res = [],
            length, _length, l,
            last, s,
            i, j;

        str = str.split('!.');
        length = str.length;

        for (i = 0; i < length; i++) {
            s = str[i].split('.');
            _length = s.length;

            if (last !== undefined) {
                last += '.' + s[0];

                if (_length > 1) {
                    res.push(last);
                } else {
                    if (i + 1 === length) {
                        res.push(last);
                    }
                    continue;
                }

                j = 1;
            } else {
                j = 0;
            }

            if (i + 1 < length) {
                l = _length - 1;
                last = s[_length - 1];
            } else {
                l = _length;
            }

            for (; j < l; j++) {
                res.push(s[j]);
            }
        }

        return res;
    };

    //optimized
    var getPath = function (path, obj) {
        var p, i, l;

        if (typeof path === 'string') {
            path = _split(path);
        }

        for (i = 0, l = path.length; i < l; i++) {
            p = path[i];

            if (obj.hasOwnProperty(p)) {
                obj = obj[p];
            } else {
                if (l > i + 1) {
                    throw new Error('can\'t get "' + path[i + 1] + '" of "' + p + '", "' + p +'" is undefined');
                } else {
                    return undefined;
                }
            }
        }

        return obj;
    };

    //optimized
    var deletePath = function (path, obj) {
        var p;

        for (var i = 0, l = path.length; i < l; i++) {
            p = path[i];

            if (i + 1 === l) {
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

    //optimized
    var splitModelAttr = function (modelAttr) {
        var parsed = modelAttr.match(/^(?:!\.|[^.])+/),
            model,
            attr;

        try {
            model = parsed[0];
            attr = modelAttr.slice(model.length + 1);
            if (!attr.length || !model.length) {
                throw '';
            }
        } catch (e) {
            throw new Error('wrong binging data"' + modelAttr + '"');
        }

        return {
            model: model,
            attr: attr
        };
    };

    //optimized
    var Computed = function (data, name, model) {
        this.name = name;

        if (typeof data === 'function') {
            this.get = function () {return data.apply(model);};
            this.set = function () {
                throw new Error('set: computed "' + name + '" has no set method');
            };
            this._simple = true;
            return this;
        }

        this._deps = data.deps;
        this._get = data.get;
        this.set = function () {return data.set.apply(model, arguments);};
        this._model = model;

        return this;
    };

    //optimized
    Computed.prototype.update = function (options) {
        if (this._simple) {
            return;
        }

        var deps = [],
            val;

        this._previous = this.value;

        if (this._deps instanceof Array) {
            for (var i = 0, l = this._deps.length; i < l; i++) {
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
            this._model.trigger('change:' + this.name, this._model, this.value, options);
        }
    };

    //optimized
    Computed.prototype.get = function () {
        return this.value;
    };

    //optimized
    var Binding = function (view, selector, bindings) {
        var binding;

        this.selector = selector;
        this.view = view;
        this.mods = {};
        this._hasInDOMHandler = bindings.hasOwnProperty('inDOM');
        this._setEl();
        this.handlers = [];

        for (var type in bindings) {
            if (type !== 'collection' && bindings.hasOwnProperty(type)) {
                binding = bindings[type];

                if (binding instanceof Array) {
                    for (var i = 0, l = binding.length; i < l; i++) {
                        this._addHandler(type, binding[i]);
                    }
                } else {
                    this._addHandler(type, binding);
                }
            }
        }
    };

    //optimized
    Binding.prototype._addHandler = function (type, binding) {
        var handler = this.view.handlers[type];

        if (!handler) {
            throw new Error('unknown handler type "' + type + '"');
        }

        if (handler.multiple) {
            for (var attr in binding) {
                if (binding.hasOwnProperty(attr)) {
                    this.addHandler(type, binding[attr], attr);
                }
            }
        } else {
            this.addHandler(type, binding);
        }
    };

    //optimized
    Binding.prototype.addHandler = function (type, binding, bindAttr) {
        var data = binding.data,
            filter = binding.filter,
            events = binding.events || 'change',
            filters = this.view.filters,
            paths = [], attrs = [], col = [], changeAttrs = {}, self = this,
            handler = {
                changeAttrs: changeAttrs
            },
            setHandler = this.view.handlers[type],
            getHandler,
            getFilter, setFilter,
            path, model, attr, attrArray, modelAttr, ch, changeAttr,
            setter, getter,
            i, l, j, l2;

        if (typeof setHandler !== 'function') {
            getHandler = setHandler.get;
            setHandler = setHandler.set;
        }

        //Формируем paths - массив объектов model-attr
        if (typeof binding === 'string') {
            paths.push(splitModelAttr(binding));
        } else {
            if (typeof data === 'string') {
                paths.push(splitModelAttr(data));
            } else if (data instanceof Array) {
                for (i = 0, l = data.length; i < l; i++) {
                    paths.push(splitModelAttr(data[i]));
                }
            } else {
                throw new Error('wrong binging format ' + JSON.stringify(binding));
            }
        }
        //////////////////////////////////////////////

        //Определяемся с фильтром
        if (filter) {
            if (typeof filter === 'string') {
                if (!filters.hasOwnProperty(filter)) {
                    throw new Error('unknown filter "' + filter + '"');
                }

                filter = filters[filter];
            }

            if (typeof filter === 'function') {
                getFilter = filter;
            } else {
                getFilter = filter.get;
                setFilter = filter.set;
            }
        }
        //////////////////////////////

        //Определяем обработчик события при изменении модели/коллекции
        if (setHandler) {
            setter = function () {
                var attrs = [],
                    view = self.view,
                    model, attr, path, i, l;

                for (i = 0, l = paths.length; i < l; i++) {
                    path = paths[i];
                    model = path.model;
                    attr = path.attr;

                    if (view[model] instanceof Backbone.Collection) {
                        attrs.push(view[model].pluck(attr));
                    } else {
                        attrs.push(view[model].get(attr));
                    }
                }

                if (getFilter) {
                    attr = getFilter.apply(view, attrs);
                } else {
                    attr = attrs[0];
                }

                setHandler.call(self, self.$el, attr, bindAttr, binding);
            };
        }
        //////////////////////////////////////////////////////////////

        //Определяем обработчик при изменении DOM-элемента
        if (getHandler) {
            if (paths.length > 1) {
                throw new Error('wrong binging format ' + JSON.stringify(binding));
            }

            getter = function () {
                var val = getHandler.call(self, self.$el);

                if (setFilter) {
                    val = setFilter.call(self.view, val);
                }

                self.view[paths[0].model].set(attr, val);
            };
        }
        ///////////////////////////////////////////////////

        for (i = 0, l = paths.length; i < l; i++) {
            path = paths[i];
            model = path.model;
            attr = path.attr;
            attrArray = _split(attr);
            ch = '';
            changeAttr = changeAttrs[model] = [];

            if (this.view[model] instanceof Backbone.Collection) {
                attrs.push(this.view[model].pluck(attr));

                if (setHandler) {
                    if (col.indexOf(model) === -1) {
                        col.push(model);
                        this.view[model].on('add remove reset sort', setter);
                    }
                }
            } else {
                attrs.push(this.view[model].get(attr));
            }

            if (setHandler) {
                for (j = 0, l2 = attrArray.length; j < l2; j++) {
                    if (ch) {
                        ch += '.';
                    }

                    ch += attrArray[j];
                    changeAttr.push(ch);

                    this.view[model].on('change:' + ch, setter);
                }
            }
        }

        if (getFilter) {
            modelAttr = getFilter.apply(this.view, attrs);
        } else {
            modelAttr = attrs[0];
        }

        if (setHandler) {
            setHandler.call(this, this.$el, modelAttr, bindAttr, binding);

            handler.setter = setter;
        }

        if (getHandler) {
            this.view.$el.on(events + '.bindingHandlers' + this.view.cid, this.selector, getter);

            handler.events = events;
        }

        this.handlers.push(handler);
    };

    //optimized
    Binding.prototype._unbind = function () {
        var handlers = this.handlers,
            col = [],
            changeAttrs, changeAttr,
            handler, setter,
            model, i, j, l, l2;

        for (i = 0, l = handlers.length; i < l; i++) {
            handler = handlers[i];
            setter = handler.setter;

            if (!setter) {
                continue;
            }

            changeAttrs = handler.changeAttrs;

            for (model in changeAttrs) {
                if (changeAttrs.hasOwnProperty(model)) {
                    if (this.view[model] instanceof Backbone.Collection) {
                        if (col.indexOf(model) === -1) {
                            col.push(model);
                            this.view[model].off('add remove reset sort', setter);
                        }
                    }

                    changeAttr = changeAttrs[model];

                    for (j = 0, l2 = changeAttr.length; j < l2; j++) {
                        this.view[model].off('change:' + changeAttr[j], setter);
                    }
                }
            }
        }
    };

    //optimized
    Binding.prototype._setEl = function () {
        var selector = this.selector,
            dummy;

        if (selector === 'el') {
            this.$el = this.view.$el;
        } else {
            this.$el = this.view.$(selector);
        }

        if (this._hasInDOMHandler) {
            this.dummies = [];

            for (var i = 0; i < this.$el.length; i++) {
                dummy = document.createElement('div');
                dummy.style.display = 'none';
                dummy.className = 'ribsDummy';
                this.dummies.push(dummy);
            }

            if (selector === 'el') {
                this.view._$el = $(this.dummies[0]);
                this.view._el = this.view._$el[0];
            } else {
                this.view._$el = null;
                this.view._el = null;
            }
        }
    };

    //optimized
    var filters = {
        not: function (val) {
            return !val;
        },

        length: function (val) {
            if (val.hasOwnProperty('length')) {
                return val.length;
            } else {
                return 0;
            }
        }
    };

    //optimized
    var handlers = {
        text: function ($el, value) {
            $el.text(value);
        },

        value: {
            set: function ($el, value) {
                if ($el.val() !== value) {
                    $el.val(value);
                }
            },
            get: function ($el) {
                return $el.val();
            }
        },

        css: {
            set: function ($el, value, style) {
                $el.css(style, value);
            },
            multiple: true
        },

        attr: {
            set: function ($el, value, attr) {
                $el.attr(attr, value);
            },
            multiple: true
        },

        classes: {
            set: function ($el, value, cl) {
                $el.toggleClass(cl, !!value);
            },
            multiple: true
        },

        html: function ($el, value) {
            $el.html(value);
        },

        inDOM: function ($el, value) {
            var dummy,
                el;

            if (this.selector === 'el') {
                this.view._ribs.outOfDOM = !value;
            }

            for (var i = 0; i < $el.length; i++) {
                el = $el[i];
                dummy = this.dummies[i];

                if (value) {
                    if (!el.parentNode && dummy.parentNode) {
                        dummy.parentNode.replaceChild(el, dummy);
                    }
                } else {
                    if (el.parentNode) {
                        el.parentNode.replaceChild(dummy, el);
                    }
                }
            }
        },

        toggle: function ($el, value) {
            $el.toggle(!!value);
        },

        disabled: function ($el, value) {
            $el.prop('disabled', !!value);
        },

        enabled: function ($el, value) {
            $el.prop('disabled', !value);
        },

        checked: {
            set: function ($el, value) {
                $el.prop('checked', false);

                if (value instanceof Array) {
                    for (var i = 0, l = value.length; i < l; i++) {
                        $el.filter('[value="' + value[i] + '"]').prop('checked', true);
                    }
                } else if (typeof value === 'boolean') {
                    $el.prop('checked', value);
                } else {
                    $el.filter('[value="' + value + '"]').prop('checked', true);
                }
            },

            get: function ($el) {
                var type = $el.attr('type'),
                    checkedEl = $el.filter(':checked');

                if ($el.length === 1) {
                    return !!checkedEl.length;
                }

                if (type === 'checkbox') {
                    var checked = [];

                    checkedEl.each(function (i, el) {
                        checked.push($(el).val());
                    });

                    return checked;
                } else {
                    return checkedEl.val();
                }
            }
        },

        options: {
            set: function ($el, value) {
                $el.val(value);
            },

            get: function ($el) {
                return $el.val() || [];
            }
        },

        mod: {
            set: function ($el, value, cl, binding) {
                var modifier = this.mods[binding];

                if (modifier) {
                    $el.removeClass(modifier);
                }

                modifier = cl + value;
                this.mods[binding] = modifier;
                $el.addClass(modifier);
            },
            multiple: true
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
            options = options || {};
            this.cid = _.uniqueId('c');
            this.attributes = {};
            if (options.collection) {
                this.collection = options.collection;
            }
            if (options.parse) {
                attrs = this.parse(attrs, options) || {};
            }
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
                return this.attributes[path[0]];
            } else {
                return getPath(path, this.attributes);
            }
        },

        set: function (key, val, options) {
            if (key == null) {
                return this;
            }

            var attrs,changes,changing,current,prev,silent,unset,path,escapedPath,attr,i,j,l;

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

            if (this.idAttribute in attrs) {
                this.id = attrs[this.idAttribute];
            }

            //new from Ribs
            for (attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    val = attrs[attr];
                    path = _split(attr);
                    if (!_.isEqual(getPath(path, current), val)) {
                        escapedPath = path.slice();
                        
                        for (i = 0; i < escapedPath.length; i++) {
                            escapedPath[i] = escapedPath[i].replace('.', '!.');
                        }

                        changes.push({
                            path: path,
                            escapedPath: escapedPath,
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

                    if (options.propagation) {
                        escapedPath = changes[i].escapedPath.slice();

                        if (escapedPath.length) {
                            while (escapedPath.length - 1) {
                                escapedPath.length--;

                                this.trigger('change:' + escapedPath.join('.'), this, undefined, options);
                            }
                        }
                    }
                }
            }

            for (i = 0; i < computedsToUpdate.length; i++) {
                computeds[computedsToUpdate[i]].update(options);
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
                i, l;

            if (typeof name === 'string' && name in computedsDeps) {
                var computeds = this._ribs.computeds,
                    deps = computedsDeps[name],
                    computed;

                for (i = 0, l = deps.length; i < l; i++) {
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
        },

        removeComputeds: function () {
            this._ribs.computedsDeps = {};
            this._ribs.computeds = {};
            return this;
        },

        toJSON: function (options) {
            var json = _super(this, 'toJSON', arguments);

            if (options && options.computeds) {
                var computeds = this._ribs.computeds,
                    computed;

                for (var name in computeds) {
                    if (computeds.hasOwnProperty(name)) {
                        computed = computeds[name];
                        json[name] = computed._simple ? computed.get() : computed.value;
                    }
                }
            }

            return json;
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

            this.filters = this.filters || {};
            this.handlers = this.handlers || {};

            _.extend(this.filters, filters);
            _.extend(this.handlers, handlers);

            _super(this, 'constructor', arguments);

            if (!this._ribs.preventBindings) {
                this.applyBindings();
            }
        },

        getEl: function () {
            return this._ribs.outOfDOM ? this._$el : this.$el;
        },

        appendTo: function ($el) {
            if (!($el instanceof $)) {
                $el = $($el);
            }

            $el.append(this.getEl());
        },

        preventBindings: function () {
            this._ribs.preventBindings = true;
        },

        applyBindings: function (options) {
            if (options && options.remove) {
                this.removeBindings();
            }

            var _bindings = this._ribs._bindings;

            for (var s in _bindings) {
                if (_bindings.hasOwnProperty(s)) {
                    this.addBinding(s, _bindings[s]);
                }
            }
        },

        addBinding: function (selector, bindings) {
            var _bindings = this._ribs._bindings,
                hasBindings = false;

            if (!_bindings.hasOwnProperty(selector)) {
                _bindings[selector] = bindings;
            }

            if (typeof bindings !== 'object') {
                throw new Error('wrong binging format for "' + selector + '" - ' + JSON.stringify(bindings));
            }

            for (var b in bindings) {
                if (bindings.hasOwnProperty(b)) {
                    hasBindings = true;
                }
            }

            if (bindings.collection) {
                var colBind = bindings.collection,
                    view = typeof colBind.view === 'string' ? this[colBind.view] : colBind.view,
                    col = typeof colBind.col === 'string' ? this[colBind.col] : colBind.col;

                this.applyCollection(selector, col, view);
            }

            if (hasBindings) {
                this._ribs.bindings.push(new Binding(this, selector, bindings));
            }
        },

        removeBindings: function () {
            var bindings = this._ribs.bindings,
                collections = this._ribs.collections;

            this.$el.off('.bindingHandlers' + this.cid);

            for (var i = 0; i < bindings.length; i++) {
                bindings[i]._unbind();
            }

            for (var cols in collections) {
                if (collections.hasOwnProperty(cols)) {
                    cols = collections[cols];

                    for (var ribsCol in cols) {
                        if (cols.hasOwnProperty(ribsCol)) {
                            ribsCol = cols[ribsCol];
                            ribsCol.collection.off('sort', this._onSort, this);
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
                    binding.handlers[j].setter();
                }
            }
        },

        applyCollection: function (selector, collection, View, data) {
            var bindId = _.uniqueId('bc'),
                views = {},
                col,
                view,
                model,
                $el;

            data = data || {};

            if (selector instanceof $) {
                $el = selector;
            } else if (selector === 'el') {
                $el = this.$el;
            } else {
                $el = this.$(selector);
            }

            if (collection.comparator) {
                collection.sort();
            }

            if (!collection.cid) {
                collection.cid = _.uniqueId('col');
            }

            col = this._ribs.collections[collection.cid];

            if (!col) {
                col = this._ribs.collections[collection.cid] = {};

                collection.on('sort', this._onSort, this);
                collection.on('add', this._onaddView, this);
                collection.on('remove', this._removeView, this);
                collection.on('reset', this._onReset, this);
            }

            col[bindId] = {
                collection: collection,
                $el: $el,
                View: View,
                data: data,
                views: views
            };

            var fragment = document.createDocumentFragment();

            for (var i = 0; i < collection.length; i++) {
                model = collection.at(i);
                view = new View(_.extend(data, {model: model, collection: collection}));
                views[model.cid] = view;
                fragment.appendChild(view instanceof Backbone.Ribs.View ? view.getEl()[0] : view.el);
            }

            $el.append(fragment);

            return bindId;
        },

        _onSort: function (collection) {
            this.renderCollection(collection);
        },

        renderCollection: function (collection, bindId) {
            var cols = this._ribs.collections[collection.cid],
                ribsCol,
                views,
                view;

            for (var c in cols) {
                if (cols.hasOwnProperty(c) && (!bindId || c === bindId)) {
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
                            ribsCol.$el.append(view instanceof Backbone.Ribs.View ? view.getEl() : view.$el);
                        }
                    }
                }
            }
        },

        _onaddView: function (model, collection) {
            this._addView(model, collection);
        },

        _addView: function (model, collection, bindId) {
            var cols = this._ribs.collections[collection.cid],
                modelCid = model.cid,
                ribsCol,
                views,
                cid,
                view,
                index;

            for (var c in cols) {
                if (cols.hasOwnProperty(c) && (!bindId || c === bindId)) {
                    ribsCol = cols[c];
                    views = ribsCol.views;
                    view = new ribsCol.View(_.extend(ribsCol.data, {model: model, collection: collection}));

                    index = undefined;

                    for (var i = 0; i < collection.length; i++) {
                        cid = collection.at(i).cid;

                        if (cid === modelCid) {
                            if (index === undefined) {
                                ribsCol.$el.prepend(view.$el);
                            } else {
                                views[index].$el.after(view.$el);
                            }
                            break;
                        }

                        if (cid in views) {
                            index = cid;
                        }
                    }

                    views[modelCid] = view;
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
