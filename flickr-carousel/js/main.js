// To generate an API URL, visit: https://www.flickr.com/services/api/explore/flickr.photos.search
var API_URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=e0a100af1e50282bf685a422d5aa22c4&text=llama+farm&safe_search=&per_page=15&format=json&nojsoncallback=1';

var NUM_PHOTOS = 15;
var DEGS_TO_RADIANS = Math.PI / 180;
var CAROUSEL_ROTATE_RADIANS = 360 * DEGS_TO_RADIANS / NUM_PHOTOS;

var scene = document.getElementById('scene');
var assets = document.querySelector('a-assets');
var imageContainer = document.getElementById('imageContainer');

var currentRotationY = 18 * DEGS_TO_RADIANS;
var imageSrcArray = [];

var carouselTween;

function generateImage(id, src) {

  var imgEl = document.createElement('img');
  imgEl.id = 'img' + id;
  imgEl.crossOrigin = "anonymous";
  imgEl.setAttribute('src', src);

  assets.appendChild(imgEl);

  var aframeImageEl = document.createElement('a-image');
  aframeImageEl.setAttribute('src', '#img' + id);
  aframeImageEl.setAttribute('width', 1.25);
  aframeImageEl.setAttribute('height', 1);

  // Rotate the image to face the centre
  aframeImageEl.setAttribute('look-at', '0 0.75 0');

  imageContainer.appendChild(aframeImageEl);

}

function generateImages() {

  for (var i=0; i < imageSrcArray.length; i++) {
    generateImage(i, imageSrcArray[i]);
  }

  console.log('Generated images');

}

/**
 * For URL format details, see: https://www.flickr.com/services/api/misc.urls.html
 */
function processImageUrls(photos) {

  imageSrcArray = [];

  for (var i=0; i < photos.length; i++) {
    var photo = photos[i];
    // This would be neater as a template literal, but that needs support/transpilation/polyfilling
    var domain = 'https://farm'+photo.farm+'.staticflickr.com';
    var path = '/'+photo.server+'/';
    var filename = photo.id+'_'+photo.secret+'_z.jpg';
    imageSrcArray.push(domain + path + filename);
  }

  console.log('Processed URLs');

}

function animate(time) {
  if (carouselTween) {
    carouselTween.update(time);
  }
  requestAnimationFrame(animate);
}

function setupTween() {

  var targetRotation = currentRotationY + CAROUSEL_ROTATE_RADIANS;

  carouselTween = new AFRAME.TWEEN.Tween(imageContainer.object3D.rotation)
    .to({y: targetRotation}, 500)
    .onComplete(function() {
      currentRotationY = targetRotation;
    });
}

function setupAnimation() {

  scene.addEventListener('click', function () {
    setupTween();
    carouselTween.start();
  });

  requestAnimationFrame(animate);

}

function fetchImages() {

  fetch(API_URL)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      processImageUrls(json.photos.photo);
      generateImages();
    })
    .catch(function (err) {
      console.error('Unable to fetch photos', err);
    });

}

function init() {
  setupAnimation();
  fetchImages();
}

init();
