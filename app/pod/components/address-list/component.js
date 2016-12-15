import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stContent,
  stStoreType,
  stAddress,
  stCity,
  stShippingCharges,
  stAddressId,
  stAddrPopupShown
  } = ENV.storageKeys;

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  showAddAddress: false,
  model: null,
  addressObjCurrent: null,
  activeAddress: null,
  showRightBgImage: true,
  willRender() {
    this._super(...arguments);
    let model = this.get('session').get('currentAddress');
    this.set('model', model);
    let modelCount = 0;
    model.forEach((data)=> {
      modelCount++;
      if (data.get('active')) {
        this.set('activeAddress', data);
      }
    });
    if (modelCount > 2) {
      this.set("showRightBgImage", false);
    }
    let _this = this;
    this.get('session').on('userAddressUpdated', function (address) {
      _this.set('model', address);
    });
  },
  didRender() {
    this._super(...arguments);
    Ps.initialize(document.getElementById("address-a"), {
      wheelSpeed: 2,
      wheelPropagation: true,
      minScrollbarLength: 20
    });
    Ember.$(".new-address-list").scroll(function () {
      if (Ember.$(".new-address-list").scrollTop() > 45) {
        Ember.$(".seleted-address").css({'display': 'none'});
      } else {
        Ember.$(".seleted-address").css({'display': 'block'});
      }
    });
  },
  actions: {
    openAddAddress: function () {
      this.sendAction('showAddAddress');
    },
    selectAddress: function (addressObj) {
      let currentCountry = this.storage.get(stContent) ? this.storage.get(stContent).countryName : ENV.location[0].name;
      var _this = this;
      var geocoder = new window.google.maps.Geocoder();
      var latlng = {lat: parseFloat(addressObj.get('lat')), lng: parseFloat(addressObj.get('lng'))};
      let model = this.get('model');
      geocoder.geocode({'location': latlng}, function (results) {
        var addressComponents = results[0].address_components;
        addressComponents.forEach((component)=> {
          var componentType = component.types;
          if (componentType[0] === 'country') {
            if ((component.long_name === currentCountry) || (component.long_name === 'Mexico')) {
              if (_this.get('activeAddress') !== null) {
                let activeAddress = _this.get('activeAddress');
                activeAddress.set('active', false);
              }
              addressObj.set("active", true);
              _this.set('addressObjCurrent', addressObj);
              if (_this.get('showModal') !== undefined) {
                _this.send('addressChangeAction');
                _this.set('showModal', true);
                _this.set('showAddressList', false);
                _this.storage.set(stAddrPopupShown, true);
                return;
              }

              let addLat = addressObj.get('lat') ? Math.abs(addressObj.get('lat')) : 0;
              let addLng = addressObj.get('lng') ? Math.abs(addressObj.get('lng')) : 0;
              let storageLat = _this.storage.get(stLat) ? Math.abs(_this.storage.get(stLat)) : 0;
              let storageLng = _this.storage.get(stLng) ? Math.abs(_this.storage.get(stLng)) : 0;
              let storeType = _this.storage.get(stStoreType);
              let cart = _this.get('cart').getCart(storeType);
              if ((Math.abs(addLat - storageLat) > 0.000001 || Math.abs(addLng - storageLng) > 0.000001) &&
                cart && ( cart.get('cartItems').length !== 0 || cart.isWhimAdded())) {
                _this.set('showReloadWarning', true);
              } else {
                _this.send('addressChangeAction');
                _this.storage.set(stAddrPopupShown, true);
              }
            } else {
              alert('Por favor, seleccione una dirección de ' + currentCountry);
              return;
            }
          }
        });
      });
    },
    addressChangeAction: function (restoreBasket) {
      let addressObj = this.get("addressObjCurrent");
      let storeType = this.storage.get(stStoreType);
      let id = addressObj.get('id');
      let address = addressObj.get('address');
      let description = addressObj.get('description');
      let lng = addressObj.get('lng');
      let lat = addressObj.get('lat');
      let tag = addressObj.get('tag');
      let active = addressObj.get('active');
      let lastorder = addressObj.get('lastorder');
      addressObj.save().then(()=> {

        let storageAddressId = this.storage.get(stAddressId)
        let addLat = lat ? Math.abs(lat) : 0;
        let addLng = lng ? Math.abs(lng) : 0;
        let storageLat = this.storage.get(stLat) ? Math.abs(this.storage.get(stLat)) : 0;
        let storageLng = this.storage.get(stLng) ? Math.abs(this.storage.get(stLng)) : 0;
        if (this.get('isCheckout') && storageAddressId && storageAddressId.toString() === id.toString()) {
          this.sendAction('showModalDelevery');
          return;
        } else {
          //this.set('showPopUp', false);
        }
        if (Ember.isEmpty(storageAddressId) || storageAddressId.toString() !== id.toString()) {
          this.storage.set(stLat, lat);
          this.storage.set(stLng, lng);
          this.storage.set(stAddress, address);
          this.storage.set(stAddressId, id);
          this.storage.set(stCity, tag);
          if (Ember.isPresent(storeType)) {
            this.cart.setShippingAddress(storeType, {id, address, description, lng, lat, tag, active, lastorder});
          }
          if ((Math.abs(addLat - storageLat) > 0.000001 || Math.abs(addLng - storageLng) > 0.000001)) {
            this.send("restoreOrderAndCart", restoreBasket);
          }else{
            this.sendAction('showModalDelevery');
          }
        }
      });
    },
    restoreOrderAndCart(restoreBasket) {

      let storeType = this.storage.get(stStoreType);
      let cart = this.cart.getCart(storeType);
      var whimWhat = "";
      var whimWhere = "";
      var cartItems = cart.get("cartItems");
      var whim = this.cart.getWhim();
      var productIdArray = [];
      var productNameArray = [];
      var productQuantityArray = [];
      if (restoreBasket && (Ember.isPresent(cartItems) || Ember.isPresent(whim.what))) {
        let address = this.storage.get(stAddress);
        let lat = this.storage.get(stLat);
        let lng = this.storage.get(stLng);
        let id = this.storage.get(stAddressId);
        let shippingAddress = {
          id: id,
          address: address,
          lat: lat,
          lng: lng
        };
        if (Ember.isPresent(whim.what)) {
          whimWhat = whim.what + whimWhat;
          whimWhere = whimWhere + " " + whim.where;
        }
        if (Ember.isPresent(cartItems)) {
          var productsName = [];
          cartItems.forEach((product) => {
            productIdArray.push(this.getFormatedProductID(product.id));
            productQuantityArray.push(product.quantity);
            productNameArray.push(" " + product.name);
          });
          this.cart.clearCart(storeType);
          this.cart.createCart(storeType, this.storage.get(stShippingCharges), shippingAddress);
          var storeTypeForApi = "";
          if (storeType === "farmacia") {
            storeTypeForApi = "Farmatodo";
          } else if (storeType === ENV.defaultStoreType) {
            storeTypeForApi = "hiper";
          }
          if (storeType !== "restaurant") {
            this.send("getProductsTorestoreCart", productNameArray, productIdArray, lat, lng, storeTypeForApi, whimWhat, whimWhere, productQuantityArray);
          } else {
            this.send("finalyRestoreCart", whimWhat, whimWhere, productNameArray);
          }
        } else {
          this.cart.clearCart(storeType);
          this.cart.createCart(storeType, this.storage.get(stShippingCharges), shippingAddress);
          this.send("finalyRestoreCart", whimWhat, whimWhere, []);
        }

      } else {
        this.cart.clearCart(storeType);
        window.location.reload(true);
      }
    },
    getProductsTorestoreCart(productNameArray, productIdArray, lat, lng, storeType, whimWhat, whimWhere, productQuantityArray) {
      let currentUrl = this.serverUrl.getUrl();
      this.apiService.get(`${currentUrl}${ENV.byLocation}?lat=${lat}&lng=${lng}&store_type=${storeType}`)
        .then((resp)=> {
          if (Object.prototype.toString().call(resp) === '[object Object]') {
            resp = Ember.$.map(resp, (value)=> {
              return [value];
            });
          }
          if (Ember.isEmpty(resp) && storeType === "hiper") {
            this.send("getProductsTorestoreCart", productNameArray, productIdArray, lat, lng, "super", whimWhat, whimWhere, productQuantityArray);
            return;
          }
          this.send("keepMatchingProducts", productNameArray, productIdArray, lat, lng,
            whimWhat, whimWhere, productQuantityArray, resp);
        }, (error)=> {
          this.send("finalyRestoreCart", whimWhat, whimWhere, productNameArray)
        });
    },
    keepMatchingProducts(productNameArray, productIdArray, lat, lng, whimWhat, whimWhere, productQuantityArray, resp) {
      let storeType = this.storage.get(stStoreType);
      resp.forEach((response)=> {
        response.corridors.forEach((corr)=> {
          corr.products.forEach((product)=> {
            let indexproductIdArray = productIdArray.indexOf(this.getFormatedProductID(product.id));
            if (indexproductIdArray !== -1) {
              let id = product.id;
              let name = product.name;
              let price = product.price;
              let presentation = product.presentation;
              let lowImage = product.imagelow ? product.imagelow.replace(this.get('url'), "") : '';
              let image = product.image_low || lowImage;
              let storeId = product.store_id;
              let saleType = product.sale_type;
              let storeType = this.storage.get(stStoreType);
              let addedProduct = this.cart.pushCart(storeType, {
                id, name, unitPrice: price, image, extras: {presentation, storeId, saleType}
              });
              addedProduct.set("quantity", productQuantityArray[indexproductIdArray])
              productIdArray.splice(indexproductIdArray, 1);
              productNameArray.splice(indexproductIdArray, 1);
              productQuantityArray.splice(indexproductIdArray, 1);
            }
          });
        });
      });
      this.send("finalyRestoreCart", whimWhat, whimWhere, productNameArray)
    },
    finalyRestoreCart(whimWhat, whimWhere, productNameArray) {
      let storeType = this.storage.get(stStoreType);
      if (Ember.isPresent(productNameArray)) {
        whimWhat += "  \"PEDIDO WEB NO COBRAR 10% DE ANTOJO\" " + productNameArray.toString();
        whimWhere = storeType + " " + whimWhere;
      }
      if (!Ember.isEmpty(whimWhat)) {
        let whimToAddCart = whimWhat + "&whim&" + whimWhere;
        let whimObj = {
          text: whimToAddCart, what: whimWhat, where: whimWhere
        };
        this.cart.pushWhim(whimObj);
      }
      this.storage.set("openPaymentAfterAddressChange", true);
      window.location.reload(true);
    }
  },
  getFormatedProductID: function (productID) {
    if (productID.split("_")[1]) {
      productID = productID.split("_")[1];
    }
    return productID;
  }
});
