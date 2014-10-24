var newtestObj;

var newdeletePath = function (path, obj) {
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

setTimeout(function () {
    var start = +new Date();

    for (var i = 0; i < 200000; i++) {
        newtestObj = {
            one: {
                't.wo': {
                    three: 'four'
                }
            }
        };
        newdeletePath(['one','t.wo','three'], newtestObj);
    }

    console.log(+new Date() - start);
    console.log('newtestObj');
    console.log(newtestObj);
}, 200);

var testObj;

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

setTimeout(function () {
    var start = +new Date();

    for (var i = 0; i < 200000; i++) {
        testObj = {
            one: {
                't.wo': {
                    three: 'four'
                }
            }
        };
        deletePath(['one','t.wo','three'], testObj);
    }

    console.log(+new Date() - start);
    console.log('testObj');
    console.log(testObj);
}, 500);