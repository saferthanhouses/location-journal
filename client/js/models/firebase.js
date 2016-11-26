import state from '../store/state'

class FirebaseModel {
  constructor(){
    this.login = this.login.bind(this)
    this.addStateListeners()
    this.provider = new firebase.auth.GoogleAuthProvider();
    this.fireDB = firebase.database();
  }
  addStateListeners(){
    state.subscribe('start_login', this.login)
  }
  login(){
    firebase.auth().signInWithPopup(this.provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    console.log("user signed in");
    state.user = result.user;
    state.update('login', {user:result.user})
  }).catch(function(error) {
    console.log("error", error);
    state.update('login_error', error)
  });
  }
}

export default FirebaseModel