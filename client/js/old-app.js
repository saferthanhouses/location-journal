const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

// refactor all app / UI methods into own files, modules - stop polluting the global namespace
// ways to do this - use a 
const openModalButton = $('button#add-location')
const locationModal = $('#location-modal')
const saveLocationButton = $('button#save-location')
const locationDescription = $('#modal-location-desc')
const locationNameContainer = $('#modal-location-name-container')
const locationName = $('#modal-location-name-input')
const closeModalButton = $('#modal-header-quit') 
const openLocationDrawer = $('button#view-location-drawer')
const openAccountDrawer = $('button#view-account-drawer')
const drawer = $('div#drawer')
const accountContainer = $('div#account-container')
const locationsContainer = $('div#locations-container')
const locationsListContainer = $('div#locations-list-container')
const iconSelector = $('div#icon-selector')
const loginButton = $('button#login-button')
const loginContainer = $('div#login-container')
const userContainer = $('div#user-container')
const deleteLocationModal = $('div#delete-location-modal')
const confirmDeleteButton = $('button#confirm-delete-button')
const cancelDeleteButton = $('button#cancel-delete-button')
const mapContainer = $('#leaflet-map-container')
const accessibliitySvg = $('#accessibility-svg')
const locationSvg = $('#location-svg')

// Setup Globals - TODO: no more globals
var map;
const db = new PouchDB('places-rev');
const provider = new firebase.auth.GoogleAuthProvider();
const fireDB = firebase.database();

// refactor
import TagsContainer from './tags.js'

const tagsContainer = new TagsContainer()

// Icons - move this - make dynamic
const icons = ["avocado.png", "default.png", "overflow.png", "squirrel-detective.png", "dino-stomp.gif", "pirate-flag.gif", "the-horns.png", "coconut.png", "cooper-stomp.gif", "bike.png"]

// Initial State
let state = {
  isInteractiveMode: false,
  currentLocation: null,
  drawer: {
    isOpen: false,
    view: 'locations'
  },
  locations: [],
  isLoggedIn: false,
  userMode: true,
  explorationMode: false,
  user: null,
  locationsRef: null,
  selectedLocation: null
}

// watch for FBase change
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("user logged in");
    state.isLoggedIn = true
    buildDrawerAccount()
    // syncLocationsOnSignin(user)
  } else {
    console.log("No user")
    state.isLoggedIn = false
    buildDrawerAccount()
  }
});

/*
i. first time user logs in
- Users logs in 
- when the auth state changes
- check 
ii. When the user returns to the app 
- when the auth state changes we make sure the db is synced
- 
*/

function syncLocationsOnSignin(user){
  if (state.dbRef) return;
  let { uid } = user;
  let dbRef = fireDB.ref(`locations/${uid}`)
  state.locationsRef = dbRef;
  dbRef.once('value', snapshot => {
    // if there are no locations
    let locations = snapshot.val()
    if (!locations){
      // forEach location, make 
      dbRef.set(state.locations)
    } 
    dbRef.push();
  })
}

// Login Button - requires FB auth 
loginButton.addEventListener('click', (evt) => {
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    console.log("user signed in");
    state.user = result.user;
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    console.log("error", error);
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
})

// Are we using LocationDescription?
// locationName.addEventListener('focus', function(){
//   // center the field more
//   console.log("focus!!!!");
//   locationDescription.style.display = "none"
// })

// locationName.addEventListener('blur', function(){
//   console.log("lost focus");
//   locationDescription.style.display = "flex"
// })

// add location to map methods
saveLocationButton.addEventListener('click', evt => {
  evt.stopPropagation()
  let desc = locationDescription.innerHTML;
  let name = locationName.value;
  state.currentLocation.description = desc;
  state.currentLocation.name = name;
  state.currentLocation.tags = tagsContainer.getCurrentTags()
  let currentLocation = {
    timestamp: state.currentLocation.timestamp,
    latitude: state.currentLocation.latitude,
    longitude: state.currentLocation.longitude,
    description: state.currentLocation.description,
    name: state.currentLocation.name,
    icon: state.currentLocation.icon.name,
    tags: state.currentLocation.tags
  }
  db.post(currentLocation)
    .then( response => {
      currentLocation._rev = response.rev;
      currentLocation._id = response.id
      console.log(currentLocation);
      state.locations.push(currentLocation)
      addMarkerToMap(currentLocation)
      tagsContainer.resetTags()
      closeModal() 
      buildDrawerLocations(state.locations)     
      console.log(state.locations);
    })
    .catch( err => {
      console.log("there was an error ...\n", err)
    })
})

