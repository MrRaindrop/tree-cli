# tree-cli

List contents of directories in tree-like format.

Tree-cli is a recursive directory listing program that produces a depth indented listing of files. With no arguments, tree lists the files in the current directory. When directory arguments are given, tree lists all the files and/or directories found in the given directories each in turn. Upon completion of listing all files/directories found, tree returns the total number of files and/or directories listed.

**Default output file: tree_out**

## install

```
npm install -g tree-cli
```

## usage

use the command `tree` or `treee` (to avoid confliction with system command)

``
tree
``

#### use --help to list help info.

``
tree --help
``

#### use options to customize output

```
tree -l 2 -o out.txt -d
```

## output example

cmd:

```
tree -l 2 -o out.txt
```
result:

```
/Applications/XAMPP/htdocs/node_playground/tree-cli
|-- README.md
|-- bin
|  `-- tree
|-- node_modules
|  |-- bluebird
|  |-- chalk
|  |-- cli-spinner
|  |-- meow
|  `-- object-assign
|-- package.json
`-- tree.js

directory: 7 file: 4
```

## Options

* --help: outputs a verbose usage listing.
* --version: outputs the version of tree-cli.
* --debug: show debug info.
* --fullpath: prints the full path prefix for each file.
* --ignore: ignores directory or file you specify - accepts arrays as comma-delimited strings: `'node_modules/, .git/, .gitignore'`
* --link: follows symbolic links if they point to directories, as if they were directories. Symbolic links that will result in recursion are avoided when detected.
* --noreport: omits printing of the file and directory report at the end of the tree listing and omits printing the tree on console.
* -a: all files are printed. By default tree does not print hidden files (those beginning with a dot '.'). In no event does tree print the file system constructs '.' (current directory) and '..' (previous directory).
* -d: list directories only.
* -f: append a '/' for directories, a '=' for socket files and a '|' for FIFOs.
* -i: makes tree not print the indentation lines, useful when used in conjunction with the -f option.
* -l: max display depth of the directory tree.
* -o: send output to filename.
