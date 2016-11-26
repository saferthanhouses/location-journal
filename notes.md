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
...

v.0.1
- service worker semver for add to homescreen
- firebase functionality 

Issues

Bugs
- all places given the same tags
- add default icon / disable button without icon
- if map in user mode and user has clicked on a item in the drawer the map will be in the wrong place < --- when a user clicks on a drawer item the map should go to exploration mode
- double click on account button bug (seemms to switch the functionality of clicking the window and clicking the account button)

UI Functionality
- more emojis / icons <--- ask nick
- different kinds (serious, funny, gif, silly)
- some sort of ripple effect from target crosshairs on modal opening
- add error messaging for db / geolocation
- move description back into location input
- change tags to look more taggy
- change map maybe?
- google analytics
- change size of emojis at different zoom levels

Offline functionality
- service worker based on versioning
- saving/cacheing map tiles for offline

Geolocation Functionality
- show toast for 'get user location', 'outdated location please update' etc
- this can take a while on mobile, so is necessary

Development Functionality
- do something about geolocation indecision (!!!)
- better error reporting - module that catches and sends errors to db
- modularisation
- seed script?

Longer Term
account 
- username
- sharing locations 
- sharing groups of locations / maps / making maps public
- search public locations by tag


Icons
icons are currently low resolution pngs
want to increase the number of emojis:
  - allow users to add new emojis ...?
  - copy slack?
encode emojis as datauris? - too big? don't do multiple requests for 'em
