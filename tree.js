/**
 * 
 * //////////////////////////////////
 * 
 * usage: use it in node cmd - node tree
 * cmd line arguments:
 * --path/-p: root path.
 * --out/-o: output file.
 * --recursive/-r: recursive.
 * --verbose/-v: output result to cli.
 * 
 * //////////////////////////////////
 * 
 * or use run api:
 * pass config object to method run:
 * path: root path.
 * data: if not passing path, data obj must be passed.
 * isVerbose: output result to cli.
 * isRecursive: show directory recursively or not.
 * level: how deep the recursion goes.
 * out: output file path.
 * 
 */

var fs = require('fs'),
	util = require('util'),
	os = require('os'),

	// use \ on windows and / on linux/unix/mac.
	pathSeparator,
	// use suffix on directory name to distingish from other files.
	dirSuffix = '/',

	DEFAULT_LEVEL = 20,
	// init configure. pass from cli arguments or parameter of run.
	opts,

	_readArgs = function(arguments, cb) {
		var keys = [
				'--path',
				'-p',
				'--out',
				'-o',
				'--recursive',
				'-r',
				'--level',
				'-l',
				'--verbose',
				'-v'
			],
			args = {}, tmp, k;
		if (!arguments || !arguments.length) return;
		for (var i = 0, l = arguments.length; i < l; i++) {
			tmp = arguments[i].split('=');
			if (!~keys.indexOf((k = tmp[0]))) {
				throw new Error('cmd arguments error with ' + k);
			}
			args[k.replace(/[-]+/, '')] = tmp[1];
		}
		opts = {
			path: args.path || args.p,
			out: args.out || args.o,
			isRecursive: args.hasOwnProperty('r') || args.hasOwnProperty('--recursive'),
			level: parseInt(args.level || args.l),
			isVerbose: args.hasOwnProperty('v') || args.hasOwnProperty('--verbose')
		};
		// new RegExp('\\' + pathSeparator + '$').test(opts.path) &&
		// 	(opts.path = opts.path.substring(0, opts.path.length - 1));
		cb(_output);
	},

	_run = function() {
		if(/win/.test(os.platform().toLowerCase())) {
			pathSeparator = '\\';
		} else {
			pathSeparator = '\/';
		}; 
		if (!opts) _readArgs(process.argv.slice(2), _readDir);
		else {
			if (!opts.path && opts.data) {
				dirSuffix = '';
				_readObj(_output);
			} else {
				_readDir(_output);
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
						console.log(err);
						throw new Error('read dir error.');
					}

					for (i = 0, l = files.length; i < l; i++) {
						file = files[i];
						if (/^\$/.test(file)) {
							continue;
						}
						stats = fs.statSync(p + file);
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
		if (!opts.path) {
			throw new Error('path must be configured.');
		}
		if (opts.path[opts.length - 1] === pathSeparator) {
			rootName = substring(0, opts.length - 1);
		} else {
			rootName = opts.path;
		}
		idx = rootName.lastIndexOf(pathSeparator);
		if (~idx) {
			rootName = rootName.substr(idx + 1);
		}
		root = dir[rootName] = {};
		if (opts.isRecursive) {
			maxLvl = opts.level || DEFAULT_LEVEL;
		} else {
			maxLvl = 1;
		}
		dirQueue.push({ name: opts.path, path: opts.path });
		readNextDir(opts.path, root, cb);

	},

	_readObj = function(cb) {
		var dir = opts.data;
		cb(dir);
	},

	_getLastKey = function(dir) {
		var lastKey = null;
		for (var k in dir) {
			if (dir.hasOwnProperty(k)) {
				lastKey = k;
			}
		}
		return lastKey;
	},
	
	_output = function(dir) {
		var str = '',
			roots = [],
			o = opts.out || 'tree_cli_output.txt';
			draw = function(parent, prefix) {
				var lk = _getLastKey(parent),
					pref = prefix;
				for (var k in parent) {
					if (parent.hasOwnProperty(k)) {
						str += pref + '  |--' + k +
							// if parent[k] has childs, append dirSuffix to it's name.
							(parent[k] !== '' ? dirSuffix : '') +
							os.EOL;
						if (typeof parent[k] === 'object' && lk === k) {
							draw(parent[k], pref + '   ');
						} else if (typeof parent[k] === 'object') {
							draw(parent[k], pref + '  |');
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
			str += '--' + roots[i] + os.EOL;
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
