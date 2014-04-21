## Deep Get/Set

```js
var model = new Backbone.Ribs.Model({
    foo: {
        bar: 'test',
        deepFoo: {
            deepBar: 'deepTest'
        }
    },
    'foo.bar': 'dot'
});
```
### Get
```js
model.get('foo.bar'); //"test"
```
You can use any depth:
```js
model.get('foo.deepFoo.deepBar'); //"deepTest"
```
If the name contains "." escape it by "!":
```js
model.get('foo!.bar'); //"dot"
```
### Set
```js
model.set('foo.bar', 'ribs');
```
`"change:foo.bar"` event will be triggered on the model
```js
model.get('foo.bar'); //"ribs"
```
You can also use any depth:
```js
model.set('foo.deepFoo.deepBar', 'deepRibs');
model.get('foo.deepFoo.deepBar'); //"deepRibs"
```