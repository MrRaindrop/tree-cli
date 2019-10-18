var tree = require('../tree');
var path = require('path');

tree({
  ignore: ['package.json'],
  o: path.resolve(__dirname, 'o.data'),
  l: 3,
  base: path.resolve(__dirname, '../'),
  noreport: false,
}).then(() => {
  console.log('success!');
});
