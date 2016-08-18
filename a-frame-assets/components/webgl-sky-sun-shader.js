/**
 * Based on https://github.com/brianchirls/three.js/blob/master/examples/webgl_shaders_sky.html
 * Requires:
 *
 *	https://cdn.rawgit.com/mrdoob/three.js/blob/r77/examples/js/SkyShader.js
 *
 */

// <a-webgl-sky control="#sun" inclination="0.49"></a-webgl-sky>

var distance = 450000;

AFRAME.registerComponent('webgl-sky', {

	schema: {
		turbidity: { default: 10 },
		reileigh: { default: 2 },
		mieCoefficient: { default: 0.005 },
		mieDirectionalG: { default: 0.8 },
		luminance: { default: 1 },
		inclination: { default: 0.49 }, // elevation / inclination
		azimuth: { default: 0.25 }, // Facing front,
		sun: { default: true },
		control: { type: 'selector' }
	},

	init: function () {

		// Add Sky Mesh
		this.sky = new THREE.Sky();

		// Add Sun Helper
		this.sunSphere = new THREE.Mesh(
			new THREE.SphereBufferGeometry( 30000, 16, 8 ),
			new THREE.MeshBasicMaterial( { color: 0xffffff } )
		);

		this.sunSphere.visible = false;

		this.sky.mesh.add(this.sunSphere);
		this.sky.mesh.scale.multiplyScalar(0.01);
		this.el.setObject3D('mesh', this.sky.mesh);
	},

	play: function () {
		if (this.data.control && this.data.control.object3D) {
			this.data.control.object3D.position.copy(this.sunSphere.position);
		}
	},

	getSunSphere: function () {
		return this.sunSphere;
	},

	update: function () {

		var uniforms = this.sky.uniforms;
		uniforms.turbidity.value = this.data.turbidity;
		uniforms.reileigh.value = this.data.reileigh;
		uniforms.luminance.value = this.data.luminance;
		uniforms.mieCoefficient.value = this.data.mieCoefficient;
		uniforms.mieDirectionalG.value = this.data.mieDirectionalG;

		var theta = Math.PI * ( this.data.inclination - 0.5 );
		var phi = 2 * Math.PI * ( this.data.azimuth - 0.5 );

		this.sunSphere.position.x = distance * Math.cos( phi );
		this.sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
		this.sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

		this.sunSphere.visible = this.data.sun;

		this.sky.uniforms.sunPosition.value.copy(this.sunSphere.position);

		if (this.data.control && this.data.control.object3D) {
			this.data.control.object3D.position.copy(this.sunSphere.position);
		}
	},

	remove: function () {
		this.sky.remove();
		this.sky = undefined;
	}
});

AFRAME.registerPrimitive('a-webgl-sky', {
	defaultComponents: {
		'webgl-sky': {}
	},
	mappings: {
		turbidity: 'webgl-sky.turbidity',
		reileigh: 'webgl-sky.reileigh',
		mieCoefficient: 'webgl-sky.mieCoefficient',
		mieDirectionalG: 'webgl-sky.mieDirectionalG',
		luminance: 'webgl-sky.luminance',
		inclination: 'webgl-sky.inclination',
		azimuth: 'webgl-sky.azimuth',
		sun: 'webgl-sky.sun',
		control: 'webgl-sky.control'
	}
});