const hs = require('http-server')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const babelrc = require('babelrc-rollup')
const bluebird = require('bluebird')
const ncp = bluebird.promisify(require('ncp').ncp);
const cp = bluebird.promisify(require('cp'));
const chalk = require('chalk')
const watch = require('node-watch')
const mkdirp = bluebird.promisify(require('mkdirp'));
const rimraf = bluebird.promisify(require('rimraf'));
const fs = bluebird.promisifyAll(require('fs'));
const path = require('path')
const commonJs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')

function timeNow(){
  let time = new Date()
  return `${time.getHours()}:${time.getMinutes()}`
}


let cache;

function bundleJSDev(){
  console.log(chalk.green("bundling js ..."));
  return rollup.rollup({
    entry: 'client/js/index.js',
    plugins: [
      babel({
        exclude: 'node_modules/**'
      }),
      nodeResolve({
        jsnext: true,
        main: true
      }),
      commonJs({
        include: 'node_modules/**'
      })
    ],
    cache: cache
  })
  .then( function ( bundle ) {
    // Generate bundle + sourcemap
    return bundle.write({
      format: 'cjs',
      dest: './build/bundle.js'
    });
  })
  .then( ()=> {
    console.log(chalk.blue("bundled", timeNow()));
  })
  .catch( err => {
    console.log(chalk.red('error in build'))
    console.log(err)
  })
}

function buildStaticAssets(){
  console.log(chalk.green("building static assets"));
  var promises = [
    ncp('./client/assets', './build/assets'),
    cp('./client/favicon.ico', './build/favicon.ico'),
    // ncp('./bower_components/', './build/bower_components')
  ]
  return Promise.all(promises)
}

function buildHTML(){
  console.log(chalk.green("building html"));
  return cp('./client/index.html', './build/index.html')
}

function buildCss(){
  console.log(chalk.green("building css"));
  let readPromises = [
    fs.readFileAsync('./client/styles/reset.css', 'utf-8'), 
    fs.readFileAsync('./client/styles/style.css', 'utf-8'),
  ] 
  return Promise.all(readPromises)
    .then(styleFiles =>{
      return fs.writeFileAsync('./build/styles.css', styleFiles.join('\n'), 'utf-8')
    })
}

function cleanDir(){
  console.log(chalk.green("cleaning..."));
  return rimraf('./build')
    .then( () => mkdirp('./build'))
}

function startDevServer(){
  console.log(chalk.green("starting dev server"));
  return new Promise( (resolve, reject) => {
    hs.createServer({root: './build'}).listen(9000, function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  })
}
// start the dev-server

function copyModules(){
  console.log(chalk.green("copying modules"));
  return ncp('bower_components', './build/bower_components')
}

function startDevBuild(){
  return cleanDir()
    .then( ()=> {
      return Promise.all([buildHTML(), buildCss(), buildStaticAssets(), bundleJSDev(), copyModules()])
    })
    .then( () => {
      // why does node-watch not work for single files but fs.watch does?
      fs.watch('./client/index.html', function(){
        return buildHTML()
      })
      watch('client/js/', {recursive: true}, () =>{
        return Promise.all([buildHTML(), bundleJSDev()])
      })
      watch('client/styles', {recursive: true}, () => {
        return Promise.all([buildHTML(), buildCss()])
      })
      watch('bower_components', {recursive: true}, () => {
        return copyModules()
      })
    })
}


startDevBuild()
.then( startDevServer )
.then( () => {
  console.log(chalk.magenta("dev pipeline running"))
})
