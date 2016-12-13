import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('whims-desires', 'Integration | Component | whims desires', {
  integration: true
});

test('it renders', function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(hbs`{{whims-desires}}`);

    //assert.equal(this.$().text().trim(), '');
    //
    //// Template block usage:
    //this.render(hbs`
    //  {{#whims-desires}}
    //    template block text
    //  {{/whims-desires}}
    //`);

    assert.equal(this.$('#ele1').text().trim(), 'Antojos y deseos', 'favors message 1');
    assert.equal(this.$('#ele2').text().trim(), '¿Qué quieres?', 'favors message 2');
    assert.equal(this.$('#ele3').text().trim(), '¿Dónde lo conseguimos?', 'favors message 3');
    assert.equal(this.$('#ele4').text().trim(), 'Antojos / favores anteriores', 'favors message 4');
  }
//test('should trigger external action on form submit', function(assert) {
//
//  // test double for the external action
//  this.set('externalAction', (actual) => {
//    let expected = { comment: 'You are not a wizard!' };
//    assert.deepEqual(actual, expected, 'submitted value is passed to external action');
//  });
//
//  this.render(hbs`{{whims-desires addWhim=(action externalAction)}}`);
//
//  // fill out the form and force an onchange
//  this.$('#what').val('You are not a wizard!');
//  this.$('#where').val('You are not a wizard!');
//
//  // click the button to submit the form
//  this.$('button').click();
//}
);
