import Ember from 'ember';
import ModalDialog from 'ember-modal-dialog/components/modal-dialog';

export default ModalDialog.extend({

  setup: function () {
    this.setPopupInCenter();
    Ember.$('body').on('keyup', (e) => {
      if (e.keyCode === 27) {
        this.sendAction('close');
      }
    });
    Ember.$("#preloader").one('transitionend', function () {
        Ember.$("#preloader").css('display', 'none');
    })
    .css('opacity', 0);
  }.on('didInsertElement'),
  teardown: function () {
    this.setPopupInCenter();
    Ember.$('body').off('keyup');
  }.on('willDestroyElement'),
  setPopupInCenter: function () {
    Ember.run.later(this, function () {
      if (Ember.$(".ember-modal-dialog").css('margin-left') !== '0px' || Ember.$(".ember-modal-dialog").css('margin-top') !== '0px' || Ember.$(".ember-modal-dialog").css('left') === '65%') {
        var widthDiff = Ember.$(window).width() - Ember.$(".ember-modal-dialog").width();
        var widthDiv = widthDiff / 2;
        var heightDiff = Ember.$(window).height() - Ember.$(".ember-modal-dialog").height();
        var heightDiv = heightDiff / 2;
        Ember.$(".ember-modal-dialog").css({
          left: widthDiv + 'px',
          top: heightDiv + 'px',
          'margin-left': '0',
          'margin-top': '0'
        });
      }

      if (document.getElementById($('.ember-modal-dialog').attr("id")) === null) {
        return;
      }
      Ps.destroy(document.getElementById($('.ember-modal-dialog').attr("id")));
      Ember.$('#' + $('.ember-modal-dialog').attr("id")).css('overflow', 'hidden');
      Ps.initialize(document.getElementById($('.ember-modal-dialog').attr("id")), {
        wheelSpeed: 2,
        wheelPropagation: true,
        minScrollbarLength: 20
      });
    }, 100);
  }
});
