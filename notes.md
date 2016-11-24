Reason to use a build process:

Modules
- in order to avoid polluting the global namespace we should package our code into modules.
- there is no built-in javascript module system but we can gain one by using a bundler like browserify or webpack
- if we use webpack we can also use transpilation / language plugins
- We are already using es6 class syntax - which does not have good browser support. We also want to be able to use the import / export syntax which requires transpilation. 
- If we use webpack we have to deal with all webpack's bundling complexity. 

Using native html vs. react/ prect
- Not having to use a framework to create elements - decorating existing elements with functionality.
- How much of an overhead do we get from using polymer ?



- Added a build pipeline using rollup for modules (this doesn't seem to wrap our code properly though - still have globals?)

- Explorator features: attempted to implement own state management & rendering pattern using events



- Notes on new vanilla js - rendering / data set
