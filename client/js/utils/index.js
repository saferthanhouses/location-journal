export function sortLocations(locations, term, options){
  term = term.toLowerCase()
  if (term === 'date added' || term === 'timestamp'){
    return normalSortDesc(locations, 'timestamp')
  } else if (term==='distance'){
    locations.forEach( location => {
      location.distance = getDistanceFromLatLonInKm(location.latitude, location.longitude,
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

export const $ = document.querySelector.bind(document)