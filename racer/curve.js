
/* For dealing with spline curves */

var __tempVector1 = new THREE.Vector3();
var __tempVector2 = new THREE.Vector3();
var up = new THREE.Vector3(0, 1, 0);
var zAxis = new THREE.Vector3(0, 0, 1);
var degToRad = THREE.Math.degToRad;

AFRAME.registerComponent('curve-point', {

	dependencies: ['position'],

	schema: {
		position: {type: 'vec3', default: '0 0 0'}
	},

	init: function () {
		var el = this.el;
		while (el && !el.matches('[curve]')) el = el.parentNode;
		this.parentCurve = el;
	},

	update: function () {
		this.el.object3D.position.copy(this.data.position);
		this.parentCurve.updateComponent('curve');
	},

	remove: function () {
		this.update();
	}

});

AFRAME.registerComponent('curve', {

	schema: {

		// CatmullRom
		// Spline
		// CubicBezier
		// QuadraticBezier
		// Line
		type: {
			default: 'CatmullRom'
		}
	},

	update: function () {
		this.needsUpdate = true;
	},

	tick: function () {
		if (!this.needsUpdate) return;
		this.needsUpdate = false;
		this.threeConstructor = THREE[this.data.type + 'Curve3'];

		var points = Array.from(this.el.querySelectorAll('a-curve-point')).filter(function (a) { return a.tagName === 'A-CURVE-POINT' });

		if (points.length <= 1) return;

		this.points = points.map(function (a) {
			if (a.x !== undefined && a.y !== undefined && a.z !== undefined) {
				return a;
			}

			// flush position information to object 3D

			a.updateComponent('position');
			return a.object3D.getWorldPosition()
		});

		// apply the points as ags to the Beziers
		if (this.data.type.match(/QuadraticBezier|CubicBezier|Line/)) {
			this.curve = (Function.prototype.bind.apply(this.threeConstructor, this.points));
		} else {
			if (!this.threeConstructor) {
				this.pause();
				throw ('No Three constructor of type (case sensitive): ' + this.data.type + 'Curve3');
			}
			this.curve = new this.threeConstructor(this.points);
		}

		this.el.emit('curve-updated');

		this.ready = true;
	},

	remove: function () {
		this.curve = null;
		this.points = null;
		this.ready = false;
	},

	closestPointInLocalSpace: function closestPoint(point, resolution, testPoint, currentRes) {
		if (!this.ready) throw Error('Curve not instantiated yet.');
		resolution = resolution || 0.1 / this.curve.getLength();
		currentRes = currentRes || 0.5;
		testPoint = testPoint || 0.5;
		currentRes /= 2;
		var aTest = testPoint + currentRes;
		var bTest = testPoint - currentRes;
		var a = this.curve.getPointAt(aTest);
		var b = this.curve.getPointAt(bTest);
		var aDistance = a.distanceTo(point);
		var bDistance = b.distanceTo(point);
		var aSmaller = aDistance < bDistance;
		if (currentRes < resolution) {

			var tangent = this.curve.getTangentAt(aSmaller ? aTest : bTest);
			if (currentRes < resolution) return {
				result: aSmaller ? aTest : bTest,
				location: aSmaller ? a : b,
				distance: aSmaller ? aDistance : bDistance,
				normal: normalFromTangent(tangent),
				tangent: tangent
			};
		}
		if (aDistance < bDistance) {
			return this.closestPointInLocalSpace(point, resolution, aTest, currentRes);
		} else {
			return this.closestPointInLocalSpace(point, resolution, bTest, currentRes);
		}
	}
});


var tempQuaternion = new THREE.Quaternion();
function normalFromTangent(tangent) {
	var lineEnd = new THREE.Vector3(0, 1, 0);
	tempQuaternion.setFromUnitVectors(zAxis, tangent);
	lineEnd.applyQuaternion(tempQuaternion);
	return lineEnd;
}

AFRAME.registerShader('line', {
	schema: {},

	init: function (data) {
		this.material = new THREE.LineBasicMaterial(data);
	}
});

