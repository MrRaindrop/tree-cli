interface IFlags {

}

declare function runTree (flags: IFlags): void;

declare module "tree-cli" {
  export=runTree
}
