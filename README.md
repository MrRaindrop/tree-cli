treejs
======

a js tool to list files and directories in local file system running on node.

cmd
----------

use it in node cmd - ``node tree``

cmd line arguments:

> * ``--path``/``-p`` : root path.
> * ``--out``/``-o``: output file.
> * ``-r``: recursive

example:
```
node tree -p=D:\www -o=D:\tree_output.txt -r
```

------------------------

api
----------

#### run

pass ``opts`` object to run:
```javascript
var tree = require('tree'),
	opts = {
		path: 'D:\www',
		isRecursive: true,
		out: 'D:\tree_output.txt'
	};
tree.run(opts);
```

> * ``path``: root path.
> * ``data``: if not passing path, data obj must be passed.
> * ``isRecursive``: show directory recursively or not.
> * ``level``: how deep the recursion goes.
> * ``out``: output file path.
