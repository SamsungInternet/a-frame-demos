var DEGS_TO_RADIANS = Math.PI / 180;

AFRAME.registerComponent('rotate-on-click', {
  schema: {
    degrees: {default: 90},
    duration: {default: 500}
  },
  init: function() {

    var self = this;

    this.el.addEventListener('click', function() {

      var targetRotation = self.el.object3D.rotation.y + self.data.degrees * DEGS_TO_RADIANS;

      new AFRAME.TWEEN.Tween(self.el.object3D.rotation)
        .to({y: targetRotation}, self.data.duration)
        .start();
    });
  }
});