AFRAME.registerComponent('draw-curve', {

	dependencies: ['curve', 'material	'],

	schema: {
		curve: { type: 'selector' },
		spacing: { default: 1 },
		tangent: { default: false },
		normal: { default: true }
	},

	init: function () {
		this.data.curve.addEventListener('curve-updated', this.update.bind(this));
	},

	update: function () {
		if (this.data.curve) {
			this.curve = this.data.curve.components.curve;
		} else if (this.components.curve.curve) {
			this.curve = this.components.curve;
		}

		if (this.curve.curve) {

			var length = this.curve.curve.getLength();
			var start = 0;
			var end = length;

			var counter = start
			var tangent;
			var line;
			var lineEnd;
			var tangentGeometry;
			var normalGeometry;
			var mesh = this.el.getOrCreateObject3D('mesh', THREE.Line);
			var geometry = mesh.geometry = new THREE.Geometry();

			while (counter < end) {
				var p = this.curve.curve.getPointAt(counter / length);
				geometry.vertices.push(p);

				if (this.data.tangent) {
					tangentGeometry = new THREE.Geometry();

					lineEnd = new THREE.Vector3();
					lineEnd.copy(p);
					lineEnd.add(this.curve.curve.getTangentAt(counter / length).normalize().multiplyScalar(5));

					tangentGeometry.vertices.push(new THREE.Vector3().copy(p));
					tangentGeometry.vertices.push(lineEnd);

					line = new THREE.Line(
						tangentGeometry,
						new THREE.LineBasicMaterial({
							color: 'green'
						})
					);

					mesh.add(line);
				}

				if (this.data.normal) {
					normalGeometry = new THREE.Geometry();
					lineEnd = normalFromTangent(this.curve.curve.getTangentAt(counter / length).normalize());
					lineEnd.add(p);

					normalGeometry.vertices.push(new THREE.Vector3().copy(p));
					normalGeometry.vertices.push(lineEnd);

					line = new THREE.Line(
						normalGeometry,
						new THREE.LineBasicMaterial({
							color: 'white'
						})
					);

					mesh.add(line);
				}

				counter += this.data.spacing;
			}
		}
	},

	remove: function () {

		this.el.getObject3D('mesh').geometry = new THREE.Geometry();
	}

});

AFRAME.registerComponent('clone-along-curve', {

	dependencies: ['curve'],

	schema: {
		curve: { type: 'selector' },
		spacing: { default: 1 },
		rotation: {
			type: 'vec3',
			default: '0 0 0'
		},
		scale: {
			type: 'vec3',
			default: '1 1 1'
		}
	},

	init: function () {
		this.el.addEventListener('model-loaded', this.update.bind(this));
		this.data.curve.addEventListener('curve-updated', this.update.bind(this));
	},

	update: function () {
		this.remove();
		if (this.data.curve) {
			this.curve = this.data.curve.components.curve;
		} else if (this.components.curve.curve) {
			this.curve = this.components.curve;
		}
	},

	tick: function () {
		if (!this.el.getObject3D('clones') && this.curve) {

			var mesh = this.el.getObject3D('mesh');


			var length = this.curve.curve.getLength();
			var start = 0;
			var end = length;
			var counter = start;

			var cloneMesh = this.el.getOrCreateObject3D('clones', THREE.Group);

			var parent = new THREE.Object3D();
			mesh.scale.set(this.data.scale.x, this.data.scale.y, this.data.scale.z);
			mesh.rotation.set(degToRad(this.data.rotation.x), degToRad(this.data.rotation.y), degToRad(this.data.rotation.z));
			mesh.rotation.order = 'YXZ';

			parent.add(mesh);

			while (counter < end) {

				var child = parent.clone(true);

				child.position.copy( this.curve.curve.getPointAt(counter/length) );

				tangent = this.curve.curve.getTangentAt(counter/length).normalize();

				child.quaternion.setFromUnitVectors(zAxis, tangent);

				cloneMesh.add(child);

				counter += this.data.spacing;
			}
		}
	},

	remove: function () {
		this.curve = null;
		this.el.removeObject3D('clones');
	}

});

AFRAME.registerPrimitive('a-draw-curve', {
	defaultComponents: {
		'draw-curve': {},
		'material': {}
	},
	mappings: {
		curve: 'draw-curve.curve',
		material: 'material'
	}
});

AFRAME.registerPrimitive('a-curve-point', {
	defaultComponents: {
		'curve-point': {
			position: '0 0 0'
		}
	},
	mappings: {
		position: 'curve-point.position'
	}
});


AFRAME.registerPrimitive('a-curve', {

	defaultComponents: {
		'curve': {}
	},

	mappings: {
		curve: 'curve',
	}

});
