'use strict';

var _DEBUG = false;

var Promise = require('bluebird'),
  assign = require('object-assign'),
  chalk = require('chalk'),
  Spinner = require('cli-spinner').Spinner,

  fs = Promise.promisifyAll(require('fs')),
  os = require('os'),
  path = require('path'),
  childProcess = require('child_process'),

  DEFAULT_LEVEL = 1,
  DEFAULT_INDENT = 2,
  DEFAULT_OUT = null,

  _LOG_DEBUG = '[debug]',
  _LOG = chalk.bold.green('[log]'),
  _ERROR = chalk.bold.red('[error]'),

  _output = chalk.bold.yellow,

  _root,
  _spinner = new Spinner(),

  _flags = {
    // --debug
    // show debug info.
    debug: _DEBUG,
    base: '.',
    indent: DEFAULT_INDENT,
    // --ignore
    // ignores specified directory/files
    ignore: [],
    // --fullpath
    // prints the full path prefix for each file.
    fullpath: false,
    // --link
    // follows symbolic links if they point to directories, as if
    // they were directories. Symbolic links that will result in
    // recursion are avoided when detected.
    link: false,
    // --noreport
    // omits printing of the file and directory report at the end of
    // the tree listing and omits printing the tree on console.
    noreport: false,
    // -l
    // max display depth of the directory tree.
    l: DEFAULT_LEVEL,
    o: DEFAULT_OUT,
    // -f
    // append a '/' for directories, a '=' for socket files
    // and a '|' for FIFOs
    f: false,
    directoryFirst: false,
  },

  _ignores = [],

  _tree = {
  },

  _report = '',

  _stats = {
    all: [],
    file: [],
    directory: [],
    blockdevice: [],
    characterdevice: [],
    symboliclink: [],
    fifo: [],
    socket: [],
    ignore: {},
  },

  _types = [
    'directory',
    'file',
    'blockdevice',
    'characterdevice',
    'symboliclink',
    'fifo',
    'socket',
  ],

  _marks,

  // backup marks: ├── └──

  _genMarks = function () {
    _marks = {
      vert: '|',
      hori: /*'-'*/'─',
      eol: os.EOL,
      pre_blank: ' ' + new Array(_flags.indent + 1).join(' '),
      pre_vert: _flags.i ?
        '' :
        '|' + new Array(_flags.indent + 1).join(' '),
      pre_file: _flags.i ?
        '' :
        /*'|'*/'├' + new Array(_flags.indent + 1).join(/*'-'*/'─') + ' ',
      last_file: _flags.i ?
        '' :
        /*'`'*/'└' + new Array(_flags.indent + 1).join(/*'-'*/'─') + ' ',
      pre_directory: _flags.f ? '/' : '',
      pre_blockdevice: '',
      pre_characterdevice: '',
      pre_symboliclink: '>',
      pre_socket: _flags.f ? '=' : '',
      pre_fifo: _flags.f ? '|' : ''
    }
  },

  _spinnerOn = function () {
    _spinner.setSpinnerString(9);
    _spinner.start();
  },

  _spinnerOff = function () {
    _spinner.stop(true);
  },

  _debug = function () {
    if (_flags.debug) {
      console.log.apply(this,
        [_LOG_DEBUG].concat(Array.prototype.slice.call(arguments)));
    }
  },

  _log = function () {
    console.log.apply(this,
      [_LOG].concat(Array.prototype.slice.call(arguments)));
  },

  _error = function () {
    console.error.apply(this,
      [_ERROR].concat(Array.prototype.slice.call(arguments)));
  },

  _typof = function (val) {
    return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
  },

  exec = function (cmd) {
    return Promise.promisify(childProcess.exec)(cmd)
      .then(function (res) {
        _debug('exec: ', cmd);
        _debug('exec res: ', res);
        return res;
      }).catch(function (err) {
        _error(err);
        process.exit(-1);
      });
  },

  init = function (flags) {
    assign(_flags, flags);
    if (_flags.l < DEFAULT_LEVEL) {
      _flags.l = DEFAULT_LEVEL;
    }
    _debug('flags', _flags);
    _genMarks();
    _spinnerOn();

    // Fixed: https://github.com/MrRaindrop/tree-cli/issues/14.
    _normalizeIgnoreFlag(flags.ignore);

    return getRoot();
  },

  getRoot = function () {

    if (!_root) {
      _root = process.cwd()
    }
    _debug('root:', _root)
    return Promise.resolve(_root);

  },

  getFileType = function (path) {

    return fs.lstatAsync(path)
      .then(function (stats) {
        var types = [
          'Directory',
          'File',
          'BlockDevice',
          'CharacterDevice',
          'SymbolicLink',
          'FIFO',
          'Socket',
        ], type;
        for (var i = 0, l = types.length; i < l; i++) {
          type = types[i];
          if (stats['is' + type]()) {
            _debug(type, path);
            return type.toLowerCase();
          }
        }
      })
      .catch(function (err) {
        _error(err);
        throw err
      });

  },

  isDirectory = function (path) {

    return fs.lstatAsync(path)
      .then(function (stats) {
        return stats.isDirectory();
      })
      .catch(function (err) {
        _error(err);
        throw err
      });

  },

  // calc priority when the flag directoryFirst is true.
  _calcPriority = function (node) {
    return node.type === 'directory' ? 1 : 0;
  },

  // compare priority when the flag directoryFirst is true.
  _comparePriority = function (nodeA, nodeB) {
    return _calcPriority(nodeB) - _calcPriority(nodeA);
  },

  appendChildNodes = function (parent) {

    _debug('appendTreeNode:', parent);
    if (parent.level >= _flags.l) {
      return;
    }
    if (!parent.path) {
      _error('Path must exists:', parent);
      process.exit(-1);
    }

    // neither a direcotry nor a symboliclink.
    if (parent.type !== 'directory' &&
      parent.type !== 'symboliclink'
    ) {
      _error('Must be a directory or a symbolic link:',
        parent.type, parent.name, parent.path
      );
      process.exit(-1);
    }

    // a symboliclink without --link flag open.
    if (parent.type !== 'directory' &&
      parent.type === 'symboliclink' &&
      !_flags.link
    ) {
      _error('Must be a directory or open the \'--link\' flag if ' +
        'it\'s a symbolic link:',
        parent.name, parent.path
      );
      process.exit(-1);
    }

    // parent.children = [];
    return fs.readdirAsync(parent.path)
      .then(function (files) {
        files = files.filter(function (file) {
          return _flags.a || !/^\./.test(file);
        });
        parent.children = [];
        return Promise.resolve(files)
          .each(function (file, index) {
            var filePath = path.resolve(parent.path, file);
            return getFileType(filePath)
              .then(function (type) {
                _debug(type, filePath);
                var child = {
                  type: type,
                  level: parent.level + 1,
                  name: file,
                  path: filePath,
                  lasts: parent.lasts ? parent.lasts.slice() : []
                };
                // flag -d means directory only.
                if (_flags.d && type !== 'directory') {
                  return
                }
                if (_testIgnore(child, _ignores)) {
                  child.ignore = true;
                }
                parent.children.push(child);
                // for statistics.
                if (!child.ignore) {
                  _stats.all.push(child);
                  _stats[type].push(child);
                }
                else {
                  if (!_stats.ignore[type]) {
                    _stats.ignore[type] = [];
                  }
                  _stats.ignore[type].push(child);
                }
              })
              .catch(function (err) {
                _debug(filePath, ' is invalid to access.');
              })
          });
      })
      .then(function () {
        if (_flags.directoryFirst) {
          parent.children.sort(_comparePriority);
        }
      })
      .then(function () {
        return Promise.resolve(parent.children)
          .each(function (child, index) {
            return Promise.resolve()
              .then(function () {
                // otherwise every type of file counts.
                var isLast = index === parent.children.length - 1;
                isLast && (child.lasts[child.level - 1] = true);
                if (_testIgnore(child, _ignores)) {
                  child.ignore = true;
                  if (isLast) {
                    var prevIndex = index - 1;
                    while(prevIndex >= 0) {
                      var prevNode = parent.children[prevIndex];
                      if (prevNode.ignore) {
                        prevIndex--;
                      }
                      else {
                        prevNode.lasts[child.level - 1] = true;
                        break;
                      }
                    }
                  }
                }
                if (child.type === 'directory') {
                  return appendChildNodes(child);
                }
              });
          });
      })
      .catch(function (err) {
        if (err.code === 'ENOTDIR') {
          // a symboliclink reference to a file instead of a directory.
          return;
        } else {
          _error(err);
          process.exit(-1);
        }
      });
  },

  genTree = function (rootPath) {

    _debug('- genTree started...');

    // rootPath must be a direcotry.
    return getFileType(rootPath).then(function (type) {
      _tree.root = {
        type: type,
        level: 0,
        name: path.basename(rootPath),
        path: rootPath
      };
      return appendChildNodes(_tree.root);
    }).then(function () {
      _debug('- genTree done.');
    });
  },

  _normalizeIgnoreFlag = function (ignoreFlag) {
    if (!ignoreFlag) {
      return;
    }
    var flagType = _typof(ignoreFlag)
    if (flagType === 'string') {
      try {
        var obj = JSON.parse(ignoreFlag);
        var type = _typof(obj);
        if (type === 'array') {
          return _normalizeIgnoreFlag(obj);
        }
        _ignores.push(ignoreFlag);
      } catch (err) {
        var parts = ignoreFlag.split(/,\s*/);
        if (parts.length > 1) {
          _normalizeIgnoreFlag(parts);
        }
        else if (ignoreFlag) {
          _ignores.push(ignoreFlag);
        }
      }
    }
    else if (flagType === 'array') {
      for (var i = 0, l = ignoreFlag.length; i < l; i++) {
        _normalizeIgnoreFlag(ignoreFlag[i]);
      }
    }
    else if (flagType) {
      _ignores.push(ignoreFlag);
    }
  },

  // test if parent includes sub
  _pathInclude = function (parent, sub) {
    var rel = path.relative(parent, sub);
    return rel && !rel.indexOf('..') === 0 && !path.isAbsolute(rel);
  },

  _testIgnore = function (node, ignoreFlag) {
    var type = _typof(ignoreFlag);
    var relPath = path.relative(_root, node.path);
    switch (type) {
      case 'regexp':
        return ignoreFlag.test(relPath);
      case 'array': {
        for (var i = 0, l = ignoreFlag.length; i < l; i++) {
          if (_testIgnore(node, ignoreFlag[i])) {
            return true;
          }
        }
        return false;
      }
      default: {
        if (ignoreFlag[0] === '/') {
          return ignoreFlag.substr(1) === relPath;
        }
        else if (ignoreFlag.slice(-1) === '/') {
          return ignoreFlag.slice(0, -1) === node.name && node.type === 'directory';
          // return ignoreFlag.slice(0, -1) === ignoreFlag
          //   || _pathInclude(path.resolve(_root, ignoreFlag), relPath)
        }
        else {
          return node.name === ignoreFlag;
        }
      }
    }
  },

  _stringifyTreeNode =  function (node, last) {

    var children = node.children, lastChild,
      str = '';
      // allLast = function (i) {
      //  //// TODO
      //  var al = true;
      //  for (var j = 0; j <= i; j++) {
      //    !node.lasts[j] && (al = false);
      //  }
      //  return al;
      // };
    if (node.ignore) {
      return '';
    }
    if (node.type === 'symboliclink' && !_flags.link) {
      return '';
    }
    for (var i = 0; i < node.level - 1; i++) {
      str += (node.lasts[i] ? _marks.pre_blank : _marks.pre_vert);
    }
    if (last) {
      str += _marks.last_file;
    } else {
      str += _marks.pre_file;
    }
    str += (_flags.fullpath ? node.path : node.name);
    if (node.type !== 'file') {
      str += _marks['pre_' + node.type];
    }
    str += _marks.eol;
    if (!children) {
      return str;
    }
    for (var i = 0, l = children.length; i < l; i++) {
      // (i === l - 1) && (lastChild = true);
      var child = children[i];
      (child.lasts[child.level - 1] === true) && (lastChild = true);
      str += _stringifyTreeNode(child, lastChild);
    }
    return str;
  },

  stringifyTree = function (tree) {

    var root = tree.root,
      str = root.path + _marks.eol,
      children = root.children,
      last,
      all = _stats.all;

    for (var i = 0, l = children.length; i < l; i++) {
      (i === l - 1) && (last = true);
      var child = children[i];
      var isLast = child.lasts[child.level - 1] === true;
      str += _stringifyTreeNode(child, isLast);
    }
    return str;

  },

  run = function (flags, withCli) {
    return init(flags)
      .then(function () {
        var rootPath = path.resolve(_root, _flags.base);
        return genTree(rootPath);
      })
      .then(function () {
        _debug('generated tree:', JSON.stringify(_tree, null, 2));
        _report = stringifyTree(_tree) + _marks.eol;
        var totalIgnores = [];
        for (var i = 0, l = _types.length; i < l; i++) {
          var type = _types[i];
          if (_stats[type] && _stats[type].length) {
            _report += type + ': ' + _stats[type].length + ' ';
          }
          var ignores = _stats.ignore[type];
          if (ignores && ignores.length) {
            totalIgnores.push([ignores, type]);
          }
        }
        var ignoreReport = totalIgnores.length > 0
          ? totalIgnores.reduce((acc, [ignores, type]) => {
              return acc + type + ' (' + ignores.length + '), ';
            }, 'ignored: ')
          : '';
        _report = _report.slice(0, -1) + '\n\n';
        _report += ignoreReport ? ignoreReport.slice(0, -2) + '\n' : '';

        if (!_flags.noreport && withCli) {
          console.log('\n' + _output(_report) + '\n');
        }
        if (!_flags.o) {
          return
        }
        return fs.writeFileAsync(_flags.o, _report)
          .then(function () {
            if (!_flags.noreport && withCli) {
              console.log('Finish writing to file:',
                path.resolve(_root, _flags.o),
                '\n\n'
              );
            }
          })
          .catch(function (err) {
            _error(err);
            process.exit(-1);
          });
      })
      .then(function () {
        _spinnerOff();
      })
      .then(function () {
        return {
          data: _tree,
          report: _report
        };
      });
  };

  module.exports = run;
