import { $ } from '../utils/'
import state from '../store/state'

class AppWindow{
  constructor(){
    this.$body = $('body')
    this.$locationModal = $('div#location-modal')
    this.openLocationModal = this.openLocationModal.bind(this)
    this.closeLocationModal = this.closeLocationModal.bind(this)
    this.checkClickModal = this.checkClickModal.bind(this)
    this.drawerOpen = this.drawerOpen.bind(this)
    this.drawerClosed = this.drawerClosed.bind(this)
    this.checkClickDrawer = this.checkClickDrawer.bind(this)

    this.addStateListeners()
  }
  addStateListeners(){
    state.subscribe('open_location_modal', this.openLocationModal)
    state.subscribe('close_location_modal', this.closeLocationModal)
    state.subscribe('drawer_open', this.drawerOpen)
    state.subscribe('drawer_closed', this.drawerClosed)
  }
  drawerOpen(){
    console.log("drawerOpen adding event hanlder?");
    this.$body.addEventListener('click', this.checkClickDrawer)
  }
  drawerClosed(){
    console.log("removing event handler");
    this.$body.removeEventListener('click', this.checkClickDrawer)
  }
  openLocationModal(){
    this.$body.addEventListener('click', this.checkClickModal)
  }
  closeLocationModal(){
    this.$body.removeEventListener('click', this.checkClickModal)
  }
  checkClickModal(evt){
    let closest = evt.target.closest('#location-modal')
    if (evt.target === this.$locationModal || closest){
      return
    } else {
      state.update('close_location_modal')
    }
  }
  checkClickDrawer(evt) {
    console.log("check click drawer");
    // did we click anywhere in the drawer
    let closest = evt.target.closest('#drawer')
    if (evt.target===drawer || closest) {
      return 
    } else {
      state.update('close_drawer')
    }
  }
}

export default AppWindow
