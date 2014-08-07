tree-cli
======

a js tool to list files and directories in local file system running on node.

install
----------
```
node install -g tree-cli
```

cmd
----------

use it in node cmd: ``tree-cli``

cmd line arguments:

> * ``--path``/``-p`` : root path.
> * ``--out``/``-o``: output file.
> * ``-r``: recursive

example:
```
tree-cli -p=D:\www -o=D:\tree_cli_output.txt -r
```

in tree_cli_output.txt:
```

```

------------------------

api
----------

#### run

pass ``opts`` object to run:
```javascript
var tree = require('tree-cli'),
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
