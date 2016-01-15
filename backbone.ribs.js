//     Backbone.Ribs.js 1.0.1

//     (c) 2014 Valeriy Zaytsev
//     Ribs may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/ZaValera/backbone.ribs

//JSHint settings
/* globals module: false */
/* globals require: false */
/* globals define: false */
/* globals console: false */

(function (root, factory) {
    'use strict';

    if (typeof module === 'object' && typeof module.exports === 'object') {
        // Define as CommonJS export:
        module.exports = factory(require('underscore'), require('backbone'));
    } else if (typeof define === 'function' && define.amd) {
        // Define as AMD:
        define(['underscore', 'backbone'], factory);
    } else {
        // Just run it:
        root.Ribs = factory(root._, root.Backbone);
    }

}(this, function (_, Backbone) {
    'use strict';

    var $ = Backbone.$;

    var Ribs = Backbone.Ribs = {
        version: '1.0.1'
    };

    var ViewProto = Backbone.View.prototype;
    var ModelProto = Backbone.Model.prototype;
    var CollectionProto = Backbone.Collection.prototype;

    var eventSplitter = /\s+/;
    var hiddenClassName = '__ribs-hidden';

    var toString = Object.prototype.toString,
        tags = {
            array: toString.call([]),
            object: toString.call({})
        };

    var eventMethods = {
        parseEvents: function (name) {
            var names;

            if (eventSplitter.test(name)) {
                names = name.split(eventSplitter);
            } else {
                names = [name];
            }

            return names;
        },
        on: function (model, name, callback, context) {
            var events = model._ribs.events,
                names = eventMethods.parseEvents(name),
                eventName, item, i, l;

            for (i = 0, l = names.length; i < l; i++) {
                eventName = names[i];
                item = {
                    callback: callback,
                    context: context
                };

                if (!events.hasOwnProperty(eventName)) {
                    events[eventName] = [item];
                } else {
                    events[eventName].push(item);
                }
            }
        },
        off: function (model, name, callback, context) {
            var names = eventMethods.parseEvents(name),
                events, cb, ev, ctx, i, j;

            for (i = names.length; i--;) {
                events = model._ribs.events[names[i]];

                for (j = events.length; j--;) {
                    ev = events[j];
                    cb = ev.callback;
                    ctx = ev.context;

                    if (cb === callback && (!context || context === ctx)) {
                        events.splice(j, 1);
                    }
                }
            }
        },
        bindingsTrigger: function (name) {
            var names = eventMethods.parseEvents(name),
                events = this._ribs.events,
                length = arguments.length,
                args = [],
                item, ev,
                i, j, l1, l2;

            for (i = 1; i < length; i++) {
                args[i - 1] = arguments[i];
            }

            for (i = 0, l1 = names.length; i < l1; i++) {
                ev = events[names[i]];

                if (ev) {
                    for (j = 0, l2 = ev.length; j < l2; j++) {
                        item = ev[j];
                        item.callback.apply(item.context, args);
                    }
                }
            }
        }
    };

    var commonMethods = {
        cloneDeep: function cloneDeep(obj) {
            var tag = toString.call(obj),
                result;

            switch (tag) {
                case tags.object:
                    result = {};
                    for (var v in obj) {
                        if (obj.hasOwnProperty(v)) {
                            result[v] = cloneDeep(obj[v]);
                        }
                    }
                    return result;

                case tags.array:
                    result = [];
                    for (var i = obj.length; i--;) {
                        result[i] = cloneDeep(obj[i]);
                    }
                    return result;

                default:
                    return obj;
            }
        },
        split: function (str) {
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
        },
        getPath: function (path, obj, options) {
            var p, i, l, isSet;

            if (typeof path === 'string') {
                path = commonMethods.split(path);
            }

            if (path.length === 1) {
                return obj[path[0]];
            }

            for (i = 0, l = path.length; i < l; i++) {
                p = path[i];

                if (obj.hasOwnProperty(p)) {
                    obj = obj[p];
                } else {
                    if (l > i + 1) {
                        if (options && options.ignoreUndefined) {
                            return undefined;
                        }

                        isSet = options && options.isSet;

                        throw new Error('can\'t ' + (isSet ? 'set' : 'get') +
                            ' `' + path[i + 1] + '` ' + (isSet ? 'to' : 'from') + ' `' + p +
                            '`, `' + p +'` is undefined');
                    } else {
                        return undefined;
                    }
                }
            }

            return obj;
        },
        deletePath: function (path, obj) {
            var p;

            for (var i = 0, l = path.length; i < l; i++) {
                p = path[i];

                if (i + 1 === l) {
                    delete obj[p];
                } else {
                    if (obj.hasOwnProperty(p)) {
                        obj = obj[p];
                    }
                }
            }
        },
        setPath: function (path, val, obj) {
            var p;

            path = path.slice();

            while (path.length) {
                p = path.shift();

                if (path.length) {
                    if (!(obj.hasOwnProperty(p) && obj[p] instanceof Object)) {
                        throw new Error('set: can\'t set anything to "' + p + '", typeof == "' + typeof obj[p] + '"');
                    }

                    obj = obj[p];
                } else {
                    obj[p] = val;
                }
            }
        },
        splitModelAttr: function (modelAttr) {
            var parsed = modelAttr.match(/^(?:!\.|[^.])+/),
                model,
                attr;

            if (parsed !== null) {
                model = parsed[0];
                attr = modelAttr.slice(model.length + 1);
            }

            if (!model || !attr || !model.length || !attr.length) {
                throw new Error('wrong binging data - "' + modelAttr + '"');
            }

            return {
                model: model,
                attr: attr
            };
        },
        getAttrs: function (key, val) {
            var attrs;

            if (typeof key === 'string') {
                attrs = {};
                attrs[key] = val;
            } else {
                attrs = key;
            }

            return attrs;
        },
        addStyle: function () {
            if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
                return;
            }

            var css = '.' + hiddenClassName + ' {display: none !important;}',
                style = document.createElement('style');

            style.type = 'text/css';

            if (style.styleSheet){
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            document.getElementsByTagName('head')[0].appendChild(style);
        }
    };

    var modelMethods = {
        propagationTrigger: function (attr, options) {
            var escapedPath = attr.escapedPath.slice(),
                path;

            if (escapedPath.length) {
                while (escapedPath.length - 1) {
                    escapedPath.length--;
                    path = escapedPath.join('.');

                    this.trigger('change:' + path, this, undefined, options, path);
                }
            }
        },
        initComputeds: function (attrs) {
            var computeds= this._ribs.computeds,
                realAttrs = [],
                compAttrs = [],
                toUpdate,
                attr;

            //преваращаем computeds в обычные атрибуты
            for (attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    compAttrs.push(attr);
                }
            }

            while (compAttrs.length) {
                attr = compAttrs.pop();

                if (attr in computeds) {
                    Array.prototype.push.apply(compAttrs, computeds[attr].deps);
                } else {
                    if (realAttrs.indexOf(attr) === -1) {
                        realAttrs.push(attr);
                    }
                }
            }
            //////////////////////////////////////////

            toUpdate = modelMethods.getComputedsToUpdate.call(this, realAttrs);

            modelMethods.updateComputeds.call(this, toUpdate);

            for (var i = 0, l = toUpdate.length; i < l; i++) {
                attr = toUpdate[i];
                this.attributes[attr] = computeds[attr].get();
            }
        },
        checkForLoop: function (newComputeds) {
            var computeds = this._ribs.computeds,
                loopref;

            for (var name in newComputeds) {
                if (newComputeds.hasOwnProperty(name)) {
                    loopref = modelMethods.find(name, computeds[name], computeds);

                    if (loopref) {
                        throw new Error('addComputeds(): a circular references in computeds "' + name + ' <-> ' + loopref +'"');
                    }
                }
            }
        },
        convertComputedsToArguments: function (attrs) {
            var newAttrs = {},
                computeds = this._ribs.computeds,
                compAttrs, computed, deps, hasComputed,
                attr, newValue, realAttrs;

            _.extend(newAttrs, attrs);

            do {
                hasComputed = false;
                realAttrs = {};

                for (attr in newAttrs) {
                    if (newAttrs.hasOwnProperty(attr)) {
                        if (attr in computeds) {
                            hasComputed = true;
                            computed = computeds[attr];
                            deps = computed.deps;
                            newValue = computed.set(newAttrs[attr]);
                            compAttrs = {};

                            if (computed.multi) {
                                if (!_.isArray(newValue)) {
                                    throw new Error('`set` computed must return an array of values');
                                }

                                for (var i = 0; i < deps.length; i++) {
                                    compAttrs[deps[i]] = newValue[i];
                                }
                            } else {
                                compAttrs[deps[0]] = newValue;
                            }


                            _.extend(realAttrs, compAttrs);

                            delete newAttrs[attr];
                        }
                    }
                }

                _.extend(newAttrs, realAttrs);
            } while (hasComputed);

            return newAttrs;
        },
        getComputedsToUpdate: function (deps) {
            var computedsDeps = this._ribs.computedsDeps,
                toUpdate = [],
                prev, dep, index, i;

            if (this._ribs.init) {
                var initDeps = [];

                for (var name in computedsDeps) {
                    if (computedsDeps.hasOwnProperty(name)) {
                        initDeps.push(name);
                    }
                }

                deps = initDeps;
            }

            if (!deps.length) {
                return toUpdate;
            }

            var findDeps = function (attrs) {
                var newDeps = [],
                    deps, i, j, l1, l2;

                for (i = 0, l1 = attrs.length; i < l1; i++) {
                    deps = computedsDeps[attrs[i]];

                    if (deps) {
                        for (j = 0, l2 = deps.length; j < l2; j++) {
                            dep = deps[j];

                            if (newDeps.indexOf(dep) === -1) {
                                newDeps.push(dep);
                            }
                        }
                    }
                }

                return newDeps;
            };

            while (true) {
                deps = findDeps(deps);

                if (!deps.length) {
                    break;
                }

                prev = toUpdate[toUpdate.length - 1];

                if (prev) {
                    for (i = 0; i < deps.length; i++) {
                        index = prev.indexOf(deps[i]);

                        if (index !== -1) {
                            prev.splice(index, 1);
                        }
                    }
                }

                toUpdate.push(deps);
            }

            return Array.prototype.concat.apply([], toUpdate);
        },
        updateComputeds: function (attrs) {
            var computeds = this._ribs.computeds,
                computed, attr;

            //направление не менять
            for (var i = 0, l = attrs.length; i < l; i++) {
                attr = attrs[i];
                computed = computeds[attr];
                computed.update();
            }
        },
        removeComputeds: function (attrs) {
            var names = [],
                computeds = this._ribs.computeds,
                removeAll = true,
                attr;

            for (attr in computeds) {
                if (computeds.hasOwnProperty(attr)) {
                    if (attrs.hasOwnProperty(attr)) {
                        names.push(attr);
                    } else {
                        removeAll = false;
                    }
                }
            }

            if (removeAll) {
                this._ribs.computedsDeps = {};
                this._ribs.computedsDepsMap = {};
                this._ribs.computeds = {};
                return this;
            }

            var computedsDeps = this._ribs.computedsDeps,
                computedsDepsMap = this._ribs.computedsDepsMap,
                dep, index, name, i, l;

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
                            delete computedsDepsMap[attr];
                        }
                    }
                }

                delete computeds[name];
            }

            return this;
        },
        trigger: function (name) {
            var names = eventMethods.parseEvents(name),
                length = names.length,
                i;

            var computedsDepsMap = this._ribs.computedsDepsMap;
            var realNames = [];

            for (i = 0; i < length; i++) {
                var currentName = computedsDepsMap[names[i]];

                if (currentName) {
                    realNames.push(currentName);
                }
            }

            var toUpdate = modelMethods.getComputedsToUpdate.call(this, realNames);

            length = toUpdate.length;

            if (!length) {
                return;
            }

            var computeds = this._ribs.computeds;
            var compChanges = [];
            var current = this.attributes;

            var val, attr, computed, currentAttr, item;

            for (i = 0; i < length; i++) {
                attr = toUpdate[i];
                computed = computeds[attr];
                computed.update();

                val = computed.get();
                currentAttr = current[attr];

                if (!_.isEqual(currentAttr, val)) {
                    compChanges.push({
                        attr: attr,
                        val: val
                    });
                }

                current[attr] = val;
            }

            length = compChanges.length;

            for (i = 0; i < length; i++) {
                item = compChanges[i];
                ModelProto.trigger.call(this, 'change:' + item.attr, this, item.val, undefined, item.attr);
            }
        },
        find: function find(name, computed, computeds) {
            var deps = computed.deps,
                loop = computed.name;

            if (deps.indexOf(name) !== -1) {
                return loop;
            }

            for (var i = 0; i < deps.length; i++) {
                var dep = deps[i];

                if (computeds.hasOwnProperty(dep)) {
                    loop = find(name, computeds[dep], computeds);

                    if (loop) {
                        return loop;
                    }
                }
            }

            return false;
        }
    };

    commonMethods.addStyle();

    //optimized
    var Computed = function (data, name, model) {
        if (typeof data === 'function') {
            throw new Error('init computed: computed "' + name + '" is a function. It is no longer available after v0.4.6');
        }

        var deps = data.deps;

        if (!_.isArray(deps)) {
            deps = [deps];
        }

        if (deps.length > 1) {
            this.multi = true;
        }

        this.name = name;
        this.deps = deps;
        this._get = data.get;
        this.toJSON = data.toJSON;

        if (typeof data.set === 'function') {
            this.set = function () {
                return data.set.apply(model, arguments);
            };
        } else {
            this.set = function () {
                throw new Error('set: computed "' + name + '" has no set method');
            };
        }
        this._model = model;

        return this;
    };

    _.extend(Computed.prototype, {
        //optimized
        update: function () {
            var deps = [],
                val, i;

            for (i = this.deps.length; i--;) {
                try {
                    val = this._model.get(this.deps[i]);
                } catch (e) {
                    val = undefined;
                }

                deps[i] = val;
            }

            this._value = this._get.apply(this._model, deps);
        },

        //optimized
        get: function () {
            return this._value;
        }
    });

    //optimized
    var processors = {
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
            get: function ($el, value) {
                if ($el.val() !== value) {
                    $el.val(value);
                }
            },
            set: function ($el) {
                return $el.val();
            }
        },

        css: {
            get: function ($el, value, style) {
                $el.css(style, value);
            },
            multiple: true
        },

        attr: {
            get: function ($el, value, attr) {
                $el.attr(attr, value);
            },
            multiple: true
        },

        classes: {
            get: function ($el, value, cl) {
                $el.toggleClass(cl, !!value);
            },
            multiple: true
        },

        html: function ($el, value) {
            $el.html(value);
        },

        toggle: function ($el, value) {
            $el.toggle(!!value);
        },

        toggleByClass: function ($el, value) {
            $el.toggleClass(hiddenClassName, !value);
        },

        disabled: function ($el, value) {
            $el.prop('disabled', !!value);
        },

        enabled: function ($el, value) {
            $el.prop('disabled', !value);
        },

        checked: {
            get: function ($el, value) {
                $el.prop('checked', false);

                if (_.isArray(value)) {
                    for (var i = 0, l = value.length; i < l; i++) {
                        $el.filter('[value="' + value[i] + '"]').prop('checked', true);
                    }
                } else if (typeof value === 'boolean') {
                    $el.prop('checked', value);
                } else {
                    $el.filter('[value="' + value + '"]').prop('checked', true);
                }
            },

            set: function ($el) {
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

        mod: {
            get: function ($el, value, cl, binding) {
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

    //optimized
    var Binding = function (view, selector, bindings) {
        var binding;

        this.cid = _.uniqueId('bind');
        this.selector = selector;
        this.view = view;
        this.mods = {};
        this.handlers = {};

        this._setEl();

        for (var type in bindings) {
            if (bindings.hasOwnProperty(type)) {
                binding = bindings[type];

                if (_.isArray(binding)) {
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
            var handler = this.view.handlers[type] || handlers[type],
                isCol = type === 'collection';

            if (!isCol && !handler) {
                throw new Error('unknown handler type "' + type + '"');
            }

            if (!isCol && handler.multiple) {
                for (var attr in binding) {
                    if (binding.hasOwnProperty(attr)) {
                        this.addHandler(type, handler, binding[attr], attr);
                    }
                }
            } else {
                if (isCol) {
                    this.addColHandler(binding);
                } else {
                    this.addHandler(type, handler, binding);
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
                $el;

            if (!(collection instanceof Ribs.Collection)) {
                throw new Error('addBindings: use only "Ribs.Collection" for bindings.');
            }

            this.waterfallAdding = colBind.waterfallAdding;

            if (selector === 'el') {
                $el = mainView.$el;
            } else {
                $el = mainView.$(selector);
            }

            eventMethods.on(collection, 'sort', this._onsort, this);
            eventMethods.on(collection, 'add', this._onaddView, this);
            eventMethods.on(collection, 'update', this._onUpdate, this);
            eventMethods.on(collection, 'remove', this._removeView, this);
            eventMethods.on(collection, 'reset', this._onReset, this);

            this.handlers.collection = {
                collection: collection,
                $el: $el,
                View: View,
                data: data,
                views: views
            };

            this._fillElByCollection();
        },

        _onUpdate: function (collection, options) {
            if (!options.add) {
                return;
            }

            var wfa = this.waterfallAdding;

            if (options && options.hasOwnProperty('waterfallAdding')) {
                wfa = options.waterfallAdding;
            }

            if (wfa) {
                if (this._toAddArr) {
                    this._addViewsToEl();
                }
            } else {
                if (this._toAdd) {
                    this._fillElByCollection();
                }
            }

            this._toAddArr = undefined;
            this._toAdd = undefined;
        },

        _addViewsToEl: function () {
            var ribsCol = this.handlers.collection,
                collection = ribsCol.collection,
                views = ribsCol.views,
                data = ribsCol.data,
                View = ribsCol.View,
                $el = ribsCol.$el,
                _toAddArr = this._toAddArr,
                nextModel, nextView, newEl,
                view, model, i;

            if (collection.comparator) {
                _toAddArr.sort(function (a, b) {
                    return collection.indexOf(a) - collection.indexOf(b);
                });
            }

            for (i = _toAddArr.length; i--;) {
                model = _toAddArr[i];
                nextModel = collection.at(collection.lastIndexOf(model) + 1);
                view = new View(_.extend(data, {model: model, collection: collection}));
                views[model.cid] = view;

                newEl = view.el;

                if (!nextModel) {
                    $el.append(newEl);
                } else {
                    nextView = views[nextModel.cid];
                    nextView.$el.before(newEl);
                }
            }
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
                    fragment.appendChild(view.el);
                }
            }

            $el.append(fragment);
        },

        //optimized
        addHandler: function (type, getHandler, binding, bindAttr) {
            var data = binding.data,
                processor = binding.processor,
                options = binding.options || {},
                getCallback = binding.callback,
                paths = [], attrs = [], col = [], changeAttrs = {}, self = this,
                handler = {
                    changeAttrs: changeAttrs
                },
                events = binding.events || getHandler.events || 'change',
                setHandler,
                getProcessor, setProcessor,
                setCallback,
                path, model, modelName, attr, attrArray, modelAttr, ch, changeAttr,
                getter, setter, multi,
                pathsLength,
                i, l, j, l2;

            options.byBinding = this.cid;

            if (typeof getHandler !== 'function') {
                setHandler = getHandler.set;
                getHandler = getHandler.get;
            }

            //Формируем paths - массив объектов model-attr
            if (typeof binding === 'string') {
                paths.push(commonMethods.splitModelAttr(binding));
            } else {
                if (typeof data === 'string') {
                    paths.push(commonMethods.splitModelAttr(data));
                } else if (_.isArray(data)) {
                    for (i = 0, l = data.length; i < l; i++) {
                        paths.push(commonMethods.splitModelAttr(data[i]));
                    }
                } else {
                    throw new Error('wrong binging format ' + JSON.stringify(binding));
                }
            }

            pathsLength = paths.length;
            multi = pathsLength > 1;
            //////////////////////////////////////////////

            //Определяемся с фильтром
            if (processor) {
                if (typeof processor === 'string') {
                    getProcessor = this.view.processors[processor] || processors[processor];

                    if (!getProcessor) {
                        throw new Error('unknown processor "' + processor + '"');
                    }
                } else {
                    getProcessor = processor;
                }

                if (typeof getProcessor !== 'function') {
                    setProcessor = getProcessor.set;
                    getProcessor = getProcessor.get;
                }
            }
            //////////////////////////////

            //Определяемся с колбэком
            if (getCallback) {
                if (typeof getCallback !== 'function') {
                    setCallback = getCallback.set;
                    getCallback = getCallback.get;
                }
            }
            //////////////////////////////

            //Определяем обработчик события при изменении модели/коллекции
            if (getHandler) {
                getter = function (instance) {
                    var options;

                    if (instance instanceof Backbone.Collection) {
                        options = arguments[1];
                    } else {
                        options = arguments[2];
                    }

                    if (self.empty || options && options.byBinding === self.cid) {
                        return;
                    }

                    var attrs = [],
                        view = self.view,
                        model, attr, path, i;

                    for (i = 0; i < pathsLength; i++) {
                        path = paths[i];
                        model = path.model;
                        attr = path.attr;

                        if (view[model] instanceof Backbone.Collection) {
                            attrs.push(view[model].pluck(attr));
                        } else {
                            attrs.push(view[model].get(attr));
                        }
                    }

                    if (getProcessor) {
                        attr = getProcessor.apply(view, attrs);
                    } else {
                        attr = attrs[0];
                    }

                    getHandler.call(self, self.$el, attr, bindAttr, binding);

                    if (getCallback) {
                        getCallback.call(view);
                    }
                };
            }
            //////////////////////////////////////////////////////////////

            //Определяем обработчик при изменении DOM-элемента
            if (setHandler) {
                if (multi && !setProcessor) {
                    throw new Error('wrong binging format ' + JSON.stringify(binding) + ', `set` processor is required');
                }

                setter = function (e) {
                    var val = setHandler.call(self, self.$el, e),
                        view = self.view,
                        i;

                    if (setProcessor) {
                        val = setProcessor.call(self.view, val);
                    }

                    if (multi && !_.isArray(val)) {
                        throw new Error('`set` processor must return an array of values');
                    }

                    for (i = 0; i < pathsLength; i++) {
                        path = paths[i];

                        view[path.model].set(path.attr, multi ? val[i] : val, options);
                    }

                    if (setCallback) {
                        setCallback.call(view, paths, val);
                    }
                };
            }
            ///////////////////////////////////////////////////

            for (i = 0; i < pathsLength; i++) {
                path = paths[i];
                modelName = path.model;
                model = this.view[modelName];
                attr = path.attr;
                attrArray = commonMethods.split(attr);
                ch = '';
                changeAttr = changeAttrs[modelName] || (changeAttrs[modelName] = []);

                if (!(model instanceof Ribs.Model || model instanceof Ribs.Collection)) {
                    throw new Error('addBindings: use only "Ribs.Model" or "Ribs.Collection" for bindings.');
                }

                if (model instanceof Backbone.Collection) {
                    attrs.push(model.pluck(attr));

                    if (getHandler) {
                        if (col.indexOf(modelName) === -1) {
                            col.push(modelName);

                            eventMethods.on(model, 'add remove reset sort', getter);
                        }
                    }
                } else {
                    attrs.push(model.get(attr));
                }

                if (getHandler) {
                    for (j = 0, l2 = attrArray.length; j < l2; j++) {
                        if (ch) {
                            ch += '.';
                        }

                        ch += attrArray[j];
                        changeAttr.push(ch);

                        eventMethods.on(model, 'change:' + ch, getter);
                    }
                }
            }

            if (getHandler) {
                if (!this.empty) {
                    if (getProcessor) {
                        modelAttr = getProcessor.apply(this.view, attrs);
                    } else {
                        modelAttr = attrs[0];
                    }

                    getHandler.call(this, this.$el, modelAttr, bindAttr, binding);

                    if (getCallback) {
                        getCallback.call(this.view);
                    }
                }

                handler.getter = getter;
            }

            if (setHandler) {
                this.view.$el.on(events + '.bindingHandlers', this.selector, setter);
                handler.setter = setter;
                handler.events = events;
            }

            this.handlers[type] = handler;
        },

        unbind: function (types) {
            var handlers = this.handlers,
                col = [],
                changeAttrs, changeAttr,
                handler, getter, events,
                modelName, model, i, l;

            for (var type in handlers) {
                if ( handlers.hasOwnProperty(type) &&
                    !(types && types.indexOf('all') === -1 &&
                    types.indexOf(type) === -1)) {
                    handler = handlers[type];
                    getter = handler.getter;
                    events = handler.events;

                    if (events) {
                        this.view.$el.off(events + '.bindingHandlers', this.selector, handler.setter);
                    }

                    if (typeof getter === 'function') {
                        changeAttrs = handler.changeAttrs;

                        for (modelName in changeAttrs) {
                            if (changeAttrs.hasOwnProperty(modelName)) {
                                model = this.view[modelName];

                                if (model instanceof Backbone.Collection) {
                                    if (col.indexOf(modelName) === -1) {
                                        col.push(modelName);

                                        eventMethods.off(model, 'add remove reset sort', getter);
                                    }
                                }

                                changeAttr = changeAttrs[modelName];

                                for (i = 0, l = changeAttr.length; i < l; i++) {
                                    eventMethods.off(model, 'change:' + changeAttr[i], getter);
                                }
                            }
                        }
                    }

                    if (type === 'collection') {
                        var collection = handler.collection,
                            views = handler.views,
                            view;

                        eventMethods.off(collection, 'sort', this._onsort, this);
                        eventMethods.off(collection, 'add', this._onaddView, this);
                        eventMethods.off(collection, 'update', this._onUpdate, this);
                        eventMethods.off(collection, 'remove', this._removeView, this);
                        eventMethods.off(collection, 'reset', this._onReset, this);

                        for (view in views) {
                            if (views.hasOwnProperty(view)) {
                                views[view].remove();
                            }
                        }
                    }

                    delete handlers[type];

                    if (type === 'toggleByClass') {
                        this.$el.removeClass(hiddenClassName);
                    }
                }
            }
        },

        update: function (types) {
            var handlers = this.handlers,
                handler, getter;

            for (var type in handlers) {
                if (handlers.hasOwnProperty(type) && !(types && types.indexOf('all') === -1 && types.indexOf(type) === -1)) {
                    handler = handlers[type];
                    getter = handler.getter;

                    if (typeof getter === 'function') {
                        this._setEl();
                        getter();
                    }

                    if (type === 'collection') {
                        this._fillElByCollection();
                    }
                }
            }
        },

        //optimized
        _setEl: function () {
            var selector = this.selector;

            if (selector === 'el') {
                this.$el = this.view.$el;
            } else {
                this.$el = this.view.$(selector);
            }

            if (!this.$el.length) {
                this.empty = true;
                return;
            }

            this.empty = false;
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

            if (!this._toAddArr) {
                this._toAddArr = [];
            }

            this._toAdd[model.cid] = model;
            this._toAddArr.push(model);
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

    Ribs.Model = Backbone.Model.extend({
        /**
         * Represents a Ribs.Model
         * @constructs Ribs.Model
         * @param {object} [attributes] - hash of model's attributes
         * @param {object} [options] - hash of options
         */
        constructor: function RibsModel(attributes, options) {
            this._ribs = {
                computeds: {},
                computedsDeps: {},
                computedsDepsMap: {},
                init: true,
                events: {}
            };

            var attrs = attributes || {};
            options = options || {};
            this.cid = _.uniqueId(this.cidPrefix || 'c');
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

            this.addComputeds(this.computeds);
            this.set(escapedAttrs, options);
            this.changed = {};

            this._ribs.init = false;
            this.initialize.apply(this, arguments);
        },

        /**
         * Allow to get previous model's attributes on any depth
         * @type {boolean}
         */
        deepPrevious: false,

        /**
         * Getting model's attribute
         * @param {string} attr - attribute name
         * @returns {*} - attribute value
         */
        get: function (attr) {
            if (attr == null) {
                return undefined;
            }

            var computeds = this._ribs.computeds;

            if (computeds.hasOwnProperty(attr)) {
                return computeds[attr].get();
            }

            return commonMethods.getPath(attr, this.attributes);
        },

        /**
         * Setting model's attribute
         * @param {string} key - attribute name or hash of attributes
         * @param {object} key - hash of attributes
         * @param {*} [val] - attribute value
         * @param {object} [options] - hash of options
         * @returns {Ribs.Model|boolean}
         */
        set: function (key, val, options) {
            if (key == null) {
                return this;
            }

            var attrs,attr,silent,unset,changes,changing,changed,current,prev,i;

            var args,compAttrs,realAttrs,hasCompInAttrs,
                computeds,computedsToUpdate,changedAttrs,compChanges,
                needUnset,path,escapedPath,item,l;

            if (typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                attrs = {};
                attrs[key] = val;
            }

            if (!options) {
                options = {};
            }

            if (!this._validate(attrs, options)) {
                return false;
            }

            unset           = options.unset;
            silent          = options.silent;
            changes         = [];
            changing        = this._changing;
            this._changing  = true;

            computeds       = this._ribs.computeds;
            hasCompInAttrs  = false;
            compChanges     = [];
            changedAttrs    = [];

            if (!changing) {
                if (this.deepPrevious) {
                    this._previousAttributes = commonMethods.cloneDeep(this.attributes);
                } else {
                    this._previousAttributes = _.clone(this.attributes);
                }

                this.changed = {};
            }

            if (unset) {
                modelMethods.removeComputeds.call(this, attrs);
                realAttrs = attrs;
            } else {
                //разделяем computeds и обычные атрибуты
                realAttrs = {};
                compAttrs = {};

                for (attr in attrs) {
                    if (attrs.hasOwnProperty(attr)) {
                        if (computeds.hasOwnProperty(attr)) {
                            compAttrs[attr] = attrs[attr];
                            hasCompInAttrs = true;
                        } else {
                            realAttrs[attr] = attrs[attr];
                        }
                    }
                }

                //Заменяем все computeds на обычные аргументы
                if (hasCompInAttrs) {
                    _.extend(realAttrs, modelMethods.convertComputedsToArguments.call(this, compAttrs));
                }
            }

            current = this.attributes;
            changed = this.changed;
            prev = this._previousAttributes;

            //обновляем обычные атрибуты
            for (attr in realAttrs) {
                if (realAttrs.hasOwnProperty(attr)) {
                    needUnset = unset && attrs.hasOwnProperty(attr);
                    val = realAttrs[attr];
                    path = commonMethods.split(attr);

                    if (!_.isEqual(commonMethods.getPath(path, current, {isSet: true}), val)) {
                        escapedPath = [];

                        for (i = path.length; i--;) {
                            escapedPath[i] = path[i].replace(/\./g, '!.');
                        }

                        changes.push({
                            escapedPath: escapedPath,
                            attr: attr,
                            val: needUnset ? undefined: val
                        });

                        changedAttrs.push(attr);
                    }

                    if (!_.isEqual(commonMethods.getPath(path, prev, {ignoreUndefined: true}), val)) {
                        changed[attr] = val;
                    } else {
                        delete changed[attr];
                    }

                    if (needUnset) {
                        commonMethods.deletePath(path, current);
                    } else {
                        commonMethods.setPath(path, val, current);
                    }
                }
            }

            //обновляем computeds
            computedsToUpdate = modelMethods.getComputedsToUpdate.call(this, changedAttrs);
            modelMethods.updateComputeds.call(this, computedsToUpdate);

            for (i = 0, l = computedsToUpdate.length; i < l; i++) {
                attr = computedsToUpdate[i];
                val = computeds[attr].get();

                if (!_.isEqual(current[attr], val)) {
                    compChanges.push({
                        attr: attr,
                        val: val
                    });
                }

                if (!_.isEqual(prev[attr], val)) {
                    changed[attr] = val;
                } else {
                    delete changed[attr];
                }

                current[attr] = val;
            }

            this.id = this.get(this.idAttribute);

            if (!silent) {
                if (changes.length) {
                    this._pending = options;

                    for (i = 0, l = changes.length; i < l; i++) {
                        item = changes[i];

                        args = ['change:' + item.attr, this, item.val, options, item.attr];

                        eventMethods.bindingsTrigger.apply(this, args);
                        ModelProto.trigger.apply(this, args);

                        if (options.propagation) {
                            modelMethods.propagationTrigger.call(this, item, options);
                        }
                    }
                }

                if (compChanges.length) {
                    for (i = 0, l = compChanges.length; i < l; i++) {
                        item = compChanges[i];
                        args = ['change:' + item.attr, this, item.val, options, item.attr];

                        eventMethods.bindingsTrigger.apply(this, args);

                        ModelProto.trigger.apply(this, args);
                    }
                }
            }

            if (changing) {
                return this;
            }

            if (!silent) {
                while (this._pending) {
                    options = this._pending;
                    this._pending = false;
                    ModelProto.trigger.call(this, 'change', this, options);
                }
            }
            this._pending = false;
            this._changing = false;
            return this;
        },

        trigger: function (name) {
            modelMethods.trigger.call(this, name);
            eventMethods.bindingsTrigger.apply(this, arguments);

            return ModelProto.trigger.apply(this, arguments);
        },

        /**
         * Getting previous model's attribute
         * @param {string} attr - attribute name
         * @returns {*} - attribute value
         */
        previous: function (attr) {
            if (attr == null || !this._previousAttributes) {
                return null;
            }

            if (this.deepPrevious) {
                return commonMethods.getPath(attr, this._previousAttributes, {ignoreUndefined: true});
            } else {
                return this._previousAttributes[attr];
            }
        },

        /**
         * Getting all previous model attributes
         * @returns {*} - hash of previous model's attributes
         */
        previousAttributes: function () {
            if (this.deepPrevious) {
                return commonMethods.cloneDeep(this._previousAttributes);
            } else {
                return _.clone(this._previousAttributes);
            }
        },

        /**
         * Returns a shallow copy of the model's attributes for JSON stringification.
         * @param {object} [options] - hash of options
         * @returns {object} - JSON
         */
        toJSON: function (options) {
            var computeds = this._ribs.computeds,
                json = {};

            for (var attr in this.attributes) {
                if (this.attributes.hasOwnProperty(attr)) {
                    if ( computeds.hasOwnProperty(attr) &&
                        ((!options || !options.computeds) && !computeds[attr].toJSON ||
                        options && options.computeds === false)) {
                        continue;
                    }

                    json[attr] = this.attributes[attr];
                }
            }

            return json;
        },

        /**
         * Add new computed attributes to model
         * @param {string} key - name of computed attribute
         * @param {object} key - hash of computed attributes
         * @param {object} [params]
         * @param {string[]} params.deps - array of computed dependencies
         * @param {function} params.get - computed getter (will receive values of dependencies)
         * @param {function} [params.set] - computed setter (must to return a hash of model's attributes)
         * @returns {Ribs.Model}
         */
        addComputeds: function (key, params) {
            if (key == null) {
                return this;
            }

            var computedsDeps = this._ribs.computedsDeps,
                computedsDepsMap = this._ribs.computedsDepsMap,
                attrs = commonMethods.getAttrs(key, params),
                deps, dep, computed, computedsDep,
                depArr, nextDepArr, name, i, j, l1, l2;

            for (name in attrs) {
                if (attrs.hasOwnProperty(name)) {
                    if (this.attributes[name] || this._ribs.computeds[name]) {
                        throw new Error('addComputeds: computed name "' + name + '" is already used');
                    }

                    computed = this._ribs.computeds[name] = new Computed(attrs[name], name, this);
                    deps = computed.deps;

                    for (i = 0, l1 = deps.length; i < l1; i++) {
                        depArr = commonMethods.split(deps[i]);
                        dep = depArr[0].replace(/\./g, '!.');

                        for (j = 0, l2 = depArr.length; j < l2; j++) {
                            computedsDep = computedsDeps[dep];

                            if (computedsDep) {
                                if (computedsDep.indexOf(name) === -1) {
                                    computedsDep.push(name);
                                }
                            } else {
                                computedsDeps[dep] = [name];
                                computedsDepsMap['change:' + dep] = dep;
                            }

                            nextDepArr = depArr[j + 1];

                            if (nextDepArr) {
                                dep += '.' + nextDepArr.replace(/\./g, '!.');
                            }
                        }
                    }
                }
            }

            modelMethods.checkForLoop.call(this, attrs);

            if (!this._ribs.init) {
                modelMethods.initComputeds.call(this, attrs);
            }

            return this;
        },

        /**
         * Remove computed attributes from model
         * @param {string} names - name of removing computed attribute
         * @param {string[]} names - names of removing computed attributes
         * @returns {Ribs.Model}
         */
        removeComputeds: function (names) {
            var attrs = {};

            if (!names) {
                //удаляем все computeds
                var computeds = this._ribs.computeds;

                for (var attr in computeds) {
                    if (computeds.hasOwnProperty(attr)) {
                        attrs[attr] = undefined;
                    }
                }
            } else {
                if (!_.isArray(names)) {
                    names = [names];
                }

                for (var i = names.length; i--;) {
                    attrs[names[i]] = undefined;
                }
            }

            return this.set(attrs, {unset: true});
        },

        /**
         * Is the attribute is computed
         * @param {string} attr - name of attribute
         * @returns {boolean}
         */
        isComputed: function (attr) {
            return this._ribs.computeds.hasOwnProperty(attr);
        },

        /**
         * Create a new model with identical attributes to this one.
         * @returns {Object}
         */
        clone: function () {
            var attrs = this.attributes,
                newAttrs = {},
                computeds = this._ribs.computeds;

            for (var attr in attrs) {
                if (attrs.hasOwnProperty(attr) && !computeds.hasOwnProperty(attr)) {
                    newAttrs[attr] = attrs[attr];
                }
            }

            return new this.constructor(newAttrs);
        }
    });

    Ribs.View = Backbone.View.extend({
        /**
         * Represents a Ribs.View
         * @constructs Ribs.View
         * @param {object} [options] - hash of options
         */
        constructor: function RibsView(options) {
            this._ribs = {
                _bindings: _.extend({}, _.result(this, 'bindings')),
                bindings: {},
                collections: {}
            };

            this.handlers = _.result(this, 'handlers') || {};
            this.processors = _.result(this, 'processors') || {};

            Backbone.View.apply(this, arguments);

            if (!this._ribs.preventBindings) {
                this.applyBindings();
            }
        },

        /**
         * Prevent to applying bindings after initialization
         * @returns {Ribs.View}
         */
        preventBindings: function () {
            this._ribs.preventBindings = true;

            return this;
        },

        /**
         * Apply bindings which were described in the `bindings` section
         * @returns {Ribs.View}
         */
        applyBindings: function () {
            this.addBindings(this._ribs._bindings);

            return this;
        },

        /**
         * Add new bindings to view
         * @param {string} selector - selector expression to match elements
         * @param {object} selector - hash of bindings
         * @param {object} [params] - declaration of bindings
         * @returns {Ribs.View}
         */
        addBindings: function (selector, params) {
            var ribsBindings = this._ribs.bindings,
                attrs = commonMethods.getAttrs(selector, params),
                bindingTypes,
                _selector,
                types;

            for (_selector in attrs) {
                if (attrs.hasOwnProperty(_selector)) {
                    bindingTypes = attrs[_selector];

                    if (typeof bindingTypes !== 'object' || _.isEmpty(bindingTypes)) {
                        throw new Error('wrong binging format for "' + _selector + '" - ' + JSON.stringify(bindingTypes));
                    }

                    if (ribsBindings.hasOwnProperty(_selector)) {
                        types = [];

                        for (var type in bindingTypes) {
                            if (bindingTypes.hasOwnProperty(type)) {
                                types.push(type);
                            }
                        }

                        this.removeBindings(_selector, types);
                    }

                    ribsBindings[_selector] = new Binding(this, _selector, bindingTypes);
                }
            }

            return this;
        },

        /**
         * Remove bindings from view
         * @param {string} [selector] - selector that was used when creating the binding
         * @param {string} [name] - name of removing bindings
         * @param {string[]} [name] - names of removing bindings
         * @returns {Ribs.View}
         */
        removeBindings: function (selector, name) {
            var bindings = this._ribs.bindings,
                attrs = commonMethods.getAttrs(selector, name),
                types, s;

            for (s in bindings) {
                if (bindings.hasOwnProperty(s) && !(attrs && !attrs.hasOwnProperty(s))) {
                    if (attrs) {
                        types = attrs[s];

                        if (typeof types === 'string') {
                            types = [types];
                        }
                    }

                    bindings[s].unbind(types);

                    if (_.isEmpty(bindings[s].handlers)) {
                        delete bindings[s];
                    }
                }
            }

            return this;
        },

        /**
         * Updates bindings with actual data
         * @param {string} selector - selector that was used when creating the binding
         * @param {string} name - name of updating bindings
         * @param {string[]} name - names of updating bindings
         * @returns {Ribs.View}
         */
        updateBindings: function (selector, name) {
            var bindings = this._ribs.bindings,
                attrs = commonMethods.getAttrs(selector, name),
                types;

            for (var s in bindings) {
                if (bindings.hasOwnProperty(s) && !(attrs && !attrs.hasOwnProperty(s))) {
                    if (attrs) {
                        types = attrs[s];

                        if (typeof types === 'string') {
                            types = [types];
                        }
                    }

                    bindings[s].update(types);
                }
            }

            return this;
        },

        /**
         * Updates the interface of the actual state of the collection
         * @param {Backbone.Collection} collection - collection which was used in binding
         * @param {string} selector - selector that was used when creating the binding
         * @returns {Ribs.View}
         */
        renderCollection: function (collection, selector) {
            var bindings = this._ribs.bindings,
                binding,
                bindCol;

            if (!(collection instanceof Backbone.Collection) && !selector) {
                selector = collection;
                collection = null;
            }

            for (var s in bindings) {
                if (bindings.hasOwnProperty(s) && (!selector || selector === s)) {
                    binding = bindings[s];
                    bindCol = binding.handlers.collection;

                    if (bindCol && (!collection || bindCol.collection === collection)) {
                        binding.update(['collection']);
                    }
                }
            }

            return this;
        },

        /**
         * Returns a hash of all `view`
         * @param {string} selector - selector that was used when creating the binding
         * @returns {object}
         */
        getCollectionViews: function (selector) {
            var binding = this._ribs.bindings[selector];

            if (binding && binding.handlers.collection) {
                return binding.handlers.collection.views;
            } else {
                return undefined;
            }
        },

        /**
         * Remove this view by taking the element out of the DOM, and removing any
         * applicable Backbone.Events listeners.
         * @returns {Ribs.View}
         */
        remove: function () {
            this.removeBindings();

            return ViewProto.remove.apply(this, arguments);
        }
    });

    Ribs.Collection = Backbone.Collection.extend({
        /**
         * Represents a Ribs.Collection
         * @constructs Ribs.Collection
         * @param {array} [models] - array of models
         * @param {object} [options] - hash of options
         */
        constructor: function RibsCollection(models, options) {
            this._ribs = {
                events: {}
            };

            Backbone.Collection.apply(this, arguments);
        },

        trigger: function (name) {
            eventMethods.bindingsTrigger.apply(this, arguments);

            return CollectionProto.trigger.apply(this, arguments);
        }
    });

    return Ribs;
}));
