import state from '../store/state'
import LocationMap from './map'
import LocationModal from './locationModal'
import BottomNav from './bottomNav'
import AppWindow from './window'
import Drawer from './drawer'
// import IconSelector from './iconSelector'
import Icons from './icons'
import DB from '../models/db'

class App {
  constructor(state){
    this.state = state
    this.init()
    this.setupDB()
  }
  setupDB(){
    this.db = new DB()
  }
  init(){
    this.appWindow = new AppWindow()
    this.map = new LocationMap(this.state, '#leaflet-map-container')
    this.icons = new Icons(this.state)
    this.locationModal = new LocationModal(this.state, 'div#location-modal')
    this.drawer = new Drawer(this.state, 'div#drawer')
    this.bottomNav = new BottomNav()
    // this.drawer = new Drawer('', state)
    // this.iconSelector = new IconSelector('', state)
  }
}

export default App
