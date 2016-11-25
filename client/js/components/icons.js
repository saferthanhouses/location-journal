import { $ } from '../utils/'
import state from '../store/state'

class Icons {
  constructor(state){
    // state
    this.state = state
    this.iconSet = new SVGMorpheus('#mode-icons');
    // state subscription
    // element cacheing
    this.$modeIconButton = $('#mode-icon-container')
    // method binding
    this.onClickHandler = this.onClickHandler.bind(this)
    this.userMode = this.userMode.bind(this)
    this.explorationMode = this.explorationMode.bind(this)
    // event listeners adding
    this.addEventListeners()
    // initial render
    state.subscribe('change_mode_to_user', this.userMode)
    state.subscribe('change_mode_to_exploration', this.explorationMode)
    this.update()
  }
  addEventListeners(){
    this.$modeIconButton.addEventListener('click', this.onClickHandler)
  }
  update(){
    if (state.userMode){
      this.userMode()
    } else {
      this.explorationMode()
    }
  }
  userMode(){
    this.iconSet.to('location-svg', {duration: 300, easing: 'cubic-in-out'})
  }
  explorationMode(){
    this.iconSet.to('accessibility-svg', {duration: 300, easing: 'cubic-in-out'})
  }
  onClickHandler(){
    if (state.userMode){
      state.update('change_mode', {mode: "exploration"})
    } else {
      state.update('change_mode', {mode: "user"})
    }
  }
}

export default Icons