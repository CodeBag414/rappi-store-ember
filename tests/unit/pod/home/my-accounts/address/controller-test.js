import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:home/my-accounts/address', 'Unit | Controller | home/my accounts/address', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

// Replace this with your real tests.
test('should trigger external action on form submit', function(assert) {
  assert.expect(9);

  const ctrl = this.subject();
  ctrl.set('model',[
    {
      "id": 294387,
      "application_user_id": 206206,
      "address": "lucknow",
      "active": false,
      "lat": "26.8466937",
      "lng": "80.94616599999999",
      "description": "",
      "tag": "otra",
      "lastorder": -1
    },
    {
      "id": 294386,
      "application_user_id": 206206,
      "address": "varanasi",
      "active": false,
      "lat": "25.3176",
      "lng": "82.9739",
      "description": null,
      "tag": "casa",
      "lastorder": -1
    },
    {
      "id": 294385,
      "application_user_id": 206206,
      "address": "allahabad",
      "active": true,
      "lat": "25.4358011",
      "lng": "81.846311",
      "description": null,
      "tag": "casa",
      "lastorder": -1
    },
    {
      "id": 294384,
      "application_user_id": 206206,
      "address": "Bogotá, Bogota, Colombia",
      "active": false,
      "lat": "4.710988599999999",
      "lng": "-74.072092",
      "description": null,
      "tag": "otra",
      "lastorder": -1
    },
    {
      "id": 294378,
      "application_user_id": 206206,
      "address": "Bogotá, Bogota, Colombia,new address",
      "active": false,
      "lat": "4.710988599999999",
      "lng": "-74.072092",
      "description": "new address",
      "tag": "novi@",
      "lastorder": 0
    },
    {
      "id": 294372,
      "application_user_id": 206206,
      "address": "Bogotá, Bogota, Colombia,asdfclnacsln",
      "active": false,
      "lat": "4.710988599999999",
      "lng": "-74.072092",
      "description": "lnclksndclksdmv ;sdvsd\nvsv sdpovj sdpv jvds pjsvd \n svd \npsn\n s",
      "tag": "otra",
      "lastorder": 1
    }
  ]);

  assert.equal(ctrl.get('inactiveAddressModel'), null, 'inactivemodel initialized');
  assert.equal(ctrl.get('activeAddressModel'), null, 'activemodel initialized');
  ctrl.send('getModel', {
    "id": 294384,
    "application_user_id": 206206,
    "address": "Bogotá, Bogota, Colombia",
    "active": false,
    "lat": "4.710988599999999",
    "lng": "-74.072092",
    "description": null,
    "tag": "otra",
    "lastorder": -1
  });
  assert.equal(ctrl.get('inactiveAddressModel').address, 'Bogotá, Bogota, Colombia', 'inactive model updated');
  assert.equal(ctrl.get('inactiveAddressModel').active, false, 'inactive model updated');
  assert.equal(ctrl.get('inactiveAddressModel').lat, "4.710988599999999", 'inactive model updated');
  assert.equal(ctrl.get('inactiveAddressModel').lng, "-74.072092", 'inactive model updated');
  assert.equal(ctrl.get('activeAddressModel').address, "allahabad", 'active model updated');
  ctrl.send('updateActive');
  assert.equal(ctrl.get('inactiveAddressModel').active, true, 'inactive model updated again');
  assert.equal(ctrl.get('activeAddressModel').active, false, 'active model updated again');
});
