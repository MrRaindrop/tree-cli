namespace Tree {
  interface IFlags {
    // --debug
    // show debug info.
    debug: boolean;
    base: string;
    indent: number;
    // --ignore
    // ignores specified directory/files
    ignore: Array<string>;
    // --fullpath
    // prints the full path prefix for each file.
    fullpath: boolean;
    // --link
    // follows symbolic links if they point to directories, as if
    // they were directories. Symbolic links that will result in
    // recursion are avoided when detected.
    link: boolean;
    // --noreport
    // omits printing of the file and directory report at the end of
    // the tree listing and omits printing the tree on console.
    noreport: boolean;
    // -l
    // max display depth of the directory tree.
    l: number;
    o: string;
    // -f
    // append a '/' for directories, a '=' for socket files
    // and a '|' for FIFOs
    f: boolean;
    // list directories only.
    d: boolean;
    // list directories first.
    directoryFirst: boolean;
  }

  interface ITreeRoot {
    root: ITreeNode;
  }

  interface IResult {
    data: ITreeRoot,
    report: string;
  }

  interface ITreeNode {
    type: 'directory' | 'file' | string;
    level: number;
    name: string;
    path: string;
    children: Array<ITreeNode>
  }
}

declare function runTree (flags: Partial<Tree.IFlags>): Promise<Tree.IResult>;

declare module "tree-cli" {
  export = runTree
}
