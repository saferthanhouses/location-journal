const $ = document.querySelector.bind(document)

import state from '../store/state'


let tileLayerUrl = 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiam9leW9saXZlciIsImEiOiJjaXJwcDViZ2kwZ3NjZmttNjE0azhiZGZnIn0.BVe9J_2_RAf6WO8DwVyNVQ'
let tileLayerAttr = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'


// query string,
// {hasLocation: boolean, 
//  latitude: Lat, 
//  longitude: Long}
class Map {
  constructor(state, selector){
    // cache dom
    this.$mapContainer = $(selector)
    // pass in state
    this.state = state;
    this.icons = []
    // bind methods
    this.openLocationModalExploration = this.openLocationModalExploration.bind(this)
    this.addLocation = this.addLocation.bind(this)
    this.removeLocation = this.removeLocation.bind(this)
    this.switchToUserMode = this.switchToUserMode.bind(this)
    this.switchToExplorationMode = this.switchToExplorationMode.bind(this)
    this.setMapView = this.setMapView.bind(this)
    this.requestOpenLocationModal = this.requestOpenLocationModal.bind(this)
    this.createPopup = this.createPopup.bind(this)
    this.createTitle = this.createTitle.bind(this)
    this.createDescription = this.createDescription.bind(this)
    // suscribe to state
    this.addStateListeners()
    // kick off rendering
    this.init()
    // create DOM event listeners (after map has been created)
    this.addDOMListeners()
  }
  get lat (){
    return this.state.currentLocation.latitude
  }
  get long (){
    return this.state.currentLocation.longitude
  }
  init(){
    this.createMap();
    this.updateMode()
  }
  createMap(){
    let { currentLocation: { latitude, longitude}} = this.state
    this.map = L.map('leaflet-map-container')
      .setView([latitude, longitude], 16)
    L.tileLayer(tileLayerUrl, {
      attribution: tileLayerAttr
    }).addTo(this.map);
    var userMarker = L.userMarker([latitude, longitude], {smallIcon:true});
    userMarker.addTo(this.map);
  }
  addStateListeners(){
    state.subscribe('add_location', this.addLocation)
    state.subscribe('location_removed', this.removeLocation)
    state.subscribe('change_mode_to_user', this.switchToUserMode)
    state.subscribe('change_mode_to_exploration', this.switchToExplorationMode)
    state.subscribe('set_map_view', this.setMapView)
    state.subscribe('request_open_location_modal', this.requestOpenLocationModal)
  }
  requestOpenLocationModal(){
    console.log("requestOpenLocationModal");
    if (this.state.userMode){
      state.update('open_location_modal')
    } else {
      this.openLocationModalExploration()
    }
  }
  updateMode(){
    if (this.state.userMode){
      this.switchToUserMode()
    } else {
      this.switchToExplorationMode()
    }
  }
  addDOMListeners(){
    // this.origin = {}
    // this.$mapContainer.addEventListener('mousedown', (evt)=>{
    //   this.origin.x = evt.clientX;
    //   this.origin.y = evt.clientY;
    //   let checkDistance = this.checkDistance.bind(this)
    //   if (this.state.userMode) {
    //     this.$mapContainer.addEventListener('mousemove', checkDistance)
    //   }
    // })

    // this.$mapContainer.addEventListener('mouseup', (evt)=>{
    //   this.$mapContainer.removeEventListener('mousemove', checkDistance)
    // })

    this.map.on('dblclick', this.openLocationModalExploration)

  }
  checkDistance(evt){
    let xDisp = this.origin.x - evt.clientX 
    let yDisp = this.origin.y - evt.clientY
    let hyp = Math.sqrt(Math.pow(xDisp, 2) + Math.pow(yDisp, 2))
    if (hyp > 100){
      state.update('change_mode', {mode: "exploration"})
      this.$mapContainer.removeEventListener('mousemove', this.checkDistance)
    }
  }
   openLocationModalExploration(evt){
    if (!this.state.explorationMode) return;
    let center = this.map.getCenter()
    let locationObj = {
      latitude: center.lat,
      longitude: center.lng,
    }
    state.update('open_location_modal', {location: locationObj})
  }
  disableAllZoom(){
    this.map.zoomControl.disable();
    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
  }
  switchToUserMode(){
    // won't happen here anymore
    // searchLocationBar.style.display = "none"
    this.map.zoomControl.disable();
    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
    this.map.dragging.disable()

    console.log("this.state.currentLocation", this.state.currentLocation);

    // let's subscribe to updates to the store so that we don't have to manually 
    // pass in every needed thing everytime we want to update the ui
    this.map.flyTo([this.lat, this.long], 16, {animate: true}) 
  }
  switchToExplorationMode(){
    this.map.zoomControl.enable();
    this.map.touchZoom.enable();
    // this.map.doubleClickZoom.enable();
    this.map.scrollWheelZoom.enable();
    this.map.boxZoom.enable();
    this.map.keyboard.enable();
    this.map.dragging.enable()
    this.map.setZoom(14, {animate: true})
  }
  addLocation({ location }){
    let { icon, name, location: {latitude, longitude }} = location,
      options = {}; 

    if (icon){
      options.icon = L.icon({
        iconUrl: `assets/icons/${icon}`,
        // shadowUrl: icon.shadowUrl,
        iconSize:     [44, 52], // size of the icon
        shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [17, 21], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [0, -24] // point from which the popup should open relative to the iconAnchor
      })
    }

    let popupMarkdown = this.createPopup(location)

    let marker = L.marker([latitude, longitude], options)
      .addTo(this.map)
      .bindPopup(popupMarkdown)
      
    // console.log("location.marker", marker);
    this.icons.push(marker)
  }
  createPopup(location){
    let popup = 
      `${this.createTitle(location.name)}
       ${this.createDescription(location.description)}
      `
    return popup
  }
  createDescription(description){
    if (description){
      return `<p>${description}</p>`
    } else {
      return ''
    }
  }
  createTitle(name){
    if (name){
      return `<h4 class="popup-title">${name}</h4>`
    } else {
      return ""
    }
  }
  removeLocation(){
    console.log("remove location");
    let idx = this.state.selectedLocation,
      icon = this.icons[idx]
    try {
      this.map.removeLayer(icon)
    } catch (err){
      console.error(err)
    }
  }
  setMapView({zoom, location}){
    this.map.setView([location.latitude, location.longitude], zoom)
  }
}

export default Map