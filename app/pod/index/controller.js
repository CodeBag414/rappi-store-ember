import Ember from 'ember';

export default Ember.Controller.extend({
  message: null,
  countrySelect: 0,
  landing_page: {
    search_block: {
      h2: {
        s1: 'TODO A DOMICILIO'
      }, h5: {
        s1: 'LA MEJOR VARIEDAD DE PRODUCTOS Y ARTÍCULOS DE TU ZONA',
      }
    },
    block_data: {
      b1: {
        title: 'SUPERMERCADO E HIPERMERCADO',
        text: 'Actualizamos cada 2 horas de inventario'
      },
      b2: {
        title: '+25.000 PRODUCTOS DE INVENTARIO',
        text: '¡Encuentra miles de productos en segundos!'
      },
      b3: {
        title: 'ANTOJOS Y DESEOS',
        text: 'Pide antojos de tu zona'
      },
      description1: 'Entra por la mañana para pedir el desayuno, en la tarde para pedir algún antojo y en la noche un vino para la cena.',
      description2: 'Descarga el App, desliza los productos a la canasta y diviértete comprando. Puedes comprar desde tu PC, smartphone, iPod o tablet.',
      description3: 'Pasea por nuestra tienda o pídenos cualquier antojo que no tengamos exhibido y se encuentre cerca de tu zona. Te lo llevamos en minutos y con una sonrisa.'
    }
  },
  storeType: null,
  basketOpenned: false,
  searching: false,
  classToTransform: null,
  actions: {
    setClassToTransform(className){
      this.set('classToTransform', className);
    },
    selectLocation: function (value) {
      this.set('countrySelect', value);
    },
    selectCountry: function () {
      this.set("selectCountryProcess", true);
      this.send("_selectLocation", this.get('countrySelect'));
    }
  }
});
