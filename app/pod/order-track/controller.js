import Ember from 'ember';

export default Ember.Controller.extend({
  eta: null,
  timer: null,
  paypalTransaction: null,
  orderObj: null,
  loading: true,
  showtimer: true,
  ctx: null,
  isWhimOrdered: false,
  orderTotalValueWithTip: 0,
  init() {
    this._super(...arguments);
  },

  willDestroyElement() {
    Ember.run.cancel(Ember.get(this, 'timer'));
    this.get('orderObj').off('etaChanged');
  },
  _updateTime: function () {
    let timer = Ember.run.later(this, function () {
      this.set('takedAtParse', this._getTime());
      if (this.get("showtimer")) {
        this._timerShow();
        this._drawCircle('#3cc777', this.get("lineWidth"), 1, this.get("ctx"), this.get("radius"));
        this.set("showtimer", false);
        this.set("min", "min");
      }
      if (this.get('eta') > 0) {
        let eta = this.get('eta');
        let totalEta = this.get("totalEta");
        var ctx = this.get("ctx");
        let lineWidth = this.get("lineWidth");
        let radius = this.get("radius");
        this._drawCircle('#45d482', 16, totalEta / totalEta, ctx, radius);
        this._drawCircle('#3cc777', lineWidth, totalEta / totalEta, ctx, radius);
        this._drawCircle('#ffffff', 15, eta / totalEta, ctx, radius);
        this._updateTime();
      } else {
        var ctx = this.get("ctx");
        let lineWidth = this.get("lineWidth");
        let radius = this.get("radius");
        this._drawCircle('#45d482', 16, 1, ctx, radius);
        this._drawCircle('#3cc777', lineWidth, 1, ctx, radius);

      }
    }.bind(this), 1000);
    Ember.set(this, 'timer', timer);
  },
  _getTime: function () {
    let _time = this.get('eta') - 1;
    this.set('eta', _time);
    let minutes = Math.floor(_time / 60);
    if (minutes < 0) {
      this.set("min", "sec");
      return '00';
    }
    let parseMinutes = (minutes < 10 ? '0' : '') + minutes;
    let seconds = _time - minutes * 60;
    let parseSeconds = (seconds < 10 ? '0' : '') + seconds;
    if (parseInt(parseMinutes) === 0) {
      this.set("min", "sec");
      return parseSeconds;
    }
    return parseMinutes;
  },
  _timerShow() {
    var el = Ember.$('#timer'); // get canvas div
    var options = {
      size: 148.5,
      lineWidth: 10,
      rotate: 0
    }
    var canvas = document.createElement('canvas');
    if (typeof(G_vmlCanvasManager) !== 'undefined') {
      G_vmlCanvasManager.initElement(canvas);
    }
    let ctx = canvas.getContext('2d');
    canvas.width = canvas.height = options.size + 15;
    el.append(canvas);
    ctx.translate(options.size / 2, options.size / 2); // change center
    ctx.rotate((-1 / 2 + options.rotate / 180) * Math.PI); // rotate -90 deg
    this.set("ctx", ctx);
    let radius = (options.size - options.lineWidth) / 2 - 5;
    this.set("radius", radius);
    this.set("lineWidth", options.lineWidth);
  },

  _drawCircle: function (color, lineWidth, p, ctx, radius) {
    let percent = Math.min(Math.max(0, p || 1), 1);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2 * percent, false);
    ctx.strokeStyle = color;
    ctx.lineCap = 'round'; // butt, round or square
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  },
  actions: {
    closeView: function () {
      this.set('orderStatusModal', false);
      this.set('removeAddressList', false);
      this.set('closePopUp', false);
    }, activateChat() {
      this.sendAction('activateChat');
    },
    renderNow() {
      let orderObj = this.get('orderObj');
      let whim = orderObj.whim;
      if (Ember.isPresent(whim)) {
        let whimsWhatWhere = whim.split("&whim&");
        let orderWhim = {};
        orderWhim['what'] = whimsWhatWhere[0];
        orderWhim['where'] = whimsWhatWhere[1];
        this.set("orderedWhim", orderWhim);
        this.set("isWhimOrdered", true);
      }
      let eta = orderObj.eta;
      let etaStartsAt = orderObj.eta_starts_at;
      this.set("orderTotalValueWithTip", parseInt(orderObj.tip) + parseInt(orderObj.total_value));
      if (Ember.isPresent(eta) && !isNaN(eta)) {
        let zoneOffset = this.get("zoneOffset");
        let localStartTime = moment.parseZone(`${etaStartsAt}${zoneOffset}`).local();
        let localETA = moment(localStartTime).add(parseInt(eta), 'minutes');
        eta = moment.duration(moment(localETA).diff(moment())).asSeconds();
        let totalEta = orderObj.eta;
        this.set("totalEta", parseInt(totalEta) * 60);
        this.set('eta', parseInt(eta));
        this._updateTime();
      }
      if (Ember.isPresent(orderObj)) {
        var starsRating = [];
        for (var i = 1; i <= 5; i++) {
          starsRating.push({
            index: i,
            off: i > orderObj.storekeeper.average_score
          });
        }
        this.set('starsRating', starsRating);
        let comment = orderObj.comment;
        if (Ember.isPresent(comment)) {
          this.set('paypalTransaction', comment.substr(7, comment.length));
        }
      }
    },
  }
});
