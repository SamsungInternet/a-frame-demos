//text area primitive
AFRAME.registerPrimitive('a-svrtextarea', {
	defaultComponents: {
		geometry: {
			primitive: 'plane',
			height: 3,
			width: 4
		},
		material: {
			opacity: 0,
			transparent: true
		},
		'bmfont-text':{
			text: '',
			color: 'white',
      align: 'left',
			width: 500
		},
		btntweaks: {
			textposition: '0 0 0.5',
			textscale: '4 4 1',
			textoffset: 0.2
		}
	},
	mappings:{
		height: 'geometry.height',
		width: 'geometry.width',
		color: 'material.color',
		opacity: 'material.opacity',
		text: 'bmfont-text.text',
		textoffset: 'btnTweaks.textoffset',
		textposition: 'btnTweaks.textposition',
		textscale: 'btnTweaks.textscale'
	}
});