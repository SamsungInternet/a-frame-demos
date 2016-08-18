
var texturePromises = {};
function updateNormal(shader, data) {
	var el = shader.el;
	var material = shader.material;
	var src = data.normalMap;

	if (src) {
		if (src === shader.textureSrc) { return; }
		// Texture added or changed.
		shader.normalSrc = src;
		el.sceneEl.systems.material.loadTexture(src, {src: src}, setNormalMap);
		return;
	}

	// Texture removed.
	if (!material.map) { return; }
	setNormalMap(null);

	function setNormalMap(texture) {
		if (data.normalTextureWrap === 'repeat') {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping
		}
		if (data.normalTextureWrap === 'clamp') {
			texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
		}
		if (data.normalTextureWrap === 'mirrored') {
			texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
		}
		if (data.normalTextureOffset) {
			texture.offset = data.normalTextureOffset;
		}
		if (data.normalTextureRepeat) {
			texture.repeat = (new THREE.Vector2()).copy(data.normalTextureRepeat);
		}

		material.normalMap = texture;
		material.needsUpdate = true;
		AFRAME.utils.material.handleTextureEvents(el, texture);
	}

};

/**
 * Standard (physically-based) shader using THREE.MeshStandardMaterial.
 */
AFRAME.registerShader('super-standard', {
	schema: {
		color: {type: 'color'},
		envMap: {default: ''},
		sphericalEnvMap: {default: ''},
		normalMap: {default: ''},
		normalScale: { type: 'vec2' },
		normalTextureWrap: { default: 'repeat' }, // one of 'repeat', 'clamp', 'mirrored'
		normalTextureOffset: { type: 'vec2'},
		normalTextureRepeat: { type: 'vec2'},
		fog: {default: true},
		height: {default: 256},
		metalness: {default: 0.0, min: 0.0, max: 1.0},
		repeat: {default: ''},
		roughness: {default: 0.5, min: 0.0, max: 1.0},
		src: {default: ''},
		width: {default: 512}
	},

	/**
	 * Initializes the shader.
	 * Adds a reference from the scene to this entity as the camera.
	 */
	init: function (data) {
		this.material = new THREE.MeshStandardMaterial(getMaterialData(data));
		AFRAME.utils.material.updateMap(this, data);
		updateNormal(this, data);
		this.updateEnvMap(data);
	},

	update: function (data) {
		this.updateMaterial(data);
		AFRAME.utils.material.updateMap(this, data);
		updateNormal(this, data);
		this.updateEnvMap(data);
	},

	/**
	 * Updating existing material.
	 *
	 * @param {object} data - Material component data.
	 * @returns {object} Material.
	 */
	updateMaterial: function (data) {
		var material = this.material;
		data = getMaterialData(data);
		Object.keys(data).forEach(function (key) {
			material[key] = data[key];
		});
	},

	/**
	 * Handle environment cubemap. Textures are cached in texturePromises.
	 */
	updateEnvMap: function (data) {
		var self = this;
		var material = this.material;
		var envMap = data.envMap;
		var sphericalEnvMap = data.sphericalEnvMap;

		// No envMap defined or already loading.
		if ((!envMap && !sphericalEnvMap) || this.isLoadingEnvMap) {
			material.envMap = null;
			material.needsUpdate = true;
			return;
		}
		this.isLoadingEnvMap = true;

		if (sphericalEnvMap) {
			this.el.sceneEl.systems.material.loadTexture(sphericalEnvMap, { src: sphericalEnvMap }, function (texture) {
				self.isLoadingEnvMap = false;
				texture.mapping = THREE.SphericalReflectionMapping;
				material.envMap = texture;
				material.needsUpdate = true;
			});
			return;
		}

		// Another material is already loading this texture. Wait on promise.
		if (texturePromises[envMap]) {
			texturePromises[envMap].then(function (cube) {
				self.isLoadingEnvMap = false;
				material.envMap = cube;
				material.needsUpdate = true;
			});
			return;
		}

		// Material is first to load this texture. Load and resolve texture.
		texturePromises[envMap] = new Promise(function (resolve) {
			utils.srcLoader.validateCubemapSrc(envMap, function loadEnvMap (urls) {
				CubeLoader.load(urls, function (cube) {
					// Texture loaded.
					self.isLoadingEnvMap = false;
					material.envMap = cube;
					resolve(cube);
				});
			});
		});
	}
});

/**
 * Builds and normalize material data, normalizing stuff along the way.
 *
 * @param {object} data - Material data.
 * @returns {object} data - Processed material data.
 */
function getMaterialData (data) {
	return {
		color: new THREE.Color(data.color),
		fog: data.fog,
		metalness: data.metalness,
		roughness: data.roughness
	};
}

AFRAME.registerComponent('wobble-normal', {
	schema: {},
	tick: function (t) {
		this.el.components.material.material.normalMap.offset.x += 0.0001 * Math.sin(t/10000);
		this.el.components.material.material.normalMap.offset.y += 0.0001 * Math.cos(t/8000);
		this.el.components.material.material.normalScale.x = 0.5 + 0.5 * Math.cos(t/1000);
		this.el.components.material.material.normalScale.x = 0.5 + 0.5 * Math.sin(t/1200);
	}
})

AFRAME.registerPrimitive('a-ocean-plane', {
	defaultComponents: {
		geometry: {
			primitive: 'plane',
			height: 10000,
			width: 10000
		},
		rotation: '-90 0 0',
		material: {
			shader: 'super-standard',
			color: '#8ab39f',
			metalness: 1,
			roughness: 0.2,
			normalTextureRepeat: '50 50',
			normalTextureOffset: '0 0',
			normalScale: '0.5 0.5',
			opacity: 0.8
		},
		'wobble-normal': {}
	},
});