openModalButton.addEventListener('click', evt => {
  navigator.geolocation
    .getCurrentPosition(openModal, errorPlaceFromGeo)
}) 

function toggleButtonShadow(evt){
  evt.target.classList.toggle('button-click-shadow')
}

function toggleButtonShadowAutomatic(evt){
  toggleButtonShadow(evt)
  setTimeout(toggleButtonShadow.bind(null, evt), 500)
}

closeModalButton.addEventListener('mousedown', toggleButtonShadow)
closeModalButton.addEventListener('mouseup', toggleButtonShadow)
closeModalButton.addEventListener('click', toggleButtonShadowAutomatic)

closeModalButton.addEventListener('click', closeModal)

locationDescription.addEventListener('focus', evt =>{
  evt.target.innerHTML = ""
})

locationName.addEventListener('input', evt => {
  if (evt.target.value === ""){
    saveLocationButton.disabled = true;
  } else {
    saveLocationButton.disabled = false;
  }
})

locationDescription.addEventListener('input', evt => {
  console.log("locationDesc input listener");
  if (evt.target.value === ""){
    evt.target.className = "placeholder-text"
  } else {
    evt.target.className = ""
  }
})

function resetModalValues(){
  locationName.value = ""
  locationDescription.innerHTML = "Location Description ..."
  locationDescription.className = 'placeholder-text'

}

function closeModalWindow(evt){
  let closest = evt.target.closest('#location-modal')
  if (evt.target === locationModal || closest){
    return
  } else {
    closeModal()
  }
  // if (evt.target !== addLocationModal && !closest && ){
  // }
}

function closeModal(){
  locationModal.classList.toggle('modal-closed')
  if (state.currentLocation.icon){
    state.currentLocation.icon.element.classList.toggle('selected-icon')
  }
  state.currentLocation = null;
  resetModalValues()
  window.removeEventListener('click', closeModalWindow)
}

// opens the modal 
function openModal(locationObj){
  // history.pushState({}, 'open modal', '/open-modal')
  let { timestamp, coords } = locationObj;
  let { latitude, longitude } = coords
  state.lastCurrentPosition = {latitude, longitude}
  state.currentLocation = { timestamp, latitude, longitude }
  locationModal.classList.toggle('modal-closed')
  window.addEventListener('click', closeModalWindow)
}

function errorPlaceFromGeo(){
  console.log("Beep Boop. Erorrz")
}

// map methods

function addMarkerToMap(markerObj){
  let { icon, latitude, longitude } = markerObj,
    options = {}; 

  if (icon){
    options.icon = L.icon({
      iconUrl: `assets/icons/${icon}`,
      // shadowUrl: icon.shadowUrl,
      iconSize:     [44, 52], // size of the icon
      shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   [17, 21], // point of the icon which will correspond to marker's location
      shadowAnchor: [4, 62],  // the same for the shadow
      popupAnchor:  [-3, -46] // point from which the popup should open relative to the iconAnchor
    })
  }

  markerObj.marker = L.marker([latitude, longitude], options)
    .addTo(map)
    .bindPopup(markerObj.name)
}

function removeMarkerFromMap(location){
  map.removeLayer(location.marker)
}

function startMap(locationObj){
  let { coords } = locationObj;
  let { latitude, longitude } = coords
  state.lastCurrentPosition = {latitude, longitude}
  map = L.map('leaflet-map-container', {dragging: false})
    .setView([latitude, longitude], 16)
  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiam9leW9saXZlciIsImEiOiJjaXJwcDViZ2kwZ3NjZmttNjE0azhiZGZnIn0.BVe9J_2_RAf6WO8DwVyNVQ', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  // show zoom control inactive and disable zoom
  map.zoomControl.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  addMapEventListeners() 
  var userMarker = L.userMarker([latitude, longitude], {pulsing: false, smallIcon:true});
  userMarker.addTo(map);
  db.allDocs({
    include_docs: true,
    attachements: true
  }).then(results => {
    // if (state.user){
    //   syncLocationsOnSignin(state.user)
    // }
    results.rows.forEach( row => {
      addMarkerToMap(row.doc)
      state.locations.push(row.doc)
    })
    state.locations = sortLocations(state.locations, 'timestamp')
    buildDrawerLocations(state.locations)
    renderIconSelector()
  })
}

