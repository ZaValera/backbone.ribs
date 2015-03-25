//     Backbone.Ribs.js 0.4.6

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
        version: '0.4.6'
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

    _.extend(Computed.prototype, {
        //optimized
        update: function (options) {
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
        },
        //optimized
        get: function () {
            return this.value;
        }
    });

    //optimized
    var Binding = function (view, selector, bindings) {
        var binding;

        this.selector = selector;
        this.view = view;
        this.mods = {};
        this._hasInDOMHandler = bindings.hasOwnProperty('inDOM');
        this._setEl();
        this.handlers = {};

        for (var type in bindings) {
            if (bindings.hasOwnProperty(type)) {
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

    _.extend(Binding.prototype, {
        //optimized
        _addHandler: function (type, binding) {
            var handler = this.view.handlers[type],
                isCol = type === 'collection';

            if (!isCol && !handler) {
                throw new Error('unknown handler type "' + type + '"');
            }

            if (!isCol && handler.multiple) {
                for (var attr in binding) {
                    if (binding.hasOwnProperty(attr)) {
                        this.addHandler(type, binding[attr], attr);
                    }
                }
            } else {
                if (isCol) {
                    this.addColHandler(binding);
                } else {
                    this.addHandler(type, binding);
                }
            }
        },

        addColHandler: function (colBind) {
            var mainView = this.view,
                View = typeof colBind.view === 'string' ? mainView[colBind.view] : colBind.view,
                collection = typeof colBind.col === 'string' ? mainView[colBind.col] : colBind.col,
                data = colBind.data || {},
                selector = this.selector,
                views = {},
                self = this,
                $el;

            if (selector === 'el') {
                $el = mainView.$el;
            } else {
                $el = mainView.$(selector);
            }

            collection.on('sort', this._onsort, this);
            collection.on('add', this._onaddView, this);
            collection.on('remove', this._removeView, this);
            collection.on('reset', this._onReset, this);

            this.handlers.collection = {
                collection: collection,
                $el: $el,
                View: View,
                data: data,
                views: views
            };

            var colSet = collection.set;

            collection.set = function () {
                var res = colSet.apply(collection, arguments);

                if (self._toAdd) {
                    self._fillElByCollection();
                }

                self._toAdd = undefined;

                return res;
            };

            this._fillElByCollection();
        },

        _fillElByCollection: function (args) {
            var ribsCol = this.handlers.collection,
                collection = ribsCol.collection,
                views = ribsCol.views,
                data = ribsCol.data,
                View = ribsCol.View,
                $el = ribsCol.$el,
                fragment = document.createDocumentFragment(),
                toAdd = this._toAdd,
                view, model, cid, i, l;

            args = args || {};

            for (i = 0, l = collection.length; i < l; i++) {
                model = collection.at(i);
                cid = model.cid;
                view = views[cid];
                if (!view && !args.withoutNewView && (!toAdd || toAdd[cid])) {
                    view = new View(_.extend(data, {model: model, collection: collection}));
                    views[cid] = view;
                }

                if (view) {
                    fragment.appendChild(view instanceof Backbone.Ribs.View ? view.getEl()[0] : view.el);
                }
            }

            $el.append(fragment);
        },

        //optimized
        addHandler: function (type, binding, bindAttr) {
            var data = binding.data,
                filter = binding.filter,
                options = binding.options || {},
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

                getter = function (e) {
                    var val = getHandler.call(self, self.$el, e);

                    if (setFilter) {
                        val = setFilter.call(self.view, val);
                    }

                    self.view[paths[0].model].set(attr, val, options);
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
                this.view.$el.on(events + '.bindingHandlers', this.selector, getter);
                handler.getter = getter;
                handler.events = events;
            }

            this.handlers[type] = handler;
        },

        unbind: function (types) {
            var handlers = this.handlers,
                col = [],
                changeAttrs, changeAttr,
                handler, setter, events,
                model, i, l;

            for (var type in handlers) {
                if (handlers.hasOwnProperty(type) && !(types && types.indexOf('all') === -1 && types.indexOf(type) === -1)) {
                    handler = handlers[type];
                    setter = handler.setter;
                    events = handler.events;

                    if (events) {
                        this.view.$el.off(events + '.bindingHandlers', this.selector, handler.getter);
                    }

                    if (typeof setter === 'function') {
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

                                for (i = 0, l = changeAttr.length; i < l; i++) {
                                    this.view[model].off('change:' + changeAttr[i], setter);
                                }
                            }
                        }
                    }

                    if (type === 'collection') {
                        var collection = handler.collection,
                            views = handler.views,
                            view;

                        collection.off('sort', this._onsort, this);
                        collection.off('add', this._onaddView, this);
                        collection.off('remove', this._removeView, this);
                        collection.off('reset', this._onReset, this);

                        for (view in views) {
                            if (views.hasOwnProperty(view)) {
                                views[view].remove();
                            }
                        }
                    }

                    if (type === 'inDOM') {
                        var $el = this.$el,
                            dummies = this.dummies,
                            el, dummy;

                        for (i = 0, l = $el.length; i < l; i++) {
                            el = $el[i];
                            dummy = dummies[i];

                            if (!el.parentNode && dummy.parentNode) {
                                dummy.parentNode.replaceChild(el, dummy);
                            }
                        }

                        if (this.selector === 'el') {
                            this.view._ribs.outOfDOM = false;
                        }

                        this.dummies = [];
                    }

                    delete handlers[type];
                }
            }
        },

        update: function (types) {
            var handlers = this.handlers,
                handler, setter;

            for (var type in handlers) {
                if (handlers.hasOwnProperty(type) && !(types && types.indexOf('all') === -1 && types.indexOf(type) === -1)) {
                    handler = handlers[type];
                    setter = handler.setter;

                    if (typeof setter === 'function') {
                        this._setEl();
                        setter();
                    }

                    if (type === 'collection') {
                        this._fillElByCollection();
                    }
                }
            }
        },

        //optimized
        _setEl: function () {
            var selector = this.selector,
                dummy,
                $el;

            if (selector === 'el') {
                this.$el = this.view.$el;
            } else {
                this.$el = this.view.$(selector);
            }

            var bindings = this.view._ribs.bindings,
                binding;

            for (binding in bindings) {
                if (bindings.hasOwnProperty(binding)) {
                    binding = bindings[binding];

                    if (binding._hasInDOMHandler) {
                        $el = binding.$el.find(selector);

                        if ($el.length) {
                            this.$el = this.$el.add($el);
                        }
                    }
                }
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
        },

        _onsort: function () {
            if (!this._toAdd) {
                this._fillElByCollection({withoutNewView: true});
            }
        },

        _onaddView: function (model) {
            if (!this._toAdd) {
                this._toAdd = {};
            }

            this._toAdd[model.cid] = model;
        },

        _removeView: function (model) {
            var ribsCol = this.handlers.collection,
                view = ribsCol.views[model.cid];

            view.remove();
            delete ribsCol.views[model.cid];
        },

        _onReset: function () {
            var ribsCol = this.handlers.collection,
                views = ribsCol.views,
                view;

            for (view in views) {
                if (views.hasOwnProperty(view)) {
                    views[view].remove();
                }
            }

            ribsCol.views = {};
            this._fillElByCollection();
        }
    });

    //optimized
    var filters = {
        not: {
            set: function (val) {
                return !val;
            },
            get: function (val) {
                return !val;
            }
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
                    escapedAttrs[attr.replace(/\./g, '!.')] = attrs[attr];
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
                            escapedPath[i] = escapedPath[i].replace(/\./g, '!.');
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
                    this.addComputeds(name, computeds[name], {silent: true});
                }
            }

            //Это не ошибка, сначала создаем все computeds, а потом обновляем
            for (name in computeds) {
                if (computeds.hasOwnProperty(name)) {
                    this._ribs.computeds[name].update();
                }
            }
        },

        //optimized
        addComputeds: function (key, val, options) {
            var computedsDeps = this._ribs.computedsDeps,
                deps, dep, computed, computedsDep, silent,
                depArr, nextDepArr, name, attrs, i, j, l1, l2;

            if (typeof key === 'string') {
                attrs = {};
                attrs[key] = val;
            } else {
                options = val;
                attrs = key;
            }

            silent = options && options.silent;

            for (name in attrs) {
                if (attrs.hasOwnProperty(name)) {
                    if (this.attributes[name] || this._ribs.computeds[name]) {
                        throw new Error('addComputeds: computed name "' + name + '" is already used');
                    }

                    computed = attrs[name];
                    deps = computed.deps;

                    if (deps instanceof Array) {
                        for (i = 0, l1 = deps.length; i < l1; i++) {
                            depArr = _split(deps[i]);
                            dep = 'change:' + depArr[0].replace(/\./g, '!.');

                            for (j = 0, l2 = depArr.length; j < l2; j++) {
                                computedsDep = computedsDeps[dep];

                                if (computedsDep) {
                                    if (computedsDep.indexOf(name) === -1) {
                                        computedsDep.push(name);
                                    }
                                } else {
                                    computedsDeps[dep] = [name];
                                }

                                nextDepArr = depArr[j + 1];

                                if (nextDepArr) {
                                    dep += '.' + nextDepArr.replace(/\./g, '!.');
                                }
                            }
                        }
                    }

                    computed = this._ribs.computeds[name] = new Computed(computed, name, this);

                    if (!silent) {
                        computed.update();
                    }
                }
            }

            return this;
        },

        //redundant
        addComputed: function () {
            this.addComputeds.apply(this, arguments);
        },

        //redundant
        removeComputed: function (name) {
            this.removeComputeds(name);
        },

        removeComputeds: function (names) {
            if (!names) {
                this._ribs.computedsDeps = {};
                this._ribs.computeds = {};
                return this;
            }

            if (!(names instanceof Array)) {
                names = [names];
            }

            var computedsDeps = this._ribs.computedsDeps,
                dep, attr, index, name, i, l;

            for (i = 0, l = names.length; i < l; i++) {
                name = names[i];

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
            }

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
                _bindings: _.clone(this.bindings) || {},
                bindings: {},
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

        applyBindings: function () {
            this.addBindings(this._ribs._bindings);
        },

        addBindings: function (key, val) {
            var ribsBindings = this._ribs.bindings,
                bindings,
                selector,
                types,
                attrs;

            if (typeof key === 'string') {
                attrs = {};
                attrs[key] = val;
            } else {
                attrs = key;
            }

            for (selector in attrs) {
                if (attrs.hasOwnProperty(selector)) {
                    bindings = attrs[selector];

                    if (typeof bindings !== 'object' || _.isEmpty(bindings)) {
                        throw new Error('wrong binging format for "' + selector + '" - ' + JSON.stringify(bindings));
                    }

                    if (ribsBindings.hasOwnProperty(selector)) {
                        types = [];

                        for (var type in bindings) {
                            if (bindings.hasOwnProperty(type)) {
                                types.push(type);
                            }
                        }

                        this.removeBindings(selector, types);
                    }

                    ribsBindings[selector] = new Binding(this, selector, bindings);
                }
            }
        },

        //redundant
        addBinding: function (selector, bindings) {
            this.addBindings.apply(this, arguments);
        },

        removeBindings: function (key, val) {
            var bindings = this._ribs.bindings,
                types,
                attrs;

            if (typeof key === 'string') {
                attrs = {};
                attrs[key] = val;
            } else {
                attrs = key;
            }

            for (var s in bindings) {
                if (bindings.hasOwnProperty(s)) {
                    if (attrs) {
                        if (attrs.hasOwnProperty(s)) {
                            types = attrs[s];

                            if (typeof types === 'string') {
                                types = [types];
                            }
                        } else {
                            continue;
                        }
                    }

                    bindings[s].unbind(types);

                    if (_.isEmpty(bindings[s].handlers)) {
                        delete bindings[s];
                    }
                }
            }
        },

        updateBindings: function (key, val) {
            var bindings = this._ribs.bindings,
                types, attrs;

            if (typeof key === 'string') {
                attrs = {};
                attrs[key] = val;
            } else {
                attrs = key;
            }

            for (var s in bindings) {
                if (bindings.hasOwnProperty(s) && !(attrs && !attrs.hasOwnProperty(s))) {
                    if (attrs) {
                        if (attrs.hasOwnProperty(s)) {
                            types = attrs[s];

                            if (typeof types === 'string') {
                                types = [types];
                            }
                        } else {
                            continue;
                        }
                    }
                    
                    bindings[s].update(types);
                }
            }
        },

        //redundant
        applyCollection: function (selector, collection, View, data) {
            this.addBindings(selector, {collection: {
                col: collection,
                view: View,
                data: data
            }});
        },

        renderCollection: function (col, selector) {
            var bindings = this._ribs.bindings,
                binding,
                bindCol;

            for (var s in bindings) {
                if (bindings.hasOwnProperty(s) && (!selector || selector === s)) {
                    binding = bindings[s];
                    bindCol = binding.handlers.collection;

                    if (bindCol && (!col || bindCol.collection === col)) {
                        binding.update(['collection']);
                    }
                }
            }
        },

        getCollectionViews: function (selector) {
            var binding = this._ribs.bindings[selector];

            if (binding && binding.handlers.collection) {
                return binding.handlers.collection.views;
            }

            return undefined;
        },

        remove: function () {
            this.removeBindings();

            return _super(this, 'remove', arguments);
        }
    });

    return Ribs;
}));
