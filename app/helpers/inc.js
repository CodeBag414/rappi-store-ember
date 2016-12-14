import Ember from 'ember';

export function inc(params/*, hash*/) {
    return parseInt(params[0]) + 1;
}

export default Ember.Helper.helper(inc);
