export function sortLocations(locations, term, options){
  term = term.toLowerCase()
  if (term === 'date added' || term === 'timestamp'){
    return normalSortDesc(locations, 'timestamp')
  } else if (term==='distance'){
    locations.forEach( location => {
      let { location: { latitude, longitude}} = location
      location.distance = getDistanceFromLatLonInKm(latitude, longitude,
        options.latitude, options.longitude)
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

export function filterLocations(locations, val){
  let regexp = new RegExp(val, 'i')
  return locations.filter( location => {
    // console.log(location);
    return location.tags.some( elt => {
      return regexp.test(elt)
    })
  })
}


export const $ = document.querySelector.bind(document)