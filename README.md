# Samsung Internet A-Frame Demos

## Set up

The demos are collected together as a Jekyll site. To get it up and running...

### Linux

```bash
sudo apt-get install bundler zlib1g-dev libxml2-dev nodejs
bundle install
bundle exec jekyll serve
```

### Mac

```bash
gem install bundler
bundle install
jekyll serve
```

If you get an error "Failed to build gem native extension", you may need to set the bundler
to install under a different path and use this instead. See: [github.com/bundler/bundler/issues/4065](https://github.com/bundler/bundler/issues/4065)
  

### Windows

*Instructions coming soon*

Then you can view the site at the URL shown in the console (http://127.0.0.1:4000/a-frame-demos/).

## Net Magazine tutorial

If you are here for our Net Magazine Flickr carousel tutorial, you can find the code under
[flickr-carousel](flickr-carousel), or for a standalone version outside of the Jekyll site, see: 
[github.com/poshaughnessy/aframe-flickr-carousel/](https://github.com/poshaughnessy/aframe-flickr-carousel/).
