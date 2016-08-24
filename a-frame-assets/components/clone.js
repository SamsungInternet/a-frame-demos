AFRAME.registerComponent('clone', {
	schema: {
		type: 'selector'
	},

	init: function () {
		var cloneGeom = this.data.object3D.clone(true);
		cloneGeom.visible = true;
		this.el.setObject3D('clone', cloneGeom);
	}
});
