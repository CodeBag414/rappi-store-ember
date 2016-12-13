import Ember from 'ember';

export function listItem(params/*, hash*/) {
  var addressModel = params[0];
  var elementIndex = params[1];
var tag = addressModel.get('tag');
  if (addressModel.get("active")) {
    if(tag==="novi@"){
      return Ember.String.htmlSafe(`<li class="row item address-pink-row"><div style="height:84px">
      <div class="div-dot"> </div>
      <div id ="div1" > <h4>${addressModel.get('tag')}</h4> <p>${addressModel.get('address')}</p></div><div id ="div2" class="col-xs-2"><img src="assets/images/heart-icon.svg" /></div></div></li>`);

    }else if(tag==="oficina"){
      return Ember.String.htmlSafe(`<li class="row item address-blue-row"><div style="height:84px">
      <div class="div-dot"> </div>
      <div id ="div1" > <h4>${addressModel.get('tag')}</h4> <p>${addressModel.get('address')}</p></div><div id ="div2" class="col-xs-2"><img src="assets/images/office-icon.svg" /></div></div></li>`);

    }else if(tag=="casa"){
      return Ember.String.htmlSafe(`<li class="row item new-green-box"><div style="height:84px">
      <div class="div-dot"> </div>
      <div id ="div1" > <h4>${addressModel.get('tag')}</h4> <p>${addressModel.get('address')}</p></div><div id ="div2" class="col-xs-2"><img src="assets/images/office-icon.svg" /></div></div></li>`);

    }
    return Ember.String.htmlSafe(`<li class="row item address-other-row"><div style="height:84px">
      <div class="div-dot"> </div>
      <div id ="div1" > <h4>${addressModel.get('tag')}</h4> <p>${addressModel.get('address')}</p></div><div id ="div2" class="col-xs-2"><img src="assets/images/moustache-icon.svg" /></div></div></li>`);
  }
      else  {
    if(tag==="novi@"){
      return Ember.String.htmlSafe(`<li class="row item address-pink-row"><div style="height:84px">
      <div class="div-dot"> </div>
      <div id ="div1" > <h4>${addressModel.get('tag')}</h4> <p>${addressModel.get('address')}</p></div><div id ="div2" class="col-xs-2"><img src="assets/images/heart-icon.svg" /></div></div></li>`);

    }else if(tag==="oficina"){
      return Ember.String.htmlSafe(`<li class="row item address-blue-row"><div style="height:84px">
      <div class="div-dot"> </div>
      <div id ="div1" > <h4>${addressModel.get('tag')}</h4> <p>${addressModel.get('address')}</p></div><div id ="div2" class="col-xs-2"><img src="assets/images/office-icon.svg" /></div></div></li>`);

    }else if(tag=="casa"){
      return Ember.String.htmlSafe(`<li class="row item new-green-box"><div style="height:84px">
      <div class="div-dot"> </div>
      <div id ="div1" > <h4>${addressModel.get('tag')}</h4> <p>${addressModel.get('address')}</p></div><div id ="div2" class="col-xs-2"><img src="assets/images/office-icon.svg" /></div></div></li>`);

    }
    return Ember.String.htmlSafe(`<li class="row item address-other-row"><div style="height:84px">
      <div class="div-dot"> </div>
      <div id ="div1" > <h4>${addressModel.get('tag')}</h4> <p>${addressModel.get('address')}</p></div><div id ="div2" class="col-xs-2"><img src="assets/images/moustache-icon.svg" /></div></div></li>`);
  }
}

export default Ember.Helper.helper(listItem);
