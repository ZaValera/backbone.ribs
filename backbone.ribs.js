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

    function _super(self, method, args) {
        return self._super.prototype[method].apply(self, args);
    }

    function _split(str) {
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
    }

    Ribs.Model = Backbone.Model.extend({
        _super: Backbone.Model,

        get: function (attr) {
            var path = _split(attr);

            if (path.length === 1) {
                return _super(this, 'get', [attr]);
            } else {
                return this._getPath(path);
            }
        },

        set: function (key, val, options) {
            if (key == null) {
                return this;
            }

            var attrs = {},
                curattr,
                path,
                attr;

            if (typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                attrs[key] = val;
            }

            for (attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    path = _split(attr);
                    if (path.length == 1) {
                        curattr = path[0];
                        _super(this, 'set', [curattr, attrs[curattr], options]);
                    } else {
                        this._setPath(path, attrs[attr], options);
                    }
                }
            }

            return this;
        },

        _setPath: function (path, val, options) {
            var attr = path.join('.'),
                pathCopy = path.slice(),
                oldVal = this.attributes,
                item;

            while (pathCopy.length) {
                item = pathCopy.shift();

                if (pathCopy.length) {
                    if (!(oldVal instanceof Object && item in oldVal)) {
                        oldVal[item] = {};
                    }

                    oldVal = oldVal[item];
                } else {
                    oldVal[item] = val;
                }
            }

            this._previousAttributes[attr] = this._getPath(path);

            _super(this, 'set', [attr, val, options]);

            delete this._previousAttributes[attr];
            delete this.attributes[attr];
        },

        _getPath: function (path) {
            var current = this.attributes;

            for (var i = 0; i < path.length; i++) {
                var item = path[i];

                if (current instanceof Object && item in current) {
                    current = current[item];
                } else {
                    return undefined;
                }
            }

            return current;
        }
    });

    return Ribs;
}));