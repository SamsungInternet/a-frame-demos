AFRAME.registerPrimitive('a-flickr-carousel', {
  defaultComponents: {
    'flickr-search': {
      search: '',
      apiKey: '',
      numResults: 15
    },
    'rotate-on-click': {
      degrees: 24
    },
    'layout': {
      type: 'circle'
    }
  },
  mappings: {
    search: 'flickr-search.search',
    'num-results': 'flickr-search.numResults',
    'api-key': 'flickr-search.apiKey',
    degrees: 'rotate-on-click.degrees',
    duration: 'rotate-on-click.duration',
    radius: 'layout.radius'
  }
});
