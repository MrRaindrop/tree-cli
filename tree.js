/**
 * usage: node tree
 * cmd line arguments:
 * --path/-p : root path.
 * --out/-o: output file.
 * -r: recursive
 * 
 */

var fs = require('fs'),
	util = require('util'),
	os = require('os'),

	pathSeparator;

	DEFAULT_LEVEL = 20,

	_readArgs = function(arguments, cb) {
		var keys = [
				'--path',
				'-p',
				'--out',
				'-o',
				'-r',
				'--level',
				'-l'
			],
			args = {}, tmp, k, opts;
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
			isRecursive: args.hasOwnProperty('r'),
			level: parseInt(args.level || args.l)	
		};
		// new RegExp('\\' + pathSeparator + '$').test(opts.path) &&
		// 	(opts.path = opts.path.substring(0, opts.path.length - 1));
		cb(opts, _output);
	},

	_run = function(opts) {
		if(/win/.test(os.platform().toLowerCase())) {
			pathSeparator = '\\';
		} else {
			pathSeparator = '\/';
		}; 
		if (!opts) _readArgs(process.argv.slice(2), _readDir);
		else {
			_readDir(opts, _output);
		}
	},

	_readDir = function(opts, cb) {

		var i, l, j, m, file, cnt = 0,
			dirQueue = [], nextDirQueue = [],
			lvl = 1, maxLvl, dir = {}, root;

			readNextDir = function(path, parent, cb) {

				console.log('read next dir -- parent: ', path, parent);

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
								nextDirQueue.push({ name: file, path: p + file });
								parent[file] = {};
								// console.log('parent[file]:', file);
								// console.log('parent:', parent);
							} else {
								parent[file] = 0;
							}
						} else {
							// console.log(path + file + ' is file');
							parent[file] = 1;
						}
					}

					// when finished scanning all the files and directories in dirQueue.
					if (cnt === dirQueue.length) {
						if (lvl === maxLvl || nextDirQueue.length === 0) {
							return cb(dir, opts.out);
						} else {
							lvl++;
							cnt = 0;
							dirQueue = nextDirQueue.slice();
							nextDirQueue = [];
							for (j = 0, m = dirQueue.length; j < m; j++) {
								// console.log('parent name:', dirQueue[j].name);
								// console.log(dirQueue[j]);
								console.log('parent-----', dirQueue[j].name, parent[dirQueue[j].name]);
								readNextDir(dirQueue[j].path, parent[dirQueue[j].name], cb);
							}
						}
					}

				});
			};

		if (!opts.path) {
			throw new Error('path must be configured.');
		}
		root = dir[opts.path.slice(opts.path.lastIndexOf(pathSeparator))] = {};
		if (opts.isRecursive) {
			maxLvl = opts.level || DEFAULT_LEVEL;
		} else {
			maxLvl = 1;
		}
		dirQueue.push({ name: opts.path, path: opts.path });
		readNextDir(opts.path, root, cb);

	},
	
	_output = function(dir, out) {
		console.log('_output:');
		if (out) {
			console.log(dir, out);
		} else {
			console.log(dir);
		}
	};

// _run();

// test 
_run({
	path: 'D:\\',
	isRecursive: true,
	level: 2
});

module.exports = {

	run: _run,

};
