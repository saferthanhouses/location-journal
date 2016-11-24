import state from '../store/state'
import { $ } from '../utils/'

import h from 'virtual-dom/h'
import diff from 'virtual-dom/diff'
import patch from 'virtual-dom/patch'
import createElement from 'virtual-dom/create-element'

// DRAWER listens for changes on these 

// on state.locations
// on state.drawer.isOpen 
// on state.drawer.view 
// on state.isLoggedIn

// on first render, render the locations that are found in the passed in state?
// update
class Drawer {
  constructor(state, selector){
    // dom cache
    this.$drawer = $(selector)
    this.$accountContainer = $('div#account-container')
    this.$locationsContainer = $('div#locations-container')
    this.$locationsListContainer = $('div#locations-list-container')
    this.$sortLocations = $("#sort-locations-select")
    this.$tagSearch = $("#tag-search-input")
    // bind methods
    this.buildLocations = this.buildLocations.bind(this)
    this.renderLocations = this.renderLocations.bind(this)
    this.renderLocation = this.renderLocation.bind(this)
    this.openLocationsDrawer = this.openLocationsDrawer.bind(this)
    this.onListLocationClick = this.onListLocationClick.bind(this)
    this.onEditLocationClick = this.onEditLocationClick.bind(this)
    this.onDeleteLocationClick = this.onDeleteLocationClick.bind(this)
    this.closeDrawer = this.closeDrawer.bind(this)
    this.sort = this.sort.bind(this)
    this.filter = this.filter.bind(this)
    // pass in state
    this.state = state
    // setup state event listeners
    this.addStateListeners()
    this.addEventListeners()
    // render cycle
    this.init()
  }
  init(){
    // create a vdom of the locations
    this.htree = this.renderLocations()
    // render
    this.hroot = createElement(this.htree)
    // append to the dom
    this.$locationsListContainer.appendChild(this.hroot)
  }
  addEventListeners(){
    this.$sortLocations.addEventListener('change', this.sort)
    this.$tagSearch.addEventListener('input', this.filter)
  }
  filter(evt){
    state.update('filter_locations', {filter: evt.target.value})
  }
  sort(evt){
    let term = evt.target.value;
    state.update('sort_change', { term })
  }
  buildLocations(){
    let newTree = this.renderLocations()
    let patches = diff(this.htree, newTree)
    this.hroot = patch(this.hroot, patches)
    this.htree = newTree
  }
  renderLocations(){
    return h('div.list-container', [
      this.state.locations.map( (item, idx) => this.renderLocation(item, idx))
    ])
  }
  renderLocation(location, idx){
    // console.log("location",location);
    let { icon, name, description, latitude, longitude, timestamp, tags } = location
    if (!tags){
      tags = ["to visit", "shop", "sex"];
    }
    if (!icon){
      icon = "default.png"
    }
    return h('div.location-list-item-container', {onclick: this.onListLocationClick.bind(null, location), "data-list-idx": idx}, [
      h('div.location-list-item.mui-panel', [
        h('div.location-item-info', [
          h('div.list-item-top-row', [
            h('div.list-item-name', [
              h('p', name),
            ]),
            h('div.list-item-time', [
              h('p', parseDate(timestamp))
            ])
          ]),
          h('div.list-item-bottom-row', [
            h('img.list-item-icon', { src:`assets/icons/${icon}`, alt:name}),
            renderTags(tags)
          ])
        ]),
        h('div.location-item-options', [
          h('button.mui-btn.mui-btn--raised.location-item-options-edit-button', {onclick: this.onEditLocationClick.bind(null, idx)}, [
            h('img.location-item-options-edit-img', {src:"assets/svgs/edit_black.svg"})
          ]),
          h('button.mui-btn.mui-btn--raised.location-item-options-delete-button', {onclick: this.onDeleteLocationClick.bind(null, idx)}, [
            h('img.location-item-options-delete-img', {src: "assets/svgs/ic_close_black_48px.svg"})
          ])
        ])
      ])
    ])
  }
  onListLocationClick({location}, evt){
    evt.stopPropagation()
    state.update('set_map_view', { location, zoom: 16})
  }
  onEditLocationClick(){

  }
  onDeleteLocationClick(){

  }
  addStateListeners(){
    // state.subscribe('load_locations', this.buildLocations)
    state.subscribe('build_locations', this.buildLocations)
    state.subscribe('open_locations_drawer', this.openLocationsDrawer)
    // state.subscribe('build_locations_filtered', this.filterLocations)
    state.subscribe('close_drawer', this.closeDrawer)
  }
  closeDrawer(){
    if (!this.state.drawer.isOpen) return
    this.$drawer.classList.toggle('drawer-closed')
    state.update('drawer_closed')
  }
  openLocationsDrawer(){
    console.log("openLocationsDrawer");
    this.showLocationsDrawer()
    this.$drawer.classList.toggle('drawer-closed')
    state.update('drawer_open')
  }
  checkDrawerIsBuilt(view){
    if (view === this.state.drawer.view) {
      return
    } else {
      if (view === "account") {
        state.drawer.view = "account"
        this.showAccountDrawer()
      } else if (view==="locations") {
        state.drawer.view = "locations"
        this.showLocationsDrawer()
      } else {
        state.drawer.view = "locations"
        this.showLocationsDrawer()
      }
    }
  }
  showLocationsDrawer(){
    this.$accountContainer.style.display = "none";
    this.$locationsContainer.style.display = "flex"
  }
  showAccountDrawer(){
    this.$accountContainer.style.display = "flex";
    this.$locationsContainer.style.display = "none";
  }
  buildDrawerAccount(){
    if (state.isLoggedIn){
      userContainer.style.display = "flex"
      loginContainer.style.display = "none"
    } else {
      userContainer.style.display = "none"
      loginContainer.style.display = "flex"
    }
  }
}

function renderTags(tags){
  return h('div.tags-container', [
    tags.map( (item, idx) => renderTag(item, idx))
  ]) 
}

function renderTag(tag){
  return h('div', {class: "tag-item"}, [
    h('p', tag)
  ])
}

function parseDate(ts){
  let date = new Date(ts);
  return `${date.getDate()}/${date.getMonth() + 1}`
}

export default Drawer