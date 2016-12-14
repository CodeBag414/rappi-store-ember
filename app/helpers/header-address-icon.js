import Ember from 'ember';

export function headerAddressIcon(params/*, hash*/) {
  var tag = params[0];
  if (tag === "novi@") {
    return Ember.String.htmlSafe(`<img src="assets/images/heart-icon-copy25x25.svg"/>`);

  } else if (tag === "oficina") {
    return Ember.String.htmlSafe(`<img src="assets/images/office-icon-copy25x25.svg"/>`);

  } else if (tag === "casa") {
    return Ember.String.htmlSafe(`<img src="assets/images/office-icon-copy25x25.svg"/>`);
  }else{
    return Ember.String.htmlSafe(`<img src="assets/images/moustache-icon-copy25x10.svg"/>`);
  }
}

export default Ember.Helper.helper(headerAddressIcon);
