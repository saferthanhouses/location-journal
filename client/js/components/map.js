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
    this.dblClickExplorationHandler = this.dblClickExplorationHandler.bind(this)
    this.addLocation = this.addLocation.bind(this)
    this.removeLocation = this.removeLocation.bind(this)
    this.switchToUserMode = this.switchToUserMode.bind(this)
    this.switchToExplorationMode = this.switchToExplorationMode.bind(this)
    this.setMapView = this.setMapView.bind(this)
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
    state.subscribe('remove_location', this.removeLocation)
    state.subscribe('change_mode_to_user', this.switchToUserMode)
    state.subscribe('change_mode_to_exploration', this.switchToExplorationMode)
    state.subscribe('set_map_view', this.setMapView)
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

    this.map.on('dblclick', this.dblClickExplorationHandler)

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
   dblClickExplorationHandler(evt){
    if (!this.state.explorationMode) return;
    console.log("double clicked");
    let center = this.map.getCenter()
    let timestamp = new Date().getTime() / 1000
    let locationObj = {
      latitude: center.lat,
      longitude: center.long,
      timestamp
    }
    console.log(locationObj);

    // dispatch & open from state
    openModal(locationObj)
    // openModal()

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
        popupAnchor:  [-3, -46] // point from which the popup should open relative to the iconAnchor
      })
    }

    location.marker = L.marker([latitude, longitude], options)
      .addTo(this.map)
      .bindPopup(name)
    
    this.icons .push(location.marker)
  }
  removeLocation({location}){
    map.removeLayer(location.marker)
  }
  setMapView({zoom, location}){
    this.map.setView([location.latitude, location.longitude], zoom)
  }
}

export default Map