/**
 * Update textures to Baked ones and add envmap
 */

var textureLoader = new THREE.TextureLoader();
var cubeTextureLoader = new THREE.CubeTextureLoader();
var sceneEl = document.getElementsByTagName('a-scene')[0];
var scene = sceneEl.object3D;
var jsonEl = document.querySelector('[three-model]');

/**
 * Helper for picking objects from a scene
 * @param  {Object3d}    root    root Object3d e.g. a scene or a mesh
 * @param  {[String]} namesIn list of namesd to find e.g. 'Camera' or 'Floor'
 * @return {Object map}          map of names to objects {'Camera': (THREE.Camera with name Camera), 'Floor': (THREE.Mesh with name Floor)}
 */
function pickObjectsHelper(root, namesIn) {

	var collection = {};
	var names = new Set(namesIn);

	(function pickObjects(root) {
		if (root.children) {
			root.children.forEach(function (node) {
				if (names.has(node.name)) {
					collection[node.name] = node;
					names.delete(node.name);
				}
				if (names.size) {
					pickObjects(node);
				}
			});
		}
	})(root);

	if (names.size) {
		console.warn('Not all objects found: ' + names.values().next().value + ' missing');
	}

	return collection;
}

jsonEl.addEventListener('model-loaded', function () {
	// Select objects from the scene for later processing.
	var toTexture = pickObjectsHelper(scene, ['Room', 'Counter', 'Cake', 'Swirl.000', 'Swirl.001', 'Swirl.002', 'Swirl.003', 'Swirl.004', 'Swirl.005', 'Swirl.006', 'Swirl.007', 'Swirl.008', 'Swirl.009']);
	var toShiny = pickObjectsHelper(scene, ['LickTheWhisk', 'Whisk', 'SaucePan', 'SaucePan.001', 'SaucePan.002', 'SaucePan.003', 'Fridge']);
	Object.keys(toTexture).forEach(function (name) {
		textureLoader.load('/a-frame-demos/a-frame-assets/kitchen/' + name.split('.')[0] + 'Bake.png', function (map) {
			toTexture[name].material = new THREE.MeshBasicMaterial({map: map})
		});
	});

	var path = "/a-frame-demos/a-frame-assets/kitchen/envmap/";
	var format = '.png';
	var urls = [
		path + '0004' + format, // +x
		path + '0002' + format, // -x
		path + '0006' + format, // +y
		path + '0005' + format, // -y
		path + '0001' + format, // +z
		path + '0003' + format  // -z
	];
	cubeTextureLoader.load(urls, function (envMap) {
		var copper = new THREE.MeshPhongMaterial( { color: 0xff9999, specular: 0x772222, envMap: envMap, combine: THREE.MixOperation, reflectivity: 0.3, metal: true} );
		var aluminium = new THREE.MeshPhongMaterial( { color: 0x888888, specular: 0x999999, envMap: envMap, combine: THREE.MixOperation, reflectivity: 0.3, metal: true} );
		var chocolate = new THREE.MeshPhongMaterial( { color: toShiny.LickTheWhisk.material.color, specular: 0x999999, envMap: envMap, combine: THREE.MixOperation, reflectivity: 0.3, metal: true} );

		toShiny['SaucePan'].material = copper;
		toShiny['SaucePan.001'].material = copper;
		toShiny['SaucePan.002'].material = copper;
		toShiny['SaucePan.003'].material = copper;
		toShiny.Whisk.material = aluminium;
		toShiny.LickTheWhisk.material = chocolate;

		textureLoader.load('/a-frame-demos/a-frame-assets/kitchen/FridgeBake.png', function (map) {
			toShiny.Fridge.material = new THREE.MeshPhongMaterial({map:map, envMap:envMap, combine: THREE.MixOperation, specular: 0x999999, reflectivity: 0.3, metal: true, side: THREE.DoubleSide });
		});

	});

});