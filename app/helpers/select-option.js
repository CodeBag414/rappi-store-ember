import Ember from 'ember';
/**
 * This Helper js is used to render select type input in html on order to show already selected option as selected to
 * user.
 * @param params
 * @returns {*}
 */
export function selectOption(params/*, hash*/) {
  var valueInDb = params[0];
  var valueInOption = params[1];

  if (valueInDb && valueInOption === valueInDb) {
    return Ember.String.htmlSafe(`<option selected="selected" value="${params[1]}">${params[2]}</option>`);
  } else {
    return Ember.String.htmlSafe(`<option value="${params[1]}">${params[2]}</option>`);
  }
}

export default Ember.Helper.helper(selectOption);
