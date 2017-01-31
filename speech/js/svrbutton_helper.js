//svrbutton helper
AFRAME.registerComponent('btntweaks', {
	schema: {
		textposition: {
			type: 'vec3',
			default:'0, 0, 0.5'
		},
		textscale:{
			type:'vec3',
			default: '4, 4, 1'
		},
		textoffset:{
			type:'number',
			default:0.2
		}
	},
	tick: function () {
		if (
			!this.text ||
			this.text !== this.el.getObject3D('bmfont-text')
		) {
			this.text = this.el.getObject3D('bmfont-text');
			if (this.text) {

				this.text.position.copy(this.data.textposition);
				this.text.scale.multiply(this.data.textscale);
				
				this.el.object3D.children[0].geometry.computeBoundingBox();
				var text_bbox = this.el.object3D.children[0].geometry.boundingBox;
				var distCenter = (text_bbox['max'].x - text_bbox['min'].x)/2;
				this.text.translateX(distCenter + this.data.textoffset);
			}
		}
	}
});