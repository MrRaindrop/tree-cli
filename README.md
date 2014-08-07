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
> * ``--recursive``/``-r``: dump recursively.
> * ``--verbose``/``-v``: dump verbosely.

example:
```
tree-cli -p=D:\Atree -o=D:\tree_cli_output.txt -r
```

in tree_cli_output.txt:
```
--Atree
  |--bar/
  |  |--bar1.txt
  |  |--bar2.txt
  |  |--bye.exe
  |  |--foo2/
  |     |--eatFood.txt
  |     |--food.txt
  |     |--foodtoEat.txt
  |     |--fruits.txt
  |--foo/
  |  |--goodDayToDie.js
  |--fun/
  |  |--funny/
  |  |  |--joystick.txt
  |  |  |--war3.bat
  |  |  |--wow.exe
  |  |--joy.txt
  |--good.day
  |--sub1/
     |--good_day.txt
     |--joy.log
     |--line/
     |  |--lie.txt
     |--nice.log
```
------------------------

api
----------

#### run

pass ``opts`` object to run:
```javascript
var tree = require('tree-cli'),
    opts = {
		path: 'D:\Atree',
		isRecursive: true,
		out: 'D:\tree_cli_output.txt'
	};
tree.run(opts);
```

> * ``path``: root path.
> * ``data``: if not passing path, data obj must be passed.
> * ``isRecursive``: show directory recursively or not.
> * ``isVerbose``: show result in cmd line.
> * ``level``: how deep the recursion goes.
> * ``out``: output file path.
