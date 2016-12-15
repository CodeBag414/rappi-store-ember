import Ember from 'ember';

export function expressCategoryName(params/*, hash*/) {
  let categoryName = params[0].toLowerCase().trim();
  categoryName = categoryName.split("-")[0];
  var name = categoryName.replace(/ /g, "_");
  name = name.replace(/_\/_/g, "_");
  name = name.replace(/\//g, "");
  return name;
}

export default Ember.Helper.helper(expressCategoryName);
