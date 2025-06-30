/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/swiper/js/modules/layoutNeighbor.js
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
function LayoutNeighbor(_ref) {
  var {
    swiper,
    params,
    moduleFound = false
  } = _ref;

  // collect module settings
  // ---------------------------------------------------------------------------
  const commonParameters = params.neighbor;

  moduleFound = j1.adapter.swiper.findModuleByName(swiper.modules, LayoutNeighbor.name);
  if (!moduleFound) { return; }

  // ---------------------------------------------------------------------------
  // effect initializer
  // ---------------------------------------------------------------------------

  // main swiper
  //
  const mainSwiper  = document.querySelector(`#${params.neighbor.swiper_id}`);
  const swiperEl    = mainSwiper.querySelector('.swiper');

  // create neighbor swiper PREV
  //
  const swiperPrevEl = swiperEl.cloneNode(true);
  swiperPrevEl.classList.add('neighbor-slider-prev');
  mainSwiper.insertBefore(swiperPrevEl, swiperEl);
  const swiperPrevSlides = swiperPrevEl.querySelectorAll('.swiper-slide');
  const swiperPrevLastSlideEl = swiperPrevSlides[swiperPrevSlides.length - 1];
  swiperPrevEl
    .querySelector('.swiper-wrapper')
    .insertBefore(swiperPrevLastSlideEl, swiperPrevSlides[0]);

  // create neighbor swiper NEXT
  //
  const swiperNextEl = swiperEl.cloneNode(true);
  swiperNextEl.classList.add('neighbor-slider-next');
  mainSwiper.appendChild(swiperNextEl);
  const swiperNextSlides = swiperNextEl.querySelectorAll('.swiper-slide');
  const swiperNextFirstSlideEl = swiperNextSlides[0];
  swiperNextEl
    .querySelector('.swiper-wrapper')
    .appendChild(swiperNextFirstSlideEl);

  // Add main class
  //
  swiperEl.classList.add('neighbor-slider-main');

  // init neighbor swiper PREV
  //
  const triplePrevSwiper = new Swiper(swiperPrevEl, {
    ...commonParameters,
    allowTouchMove: false,
    on: {
      click() {
        tripleSwiper.slidePrev();
      },
    },
  });

  // init neighbor swiper NEXT
  //
  const tripleNextSwiper = new Swiper(swiperNextEl, {
    ...commonParameters,
    allowTouchMove: false,
    on: {
      click() {
        tripleSwiper.slideNext();
      },
    },
  });

  // init neighbor swiper MAIN
  //
  const tripleSwiper = new Swiper(swiperEl, {
    ...commonParameters,
    grabCursor: true,
    controller: {
      control: [triplePrevSwiper, tripleNextSwiper],
    },
    on: {
      destroy() {
        // destroy swipers PREV|NEXT on MAIN destroy
        triplePrevSwiper.destroy();
        tripleNextSwiper.destroy();
      },
    },
  });

} // END LayoutNeighbor