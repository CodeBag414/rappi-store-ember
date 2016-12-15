import Ember from 'ember';

export function headerAddressList(params/*, hash*/) {
  var addressModel = params[0];
  var tag = addressModel.get('tag');
  var address = addressModel.get('address').split('#');
  var element = '';
  address.forEach((addressPart, index)=>{
    element += `<span class="CALLE-93-18-51-LIST">${addressPart}</span>`;
    if(index !== address.length-1){
      element += `<span class="CALLE-93-18-51-LIST" style="font-weight: 500;margin-left: 0px;">#</span>`;
    }
  });
  if (tag === "novi@") {
    return Ember.String.htmlSafe(`<div class="each-address-bg" id='${addressModel.get("id")}'>
        <span class="map-pointer"><img src="assets/images/heart-icon-copy20x19.svg"/></span>
        <div class="address-wrap">
        <span class="OFICINA-LIST">NOVI@</span>
        ${element}
        </div></div>`);

  } else if (tag === "oficina") {
    return Ember.String.htmlSafe(`<div class="each-address-bg" id='${addressModel.get("id")}'>
        <span class="map-pointer"><img src="assets/images/office-icon-copy21x21.svg"/></span>
        <div class="address-wrap">
        <span class="OFICINA-LIST">OFICIANA</span>
        ${element}
        </div></div>`);

  } else if (tag === "casa") {
    return Ember.String.htmlSafe(`<div class="each-address-bg" id='${addressModel.get("id")}'>
        <span class="map-pointer"><img src="assets/images/office-icon-copy21x21.svg"/></span>
        <div class="address-wrap">
        <span class="OFICINA-LIST">CASA</span>
        ${element}
        </div></div>`);
  }else{
    return Ember.String.htmlSafe(`<div class="each-address-bg" id='${addressModel.get("id")}'>
        <span class="map-pointer"><img src="assets/images/moustache-icon-copy21x8.svg"/></span>
        <div class="address-wrap">
        <span class="OFICINA-LIST">OTRA</span>
        ${element}
        </div></div>`);
  }
}


export default Ember.Helper.helper(headerAddressList);