function errorStartMap(){}

function addMapEventListeners(){
  let origin ={}

  function checkDistance(evt){
    let xDisp = origin.x - evt.clientX 
    let yDisp = origin.y - evt.clientY
    let hyp = Math.sqrt(Math.pow(xDisp, 2) + Math.pow(yDisp, 2))
    console.log("hyp", hyp);
    if (hyp > 100){
      switchToExplorationMode()
      mapContainer.removeEventListener('mousemove', checkDistance)
    }
  }
  mapContainer.addEventListener('mousedown', (evt)=>{
    origin.x = evt.clientX;
    origin.y = evt.clientY;
    if (state.userMode) {
      mapContainer.addEventListener('mousemove', checkDistance)
    }
  })

  mapContainer.addEventListener('mouseup', function(evt){
    mapContainer.removeEventListener('mousemove', checkDistance)
  })

  map.on('dblclick', dblClickExplorationHandler)

  function dblClickExplorationHandler(evt){
    if (!state.explorationMode) return;
    console.log("double clicked");
    let center = map.getCenter()
    let timestamp = new Date().getTime() / 1000
    let locationObj = {
      latitude: center.lat,
      longitude: center.long,
      timestamp
    }
    console.log(locationObj);
    openModal(locationObj)
    // openModal()

  }
  // $('body').on('drag', function(){
  //   console.log("drag");
  // })
}

function checkDrawerIsBuilt(view){
  console.log("view", view);
  if (view === state.drawer.view) {
    return
  } else {
    if (view === "account") {
      state.drawer.view = "account"
      showAccountDrawer()
    } else if (view==="locations") {
      state.drawer.view = "locations"
      showLocationsDrawer()
    } else {
      state.drawer.view = "locations"
      showLocationsDrawer()
    }
  }
}

var h = maquette.h;
var projector = maquette.createProjector();

function buildDrawerLocations(locations){
  // state.locations
  locationsListContainer.innerHTML = ""
  projector.append(locationsListContainer, renderLocations.bind(null, locations))
}

function renderLocations(locations){
  return h('div.list-container', [
    locations.map( (item, idx) => renderLocation(item, idx))
  ])
}


function onListLocationClick(location, evt){
  evt.stopPropagation()
  let idx = evt.target
  map.setView([location.latitude, location.longitude], 16)
  /*console.log("location", location);
  console.log("evt", evt);
  console.log("idx", idx);*/
  console.log("onListLocationClick")
}

function onEditLocationClick(idx){

}

function onDeleteLocationClick(idx, evt){
  evt.stopPropagation()
  state.selectedLocation = idx;
  closeDrawer()
  deleteLocationModal.className = "open-modal-delete"
}

confirmDeleteButton.addEventListener('click', evt =>{
  db.remove(state.locations[state.selectedLocation])
    .then( result => {
      var idx = state.selectedLocation
      removeMarkerFromMap(state.locations[idx])
      state.locations.splice(idx, 1)
      state.selectedLocation = null;
      deleteLocationModal.className = ""
      buildDrawerLocations(state.locations)
      // TODO: FB - update firebase here
    })
    .catch( err => {
      console.error(err)
    })
})

cancelDeleteButton.addEventListener('click', evt =>{
  state.selectedLocation = null;
  deleteLocationModal.className = ""
})

