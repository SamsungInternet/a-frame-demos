//button primitive
AFRAME.registerPrimitive('a-svrbutton', {
	defaultComponents: {
		geometry: {
			primitive:'box',
			height:1.5,
			depth:0.2,
			width:3.5
		},
		material: {
			opacity:1.0,
			transparent:true,
			side:'Double',
			color:'#987FFF'
		},
		'bmfont-text':{
			text:'button',
			color: 'white',
            align: 'left',
			width:500
		},
		btntweaks: {
			textposition: '0 0 0.5',
			textscale: '4 4 1',
			textoffset: 0.2
		}
	},
	mappings:{
		height:'geometry.height',
		width:'geometry.width',
		depth:'geometry.depth',
		color:'material.color',
		opacity:'material.opacity',
		text: 'bmfont-text.text',
		textoffset: 'btnTweaks.textoffset',
		textposition: 'btnTweaks.textposition',
		textscale: 'btnTweaks.textscale'
	}
});