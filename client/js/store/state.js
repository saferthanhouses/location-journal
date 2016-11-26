// redux like - lite store?
// state container that uses event emitters

import { sortLocations, filterLocations, getTimestamp } from '../utils/'
import { getCurrentPosition, 
          extractLatLng,
          extractLatLngAndTime } from '../services/locations'
// create a store with an initial state that will take store dispatches
// and then update components that have subscribed to this store

// let state = {}
let initialState = {
  isInteractiveMode: false,
  hasLocation: false,
  currentLocation: null,
  drawer: {
    isOpening: false,
    isOpen: false,
    view: 'locations'
  },
  locationModal: {
    // is in the process of opening - getting geolocation data etc
    isOpening: false,
    isOpen: false
  },
  sortTerm: "timestamp",
  locations: [],
  isLoggedIn: false,
  userMode: true,
  explorationMode: false,
  currentMode: "user",
  user: null,
  locationsRef: null,
  selectedLocation: null
}

let state = initialState;

let listeners = {}

state.subscribe = function(event, func){
  if (typeof func !== 'function'){
    console.error("subscribe must be passed a function")
  }
  console.log("new subscription - event:", event);
  if (!listeners[event]) {
    listeners[event] = [func]
  } else {
    listeners[event].push(func)
  }
}

state.emit = function(event, payload){
  try {
    listeners[event].forEach( fn => {
      fn(payload)
    })
  } catch (err){
    console.log(`error in emitting event ${event} to listeners - ${err}`);
    console.log("no event listeners for event", event)
  }
}

// update is basically a reducer (triggers other actions too)
// signals to the state that a data update has occurred. State
// can then manage the outcomes.
// Semantic way of differentiating updates (state updates)
// with emits (component updates)?
state.update = function(event, payload){
  console.log("event", event, "payload", payload);
  switch (event){
    case "load_locations":
      return loadLocations(payload)
    case "change_mode":
      return changeMode(payload)
    case "request_open_location_modal":
      return requestOpenLocationModal()
    case "open_location_modal":
      return openLocationModal(payload)
    case "close_location_modal":
      return closeLocationModal()
    case "start_save_location":
      return saveLocation(payload)
    case "location_saved":
      return locationSaved(payload)
    case "open_locations_drawer":
      return openLocationsDrawer()
    case "request_open_account_drawer":
      return requestOpenAccountDrawer()
    case "drawer_open":
      return drawerOpen(payload)
    case "close_drawer":
      return closeDrawer()
    case "drawer_closed":
      return drawerClosed()
    case "set_map_view":
      return setMapView(payload)
    case "sort_change":
      return sortChange(payload)
    case "filter_locations":
      return filterLocs(payload)
    case "open_delete_location":
      return openDelete(payload)
    case "delete_location":
      return deleteLocation()
    case "location_deleted":
      return locationDeleted()
    case "start_login":
      return startLogin()
    case "login":
      return login(payload)
    case "updating_location":
      return updateLocation()
    case "location_updated":
      return locationUpdated()
    case "icon_selector_close":
      return iconSelectorClose()
    case "icon_selector_expand":
      return iconSelectorExpand()
  }
}

function iconSelectorExpand(){
  state.emit('icon_selector_close')
}

function iconSelectorClose(){
  state.emit('icon_selector_close')
}

function updateLocation(){
  state.emit('toast_open', {message: "One second while we get your location"})
}

function locationUpdated(){
  state.emit('toast_close')
}

function login({user}){
  state.user = user
  state.isLoggedIn = true
  state.emit('login')
}

function startLogin(){
  state.emit('start_login')
}

function locationDeleted(){
  state.locations.splice(state.selectedLocation, 1)
  state.all_locations = state.locations.slice()
  state.emit('build_locations')
  state.emit('location_removed')
  state.selectedLocation = null
}

function deleteLocation(){
  state.emit('delete_location')
}

function openDelete({idx}){
  state.selectedLocation = idx
  state.emit('close_drawer')
  state.emit('open_delete_location')
}

function filterLocs({filter}){
  state.locations = filterLocations(state.all_locations, filter)
  state.emit('build_locations')
}