function renderLocation(location, idx){
  // console.log("location",location);
  let { icon, name, description, latitude, longitude, timestamp, tags } = location
  if (!tags){
    tags = ["to visit", "shop", "sex"];
  }
  if (!icon){
    icon = "default.png"
  }
  return h('div.location-list-item-container', {onclick: onListLocationClick.bind(null, location), "data-list-idx": idx}, [
    h('div', {class: "location-list-item mui-panel"}, [
      h('div', {class:"location-item-info"}, [
        h('div', {class: "list-item-top-row"}, [
          h('div', {class: "list-item-name"}, [
            h('p', name),
          ]),
          h('div', {class: "list-item-time"}, [
            h('p', parseDate(timestamp))
          ])
        ]),
        h('div', {class: "list-item-bottom-row"}, [
          h('img', { src:`assets/icons/${icon}`, alt:name, class: "list-item-icon" }),
          renderTags(tags)
        ])
      ]),
      h('div', {class:"location-item-options"}, [
        h('button', {class: "mui-btn mui-btn--raised location-item-options-edit-button", onclick: onEditLocationClick.bind(null, idx)}, [
          h('img', {src:"assets/svgs/edit_black.svg", class: "location-item-options-edit-img"})
        ]),
        h('button', {class: "mui-btn mui-btn--raised location-item-options-delete-button", onclick: onDeleteLocationClick.bind(null, idx)}, [
          h('img', {src: "assets/svgs/ic_close_black_48px.svg", class: "location-item-options-delete-img"})
        ])
      ])
    ])
  ])
}

function renderTags(tags){
  return h('div.tags-container', [
    tags.map( (item, idx) => renderTag(item, idx))
  ]) 
}

function renderTag(tag){
  return h('div', {class: "tag-item"}, [
    h('p', tag)
  ])
}

function parseDate(ts){
  let date = new Date(ts);
  return `${date.getDate()}/${date.getMonth() + 1}`
}

function renderIconSelector(){
  icons.forEach( iconName => {
    let iconButton = document.createElement('div')
    iconButton.className = "icon-button mui-btn"
    iconButton.style.backgroundImage = `url(assets/icons/${iconName})`
    iconSelector.appendChild(iconButton)
    iconButton.addEventListener('click', function(){
      if (state.currentLocation.icon){
        state.currentLocation.icon.element.classList.toggle('selected-icon')
      }
      state.currentLocation.icon = {
        name: iconName,
        element: iconButton
      }
      iconButton.classList.toggle('selected-icon')
    })
  })
}

function showLocationsDrawer(){
  accountContainer.style.display = "none";
  locationsContainer.style.display = "flex"
}

function showAccountDrawer(){
  accountContainer.style.display = "flex";
  locationsContainer.style.display = "none";
}

function buildDrawerAccount(){
  if (state.isLoggedIn){
    userContainer.style.display = "flex"
    loginContainer.style.display = "none"
  } else {
    userContainer.style.display = "none"
    loginContainer.style.display = "flex"
  }
}

function buildLoginPage(){
}

// open drawer

openLocationDrawer.addEventListener('click', toggleDrawer.bind(null, 'locations'))
openAccountDrawer.addEventListener('click', toggleDrawer.bind(null, 'account'))

function toggleDrawer(view, event){
  event.stopPropagation()
  checkDrawerIsBuilt(view)
  if (state.drawer.IsOpen){
    closeDrawer()
  } else {
    openDrawer(event)
  }
}

function openDrawer(){
  // open/close drawer and add/remove event listener
  drawer.classList.toggle('drawer-closed')
  window.addEventListener('click', checkClickDrawer)
  state.drawer.isOpen = true;
}

function closeDrawer(){
  drawer.classList.toggle('drawer-closed')
  window.removeEventListener('click', checkClickDrawer)
  state.drawer.isOpen = false;
}

function checkClickDrawer(windowEvent) {
  // did we click anywhere in the drawer
  let closest = windowEvent.target.closest('#drawer')
  if (windowEvent.target===drawer || closest) {
    return 
  } else {
    closeDrawer()
  }
}

/* */


/* Start tag search */

const tagSearchInput = $('#tag-search-input')
tagSearchInput.addEventListener('input', function(evt){
  let locations = filterLocations(evt.target.value)
  buildDrawerLocations(locations)
})

function filterLocations(val){
  let regexp = new RegExp(val, 'i')
  return state.locations.filter( location => {
    // console.log(location);
    return location.tags.some( elt => {
      return regexp.test(elt)
    })
  })
}

/* End tag search */


/* start Sort */
const sortLocationsSelect = $("#sort-locations-select")
sortLocationsSelect.addEventListener('change', function(evt){
  let term = evt.target.value;
  state.locations = sortLocations(state.locations, term)
  buildDrawerLocations(state.locations)
})

