// import LocationIcon from '../LocationIcon/'
import { icons } from '../services/icons'
import { $ } from '../utils/'

class IconSelector {
  constructor(state){
    this.$iconSelector = $('div#icon-selector')
    this.state = state
    this.icons = icons
    this.style = {}
    this.toggleIcon = this.toggleIcon.bind(this)
    this.createIconButton = this.createIconButton.bind(this)
    this.renderIcons()
    this.selectedIcon = null;
  }
  getSelectedIcon(){
    return this.selectedIcon.dataset.icon
  }
  reset(){
    if (this.selectedIcon){
      this.selectedIcon.classList.toggle('selected-icon')
      this.selectedIcon = null
    }
  }
  collapse(){
    this.style = {
      height: this.$iconSelector.style.height,
      padding: this.$iconSelector.style.padding,
      opacity: this.$iconSelector.style.opacity,
    }
    this.$iconSelector.style.height = 0;
    this.$iconSelector.style.padding = 0;
    this.$iconSelector.style.opacity = 0;
  }
  expand(){
    this.$iconSelector.style.height = this.style.height;
    this.$iconSelector.style.padding = this.style.padding;
    this.$iconSelector.style.opacity = this.style.opacity;
    this.style = {}
  }
  createIconButton(iconName){
    let iconButton = document.createElement('div')
    iconButton.className = "icon-button mui-btn"
    iconButton.style.backgroundImage = `url(assets/icons/${iconName})`
    this.$iconSelector.appendChild(iconButton)
    iconButton.addEventListener('click', this.toggleIcon)
    iconButton.dataset.icon = iconName
    return iconButton    
  }
  toggleIcon(evt){
    if (this.selectedIcon){
      this.selectedIcon.classList.toggle('selected-icon')
    }
    this.selectedIcon = evt.target
    evt.target.classList.toggle('selected-icon')
  }
  renderIcons(icons){
    this.icons.map( this.createIconButton )
  }
}


export default IconSelector