function sortChange({term}){
  state.locations = sortLocations(state.locations, term, state.currentLocation);
  state.emit('build_locations')
}

function setMapView(payload){
  state.emit('set_map_view', payload)
}

function drawerClosed(){
  state.drawer.isOpen = false;
  state.emit('drawer_closed')
}

function closeDrawer(){
  if (!state.drawer.isOpen) return
  state.emit('close_drawer')
}

function drawerOpen({view}){
  state.drawer.isOpen = true;
  state.drawer.isOpening = false;
  state.drawer.view = view
  state.emit('drawer_open')
}

function openLocationsDrawer(){
  if (state.drawer.isOpen || state.drawer.isOpening) return
  state.drawer.isOpening = true;
  state.emit('open_locations_drawer')
}

function requestOpenAccountDrawer(){
  if (state.drawer.isOpening) return
  if (state.drawer.isOpen && state.drawer.view === 'account') return
  else if (!state.drawer.isOpen){
    state.drawer.isOpening = true;
    state.emit('open_account_drawer')
  } else if (state.drawer.isOpen && state.drawer.view === "locations"){
    // state.drawer.isOpening = true;
    state.emit('close_drawer_to_change', {view: 'account'})
  }
  // state.emit('request_open_account_drawer')
}

function locationSaved({location}){
  state.locations.push(location)
  state.all_locations.push(location)
  // state.locations = sortLocations( state.locations, state.sortTerm )
  state.emit('add_location', { location })
  state.emit('build_locations')
  closeLocationModal()
}

function saveLocation({ data }){
  let { location, timestamp } = state.locationModal
  let { icon, name, tags } = data
  let locationObj = {
    location,
    timestamp,
    icon,
    name,
    tags
  }
  state.emit('save_location', {location: locationObj})
}

function requestOpenLocationModal(){
  state.emit('request_open_location_modal')
}

function openLocationModal(locationObj){
  if (state.locationModal.isOpen || state.locationModal.isOpening ) return
  state.emit('close_drawer')
  state.locationModal.isOpening = true;
  let locationPromise
  // locaiton obj only passed in when map triggered in exploration mode
  if (locationObj){
    let timestamp = getTimestamp()
    let location = locationObj.location 
    locationPromise = Promise.resolve({location, timestamp})
  } else {
    locationPromise = getCurrentPosition().then( extractLatLngAndTime )
    // only update the location if this is user mode
    // state.currentLocation = location
  }
  locationPromise
    .then( ({location, timestamp }) => {
      if (state.userMode) state.currentLocation = location
      console.log("location", location, "timestamp", timestamp);
      state.locationModal.location = location
      state.locationModal.timestamp = timestamp
      state.locationModal.isOpening = false;
      state.locationModal.isOpen = true;
      state.emit('open_location_modal')
    })  
}

function closeLocationModal(){
  state.locationModal.currentLocation = null;
  state.locationModal.timestamp = null;
  state.locationModal.isOpen = false;
  state.emit('close_location_modal')
}

function loadLocations(payload){
  state.all_locations = payload.locations.slice()
  state.locations = sortLocations( payload.locations, state.sortTerm )
  state.locations.forEach( location => {
    state.emit('add_location', { location })
    // listeners["add_location"].forEach(fn => fn({location: location}))
  })
  state.emit('build_locations', {locations: state.locations})
  // listeners["load_locations"].forEach(fn => fn())
}

function changeMode(payload){
  if (payload.mode === "exploration") {
    state.userMode = false
    state.explorationMode = true
    state.currentMode = "exploration"
    state.emit('change_mode_to_exploration')
    // state.emit('change_mode_to_user')
  } else {
    getCurrentPosition()
      .then( extractLatLng )
      .then( location => {
        state.currentLocation = location
        state.userMode = true
        state.explorationMode = false
        state.currentMode = "user"
        // state.emit('change_mode_to_exploration')
        state.emit('change_mode_to_user')
        //   currentMode: "user",
      })
      .catch( err => {
        console.error("problem getting user position", err)
      })
  }
}

export default state
