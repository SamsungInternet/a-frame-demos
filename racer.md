---
layout: a-frame
title: A-Frame Racer
description: A-Frame Demo
image: https://samsunginternet.github.io/a-frame-demos/icon512-racer.png
meta: racer
scripts: [

	'scripts/init-service-worker.js',

	'https://cdn.rawgit.com/aframevr/aframe/v0.3.0/dist/aframe.min.js', # A-Frame 0.3

	'https://cdn.rawgit.com/ngokevin/aframe-look-at-component/master/dist/aframe-look-at-component.min.js', # look at component

	'a-frame-assets/components/follow.js',
	'a-frame-assets/components/ship-controller.js',
	'a-frame-assets/components/curve.js',
	'a-frame-assets/components/super-standard-material.js'
]
---


<a-scene inspector stats physics="debug: true">

	<!-- Assets -->

	<a-assets>
		<a-asset-item id="Feisar-ship-obj" src="a-frame-assets/Feisar_Ship_OBJ/Feisar_Ship.obj"></a-asset-item>
		<a-asset-item id="Feisar-ship-mtl" src="a-frame-assets/Feisar_Ship_OBJ/Feisar_Ship.mtl"></a-asset-item>

		<a-asset-item id="race-track-obj" src="a-frame-assets/race-track/race-track.obj"></a-asset-item>
		<a-asset-item id="race-track-mtl" src="a-frame-assets/race-track/race-track.mtl"></a-asset-item>

		<img id="water-normal" src="https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg" crossorigin="anonymous" />

		<!-- Sky is free sample sky from cgskies, buy one for commecial use -->
		<img id="cgsky" src="a-frame-assets/sky/CGSkies_0347_free.jpg" crossorigin="anonymous" />
	</a-assets>

	<!-- CAMERA -->

	<a-entity look-at="#ship" follow="target: #ship-camera-target;">
		<a-entity position="0 2 0" rotation="0 180 0">

			<!-- Disable the default wasd controls we are using those to control the ship -->
			<a-camera wasd-controls="enabled: false;"></a-camera>
		</a-entity>
	</a-entity>


	<!-- this is moved by the controller, it's rotation is set to the normal of ther service it is on' -->
	<a-entity ship-controller="easing: 2; acceleration: 40; rollTarget: #ship; turnTarget: #controller-target;">

		<!-- This is rotated by the controller -->
		<a-entity id="controller-target" rotation="0 -90 0">
			<a-entity	id="ship-camera-target" position="0 0 -8"></a-entity>

			<!-- this rolled by the controller -->
			<a-obj-model src="#Feisar-ship-obj" mtl="#Feisar-ship-mtl" position="0 0.2 0" scale="0.3 0.3 0.3" rotation id="ship">
				<!--<a-torus-knot position="0 4 -5" material="shader: super-standard; sphericalEnvMap: #cgsky; color: #8ab39f; normalMap: #water-normal; metalness: 1; roughness: 0.2; normalTextureRepeat: 50 50 50; opacity: 0.8;"></a-torus-knot>-->
			</a-obj-model>
		</a-entity>
	</a-entity>

	<!-- ENVIRONMENT -->

	<a-sky src="#cgsky" position="0 -1 0" rotation="0 -90 0"></a-sky>
	<a-entity light="color: #4c7cc2; intensity: 0.4; type: ambient;"></a-entity>
	<a-entity light="color: #fffab7; intensity: 1.5" position="0 1 -5" id="sun"></a-entity>
	<a-ocean-plane material="normalMap: #water-normal; sphericalEnvMap: #cgsky;"></a-ocean-plane>

	<!-- TRACK -->

	<a-curve id="track1" curve="CatmullRom">
		<a-curve-point position="30 -10 0"></a-curve-point>
		<a-curve-point position="0 0 0"></a-curve-point>
		<a-curve-point position="-60 4 30"></a-curve-point>
		<a-curve-point position="-60 10 60"></a-curve-point>
		<a-curve-point position="-60 10 120"></a-curve-point>
		<a-curve-point position="-60 30 180"></a-curve-point>
	</a-curve>

	<a-curve id="track2" curve="CatmullRom">
		<a-curve-point position="-60 10 180"></a-curve-point>
		<a-curve-point position="-60 10 260"></a-curve-point>
		<a-curve-point position="0 10 280"></a-curve-point>
	</a-curve>

	<!--<a-draw-curve curve="#track" material="shader: line; color: red;"></a-draw-curve>-->

	<a-entity floor-track clone-along-curve="curve: #track1; spacing: 6; scale: 1.5 1 2;" obj-model="obj: #race-track-obj; mtl: #race-track-mtl;"></a-entity>

	<a-entity floor-track clone-along-curve="curve: #track2; spacing: 6; scale: 1.5 1 2;" obj-model="obj: #race-track-obj; mtl: #race-track-mtl;"></a-entity>

