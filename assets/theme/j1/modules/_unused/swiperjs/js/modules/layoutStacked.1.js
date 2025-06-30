/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/swiper/js/modules/layoutStacked.js
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
function LayoutStacked(_ref) {
  var {
    swiper,
    params,
    moduleFound = false
  } = _ref;

  // collect module settings
  // ---------------------------------------------------------------------------
  const commonParameters = params.stacked;

  moduleFound = j1.adapter.swiper.findModuleByName(swiper.modules, LayoutStacked.name);
  if (!moduleFound) { return; }

  // ---------------------------------------------------------------------------
  // effect initializer
  // ---------------------------------------------------------------------------

  // main swiper
  //
  // const mainSwiper  = document.querySelector(`#${params.stacked.swiper_id}`);
  const mainSwiper  = document.querySelector('#swiper_image_stacked');
  const swiperEl    = mainSwiper.querySelector('.swiper');

  const calcNextOffset = () => {
    const parentWidth = swiperEl.parentElement.offsetWidth;
    const swiperWidth = swiperEl.offsetWidth;
    var nextOffset    = (parentWidth - (parentWidth - swiperWidth) / 2) / swiperWidth;
    var nextOffsetVh  = Math.max(nextOffset, 1) * 100;

    return `${nextOffsetVh}%`;
  };

  const stackedSwiper = new Swiper(swiperEl, {      
    effect: 'creative',
    speed: 600,
    resistanceRatio: 0,
    grabCursor: true,
    parallax: true,
    pagination: {
      el: '.swiper-pagination-inner',
      type: 'bullets',
      clickable: true
    },      
    creativeEffect: {
      limitProgress: 3,
      perspective: true,
      shadowPerProgress: true,
      prev: {
        shadow: true,
        translate: ['-15%', 0, -200],
      },
      next: {
        translate: [calcNextOffset(), 0, 0],
      },
    },
    on: {
      init: (swiper) => { var slideHeight = 600; swiper.slides.forEach(slide => { slide.style.height = `${slideHeight}px`; }); }
    }
  });

  const onResize = () => {
    if (!stackedSwiper || stackedSwiper.destroyed) return;
    // prettier-ignore
    stackedSwiper.params.creativeEffect.next.translate = [calcNextOffset(), 0, 0];
    if (
      stackedSwiper.params.resizeObserver &&
      typeof window.ResizeObserver !== 'undefined'
    ) {
      stackedSwiper.update();
    }
  };
  window.addEventListener('resize', onResize);

  return stackedSwiper;

} // END LayoutStacked