function sortLocations(locations, term){
  term = term.toLowerCase()
  if (term === 'date added' || term === 'timestamp'){
    return normalSortDesc(locations, 'timestamp')
  } else if (term==='distance'){
    locations.forEach( location => {
      location.distance = getDistanceFromLatLonInKm(location.latitude, location.longitude,
        state.lastCurrentPosition.latitude, state.lastCurrentPosition.longitude)
    })
    return normalSortDesc(locations, 'distance')
  } else if (term === 'icon') {
    return normalSortDesc(locations, 'icon')
  }else {
    return locations
  }
}

function normalSortDesc(list, val){
  return list.sort( (a, b)=>{
    if (a[val] < b[val]) return 1;
    else if (a[val] > b[val]) return -1
  })
}

function normalSortAsc(list, val){
  return list.sort( (a, b)=>{
    if (a[val] < b[val]) return -1;
    else if (a[val] > b[val]) return 1
  })
}

/* end sort */

/* mode icons */
const modeIconButton = $('#mode-icon-container')
modeIconButton.addEventListener('click', toggleModes)

var myIcons = new SVGMorpheus('#mode-icons');

/* Start Mode Functions */
function toggleModes(){
  if (state.userMode){
    switchToExplorationMode();
  } else {
    switchToUserMode();
  }
}

function switchToExplorationMode(){
  myIcons.to('accessibility-svg', {duration: 300, easing: 'cubic-in-out'})
  state.userMode = false
  state.explorationMode = true;
  map.zoomControl.enable();
  map.touchZoom.enable();
  // map.doubleClickZoom.enable();
  map.scrollWheelZoom.enable();
  map.boxZoom.enable();
  map.keyboard.enable();
  map.dragging.enable()
  map.setZoom(14, {animate: true})
  // accessibliitySvg.style.display = "block";
  // locationSvg.style.display = "none"
  
  //change to an emitted event
  searchLocationBar.style.display = "block"
}

function switchToUserMode(){
  myIcons.to('location-svg', {duration: 300, easing: 'cubic-in-out'})
  state.userMode = true
  state.explorationMode = false;
  map.zoomControl.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  map.dragging.disable()
  map.flyTo([state.lastCurrentPosition.latitude, state.lastCurrentPosition.longitude], 16, {animate: true})
  // map.setZoom(16, {animate: true})
  // accessibliitySvg.style.display = "none";
  // locationSvg.style.display = "block";
  searchLocationBar.style.display = "none"
}

/* End Mode Functions */

/* Start Seach Location Bar 
  TODO: make the search work
*/
const searchLocationBar = $('#search-location-bar')

/* End Search Location Bar */

/* Start Utils */

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

/* End Utils */



// sortLocations.addEventListener
// //  open account drawer 
// openAccountDrawer.addEventLister('click', toggleAccountDrawer)

// function toggleAccountDrawer(event){
//   event.stopPropagation()
//   checkDrawerIsBuilt('account')
//   if (state.drawer.IsOpen){
//     closeDrawer()
//   } else {
//     openDrawer(event)
//   }
// }

// kick it off
navigator.geolocation.getCurrentPosition(startMap, errorStartMap)

// Schema

  // let currentLocation = {
  //   timestamp: state.currentLocation.timestamp,
  //   latitude: state.currentLocation.latitude,
  //   longitude: state.currentLocation.longitude,
  //   description: state.currentLocation.description,
  //   name: state.currentLocation.name,
  //   icon: state.currentLocation.icon.name
  //   tags: [String]
  //   visitCount: 0
  // }


// Style Utilities

// roll your own ripple
// when a ripple button is clicked
// append a child div to it,
// https://codepen.io/Craigtut/pen/dIfzv

// const rippleButtons = $$('.ripple')
// rippleButtons.forEach( btn => {
//   btn.addEventListener('click', evt => {
//     const dimensions = btn.getBoundingClientRect()
//     console.log("evt", evt);
//     evt.preventDefault()
//     let $div = document.createElement('div'),
//       xPos = evt.pageX - dimensions.left,
//       yPos = evt.pageY - dimensions.top; 
//     $div.className = "ripple-effect"
//     console.log("$div", $div);
//     $div.style.height = dimensions.height;
//     $div.style.width = dimensions.height;
//     $div.style.top = yPos 
//     $div.style.left = xPos
//     $div.style.background = "blue"
//     btn.appendChild($div)
//   })
// })