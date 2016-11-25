
export function getCurrentPosition(){
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition( location => {
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
