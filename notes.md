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

Todo Sun 20/11 - 
Create a bundle / build pipeline so that we can use import / export and for a module system
Stage 1) Bundle with rollup and babel inputs