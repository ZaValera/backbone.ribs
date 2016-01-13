//JSHint settings
/* globals QUnit: false */
/* globals Backbone: false */

QUnit.module('Computeds', function () {
    'use strict';

    QUnit.module('GET', {
        beforeEach: function () {
            this.model = new (Backbone.Ribs.Model.extend({
                defaults: {
                    bar1: 1,
                    bar2: 2,
                    bar3: {
                        subBar: 3
                    },
                    'bar.bar': {
                        subBar: {
                            deepBar: 4
                        }
                    }
                },

                computeds: {
                    comp1: {
                        deps: 'bar1',
                        get: function (bar1) {
                            return bar1 * 10;
                        }
                    },

                    comp2: {
                        deps: ['bar1', 'bar2'],
                        get: function (bar1, bar2) {
                            return bar1 + bar2;
                        }
                    },

                    comp3: {
                        deps: ['comp1', 'comp2', 'comp4', 'bar2'],
                        get: function (comp1, comp2, comp4, bar2) {
                            return comp1 + ' ' + comp2 + ' ' + comp4 + ' ' + bar2;
                        }
                    },

                    comp4: {
                        deps: ['bar2'],
                        get: function (bar2) {
                            return bar2 * 10;
                        }
                    },

                    comp5: {
                        deps: ['bar!.bar.subBar.deepBar'],
                        get: function (deepBar) {
                            return deepBar * 10;
                        }
                    },

                    comp6: {
                        deps: ['bar3'],
                        get: function (bar3) {
                            return bar3.subBar * 10;
                        }
                    }
                }
            }))();
        }
    }, function () {
        QUnit.test('Init', function (assert) {
            var model = this.model;

            assert.equal(model.get('comp1'), 10, 'Get single deps computed');
            assert.equal(model.get('comp2'), 3, 'Get double deps computed');
            assert.equal(model.get('comp3'), '10 3 20 2', 'Get computed deps on other computed');
            assert.equal(model.get('comp5'), 40, 'Get deep deps computed');
            assert.equal(model.get('comp6'), 30, 'Get sublevel deps computed');

            assert.equal(model.previous('comp1'), undefined, 'Previous single deps computed');
            assert.equal(model.previous('comp2'), undefined, 'Previous double deps computed');
            assert.equal(model.previous('comp3'), undefined, 'Previous computed deps on other computed');
            assert.equal(model.previous('comp5'), undefined, 'Previous deep deps computed');
            assert.equal(model.previous('comp6'), undefined, 'Previous sublevel deps computed');

            assert.equal(model.attributes.comp1, 10, 'single deps computed in attributes');
            assert.equal(model.attributes.comp2, 3, 'double deps computed in attributes');
            assert.equal(model.attributes.comp3, '10 3 20 2', 'computed deps on other computed in attributes');
            assert.equal(model.attributes.comp5, 40, 'deep deps computed in attributes');
            assert.equal(model.attributes.comp6, 30, 'sublevel deps computed in attributes');
        });

        QUnit.test('After set ', function (assert) {
            var model = this.model;

            model.set('bar1', 5);
            assert.equal(model.get('comp1'), 50, 'Get single deps computed');
            assert.equal(model.get('comp2'), 7, 'Get double deps computed');
            assert.equal(model.get('comp3'), '50 7 20 2', 'Get computed deps on other computed');

            model.set('bar2', 6, {silent: true});
            assert.equal(model.get('comp3'), '50 11 60 6', 'Get computed deps on other computed after silent set');

            model.set('bar!.bar.subBar.deepBar', 8);

            assert.equal(model.get('comp5'), 80, 'Get deep deps computed after set first level');

            model.set('bar!.bar.subBar', {deepBar: 9});

            assert.equal(model.get('comp5'), 90, 'Get deep deps computed after set second level');

            model.set('bar!.bar', {subBar: {deepBar: 10}});

            assert.equal(model.get('comp5'), 100, 'Get deep deps computed after set third level');

            model.set('bar3.subBar', 11);

            assert.equal(model.get('comp6'), 30, 'Get sublevel deps computed');
        });
    });

    QUnit.module('SET', {
        beforeEach: function () {
            this.model = new (Backbone.Ribs.Model.extend({
                defaults: {
                    bar1: 1,
                    bar2: 2,
                    foo: {
                        bar: 3
                    }
                },

                computeds: {
                    comp1: {
                        deps: 'bar1',
                        get: function (bar1) {
                            return bar1 * 10;
                        },
                        set: function (val) {
                            return val/10;
                        }
                    },

                    comp2: {
                        deps: ['bar1', 'bar2'],
                        get: function (bar1, bar2) {
                            return bar1 + ' ' + bar2;
                        },
                        set: function (val) {
                            val = val.split(' ');

                            return [parseInt(val[0]), parseInt(val[1])];
                        }
                    },

                    comp3: {
                        deps: ['bar2', 'comp2'],
                        get: function (bar1, comp2) {
                            return bar1 + '-' + comp2;
                        },
                        set: function (val) {
                            val = val.split('-');

                            return [parseInt(val[0]), val[1]];
                        }
                    },

                    comp4: {
                        deps: 'foo',
                        get: function (foo) {
                            return foo.bar;
                        }
                    }
                }
            }))();
        }
    }, function () {
        QUnit.test('Single deps', function (assert) {
            var model = this.model;

            model.set('comp1', 30);

            assert.equal(model.get('comp1'), 30, 'Get updated computed');
            assert.equal(model.previous('comp1'), 10, 'Previous computed');
            assert.equal(model.attributes.comp1, 30, 'computed in attributes');
            assert.equal(model.changed.comp1, 30, 'computed in changed');

            assert.equal(model.get('bar1'), 3, 'Get deps');
            assert.equal(model.previous('bar1'), 1, 'Previous deps');
            assert.equal(model.changed.bar1, 3, 'changed deps');
        });

        QUnit.test('Double deps', function (assert) {
            var model = this.model;

            model.set('comp2', '3 4');

            assert.equal(model.get('comp2'), '3 4', 'Get updated computed');
            assert.equal(model.previous('comp2'), '1 2', 'Previous computed');
            assert.equal(model.attributes.comp2, '3 4', 'computed in attributes');
            assert.equal(model.changed.comp2, '3 4', 'computed in changed');

            assert.equal(model.get('bar1'), 3, 'Get deps 1');
            assert.equal(model.previous('bar1'), 1, 'Previous deps 1');
            assert.equal(model.changed.bar1, 3, 'changed deps 1');

            assert.equal(model.get('bar2'), 4, 'Get deps 2');
            assert.equal(model.previous('bar2'), 2, 'Previous deps 2');
            assert.equal(model.changed.bar2, 4, 'changed deps 2');
        });

        QUnit.test('Deps on other computeds', function (assert) {
            var model = this.model;

            model.set('comp3', '4-3 4');
            assert.equal(model.get('comp3'), '4-3 4', 'Get updated computed');
            assert.equal(model.previous('comp3'), '2-1 2', 'Previous computed');
            assert.equal(model.attributes.comp3, '4-3 4', 'computed in attributes');
            assert.equal(model.changed.comp3, '4-3 4', 'computed in changed');

            assert.equal(model.get('bar2'), 4, 'Get deps');
            assert.equal(model.previous('bar2'), 2, 'Previous deps');
            assert.equal(model.changed.bar2, 4, 'changed deps');

            assert.equal(model.get('comp2'), '3 4', 'Get deps computed');
            assert.equal(model.previous('comp2'), '1 2', 'Previous deps computed');
            assert.equal(model.attributes.comp2, '3 4', 'deps computed in attributes');
            assert.equal(model.changed.comp2, '3 4', 'changed deps computed');

            assert.equal(model.get('bar1'), 3, 'Get deps sublevel');
            assert.equal(model.previous('bar1'), 1, 'Previous deps sublevel');
            assert.equal(model.changed.bar1, 3, 'changed deps sublevel');
        });

        QUnit.test('Silent', function (assert) {
            var model = this.model,
                counter = 0;

            model.on('change:comp1', function () {counter++;});
            model.on('change:comp2', function () {counter++;});
            model.on('change:comp3', function () {counter++;});
            model.on('change:bar1', function () {counter++;});
            model.on('change:bar2', function () {counter++;});

            model.set('comp3', '4-3 4', {silent: true});
            assert.equal(model.get('comp3'), '4-3 4', 'Get updated computed');
            assert.equal(model.previous('comp3'), '2-1 2', 'Previous computed');
            assert.equal(model.attributes.comp3, '4-3 4', 'computed in attributes');
            assert.equal(model.changed.comp3, '4-3 4', 'computed in changed');

            assert.equal(model.get('bar2'), 4, 'Get deps');
            assert.equal(model.previous('bar2'), 2, 'Previous deps');
            assert.equal(model.changed.bar2, 4, 'changed deps');

            assert.equal(model.get('comp2'), '3 4', 'Get deps computed');
            assert.equal(model.previous('comp2'), '1 2', 'Previous deps computed');
            assert.equal(model.attributes.comp2, '3 4', 'deps computed in attributes');
            assert.equal(model.changed.comp2, '3 4', 'changed deps computed');

            assert.equal(model.get('bar1'), 3, 'Get deps sublevel');
            assert.equal(model.previous('bar1'), 1, 'Previous deps sublevel');
            assert.equal(model.changed.bar1, 3, 'changed deps sublevel');

            assert.equal(counter, 0, 'Silent!!!');
        });

        QUnit.test('Unset (Single deps)', function (assert) {
            var model = this.model;

            model.set('comp1', 30, {unset: true});
            assert.equal(model.get('comp1'), undefined, 'Get updated computed');
            assert.equal(model.previous('comp1'), 10, 'Previous computed');
            assert.equal(model.attributes.comp1, undefined, 'computed in attributes');
            assert.equal(model.changed.comp1, 30, 'computed in changed');

            assert.equal(model.get('bar1'), 1, 'Get deps');
        });

        QUnit.test('Unset (Double deps)', function (assert) {
            var model = this.model;

            model.set('comp2', '3 4', {unset: true});
            assert.equal(model.get('comp2'), undefined, 'Get updated computed');
            assert.equal(model.previous('comp2'), '1 2', 'Previous computed');
            assert.equal(model.attributes.comp2, undefined, 'computed in attributes');
            assert.equal(model.changed.comp2, '3 4', 'computed in changed');

            assert.equal(model.get('bar1'), 1, 'Get deps 1');
            assert.equal(model.get('bar2'), 2, 'Get deps 2');
            assert.equal(model.get('comp3'), '2-undefined', 'Get computed with deps');
        });

        QUnit.test('Unset (Deps on other computeds)', function (assert) {
            var model = this.model;

            model.set('comp3', '4-3 4', {unset: true});
            assert.equal(model.get('comp3'), undefined, 'Get updated computed');
            assert.equal(model.previous('comp3'), '2-1 2', 'Previous computed');
            assert.equal(model.attributes.comp3, undefined, 'computed in attributes');
            assert.equal(model.changed.comp3, '4-3 4', 'computed in changed');

            assert.equal(model.get('bar2'), 2, 'Get deps');
            assert.equal(model.get('comp2'), '1 2', 'Get deps computed');
        });

        QUnit.test('Fire change events', function (assert) {
            var model = this.model,
                res = [];

            model.on('change:bar1', function () {res.push('bar1');});
            model.on('change:bar2', function () {res.push('bar2');});
            model.on('change:comp1', function () {res.push('comp1');});
            model.on('change:comp2', function () {res.push('comp2');});
            model.on('change:comp3', function () {res.push('comp3');});

            model.set('bar1', 3);

            assert.equal(res.sort().join(' '), 'bar1 comp1 comp2 comp3', 'Set attribute');

            res = [];

            model.set('bar2', 4);

            assert.equal(res.sort().join(' '), 'bar2 comp2 comp3', 'Set other attribute');

            res = [];

            model.set('comp2', '5 6');

            assert.equal(res.sort().join(' '), 'bar1 bar2 comp1 comp2 comp3', 'Set computed');

            res = [];

            model.set('comp3', '7-8 9');

            assert.equal(res.sort().join(' '), 'bar1 bar2 comp1 comp2 comp3', 'Set complex computed');
        });

        QUnit.test('Trigger change events', function (assert) {
            var model = this.model,
                attrChanged = false,
                compChanged = false;

            model.on('change:foo', function () {
                attrChanged = true;
            });

            model.on('change:comp4', function () {
                compChanged = true;
            });

            model.get('foo').bar = 4;

            assert.equal(model.get('comp4'), 3, 'Computed after changing attr without set');
            assert.equal(attrChanged, false, 'change attr event not fired');
            assert.equal(compChanged, false, 'change comp event not fired');

            model.trigger('change:foo');

            assert.equal(model.get('comp4'), 4, 'Computed after triggering change event');
            assert.equal(attrChanged, true, 'change attr event fired');
            assert.equal(compChanged, true, 'change comp event fired');
        });
    });

    QUnit.module('Methods', {
        beforeEach: function () {
            this.model = new (Backbone.Ribs.Model.extend({
                defaults: {
                    bar1: 1,
                    bar2: 2
                },

                computeds: {
                    comp1: {
                        deps: 'bar1',
                        get: function (bar1) {
                            return bar1 * 10;
                        },
                        set: function (val) {
                            return val/10;
                        },
                        toJSON: true
                    },

                    comp2: {
                        deps: 'bar2',
                        get: function (bar2) {
                            return bar2 * 10;
                        }
                    }
                }
            }))();
        }
    }, function () {
        QUnit.test('isComputed()', function (assert) {
            var model = this.model;

            assert.equal(model.isComputed('comp1'), true, 'isComputed computed');
            assert.equal(model.isComputed('bar1'), false, 'isComputed attribute');
            assert.equal(model.isComputed('foo'), false, 'isComputed undefined');
        });

        QUnit.test('addComputeds()', function (assert) {
            var model = this.model;

            model.addComputeds('comp3', {
                deps: 'bar2',
                get: function (bar2) {
                    return bar2 * 100;
                }
            });

            model.addComputeds({
                'comp4': {
                    deps: 'bar2',
                    get: function (bar2) {
                        return bar2 * 100;
                    }
                }
            });

            assert.equal(model.get('comp3'), 200);
            assert.equal(model.get('comp4'), 200);

            var error = '';

            try {
                model.addComputeds('bar1', {
                    deps: ['bar2'],
                    get: function (bar2) {
                        return bar2 * 10;
                    }
                });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'addComputeds: computed name "bar1" is already used', 'addComputeds - already used attr error');

            error = '';

            try {
                model.addComputeds('comp2', {
                    deps: ['bar2'],
                    get: function (bar2) {
                        return bar2 * 10;
                    }
                });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'addComputeds: computed name "comp2" is already used', 'addComputeds - already used computed error');
        });

        QUnit.test('removeComputeds() all', function (assert) {
            var model = new (Backbone.Ribs.Model.extend({
                defaults: {
                    bar1: 1,
                    bar2: 2
                },

                computeds: {
                    comp1: {
                        deps: 'bar1',
                        get: function (bar1) {
                            return bar1 * 10;
                        }
                    },

                    comp2: {
                        deps: ['bar1', 'bar2'],
                        get: function (bar1, bar2) {
                            return bar1 + bar2;
                        }
                    }
                }
            }))();

            model.removeComputeds();
            assert.equal(model.get('comp1'), undefined);
            assert.equal(model.get('comp2'), undefined);
            model.set('bar1', 3);
            assert.equal(model.get('comp1'), undefined);
            assert.equal(model.get('comp2'), undefined);
        });

        QUnit.test('removeComputeds() multi', function (assert) {
            var model = new (Backbone.Ribs.Model.extend({
                defaults: {
                    bar1: 1,
                    bar2: 2
                },

                computeds: {
                    comp1: {
                        deps: 'bar1',
                        get: function (bar1) {
                            return bar1 * 10;
                        }
                    },

                    comp2: {
                        deps: ['bar1', 'bar2'],
                        get: function (bar1, bar2) {
                            return bar1 + bar2;
                        }
                    },

                    comp3: {
                        deps: ['bar1', 'bar2'],
                        get: function (bar1, bar2) {
                            return bar1 + bar2;
                        }
                    }
                }
            }))();

            model.removeComputeds(['comp1', 'comp3']);
            assert.equal(model.get('comp1'), undefined);
            assert.equal(model.get('comp2'), 3);
            assert.equal(model.get('comp3'), undefined);
            model.set('bar1', 3);
            assert.equal(model.get('comp1'), undefined);
            assert.equal(model.get('comp2'), 5);
            assert.equal(model.get('comp3'), undefined);
        });

        QUnit.test('removeComputeds() single', function (assert) {
            var model = this.model;

            model.addComputeds('comp3', {
                deps: 'bar2',
                get: function (bar2) {
                    return bar2 * 100;
                }
            });

            model.removeComputeds('comp1');
            assert.equal(model.get('comp1'), undefined);
            model.set('bar1', 3);
            assert.equal(model.get('comp1'), undefined);

            model.set('comp1', 40);
            assert.equal(model.get('comp1'), 40, 'Set attr after removeComputeds');
            assert.equal(model.isComputed('comp1'), false);
        });

        QUnit.test('toJSON()', function (assert) {
            var model = this.model;

            assert.deepEqual(model.toJSON(), {bar1: 1, bar2: 2, comp1: 10}, 'toJSON in computed');
            assert.deepEqual(model.toJSON({computeds: true}), {bar1: 1, bar2: 2, comp1: 10, comp2: 20}, 'all computeds');
            assert.deepEqual(model.toJSON({computeds: false}), {bar1: 1, bar2: 2}, 'without computeds');
        });

        QUnit.test('clone()', function (assert) {
            var model = this.model,
                clonedModel = model.clone();

            assert.deepEqual(clonedModel.attributes, {bar1: 1, bar2: 2, comp1: 10, comp2: 20}, 'cloned attributes');
        });
    });

    QUnit.module('Features', function () {
        QUnit.test('loop', function (assert) {
            var error;

            try {
                var model = new (Backbone.Ribs.Model.extend({
                    computeds: {
                        comp1: {
                            deps: 'comp2',
                            get: function (comp2) {
                                return comp2 * 10;
                            }
                        },

                        comp2: {
                            deps: 'comp1',
                            get: function (comp1) {
                                return comp1 / 10;
                            }
                        }
                    }
                }))();
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'addComputeds(): a circular references in computeds "comp1 <-> comp2"');
        });

        QUnit.test('set must return array', function (assert) {
            var error;

            try {
                var model = new (Backbone.Ribs.Model.extend({
                    defaults: {
                        foo: '10',
                        bar: '20'
                    },

                    computeds: {
                        comp1: {
                            deps: ['foo', 'bar'],
                            get: function (foo, bar) {
                                return foo + ';' + bar;
                            },
                            set: function (val) {
                                return val;
                            }
                        }
                    }
                }))();

                model.set('comp1', '30;40');
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, '`set` computed must return an array of values');
        });

        QUnit.test('deps to deep', function (assert) {
            var model = new (Backbone.Ribs.Model.extend({
                defaults: {
                    foo: 10
                },

                computeds: {
                    comp: {
                        deps: ['foo.bar.ribs'],
                        get: function (ribs) {
                            return ribs + '_ribs';
                        }
                    }
                }
            }))();


            assert.equal(model.get('comp'), 'undefined_ribs');
        });

        QUnit.test('deps is not in attributes', function (assert) {
            var model = new (Backbone.Ribs.Model.extend({
                computeds: {
                    comp: {
                        deps: ['foo'],
                        get: function (ribs) {
                            return ribs + '_ribs';
                        }
                    }
                }
            }))();


            assert.equal(model.get('comp'), 'undefined_ribs');
        });

        QUnit.test('set in change callback', function (assert) {
            var model = new (Backbone.Ribs.Model.extend({
                defaults: {
                    foo: 10
                },

                computeds: {
                    comp: {
                        deps: ['foo'],
                        get: function (ribs) {
                            return ribs * 10;
                        }
                    }
                }
            }))();

            model.on('change:foo', function () {
                model.set('foo', 10, {silent: true});
            });

            model.set('foo', 20);

            assert.deepEqual(model.changed, {});
        });

        QUnit.test('function computed', function (assert) {
            var error;

            try {
                var model = new (Backbone.Ribs.Model.extend({
                    computeds: {
                        comp1: function () {
                            return 'foo';
                        }
                    }
                }))();
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'init computed: computed \"comp1\" is a function. It is no longer available after v0.4.6');
        });

        QUnit.test('set computed without set method', function (assert) {
            var error;

            try {
                var model = new (Backbone.Ribs.Model.extend({
                    computeds: {
                        comp1: {
                            deps: 'foo',
                            get: function (foo) {
                                return foo * 10;
                            }
                        }
                    }
                }))();

                model.set('comp1', '20');
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'set: computed \"comp1\" has no set method');
        });

        QUnit.test('collection.where', function (assert) {
            var Col = Backbone.Collection.extend({
                model: Backbone.Ribs.Model.extend({
                    computeds: {
                        comp: {
                            deps: ['first', 'last'],
                            get: function (first, last) {
                                return first + last;
                            }
                        }
                    }
                })
            });

            var col = new Col([{first: 'a', last: 'b'}, {first: 'c', last: 'd'}, {first: 'a', last: 'b'}]);

            assert.equal(col.where({comp: 'ab'}).length, 2);
        });
    });
});