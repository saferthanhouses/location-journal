import { $ } from '../utils'
import state from '../store/state'

class DeleteModal {
  constructor(){
    this.$modal = $('div#delete-location-modal')
    this.$deleteButton = $('button#confirm-delete-button')
    this.$cancelButton = $('button#cancel-delete-button')
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.delete = this.delete.bind(this)
    this.addStateListeners()
    this.addEventListeners()
  }
  addStateListeners(){
    state.subscribe('open_delete_location', this.open)
  }
  addEventListeners(){
    this.$cancelButton.addEventListener('click', this.close)
    this.$deleteButton.addEventListener('click', this.delete)
  }
  open(){
    this.$modal.className = "open-modal-delete"
  }
  delete(evt){
    evt.stopPropagation()
    this.close()
    state.update('delete_location')
  }
  close(){
    this.$modal.className = ""
  }
}

export default DeleteModal