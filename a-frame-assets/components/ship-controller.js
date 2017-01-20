// Based on https://github.com/aframevr/aframe/blob/master/src/components/wasd-controls.js
// it controls the ship with wasd, head tilting and mouse clicks

var shouldCaptureKeyEvent = AFRAME.utils.shouldCaptureKeyEvent;

var MAX_DELTA = 0.2;

/**
 * WASD component to control entities using WASD keys.
 */
AFRAME.registerComponent('ship-controller', {
	schema: {
		easing: { default: 10 },
		rollEasing: { default: 1 },
		acceleration: { default: 250 },
		rollAcceleration: { default: 50 },
		rollTarget: { type: 'selector' },
		turnTarget: { type: 'selector' },
	},

	init: function () {
		this.velocity = new THREE.Vector3();
		// To keep track of the pressed keys
		this.keys = {};
		this.onBlur = this.onBlur.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onVisibilityChange = this.onVisibilityChange.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this.attachVisibilityEventListeners();
		this.roll = 0;
	},

	update: function (previousData) {

		var data = this.data;
		var acceleration = data.acceleration;
		var easing = data.easing;
		var velocity = this.velocity;
		var prevTime = this.prevTime = this.prevTime || Date.now();
		var time = window.performance.now();
		var delta = (time - prevTime) / 1000;
		this.prevTime = time;
		var keys = this.keys;
		var movementVector;
		var el = this.el;

		// If data changed or FPS too low, reset velocity.
		if (previousData || delta > MAX_DELTA) {
			velocity.x = 0;
			velocity.z = 0;
			return;
		}

		var position = el.getAttribute('position');
		var rotation = (this.data.turnTarget || el).getAttribute('rotation');

		this.roll -= this.el.sceneEl.camera.el.getAttribute('rotation').z * (Math.PI/180) * delta * this.data.rollAcceleration;
		rotation.y += this.roll * this.data.rollEasing * delta * -velocity.z * 0.1;
		this.roll -= this.roll * this.data.rollEasing * delta;
		velocity.x -= velocity.x * easing * delta;
		velocity.z -= velocity.z * easing * delta;

		if (this.data.rollTarget) {
			var rollTargetRotation = this.data.rollTarget.getAttribute('rotation');
			rollTargetRotation.z = this.roll;
			this.data.rollTarget.setAttribute('rotation', rollTargetRotation);
		} else {
			rotation.z = this.roll;
		}

		if (keys[65] || keys[37]) { this.roll -= this.data.rollAcceleration * delta; } // Left
		if (keys[68] || keys[39]) { this.roll += this.data.rollAcceleration * delta; } // Right
		if (keys[87] || keys[38] || keys['touch']) { velocity.z += acceleration * delta; } // Up
		if (keys[83] || keys[40]) { velocity.z -= acceleration * delta; } // Down

		movementVector = this.getMovementVector(delta);
		el.object3D.translateX(movementVector.x);
		el.object3D.translateY(movementVector.y);
		el.object3D.translateZ(movementVector.z);

		el.setAttribute('position', {
			x: position.x + movementVector.x,
			y: position.y + movementVector.y,
			z: position.z + movementVector.z
		});

		(this.data.turnTarget || el).setAttribute('rotation', rotation);
	},

	play: function () {
		this.attachKeyEventListeners();
	},

	pause: function () {
		this.keys = {};
		this.removeKeyEventListeners();
	},

	tick: function (t) {
		this.update();
	},

	remove: function () {
		this.pause();
		this.removeVisibilityEventListeners();
	},

	attachVisibilityEventListeners: function () {
		window.addEventListener('blur', this.onBlur);
		window.addEventListener('focus', this.onFocus);
		document.addEventListener('visibilitychange', this.onVisibilityChange);
	},

	removeVisibilityEventListeners: function () {
		window.removeEventListener('blur', this.onBlur);
		window.removeEventListener('focus', this.onFocus);
		document.removeEventListener('visibilitychange', this.onVisibilityChange);
	},

	attachKeyEventListeners: function () {
		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);

		this.el.sceneEl.addEventListener("touchstart", this.handleTouchStart.bind(this), false);
		this.el.sceneEl.addEventListener("touchend", this.handleTouchEnd.bind(this), false);
		this.el.sceneEl.addEventListener("touchcancel", this.handleTouchCancel.bind(this), false);

		this.el.sceneEl.addEventListener("mousedown", this.handleTouchStart.bind(this), false);
		this.el.sceneEl.addEventListener("mouseup", this.handleTouchEnd.bind(this), false);
		this.el.sceneEl.addEventListener("mouseleave", this.handleTouchCancel.bind(this), false);
	},

	removeKeyEventListeners: function () {
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);

		this.el.sceneEl.addEventListener("touchstart", this.handleTouchStart.bind(this), false);
		this.el.sceneEl.addEventListener("touchend", this.handleTouchEnd.bind(this), false);
		this.el.sceneEl.addEventListener("touchcancel", this.handleTouchCancel.bind(this), false);

		this.el.sceneEl.addEventListener("mousedown", this.handleTouchStart.bind(this), false);
		this.el.sceneEl.addEventListener("mouseup", this.handleTouchEnd.bind(this), false);
		this.el.sceneEl.addEventListener("mouseleave", this.handleTouchCancel.bind(this), false);
	},

	onBlur: function () {
		this.pause();
	},

	onFocus: function () {
		this.play();
	},

	onVisibilityChange: function () {
		if (document.hidden) {
			this.onBlur();
		} else {
			this.onFocus();
		}
	},

	onKeyDown: function (event) {
		if (!shouldCaptureKeyEvent(event)) { return; }
		this.keys[event.keyCode] = true;
	},

	onKeyUp: function (event) {
		if (!shouldCaptureKeyEvent(event)) { return; }
		this.keys[event.keyCode] = false;
	},

	handleTouchStart: function (e) {
		if (e.target.tagName !== "BUTTON") {
			e.preventDefault();
			this.keys['touch'] = true;
		}
	},

	handleTouchCancel: function (e) {
		if (e.target.tagName !== "BUTTON") {
			e.preventDefault();
			this.keys['touch'] = false;
		}
	},

	handleTouchEnd: function (e) {
		if (e.target.tagName !== "BUTTON") {
			e.preventDefault();
			this.keys['touch'] = false;
		}
	},

	getMovementVector: (function (delta) {
		var direction = new THREE.Vector3(0, 0, 0);
		var rotation = new THREE.Euler(0, 0, 0, 'YXZ');
		return function (delta) {
			var velocity = this.velocity;
			var elRotation = (this.data.turnTarget || el).getAttribute('rotation');
			direction.copy(velocity);
			direction.multiplyScalar(delta);
			if (!elRotation) { return direction; }
			if (!this.data.fly) { elRotation.x = 0; }
			rotation.set(THREE.Math.degToRad(elRotation.x), THREE.Math.degToRad(elRotation.y), 0);
			direction.applyEuler(rotation);
			return direction;
		};
	})()
});
