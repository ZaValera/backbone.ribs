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
            } else if (ch !== '!' || nch !== '.'){
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

        path = path.slice();

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

    var Computed = function (data, model) {
        if (typeof data === 'function') {
            this.get = function () {return data.apply(model, arguments)};
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

        if (this._deps instanceof Array) {
            for (var i = 0; i < this._deps.length; i++) {
                try {
                    val = this._model.get(this._deps[i]);
                } catch (e) {
                    this.value = undefined;
                }

                deps.push(val);
            }
        }

        this.value = this._get.apply(this._model, deps);
    };

    Computed.prototype.get = function () {
        return this.value;
    };

    Ribs.Model = Backbone.Model.extend({
        _super: Backbone.Model,

        constructor: function(attributes, options) {
            this._ribs = {
                computeds: {},
                computedsDeps: {}
            };
            _super(this, 'constructor', arguments);
            this.initComputeds();
        },

        get: function (attr) {
            var computeds = this._ribs.computeds;

            if (attr in computeds) {
                return computeds[attr].get();
            }

            var path = _split(attr);

            if (path.length === 1) {
                return _super(this, 'get', [attr]);
            } else {
                return getPath(path, this.attributes);
            }
        },

        set: function (key, val, options) {
            if (key == null) {
                return this;
            }

            var attrs,
                changes,
                changing,
                current,
                prev,
                silent,
                unset,
                path,
                attr;

            if (typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                attrs = {};
                attrs[key] = val;
            }

            //new from Ribs
            var computeds = this._ribs.computeds,
                size = 0;

            for (attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    if (attr in computeds) {
                        computeds[attr].set(attrs[attr]);
                        delete attrs[attr];
                    } else {
                        size++;
                    }
                }
            }

            if (!size) {
                return this;
            }
            ////////////////////////

            options || (options = {});

            if (!this._validate(attrs, options)) {
                return false;
            }

            unset           = options.unset;
            silent          = options.silent;
            changes         = [];
            changing        = this._changing;
            this._changing  = true;

            if (!changing) {
                this._previousAttributes = _.clone(this.attributes);
                this.changed = {};
            }

            current = this.attributes;
            prev = this._previousAttributes;

            if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

            //new from Ribs
            for (attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    if (attr in computeds) {
                        computeds[attr].set(attrs[attr]);
                        continue;
                    }

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

                    if (unset) {
                        deletePath(path, current);
                    } else {
                        this._setPath(path, val);
                    }
                }
            }

            var l = changes.length,
                computedsDeps = this._ribs.computedsDeps,
                deps,
                i, j;

            for (i = 0; i < l; i++) {
                attr = changes[i].attr;
                deps = computedsDeps[attr];
                if (deps) {
                    for (j = 0; j < deps.length; j++) {
                        computeds[deps[j]].update();
                    }
                }
            }

            if (!silent) {
                if (changes.length) {
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

                        throw new Error('can\'t set anything to "' + p + '", typeof == "' + typeof attr[p] + '"');
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
                    this.addComputed(computeds[name], name);
                    this._ribs.computeds[name].update();
                }
            }
        },

        addComputed: function (computed, name) {
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

            this._ribs.computeds[name] = new Computed(computed, this);
        }
    });

    return Ribs;
}));