const tree = require('tree-cli');
tree({
  base: '.',
  noreport: true
}).then((res) => {
  console.dir(res.root.children);
});
