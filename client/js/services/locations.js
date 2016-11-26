import state from '../store/state'

export function getCurrentPosition(){
  return new Promise((resolve, reject) => {
    state.update('updating_location')
    navigator.geolocation.getCurrentPosition( location => {
      state.update('location_updated')
      resolve(location)
    }, err => {
      reject(err)
    })
  })
}

export function extractLatLng({coords}){
  console.log("coords", coords);
  let { latitude, longitude, accuracy } = coords;
  return {latitude, longitude, accuracy}
}

export function extractLatLngAndTime({coords, timestamp}){
  return {
    location: extractLatLng({coords}),
    timestamp
  }
}
