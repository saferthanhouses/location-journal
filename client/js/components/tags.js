import { $ } from '../utils/'
import state from '../store/state'

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
    state.emit('icon_selector_close')
  }
  tagsInputBlurListener(){
    state.emit('icon_selector_expand')
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
    this.state.currentTags = []
  }
}

export default TagsContainer