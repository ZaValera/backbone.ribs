var Model = Backbone.Ribs.Model.extend(),
    ar = [0,1,{foo: 'bar'}],
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
test('Simple GET', function() {
    equal(model.get('ar'), ar, 'Get Array');

    equal(model.get('obj'), obj, 'Get Object');

    equal(model.get('str'), 'testString', 'Get String');

    equal(model.get('num'), 123, 'Get Number');

    equal(model.get('bool'), true, 'Get Boolean');

    equal(model.get('nl'), null, 'Get Null');

    equal(model.get('ndf'), undefined, 'Get Undefined');

    equal(model.get('fn'), fn, 'Get Function');
});

test('Deep GET', function() {
    equal(model.get('ar.1'), 1, 'Get Array Element');

    equal(model.get('ar.2.foo'), 'bar', 'Get Object in Array Element');

    equal(model.get('obj.foo'), 'bar', 'Get Object First Level');

    equal(model.get('obj.subObj.subFoo'), 'subBar', 'Get Object Second Level');

    equal(model.get('obj.subAr.1'), 1, 'Get Array in Object Element');
});