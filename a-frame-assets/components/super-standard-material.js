
var texturePromises = {};
function updateDistortionMap(type, shader, data) {
	var el = shader.el;
	var material = shader.material;
	var src = data[type + 'Map'];
	var info = {};
	info[type + 'Map'] = src;

	if (src) {
		if (src === shader.textureSrc) { return; }
		// Texture added or changed.
		shader[type + 'Src'] = src;
		el.sceneEl.systems.material.loadTexture(src, info, setMap);
		return;
	}

	// Texture removed.
	if (!material.map) { return; }
	setMap(null);

	function setMap(texture) {

		if (data[type + 'TextureWrap'] === 'repeat') {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		} else if (data[type + 'TextureWrap'] === 'clamp') {
			texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
		} else if (data[type + 'TextureWrap'] === 'mirrored') {
			texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
		} else {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		}

		texture.offset = data[type + 'TextureOffset'];
		texture.repeat = (new THREE.Vector2()).copy(data[type + 'TextureRepeat']);

		material[type + 'Map'] = texture;
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
		sphericalEnvMap: { default: '' },

		normalMap: {default: ''},
		normalScale: { type: 'vec2', default: '1 1' },
		normalTextureWrap: { default: 'repeat' }, // one of 'repeat', 'clamp', 'mirrored'
		normalTextureOffset: { type: 'vec2'},
		normalTextureRepeat: { type: 'vec2', default: '1 1' },

		displacementMap: {default: ''},
		displacementScale: {default: 1},
		displacementBias: {default: 1},
		displacementTextureWrap: { default: 'repeat' }, // one of 'repeat', 'clamp', 'mirrored'
		displacementTextureOffset: { type: 'vec2'},
		displacementTextureRepeat: { type: 'vec2', default: '1 1' },

		aoMap: {default: ''},
		aoMapIntensity: {default: 1},
		aoTextureWrap: { default: 'repeat' }, // one of 'repeat', 'clamp', 'mirrored'
		aoTextureOffset: { type: 'vec2'},
		aoTextureRepeat: { type: 'vec2', default: '1 1' },

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
		if (data.normalMap) updateDistortionMap('normal', this, data);
		if (data.displacementMap) updateDistortionMap('displacement', this, data);
		if (data.aoMap) updateDistortionMap('ao', this, data);
		this.updateEnvMap(data);
	},

	update: function (data) {
		this.updateMaterial(data);
		AFRAME.utils.material.updateMap(this, data);
		if (data.normalMap) updateDistortionMap('normal', this, data);
		if (data.displacementMap) updateDistortionMap('displacement', this, data);
		if (data.aoMap) updateDistortionMap('ao', this, data);
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
	var newData = {
		color: new THREE.Color(data.color),
		fog: data.fog,
		metalness: data.metalness,
		roughness: data.roughness
	};

	if (data.normalMap) {
		newData.normalScale = data.normalScale;
	}

	if (data.aoMap) {
		newData.aoMapIntensity = data.aoMapIntensity;
	}

	if (data.displacementMap) {
		newData.displacementScale = data.displacementScale;
		newData.displacementBias = data.displacementBias;
	}

	return newData;
}
