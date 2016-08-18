
/* Follows an object around (don't need to be in same space) */

var __tempVector1 = new THREE.Vector3();
var __tempVector2 = new THREE.Vector3();

AFRAME.registerComponent('follow', {

	schema: {
		strength: { default: 0.03 },
		target: { type: 'selector' }
	},

	tick: function () {
		var usPos = __tempVector1;
		this.el.object3D.getWorldPosition(usPos);
		var targetPos = __tempVector2;
		this.data.target.object3D.getWorldPosition(targetPos);

		targetPos.sub(usPos).multiplyScalar(this.data.strength).add(this.el.object3D.position);

		this.el.setAttribute('position', targetPos);
	}
});