/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/swiper/js/modules/effectNeighbor.js
 # J1 module for SwiperJS v11
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

function EffectNeighbor(_ref) {

  var {
      swiper,
      params,
      on
  } = _ref;

  // ---------------------------------------------------------------------------
  // effect initializer
  // ---------------------------------------------------------------------------

  var tripleMainSwiper;

  // module options
  const commonParameters = params.neighbor;

  var neighbor_swiper = document.querySelector('#neighbor_slider');
  
  // main slider
  //
  const swiperEl = neighbor_swiper.querySelector('#neighbor_slider .swiper');

  // create neighbor slider PREV
  //
  const swiperPrevEl = swiperEl.cloneNode(true);
  swiperPrevEl.classList.add('neighbor-slider-prev');
  neighbor_swiper.insertBefore(swiperPrevEl, swiperEl);
  const swiperPrevSlides = swiperPrevEl.querySelectorAll('.swiper-slide');
  const swiperPrevLastSlideEl = swiperPrevSlides[swiperPrevSlides.length - 1];
  swiperPrevEl
    .querySelector('.swiper-wrapper')
    .insertBefore(swiperPrevLastSlideEl, swiperPrevSlides[0]);

  // create neighbor slider NEXT
  //
  const swiperNextEl = swiperEl.cloneNode(true);
  swiperNextEl.classList.add('neighbor-slider-next');
  neighbor_swiper.appendChild(swiperNextEl);
  const swiperNextSlides = swiperNextEl.querySelectorAll('.swiper-slide');
  const swiperNextFirstSlideEl = swiperNextSlides[0];
  swiperNextEl
    .querySelector('.swiper-wrapper')
    .appendChild(swiperNextFirstSlideEl);

  // Add main class
  //
  swiperEl.classList.add('neighbor-slider-main');

  // init neighbor slider PREV
  //
  const triplePrevSwiper = new Swiper(swiperPrevEl, {
    ...commonParameters,
    allowTouchMove: false,
    on: {
      click() {
        tripleMainSwiper.slidePrev();
      },
    },
  });

  // init neighbor slider NEXT
  //
  const tripleNextSwiper = new Swiper(swiperNextEl, {
    ...commonParameters,
    allowTouchMove: false,
    on: {
      click() {
        tripleMainSwiper.slideNext();
      },
    },
  });

  // init neighbor slider MAIN
  //
  tripleMainSwiper = new Swiper(swiperEl, {
    ...commonParameters,
    grabCursor: true,
    controller: {
      control: [triplePrevSwiper, tripleNextSwiper],
    },
    on: {
      destroy() {
        // destroy side sliders on main (slider) destroy
        triplePrevSwiper.destroy();
        tripleNextSwiper.destroy();
      },
    },
  });

} // END EffectNeighbor