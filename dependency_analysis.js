const dependencyTree = require("dependency-tree");

const tree = dependencyTree({
  filename: "./lib/cdk-workshop-stack.ts",
  directory: ".",
});

console.log(tree);
