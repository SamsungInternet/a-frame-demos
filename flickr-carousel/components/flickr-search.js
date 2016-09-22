var API_URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&safe_search=&format=json&nojsoncallback=1';

/**
 * For URL format details, see: https://www.flickr.com/services/api/misc.urls.html
 */
function processImageUrls(photos) {

  var imageSources = [];

  for (var i=0; i < photos.length; i++) {
    var photo = photos[i];
    // This would be neater as a template literal, but that needs support/transpilation/polyfilling
    var domain = 'https://farm'+photo.farm+'.staticflickr.com';
    var path = '/'+photo.server+'/';
    var filename = photo.id+'_'+photo.secret+'_z.jpg';
    imageSources.push(domain + path + filename);
  }

  return imageSources;

}

function generateImage(src) {

  var imageEl = document.createElement('a-image');
  imageEl.setAttribute('src', src);
  imageEl.setAttribute('width', 1.25);
  imageEl.setAttribute('height', 1);

  // Rotate the image to face the centre
  imageEl.setAttribute('look-at', '0 0.75 0');

  return imageEl;

}


AFRAME.registerComponent('flickr-search', {
  schema: {
    search: {default: ''},
    numResults: {default: 10},
    apiKey: {default: ''}
  },

  init: function() {
    this.images = [];
  },

  update: function() {

    var self = this;
    var el = this.el;

    if (!this.data.apiKey) {
      // No api key yet - it may take a couple of updates to come through
      return;
    }

    fetch(API_URL+'&text='+this.data.search+'&per_page='+this.data.numResults+'&api_key='+this.data.apiKey)
      .then(function(response) {
        return response.json();
      })
      .then(function(json) {

        if (!json || !json.photos || !json.photos.photo) {
          console.log('Invalid JSON', json);
          throw 'Invalid JSON response';
        }

        var imageSources = processImageUrls(json.photos.photo);

        for (var i = 0; i < imageSources.length; i++) {
          var aImage = generateImage(imageSources[i]);
          self.images.push(aImage);
          el.appendChild(aImage);
        }

      })
      .catch(function (err) {
        console.error('Unable to fetch photos', err);
      });

  },

  remove: function() {
    this.images.forEach(function(imageEl) {
      this.el.remove(imageEl);
    });
  }
});
