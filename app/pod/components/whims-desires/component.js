import Ember from 'ember';
export default Ember.Component.extend({
  what: null,
  where: null,
  blankField: false,
  message: null,
  color: null,
  showLeftMenu: false,
  slidingImages:[{
    background:"url('assets/images/boarding-pass.png') no-repeat",
    width: "322px",
    height: "261px",
    left: "87px",
  },{
    background: "url('assets/images/wedding-ring.png') no-repeat",
    width: "254px",
    height: "303px",
    left: "142px",
  },{
    background:"url('assets/images/teddy-bear.png') no-repeat",
    width: "254px",
    height: "287px",
    left: "142px",
  },
    {
      background: "url('assets/images/hamburger.png') no-repeat",
      width: "313px",
      height: "235px",
      left: "136px"
    },
    {
      background:"url('assets/images/iphone-cable.png') no-repeat",
        width: "187px",
      height: "252px",
      left: "186px"
    },
    {
      background:"url('assets/images/perfume.png') no-repeat",
      width: "187px",
      height: "252px",
      left: "186px"
    }
  ],
  antojoProducrText:[{
    first:"DOS ENTRADAS DE SKYDIVING PARA EL VIERNES A LAS 3PM",
    second:"OFF Limits Adventures"
  },
    {
      first:"ANILLOS ORO 18K",
      second:"Joyería Bauer"
    },{
      first:"OSO REF.34",
      second:"Pepe Ganga de la 93"
    },{
      first:"CORRALISIMA EN COMBO SIN SALSAS",
      second:"El Corral"
    },{
      first:"CABLE IPHONE",
      second:"Unilago"
    },{
      first:"CHANNEL NO.5",
      second:"Fedco"
    }],
  slidingImagesPerson:[{
    background:"url('assets/images/person.png') no-repeat",
    bottom: "212px",
    right: "48px",
    width: "320px",
    height: "266px"
  },{
    background: "url('assets/images/person-couple.png') no-repeat",
    bottom: "28px",
    right: "48px",
    width: "320px",
    height: "266px"
  },{
    background:"url('assets/images/person-kid.png') no-repeat",
    bottom: "10px",
    right: "93px",
    width: "320px",
    height: "204px"
  },
    {
      background: "url('assets/images/person-guy.png') no-repeat",
      bottom: "67px",
      right: "96px",
      width: "232px",
      height: "281px"
    },
    {
      background:"url('assets/images/geek-guy.png') no-repeat",
      bottom: "49px",
      right: "96px",
      width: "369px",
      height: "293px"
    },
    {
      background:"url('assets/images/person-mom.png') no-repeat",
      bottom: "49px",
      right: "96px",
      width: "203px",
      height: "296px"
    }
  ],
  didRender() {
    this._super(...arguments);
    let _this = this;
    Ember.$("#asd").scroll(function () {
      let scrollHeight = Ember.$("#asd")[0].scrollHeight;
      let scrollTop = Ember.$("#asd").scrollTop();
      let height = Ember.$("#asd").height();
      if (scrollTop + height === scrollHeight) {
        _this.sendAction('scrollEnd');
      }
    });
  },
  init() {
    this._super(...arguments);
    let storedWhims = this.cart.getWhim();
    if (Ember.isPresent(storedWhims) && Ember.isPresent(storedWhims.text)) {
      let whatWhere = storedWhims.text.split('&whim&');
      this.set('what', whatWhere[0]);
      this.set('where', whatWhere[1]);
    }
    let whims = this.get('model') ? this.get('model').whims : undefined;
    if (Ember.isPresent(whims) && Ember.isPresent(storedWhims) && Ember.isPresent(storedWhims.text)) {
      let _this = this;
      whims.forEach((whimObj)=> {
        if (storedWhims.text.indexOf(whimObj.text) >= 0) {
          Ember.set(whimObj, 'isAdded', true);
          Ember.set(whimObj, 'buttonText', "añadido a la cesta");
          _this.set('addedWhimObj', whimObj);
          return;
        }
      });
    }
    this.set("antojo-outer-1",this.get("antojoProducrText")[0].first);
    this.set("antojo-outer-2",this.get("antojoProducrText")[0].second);
    if($(window).width()>480){
      this.imageAnimation(0);
    }else{
      this.antojoTextImageChange(0);
      this.set("mobileSite",true);
    }
  },
  antojoTextImageChange(times){
    this.antojoTextImageAnimate(times);
    let antojoAnimator=Ember.run.later(this,function(){
      this.antojoTextImageChange(times===5?0:times+1);
    },5000);
    Ember.set(this,"antojoTextAnimator",antojoAnimator);
  },
  antojoTextImageAnimate(times){
    if(times===0){
      Ember.$("#antojo-section-img").attr("src","assets/images/section-name.png");
    }else{
      Ember.$("#antojo-section-img").attr("src","assets/images/section-name-couple.png");
    }
  },
  imageAnimation(times){
    var _this =this;
    var img = this.get("slidingImages")[times];
    var imgPerson = this.get("slidingImagesPerson")[times];
    Ember.$(".antojo-first-image").animate({left:"-390px"}, 300,function(){
      if(!_this.get("animationStarted")){
        _this.set("animationStarted",true);
        Ember.$(".antojo-section").addClass("antojo-animation-bg");
      }
      Ember.$(".antojo-first-image").css(img);
      Ember.$(".antojo-first-image").css({left:"-390px"});
    });
    var left =img["left"];
    this.antojoTextImageAnimate(times);
    Ember.$(".antojo-first-image").animate({left:left}, 300);

    Ember.$(".antojo-outer").animate({"margin-left":"-10%"},300,function(){
      _this.set("antojo-outer-1",_this.get("antojoProducrText")[times].first);
      _this.set("antojo-outer-2",_this.get("antojoProducrText")[times].second);
  });

    Ember.$(".antojo-outer").animate({"margin-left":"30%"},300);
    Ember.$(".antojo-second-image").animate({right:"-390px"}, 300,function(){
      Ember.$(".antojo-second-image").css(imgPerson);
      Ember.$(".antojo-second-image").css({right:"-390px"});
    });
    var right =imgPerson["right"];
    Ember.$(".antojo-second-image").animate({right:right}, 300);
    let antojoAnimator=Ember.run.later(this,function(){
      this.imageAnimation(times===5?0:times+1);
    },5000);
    Ember.set(this,"antojoAnimator",antojoAnimator);
  }
  , setMessage(color, message) {
    this.set('blankField', true);
    this.set('color', color);
    this.set('message', message);
    let _this = this;
    Ember.run.later(() => {
      _this.set('blankField', false);
      _this.set('color', null);
      _this.set('message', null);
    }, 3000);
  },
  actions: {
    addWhat:function(){
      let what = this.get('what');
      if (Ember.isPresent(what)) {
       Ember.$("#where-div").removeClass("translate-antojo-where-div");
        Ember.$("#what-div").addClass("translate-antojo-what-div");
      } else {
        this.setMessage('msg-error', 'Los campos que no pueden dejarse en blanco.');
      }
    },
    backToWhat:function(){
      Ember.$("#what-div").removeClass("translate-antojo-what-div");
      Ember.$("#where-div").addClass("translate-antojo-where-div");
    },
    addWhim: function () {
      this.set('blankField', false);
      let what = this.get('what');
      let where = this.get('where');
      let storedWhims = this.cart.getWhim();
      if (Ember.isPresent(storedWhims) && Ember.isPresent(storedWhims.text)) {
        let whatWhere = storedWhims.text.split('&whim&');
        if (what === whatWhere[0] && where === whatWhere[1]) {
          this.send("openBasket");
          return;
        }
      }
      if (Ember.isPresent(what) && Ember.isPresent(where)) {
        let whim = what + "&whim&" + where;
        let whimObj = {
          text: whim, what, where
        };
        this.cart.pushWhim(whimObj);
        mixpanel.track("Global_add_product");
        mixpanel.track("add_to_cart_antojos");
        this.send("openBasket");
        this.set('addedWhimObj', whimObj);
      } else {
        this.setMessage('msg-error', 'Los campos que no pueden dejarse en blanco.');
      }
    }, addToBasket(whimObj) {
      let addedWhimObj = this.get('addedWhimObj');
      if (Ember.isPresent(addedWhimObj)) {
        Ember.set(addedWhimObj, 'buttonText', "+ agregar a la canasta");
        Ember.set(addedWhimObj, 'isAdded', false);
      }
      Ember.set(whimObj, 'isAdded', true);
      Ember.set(whimObj, 'buttonText', "añadido a la cesta");
      this.set('addedWhimObj', whimObj);
      this.cart.pushWhim(whimObj);
      mixpanel.track("add_antojos_to_cart_by_antojo_section");
    },
    openBasket(){
      Ember.$(".products-basket").css("max-height", (Ember.$(window).height() - 100));
      Ember.$('#product-basket').collapse('show');
      Ember.run.later(this, function () {
        this.set("basketOpenned", true);
      }, 100);
    }
  },
  willDestroyElement() {
    Ember.run.cancel(this.get("antojoAnimator"));
    Ember.run.cancel(this.get("antojoTextAnimator"));
  },
});
