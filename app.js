const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const openModalButton = $('button#add-location')
const addLocationModal = $('#add-location-modal')
const addLocationButton = $('#add-location')
const saveLocationButton = $('button#save-location')
const locationDescription = $('#modal-location-desc')
var map


const db = new PouchDB('places-rev');

let state = {
  currentLocation: null
}

function addPlaceFromGeo(locationObj){
  let { timestamp, coords } = locationObj;
  let { latitude, longitude } = coords
  state.currentLocation = { timestamp, latitude, longitude }
  addLocationModal.classList.toggle('modal-closed')
}

function errorPlaceFromGeo(){
  console.log("Beep Boop. Erorrz")
}

saveLocationButton.addEventListener('click', evt => {
  let desc = locationDescription.innerHTML
  state.currentLocation.description = desc;
  db.post(state.currentLocation)
    .then( response => {
      addLocationModal.classList.toggle('modal-closed')
      addMarkerToMap(state.currentLocation)
      state.currentLocation = null;
    })
    .catch( err => {
      console.log("there was an error ...\n", err)
    })
})

openModalButton.addEventListener('click', evt => {
  // evt.stopPropagation()
  navigator.geolocation
    .getCurrentPosition(addPlaceFromGeo, errorPlaceFromGeo)
}) 

function addMarkerToMap(markerObj){
  console.log("markerObj", markerObj);
  L.marker([markerObj.latitude, markerObj.longitude])
    .addTo(map)
    .bindPopup(markerObj.description)
    .openPopup()
}

function startMap(locationObj){
  let { coords } = locationObj;
  let { latitude, longitude } = coords
  map = L.map('leaflet-map-container')
    .setView([latitude, longitude], 13)
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  db.allDocs({
    include_docs: true,
    attachements: true
  }).then(results => {
    results.rows.forEach( row => {
      addMarkerToMap(row.doc)
    })
  })
}

function errorStartMap(){}

navigator.geolocation.getCurrentPosition(startMap, errorStartMap)