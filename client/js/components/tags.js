import { $ } from '../utils/'

class TagsContainer {
  constructor(){
    this.tagsContainerElt = $('#location-modal .tags-container')
    this.tagsInputElt = $('#tags-text-input')
    this.tagsFormElt = $('#tags-form')
    this.state = {
      currentTags: [],
      iconSelectorStyles: {}
    }
    this.tagsInputFocusListener = this.tagsInputFocusListener.bind(this)
    this.tagsInputBlurListener = this.tagsInputBlurListener.bind(this)
    this.tagsFormSubmitListener = this.tagsFormSubmitListener.bind(this)
    this.addEventListeners()
  }
  addEventListeners(){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      this.tagsInputElt.addEventListener('focus', this.tagsInputFocusListener)
      this.tagsInputElt.addEventListener('blur', this.tagsInputBlurListener)
    }
    this.tagsFormElt.addEventListener('submit', this.tagsFormSubmitListener)
  }
  tagsInputFocusListener(){
    console.log("this",this)
    iconSelector.style.height = 0;
    iconSelector.style.padding = "0px";
    iconSelector.style.opacity = "0";
  }
  tagsInputBlurListener(){
    // this.EE.emit('icon-selector', 'expand')
    // iconSelector.style.height = iconSelectorStyles.height;
    // iconSelector.style.padding = iconSelectorStyles.padding;
    // iconSelector.style.opacity = iconSelectorStyles.opacity;
  }
  tagsFormSubmitListener(evt){
    evt.preventDefault();
    let tag = this.tagsInputElt.value
    this.state.currentTags.push(tag);
    this.addTag(tag)
    evt.target.blur()
    this.tagsInputElt.value = ""
  }
  addTag(tag){
    let newTag = document.createElement('div')
    newTag.classList = "tag-item"
    newTag.innerHTML = tag;
    this.tagsContainerElt.appendChild(newTag)
  }
  getCurrentTags(){
    return this.state.currentTags;
  }
  resetTags(){
    this.tagsContainerElt.innerHTML = ""
    this.currentTags = []
  }
}

export default TagsContainer