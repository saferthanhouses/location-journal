// const tagsInput = $('#tags-text-input')
// const tagsForm = $('#tags-form')
// const tagsContainer = $('#location-modal .tags-container')

// let iconSelectorStyles = {}

// let currentTags = []

// tagsInput.addEventListener('focus', function(){
//   iconSelectorStyles.height = iconSelector.style.height
//   iconSelectorStyles.padding = iconSelector.style.padding
//   iconSelectorStyles.opacity = iconSelector.style.opacity;
//   iconSelector.style.height = 0;
//   iconSelector.style.padding = "0px";
//   iconSelector.style.opacity = "0";
// })

// tagsInput.addEventListener('blur', function(){
//   iconSelector.style.height = iconSelectorStyles.height;
//   iconSelector.style.padding = iconSelectorStyles.padding;
//   iconSelector.style.opacity = iconSelectorStyles.opacity;
// })

// tagsForm.addEventListener('submit', function(evt){
//   evt.preventDefault();
//   let tag = tagsInput.value
//   currentTags.push(tag);
//   addTag(tag)
//   evt.target.blur()
//   tagsInput.value = ""
// })

// function addTag(tag){
//   let newTag = document.createElement('div')
//   newTag.classList = "tag-item"
//   newTag.innerHTML = tag;
//   tagsContainer.appendChild(newTag)
// }

class TagsContainer {
  constructor(){
    this.tagsContainerElt = $('#location-modal .tags-container')
    this.tagsInputElt = $('#tags-text-input')
    this.tagsFormElt = $('#tags-form')
    this.state = {
      currentTags: [],
      iconSelectorStyles: {}
    }
    this.tagsInputFocusListener.bind(this)
    this.tagsInputBlurListener.bind(this)
    this.tagsFormSubmitListener.bind(this)
    this.addEventListeners()
    this.eventEmitter = new EE()
  },
  addEventListeners(){
    this.tagsInputElt.addEventListener('focus', tagsInputFocusListener)
    this.tagsInputElt.addEventListener('blur', tagsInputBlurListener)
    this.tagsFormElt.addEventListener('submit', tagsFormSubmitListener)
  },
  tagsInputFocusListener(){
    this.iconSelectorRef.shrink();
    iconSelector.style.height = 0;
    iconSelector.style.padding = "0px";
    iconSelector.style.opacity = "0";
  },
  tagsInputBlurListener(){
    this.EE.emit('icon-selector', 'expand')
    // iconSelector.style.height = iconSelectorStyles.height;
    // iconSelector.style.padding = iconSelectorStyles.padding;
    // iconSelector.style.opacity = iconSelectorStyles.opacity;
  },
  tagsFormSubmitListener(evt){
    evt.preventDefault();
    let tag = tagsInputElt.value
    this.state.currentTags.push(tag);
    this.addTag(tag)
    evt.target.blur()
    tagsInputElt.value = ""
  },
  addTag(){
    let newTag = document.createElement('div')
    newTag.classList = "tag-item"
    newTag.innerHTML = tag;
    this.tagsContainerElt.appendChild(newTag)
  }
}

const tagsContainer = new TagsContainer()