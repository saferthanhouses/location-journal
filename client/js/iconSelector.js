import LocationIcon from '../LocationIcon/'

class IconSelector {
  constructor(){
    this.iconSelectorContainerElt = $('div#icon-selector')
    this.state.style = {}
  }
  collapse(){
    this.state.style = {
      height: this.iconSelectorContainerElt.style.height;
      padding: this.iconSelectorContainerElt.style.padding;
      opacity: this.iconSelectorContainerElt.style.opacity;
    }
    this.iconSelectorContainerElt.style.height = 0;
    this.iconSelectorContainerElt.style.padding = 0;
    this.iconSelectorContainerElt.style.opacity = 0;
  },
  expand(){
    this.iconSelectorContainerElt.style.height = this.state.style.height;
    this.iconSelectorContainerElt.style.padding = this.state.style.padding;
    this.iconSelectorContainerElt.style.opacity = this.state.style.opacity;
    this.state.style = {}
  }
  renderIcons(icons){
    icons.forEach( iconName => {
      new LocationIcon(iconName)
      let iconButton = document.createElement('div')
      iconButton.className = "icon-button mui-btn"
      iconButton.style.backgroundImage = `url(assets/icons/${iconName})`
      this.iconSelectorContainerElt.appendChild(iconButton)
      iconButton.addEventListener('click', function(){
        if (state.currentLocation.icon){
          state.currentLocation.icon.element.classList.toggle('selected-icon')
        }
        state.currentLocation.icon = {
          name: iconName,
          element: iconButton
        }
        iconButton.classList.toggle('selected-icon')
      })
    })
  }
}

const iconSelector = new IconSelector()