</a-scene>

<script>

	function getCurveFromTrack(a) { return a.components['clone-along-curve'].data.curve.components.curve; }

	var shipControllerEl = document.querySelector('[ship-controller]');
	var curves = Array.from(document.querySelectorAll('[floor-track]'));
	var gravity = 60;
	var __tempVector1 = new THREE.Vector3();
	var __tempVector2 = new THREE.Vector3();
	var yAxis = new THREE.Vector3(0, 1, 0);
	var __tempQuaternion = new THREE.Quaternion();
	var shipReturnTimeout;

	var currentFloor = {
		height: 0,
		normal: new THREE.Vector3(),
		lastPoint: new THREE.Vector3(),
		lastTangent: new THREE.Vector3()
	}

	function returnShip() {
		shipControllerEl.setAttribute('position', currentFloor.lastPoint);
		shipControllerEl.components['ship-controller'].velocity.set(0, 0, 0);
		shipReturnTimeout = null;
	}

	function updateCurrentFloor(p) {
		currentFloor.height = 0;
		currentFloor.normal.copy(yAxis);
		var isOnTrack = false;
		for (var i in curves) {
			var d = getCurveFromTrack(curves[i]).closestPointInLocalSpace(p);
			if (d.distance < 6) {
				isOnTrack = true;
				if (d.location.y > currentFloor.height) {
					currentFloor.height = d.location.y;
					currentFloor.normal.copy(d.normal);
					currentFloor.lastPoint.copy(d.location);
					currentFloor.lastTangent.copy(d.tangent);
				}
			}
		}
		if(!isOnTrack) {
			if (!shipReturnTimeout) shipReturnTimeout = setTimeout(returnShip, 3000);
		} else {
			if (shipReturnTimeout) {
				clearTimeout(shipReturnTimeout);
				shipReturnTimeout = null;
			}
		}
	}

	AFRAME.registerSystem('custom-fuzzy-physics', {
		init: function () {
			this.restoreNormalAmount = 0.01;
		},
		tick: function () {
			var output = output || document.querySelector('.rs-container *');
			var prevTime = this.prevTime = this.prevTime || Date.now();
			var time = window.performance.now();
			var delta = (time - prevTime) / 1000;
			this.prevTime = time;
			var shipController = shipControllerEl.components['ship-controller'];
			var p = shipControllerEl.getComputedAttribute('position');
			updateCurrentFloor(p);

			if (p.y > currentFloor.height + 0.5) {
				shipController.velocity.y -= gravity * delta;
			}

			// Smoothly rotate the ship to the current floor normal
			__tempQuaternion.setFromUnitVectors(yAxis, currentFloor.normal);
			shipControllerEl.object3D.quaternion.slerp(__tempQuaternion, this.restoreNormalAmount);
			this.restoreNormalAmount *= 0.8;

			output.textContent = `${currentFloor.height}`;

			if (p.y < currentFloor.height) {
				var underground = currentFloor.height - p.y;

				this.restoreNormalAmount = 0.3;

				__tempVector1.copy(shipController.velocity);

				__tempVector1.add(currentFloor.normal.multiplyScalar(
					Math.max(-currentFloor.normal.dot(shipController.velocity), 0.01)
				));

				if (underground > 2) {
					p.y = currentFloor.height;
					shipControllerEl.setAttribute('position', p);
				}

				shipController.velocity.copy(__tempVector1);
			}
		}
	});
</script>