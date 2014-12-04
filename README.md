tree-cli
======

a js tool to list files and directories in local file system running on node.

install
----------
```
npm install -g tree-cli
```

cmd
----------

use it in node cmd: ``tree``

example:
```
tree
```

Input the information according to the prompts, the results will goto the output file(default: tree_cli_output.txt):
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
    out: 'D:\tree_cli_output.txt',
    level: 2,
    indentation: 1
  };
tree.run(opts);
```
if you want to print a object like this in a tree:
```javascript
var myObj = {
  foo: {
    foo: '',
  },
  bar: {
    bar1: '',
    bar2: '',
  }
}
```
you must use it in the attribute ``data``:
```javascript
var tree = require('tree-cli'),
  opts = {
    data: myObj,
    out: 'D:\tree_cli_output.txt',
    level: 2,
    indentation: 1
  };
tree.run(opts);
```
the result in the output file will be:
```
─foo
 └─foo
─bar
 ├─bar1
 └─bar2
```

> * ``path``: root path.
> * ``data``: if not passing path, data obj must be passed.
> * ``out``: output file path.
> * ``level``: how deep the recursion goes(nust be a ``Number``).
> * ``indentation``: indentation of results(must be a ``Number``).
> * ``isVerbose``: show result in cmd line(``true`` or ``false``).


