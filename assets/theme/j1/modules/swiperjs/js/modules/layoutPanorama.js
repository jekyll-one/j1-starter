/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/swiper/js/modules/layoutPanorama.js
 # J1 Module for SwiperJS v11 (layout)
 # -----------------------------------------------------------------------------
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2025 Juergen Adams
 #
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
"use strict";
function LayoutPanorama(_ref) {
  var {
    swiper,
    extendParams,
    on
  } = _ref;

  // ---------------------------------------------------------------------------
  // effect initializer
  // ---------------------------------------------------------------------------
  on('beforeInit', function (swiper) {
    if (swiper.params.effect !== 'panorama') return;

    swiper.classNames.push(`${swiper.params.containerModifierClass}panorama`);
    swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);

    // set (extended) options
    const overwriteParams = {
      watchSlidesProgress: true,
    };
    Object.assign(swiper.params, overwriteParams);
  }); // END effect initializer

  // ---------------------------------------------------------------------------
  // create (surround) effect (on Swiper progress) on all slides
  // ---------------------------------------------------------------------------
  on('progress', function (swiper, progress) {
    if (swiper.params.effect !== 'panorama') return;

    // overload defaults
    const { depth = 200, rotate = 30 } = swiper.params.panoramaEffect;

    // create geometry settings
    const sizesGrid     = swiper.slidesSizesGrid;
    const angleRad      = (rotate * Math.PI) / 180;
    const halfAngleRad  = angleRad / 2;
    const angleModifier = 1 / (180 / rotate);

    // process all slides
    for (let i = 0; i < swiper.slides.length; i += 1) {
      const slideEl           = swiper.slides[i];
      const slideProgress     = slideEl.progress;
      const slideSize         = sizesGrid[i];
      const progressModifier = swiper.params.centeredSlides
        ? 0
        : (swiper.params.slidesPerView - 1) * 0.5;
      const modifiedProgress  = slideProgress + progressModifier;
      const angleCos          = 1 - Math.cos(modifiedProgress * angleModifier * Math.PI);
      const translateX        = `${modifiedProgress * (slideSize / 3) * angleCos}px`;
      const rotateY           = modifiedProgress * rotate;
      const radius            = (slideSize * 0.5) / Math.sin(halfAngleRad);
      const translateZ        = `${radius * angleCos - depth}px`;

      // transform styles
      slideEl.style.transform =
        swiper.params.direction === 'horizontal'
          ? `translateX(${translateX}) translateZ(${translateZ}) rotateY(${rotateY}deg)`
          : `translateY(${translateX}) translateZ(${translateZ}) rotateX(${-rotateY}deg)`;
    } // END for

  }); // END on Swiper progress

  // ---------------------------------------------------------------------------
  // click effects
  // ---------------------------------------------------------------------------  
  on('click', function (swiper, event) {
    if (swiper.params.effect !== 'panorama') return;

    // overload defaults
    const { on_click = false } = swiper.params.panorama;
    if (on_click === 'next') {
        swiper.slideNext();
    }
  }); // END click effects

} // END LayoutPanorama 