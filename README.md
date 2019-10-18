# tree-cli

[![CircleCI](https://circleci.com/gh/MrRaindrop/tree-cli.svg?style=svg)](https://circleci.com/gh/MrRaindrop/tree-cli)
[![npm version](https://badge.fury.io/js/tree-cli.svg)](https://badge.fury.io/js/tree-cli)
![downloads](https://img.shields.io/npm/dm/tree-cli?style=flat-square)

List contents of directories in tree-like format.

Tree-cli is a recursive directory listing program that produces a depth indented listing of files. With no arguments, tree lists the files in the current directory. When directory arguments are given, tree lists all the files and/or directories found in the given directories each in turn. Upon completion of listing all files/directories found, tree returns the total number of files and/or directories listed.

## example

cmd:

```
tree -l 2 -o output.txt
```

result:

```
/Applications/XAMPP/htdocs/node_playground/tree-cli
├── README.md
├── bin
|  └── tree
├── node_modules
|  ├── bluebird
|  ├── chalk
|  ├── cli-spinner
|  ├── meow
|  └── object-assign
├── package.json
└── tree.js

directory: 7 file: 4
```

## install

```
npm install -g tree-cli
```

## usage

#### Use the command `tree` or `treee` (to avoid confliction with system command).

**NOTE: use `treee` instead of `tree` on windows system.**

``
tree/treee
``

#### Use it as a node module to get the detailed tree data.

```javascript
require('tree-cli')({
  base: '.',    // or any path you want to inspect.
  noreport: true
}).then(res => {
  // res.data is the data for the file tree.
  // res.report is the stringified scanning report.
  console.log(res.data, res.report);
});
```

You can find the type declaration for the exporting function and the type declaration of its' params and result in the 'types/index.d.ts' file. If you are using VSCode, you'll find the type hint during your typing.

**Breaking change:** In version before 0.6.0, the resovled result is the tree structure of the scanned directory. But in latest **v0.6.0**, the resolved result is changed to a object contains both the file tree structure and the scanned report. The structure of result would be:

```
{
  data: {
    // ...The file node tree.
  },
  report: '...',  // The final report.
}
```

#### use --help to list help info.

``
tree --help
``

#### specify the level of path (how deep to scan).

use `-l levelNumber` to specify the path level.

```
tree -l 2
```

#### output result to a file

use `-o outputFilePath` to specify the output file.

```
tree -l 2 -o out.txt
```

#### show directory only

use `-d` to show directories only.

```
tree -l 2 -o out.txt -d
```

#### other arguments

see [Options](#options).

#### FOR WINDOWS USERS

you should just use the `treee` command as `tree` has been already taken by windows system.

```
treee -l 2 -o out.txt -d
```

## Options

* --help: outputs a verbose usage listing.
* --version: outputs the version of tree-cli.
* --debug: show debug info.
* --fullpath: prints the full path prefix for each file.
* --ignore: ignores directory or file you specify - accepts arrays as comma-delimited strings: `'node_modules/, .git/, .gitignore'`
* --link: follows symbolic links if they point to directories, as if they were directories. Symbolic links that will result in recursion are avoided when detected.
* --noreport: omits printing of the file and directory report at the end of the tree listing and omits printing the tree on console.
* --base: specify a root directory. Relative path from cwd root and absolute path are both acceptable. This argument is optional.
* -a: all files are printed. By default tree does not print hidden files (those beginning with a dot '.'). In no event does tree print the file system constructs '.' (current directory) and '..' (previous directory).
* -d: list directories only.
* -f: append a '/' for directories, a '=' for socket files and a '|' for FIFOs.
* -i: makes tree not print the indentation lines, useful when used in conjunction with the -f option.
* -l: max display depth of the directory tree.
* -o: send output to filename.

