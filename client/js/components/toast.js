import { $ } from '../utils'
import state from '../store/state'

class Toast {
  constructor(){
    this.$toast = $('#toast')
    this.$message = $('#toast p')
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    state.subscribe('toast_open', this.open)
    state.subscribe('toast_close', this.close)
  }
  open({message}){
    this.$message.innerHTML = message
    this.$toast.className = "toast-open"
  }
  close(){
    this.$message.innerHTML = ""
    this.$toast.className = ""
  }
}

export default Toast