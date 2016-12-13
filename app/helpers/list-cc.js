import Ember from 'ember';

export function listCc(params/*, hash*/) {
  var CCModel = params[0];
  var elementIndex = params[1];
  if (CCModel.isDefault) {
    return Ember.String.htmlSafe('<li class="item greenBox"> <h4>' + '******' + CCModel.termination + '</h4> <p>' + CCModel.name + '</p></li>');
  } else {
    return Ember.String.htmlSafe('<li class="item no-defaul-card"> <h4>' + '******' + CCModel.termination + '</h4> <p>' + CCModel.name + '</p></li>');
  }
}

export default Ember.Helper.helper(listCc);
