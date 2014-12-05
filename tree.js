/**
 * 
 * //////////////////////////////////
 * 
 * usage: use it in node cmd - node tree
 * 
 */

var fs = require('fs'),
	util = require('util'),
	os = require('os'),
	prompt = require('prompt'),

	// use \ on windows and / on linux/unix/mac.
	pathSeparator,
	// use suffix on directory name to distingish from other files.
	dirSuffix = '/',

	DEFAULT_LEVEL = 1,
	DEFAULT_INDENTATION = 2,

	// init configure. pass from prompt arguments or parameter of run.
	opts,

	_readArgs = function(cb) {
		var promptSchema = {
			properties: {
				path: {
					description: 'path of the target directory',
					require: true
				},
				out: {
					description: 'path of the output txt file',
					require: true
				},
				level: {
					description: 'maximum recursion depth: (default: 1)',
					pattern: /^[1-9][0-9]*$/,
					require: true
				},
				indentation: {
					description: 'indentation: (integer number, default: 2)',
					pattern: /^[1-9][0-9]*$/,
					require: true
				},
				isVerbose: {
					description: 'Show results in console? N[Y]',
					pattern: /^(y|n)$/i,
					require: true
				}
			}
		};
		prompt.start();
		prompt.get(promptSchema, function(err, res) {
			if (err) {
				console.log(err);
			} else {
				opts = {
					path: res.path,
					out: res.out,
					level: ~~res.level || DEFAULT_LEVEL,
					indentation: ~~res.indentation || DEFAULT_INDENTATION,
					isVerbose: (res.isVerbose === 'y' || res.isVerbose === 'Y')
				};

				fs.readdir(res.path, function(err, files) {
					if (err) {
						console.log('[error]:invalid path: ', res.path);
						_readArgs(cb);
					} else {
						cb(_output);
					}
				});

			}
		});
	},

	_run = function(config) {
		if(/win/.test(os.platform().toLowerCase())) {
			pathSeparator = '\\';
		} else {
			pathSeparator = '\/';
		};

		if (!config) _readArgs(_readDir);

		else {
			opts = config;
			if (!opts.path && opts.data) {
				dirSuffix = '';
				_readObj(_output);
			} else {
				// validate the directory by trying to read it.
				fs.readdir(opts.path, function(err, files) {
					if (err) {
						throw new Error('invalid path: ', res.path, err); alert(1);
					} else {
						_readDir(_output);
					}
				});
			}
		}
	},

	_readDir = function(cb) {

		var i, l, j, m, file, cnt = 0,
			dirQueue = [], nextDirQueue = [],
			lvl = 1, maxLvl, dir = {}, root, rootName, idx;

			readNextDir = function(path, parent, cb) {

				fs.readdir(path, function(err, files) {

					var p = path + pathSeparator,
						stats;

					cnt++;

					if (err) {
						console.log('[error]invalid path: ', path);
						return;
					}

					for (i = 0, l = files.length; i < l; i++) {
						file = files[i];

						// if (/^\$/.test(file)) {
						// 	continue;
						// }

						try {
							stats = fs.statSync(p + file);
						} catch (e) {
							console.log(e);
							continue;
						}
						
						if (stats.isDirectory()) {
							if (lvl !== maxLvl) {
								parent[file] = {};
								nextDirQueue.push({ name: file, path: p + file, parent: parent[file] });
							} else {
								parent[file] = '/';
							}
						} else {
							parent[file] = '';
						}
					}

					// when finished scanning all the files and directories in dirQueue.
					if (cnt === dirQueue.length) {
						if (lvl === maxLvl || nextDirQueue.length === 0) {
							return cb(dir, opts);
						} else {
							lvl++;
							cnt = 0;
							dirQueue = nextDirQueue.slice();
							nextDirQueue = [];
							for (j = 0, m = dirQueue.length; j < m; j++) {
								readNextDir(dirQueue[j].path, dirQueue[j].parent, cb);
							}
						}
					}

				});
			};

		if (opts.path) {
			opts.path = path.resolve(__dirname, opts.path);
		} else {
			opts.path = __dirname;
		}
		if (opts.path[opts.path.length - 1] === pathSeparator) {
			rootName = opts.path.substring(0, opts.path.length - 1);
		} else {
			rootName = opts.path;
			opts.path += pathSeparator;
		}
		idx = rootName.lastIndexOf(pathSeparator);
		if (~idx) {
			rootName = rootName.substr(idx + 1);
		}
		root = dir[rootName] = {};
		maxLvl = opts.level;

		dirQueue.push({ name: opts.path, path: opts.path });
		readNextDir(opts.path, root, cb);

	},

	_readObj = function(cb) {
		var dir = opts.data;
		opts.level = ~~opts.level || DEFAULT_LEVEL;
		opts.indentation = ~~opts.indentation || DEFAULT_INDENTATION;
		cb(dir);
	},

	_getKeys = function(dir) {
		var keys = [];
		for (var k in dir) {
			if (dir.hasOwnProperty(k)) {
				keys.push(k);
			}
		}
		return keys;
	},

	_getKeysLength = function(dir) {
		var cnt = 0;
		for (var k in dir) {
			if (dir.hasOwnProperty(k)) {
				cnt++;
			}
		}
		return cnt;
	},
	
	_output = function(dir) {
		console.log('dir', dir);
		var str = '',
			roots = [],
			o = opts.out || 'tree_cli_output.txt';
			draw = function(parent, prefix) {
				var lk = _getLastKey(parent),
					tb = '', tl = '',
					line,
					lineA = '├',
					lineB = '└',
					pref = prefix;
				for (var i = 0; i < opts.indentation; i++) {
					tb += ' ';
					tl += '─';
				}
				lineA = tb + lineA + tl + '';
				lineB = tb + lineB + tl + '';
				for (var k in parent) {
					if (parent.hasOwnProperty(k)) {
						if (lk === k) {
							line = lineB;
						} else {
							line = lineA;
						}
						str += pref + line + k +
							// if parent[k] has childs, append dirSuffix to it's name.
							(parent[k] !== '' ? dirSuffix : '') +
							os.EOL;
						if (typeof parent[k] === 'object' && lk === k) {
							draw(parent[k], pref + new Array(opts.indentation + 1).join(' ') + '  ');
						} else if (typeof parent[k] === 'object') {
							draw(parent[k], pref + new Array(opts.indentation + 1).join(' ') + '│');
						}
					}
				}
			};
		for (var k in dir) {
			if (dir.hasOwnProperty(k)) {
				roots.push(k);
			}
		}
		for (var i = 0, l = roots.length; i < l; i++) {
			str += new Array(opts.indentation + 1).join('─') + roots[i] + os.EOL;
			draw(dir[roots[i]], '');
		}
		if (opts.isVerbose) {
			console.log('tree-cli output_tree:\n' + str);
		}
		fs.writeFile(o, str, function(err) {
			if (err) throw err;
			console.log('dir tree has been saved to ' + o);
		});
	};

module.exports = {

	run: _run

};
