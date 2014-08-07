treejs
======

a js tool to listing files and directories in local file system running on node.

usage
----------

use it in node cmd - ``node tree``

cmd line arguments:

	``--path``/``-p`` : root path.
	``--out``/``-o``: output file.
	``-r``: recursive

api
----------

* run

	arguments:
	``path``: root path.
	``data``: if not passing path, data obj must be passed.
	``isRecursive``: show directory recursively or not.
	``level``: how deep the recursion goes.
	``out``: output file path.

