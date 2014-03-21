var Model = Backbone.Ribs.Model.extend(),
    ar = [0,1,2],
    obj = {
        foo: 'bar',
        subObj: {
            subFoo: 'subBar'
        },
        subAr: [0,1,2]
    },
    fn = function () {return true;},
    model = new Model({
        ar: ar,
        obj: obj,
        str: 'testString',
        num: 123,
        bool: true,
        nl: null,
        ndf: undefined,
        fn: fn
    });

module('GET');
test('Deep GET', function() {
    equal(model.get('ar.1'), 1, 'Get Array Element');
});

test('Simple GET', function() {
    equal(model.get('ar'), ar, 'Get Array');

    equal(model.get('obj'), obj, 'Get Object');

    equal(model.get('str'), 'testString', 'Get String');

    equal(model.get('num'), 1234, 'Get Number');

    equal(model.get('bool'), true, 'Get Boolean');

    equal(model.get('nl'), null, 'Get Null');

    equal(model.get('ndf'), undefined, 'Get Undefined');

    equal(model.get('fn'), fn, 'Get Function');
});

module('SET');

test('Deep SET', function() {
    equal(model.get('ar.1'), 1, 'Get Array Element');
});

