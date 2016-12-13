import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
    stShowPromoBanner
} = ENV.storageKeys;

export default Ember.Component.extend({
    show:  true,
    showTermConditions: false,
    promoBannerUrl: 'assets/images/promo-banner.png',
    promoModalUrl: 'assets/images/promo-modal.jpg',
    init() {
        this._super(...arguments);
        this.set('show', Ember.isEmpty(this.storage.get(stShowPromoBanner)) ? true : this.storage.get(stShowPromoBanner));
    },
    actions: {
        toggleShow: function()
        {
            this.toggleProperty('show');
            this.storage.set(stShowPromoBanner, this.get('show'));
        },
        toggleShowTermConditions: function()
        {
            this.toggleProperty('showTermConditions');
        }
    }
});
