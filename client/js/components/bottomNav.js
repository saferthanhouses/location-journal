import { $ } from '../utils/'
import state from '../store/state'

class BottomNav {
  constructor(){
    // cache dom elements
    this.$openModalButton = $('button#add-location')
    this.$openLocationDrawer = $('button#view-location-drawer')
    this.$openAccountDrawer = $('button#view-account-drawer')
    
    // bind callbacks 
    this.openModalClickHandler = this.openModalClickHandler.bind(this)
    this.openLocationsClickHandler = this.openLocationsClickHandler.bind(this)
    this.openAccountClickHandler = this.openAccountClickHandler.bind(this)
    
    // add event listeners
    this.addEventListeners()
  }
  addEventListeners(){
    this.$openModalButton.addEventListener('click', this.openModalClickHandler)
    this.$openLocationDrawer.addEventListener('click', this.openLocationsClickHandler)
    this.$openAccountDrawer.addEventListener('click', this.openAccountClickHandler)
  }
  openModalClickHandler(evt){
    evt.stopPropagation()
    state.update('request_open_location_modal')
  }
  openLocationsClickHandler(evt){
    evt.stopPropagation()
    state.update('open_locations_drawer')
  }
  openAccountClickHandler(evt){
    evt.stopPropagation()
    state.update('request_open_account_drawer')
  }
}

export default BottomNav