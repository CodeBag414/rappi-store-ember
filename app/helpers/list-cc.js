import Ember from 'ember';

export function listCc(params/*, hash*/) {
  var CCModel = params[0];
  var elementIndex = params[1];
  //if (CCModel.isDefault) {
  //  return Ember.String.htmlSafe('<li class="item greenBox"> <h4>' + '******' + CCModel.termination + '</h4> <p>' + CCModel.name + '</p></li>');
  //} else {
  //  return Ember.String.htmlSafe('<li class="item no-defaul-card"> <h4>' + '******' + CCModel.termination + '</h4> <p>' + CCModel.name + '</p></li>');
  //}
  if(CCModel.type === 'vi'){
    return Ember.String.htmlSafe('<span class="Tarjeta_VISA">' + 'Tarjeta VISA **********' + CCModel.termination + '</span>');
  }else{
    return Ember.String.htmlSafe('<span class="Tarjeta_VISA">' + 'Tarjeta Mastercard **********' + CCModel.termination + '</span>');
  }
}

export default Ember.Helper.helper(listCc);
