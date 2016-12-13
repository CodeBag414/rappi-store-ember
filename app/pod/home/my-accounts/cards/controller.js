import Ember from 'ember';
import ENV from 'rappi/config/environment';

export default Ember.Controller.extend({
  url: null,
  session: Ember.inject.service('session'),
  flashMessages: Ember.inject.service(),
  redirectURL: '',
  creditCard: false,
  creditcardDetails: [],
  creditcardInfo: [],
  cardProcess: false,
  parentController: null,
  deleteCardConfirmation: false,
  selectCard: null,
  init() {
    this._super(...arguments);
    Ember.run.later(this, function () {
      this.send('getCards');
    }, 100);

    this.set('content', Ember.Object.create({
      info: null
    }));
    // other setup here...
  },
  actions: {
    iFrameLoaded() {
      this.get('parentController').set('currentlyLoading', false);
    },
    addCard: function () {
      var session = this.get('session');
      if (session.isAuthenticated) {
        var accessToken = session.get('data.authenticated.access_token');
        let currentUrl = this.serverUrl.getUrl();
        this.set("cardProcess", true);
        this.get('parentController').set('currentlyLoading', true);
        this.apiService.get(`${currentUrl}${ENV.addCreditCardUrl}?env=pro`, `${accessToken}`)
          .then((rsp)=> {
            var redirectUrl = rsp.url;
            this.set("redirectURL", redirectUrl);
            this.set("creditCard", true);
            this.set("cardProcess", false);
          }, (error)=> {
            this.set("cardProcess", false);
            this.get('parentController').set('currentlyLoading', false);
            console.log("err>> is ...", error);
          });

      } else {
        this.transitionToRoute('index');
      }
    },
    updateUserInfo: function (model) {
      let cardNumber = Ember.$('input:radio[name=selectCard]:checked').val();
      if (cardNumber === 'on') {
        return;
      }
      this.set("cardProcess", true);
      model.set('default_cc', cardNumber);
      model.save();
      let defaultCc = this.get('session').get('currentUser').get("content").get("default_cc");
      let oldCurrentCardList = this.get("creditcardInfoDefault");
      let cardList = [];
      this.get("creditcardDetails").forEach((data)=> {
        if (data.card_reference === defaultCc) {
          this.set("creditcardInfoDefault", data);
        } else {
          cardList.push(data);
        }
      });
      cardList.push(oldCurrentCardList);
      this.set("creditcardDetails", cardList);
      this.set("cardProcess", false);
      Ember.$('input:radio[id=btnChecked]').prop('checked', true);
    }, getCards: function () {
      var cardList = [];
      var accessToken = this.get('session').get('data.authenticated.access_token');
      let currentUrl = this.get("currentUrl");
      this.get('parentController').set('currentlyLoading', true);
      this.apiService.get(`${currentUrl}${ENV.cardList}`, `${accessToken}`)
        .then((rsp)=> {
          let defaultCc = this.get('session').get('currentUser').get("content").get("default_cc");
          rsp.forEach((data)=> {
            if (data.card_reference === defaultCc) {
              this.set("creditcardInfoDefault", data);
            } else {
              cardList.push(data);
            }
          });
          this.set("creditcardDetails", cardList);
          this.get('parentController').set('currentlyLoading', false);
        }, (error)=> {
          this.get('parentController').set('currentlyLoading', false);
          console.log("err>> is ...", error);
        });
    }, logout() {
      this.get('session').invalidate();
    },
    deleteCard: function () {
      var details = this.get("selectCard");
      var accessToken = this.get('session').get('data.authenticated.access_token');
      let currentUrl = this.serverUrl.getUrl();
      let data = {card_reference: details.card_reference};
      this.apiService.delete(`${currentUrl}${ENV.cardList}`, `${accessToken}`, data)
        .then((rsp)=> {
          this.get("creditcardDetails").removeObject(details);
          this.set("selectCard", null);
          this.toggleProperty('deleteCardConfirmation');
        }, (error)=> {
          if (error.status === 403) {
            this.get("flashMessages").danger("Tarjeta no encontrada");
          } else {
            this.get("flashMessages").danger("Algo salió mal");
          }
          this.toggleProperty('deleteCardConfirmation');
        });
    },
    deleteCardConfirmation: function (details) {
      this.set("selectCard", details);
      this.toggleProperty('deleteCardConfirmation');
    },
    closeDeleteCardConfirmationPopup: function () {
      this.set("selectCard", null);
      this.toggleProperty('deleteCardConfirmation');
    }
  }
});
