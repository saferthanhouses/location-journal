import state from './store/state'
import App from './components/app'
import { getCurrentPosition, extractLatLng } from './services/locations'

getCurrentPosition().then( extractLatLng ).then( location => { 
  state.currentLocation = location
  new App(state)
})
// new App()
