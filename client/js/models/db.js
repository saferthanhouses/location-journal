
import state from '../store/state'

// import this locally
PouchDB = PouchDB

const db = new PouchDB('places-rev');

// model layer, wrapper, will all return promises?
// db layer (doing the actual db interactions - the pouch db library pretty much takes care of all of this
// and state mapping layer - reflecting changes in the db in the app state.


class LocationsModel {
  constructor(initialState){
    this.state = initialState
    this.saveLocation = this.saveLocation.bind(this)
    this.startStateListeners()
    this.loadLocations()
  }
  startStateListeners(){
    state.subscribe('save_location', this.saveLocation)
  }
  loadLocations(){
    return db.allDocs({
      include_docs: true,
      attachements: true
    }).then(results => { 
      let locations = results.rows.map( row => row.doc )
      state.update('load_locations', {locations: locations})
    })
  } 
  saveLocation({location}){
    db.post(location)
      .then( response => {
        location._rev = response.rev
        location._id = response .id
        // console.log("location saved", location);
        state.update('location_saved', { location })
      })
      .catch( err => {
        console.error(err)
        state.update('create_location_error', err)
      })
  }
}

export default LocationsModel