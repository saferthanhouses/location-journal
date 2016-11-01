const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const openModalButton = $('button#add-location')
const addLocationModal = $('#add-location-modal')
const addLocationButton = $('#add-location')
const saveLocationButton = $('button#save-location')
const locationDescription = $('#modal-location-desc')
const openLocationDrawer = $('button#view-location-drawer')
const openAccountDrawer = $('button#view-account-drawer')
const drawer = $('div#drawer')

var map;

const db = new PouchDB('places-rev');

let state = {
  isInteractiveMode: false,
  currentLocation: null,
  drawer: {
    isOpen: false,
    view: null
  },
  locations: []
}

// add location to map methods

saveLocationButton.addEventListener('click', evt => {
  evt.stopPropagation()
  let desc = locationDescription.innerHTML
  state.currentLocation.description = desc;
  let currentLocation = {
    timestamp: state.currentLocation.timestamp,
    latitude: state.currentLocation.latitude,
    longitude: state.currentLocation.longitude,
    description: state.currentLocation.description
  }
  db.post(currentLocation)
    .then( response => {
      state.locations.push(currentLocation)
      addMarkerToMap(currentLocation)
      closeModal()      
    })
    .catch( err => {
      console.log("there was an error ...\n", err)
    })
})

openModalButton.addEventListener('click', evt => {
  navigator.geolocation
    .getCurrentPosition(openModal, errorPlaceFromGeo)
}) 

function closeModalWindow(evt){
  let closest = evt.target.closest('#add-location-modal')
  if (evt.target === addLocationModal || closest){
    return
  } else {
    closeModal()
  }
  // if (evt.target !== addLocationModal && !closest && ){
  // }
}

function closeModal(){
  console.log("closeModal");
  addLocationModal.classList.toggle('modal-closed')
  state.currentLocation = null;
  window.removeEventListener('click', closeModalWindow)
}

// opens the modal 
function openModal(locationObj){
  let { timestamp, coords } = locationObj;
  let { latitude, longitude } = coords
  state.currentLocation = { timestamp, latitude, longitude }
  addLocationModal.classList.toggle('modal-closed')
  window.addEventListener('click', closeModalWindow)
}

function errorPlaceFromGeo(){
  console.log("Beep Boop. Erorrz")
}

// map methods

function addMarkerToMap(markerObj){
  console.log("markerObj", markerObj);
  L.marker([markerObj.latitude, markerObj.longitude])
    .addTo(map)
    .bindPopup(markerObj.description)
    // .openPopup()
}

function startMap(locationObj){
  let { coords } = locationObj;
  let { latitude, longitude } = coords
  map = L.map('leaflet-map-container')
    .setView([latitude, longitude], 18)
  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiam9leW9saXZlciIsImEiOiJjaXJwcDViZ2kwZ3NjZmttNjE0azhiZGZnIn0.BVe9J_2_RAf6WO8DwVyNVQ', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  var userMarker = L.userMarker([latitude, longitude], {pulsing: true, smallIcon:true});
  userMarker.addTo(map);
  db.allDocs({
    include_docs: true,
    attachements: true
  }).then(results => {
    results.rows.forEach( row => {
      state.locations.push(row.doc)
      addMarkerToMap(row.doc)
    })
  })
}

function errorStartMap(){}

// drawer rendering

function checkDrawerIsBuilt(view){
  console.log("view", view);
  if (view === state.drawer.view) {
    return
  } else {
    if (view === "account") {
      console.log("account");
      state.drawer.view = "account"
      buildDrawerAccount()
    } else if (view==="locations") {
      state.drawer.view = "locations"
      buildDrawerLocations()
    } else {
      state.drawer.view = "locations"
      buildDrawerLocations()
    }
  }
}

function buildDrawerLocations(){
  drawer.innerHTML = "Locations View"
}

function buildDrawerAccount(){
  drawer.innerHTML = "Account"
}

// open drawer

openLocationDrawer.addEventListener('click', toggleDrawer.bind(null, 'location'))
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