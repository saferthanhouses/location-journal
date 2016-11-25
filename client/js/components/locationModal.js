import TagsContainer from './tags.js'
import { $ } from '../utils/'
import state from '../store/state'
import IconSelector from './iconSelector'

class locationModal {
  constructor(state, selector){
    this.$modal = $(selector)
    this.$name = $('#modal-location-name-input')
    this.$saveButton = $('button#save-location')
    this.$closeButton = $('#modal-header-quit')
    this.$coords = $('#location-coords-input')
    this.state = state
    this.iconSelector = new IconSelector()
    this.tagsContainer = new TagsContainer()

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.nameInputValidation = this.nameInputValidation.bind(this)
    this.updateCloseModal = this.updateCloseModal.bind(this)
    this.save = this.save.bind(this)
    this.parseCoords = this.parseCoords.bind(this)

    this.addStateListeners()
    this.addEventListeners()
  }
  addStateListeners(){
    state.subscribe('open_location_modal', this.open)
    state.subscribe('close_location_modal', this.close)
  }
  addEventListeners(){
    this.$name.addEventListener('input', this.nameInputValidation)
    this.$closeButton.addEventListener('click', this.updateCloseModal)
    this.$saveButton.addEventListener('click', this.save)
  }
  parseCoords(coords){
    let {latitude, longitude} = coords
    return `${latitude}, ${longitude}`
  }
  open(){
    console.log("this.$coords", this.coords);
    if (this.state.explorationMode){
      let loc = this.state.locationModal.location
      this.$coords.value = this.parseCoords(loc)
    } else {
      this.$coords.value = "current location"
    }
    this.$modal.classList.toggle('modal-closed')
  }
  close(){
    this.$name.value = ""
    this.$coords.value = ""
    this.iconSelector.reset()
    this.tagsContainer.resetTags()
    this.$modal.classList.toggle('modal-closed')
  }
  nameInputValidation(evt){
    if (evt.target.value === ""){
      this.$saveButton.disabled = true;
    } else {
      this.$saveButton.disabled = false;
    }
  }
  save(){
    let data = {
      name: this.$name.value,
      tags: this.tagsContainer.getCurrentTags(),
      icon: this.iconSelector.getSelectedIcon()
    } 
    state.update('start_save_location', {data})
  }
  updateCloseModal(){
    state.update('close_location_modal')
  }
}

export default locationModal