
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
  let { latitude, longitude } = coords;
  return {latitude, longitude}
}

export function extractLatLngAndTime({coords, timestamp}){
  return {
    location: extractLatLng({coords}),
    timestamp
  }
}
