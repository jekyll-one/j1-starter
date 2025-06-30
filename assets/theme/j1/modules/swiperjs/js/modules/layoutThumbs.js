/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/swiper/js/modules/layoutThumbs.js
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
function LayoutThumbs(_ref) {
  var {
    swiper,
    extendParams,
    params,
    on
  } = _ref;

  var paramsPagination, settingsPagination, paramsThumbs, renderBullet;

  // set (module) options
  // ---------------------------------------------------------------------------
  if (params.pagination.enabled && params.pagination.nunbered) {
    renderBullet = (index, className) => { return `<span class="${className}"> ${++index} </span>`; };
  } else {
    renderBullet = false;
  }

  settingsPagination  = {
    el: '.swiper-pagination-outer',
    type: 'bullets',
    clickable: true,
    renderBullet: renderBullet
  };

  if (params.pagination.enabled) {
    paramsPagination = settingsPagination;
  } else {
    paramsPagination = false;
  }

  paramsThumbs      = params.thumbs;

  const thumbSpeed        = paramsThumbs.speed/2;
  const mainSpeed         = paramsThumbs.speed;


  // ---------------------------------------------------------------------------
  // layout initializer
  // ---------------------------------------------------------------------------

  // main swiper
  //
  const mainSwiper    = document.querySelector(`#${paramsThumbs.swiper_id}`);
  const mainSwiperEl  = mainSwiper.querySelector('.swiper');

  // create thmubs swiper (duplicate from main)
  //
  const swiperThumbEl = mainSwiperEl.cloneNode(true);
  swiperThumbEl.classList.add('thumbs-slider');
  mainSwiper.insertBefore(swiperThumbEl, mainSwiperEl);

  const swiperThumbSlides      = swiperThumbEl.querySelectorAll('.swiper-slide');
  const swiperThumbLastSlideEl = swiperThumbSlides[swiperThumbSlides.length - 1];

  if (paramsThumbs.placement === 'bottom') {
    // place thumbs slider AFTER the main swiper (place at botton)
    // -------------------------------------------------------------------------
    mainSwiper.appendChild(swiperThumbEl);
    // mainSwiperEl.classList.add('mb-1');
    swiperThumbEl.classList.add('thumbs-slider--bottom');
  } else if (paramsThumbs.placement === 'top') {
    // place thumbs slider BEFORE the main swiper (place on top)
    // -------------------------------------------------------------------------
    swiperThumbEl
      .querySelector('.swiper-wrapper')
      .insertBefore(swiperThumbLastSlideEl, swiperThumbLastSlideEl[0]);

      // mainSwiperEl.classList.add('mt-1');
      swiperThumbEl.classList.add('thumbs-slider--top');
  } else {
    // place thumbs at botton (default)
    // -------------------------------------------------------------------------
    mainSwiper.appendChild(swiperThumbEl);
    mainSwiperEl.classList.add('mb-1');
    swiperThumbEl.classList.add('thumbs-slider--bottom');
  }


  // ---------------------------------------------------------------------------
  // slider initializer
  // ---------------------------------------------------------------------------

  const thumbSlider = new Swiper(swiperThumbEl, {
    grabCursor:     paramsThumbs.grabCursor,
    speed:          paramsThumbs.speed * .5,
    spaceBetween:   paramsThumbs.spaceBetween,
    slidesPerView:  paramsThumbs.slidesPerView,
  });

  const mainSlider = new Swiper(mainSwiperEl, {
    grabCursor:     paramsThumbs.grabCursor,
    speed:          paramsThumbs.speed,
    pagination:     paramsPagination,
    thumbs: {
      swiper:       thumbSlider,
    },
  });

  // if (paramsPagination.enabled) {
  //   const mainSlider = new Swiper(mainSwiperEl, {
  //     grabCursor:     paramsThumbs.grabCursor,
  //     speed:          paramsThumbs.speed,
  //     pagination:     paramsPagination,
  //     thumbs: {
  //       swiper:       thumbSlider,
  //     },
  //   });
  // } else {
  //   const mainSlider = new Swiper(mainSwiperEl, {
  //     grabCursor:     paramsThumbs.grabCursor,
  //     speed:          paramsThumbs.speed,
  //     pagination:     paramsPagination,
  //     thumbs: {
  //       swiper:       thumbSlider,
  //     },
  //   });    
  // }



  // ---------------------------------------------------------------------------
  // slider events
  // ---------------------------------------------------------------------------   

  // MAIN
  //
  mainSlider.on('init', function (swiper) {
    if (paramsThumbs.slideHeight !== 'auto') {
      swiper.slides.forEach(slide => { slide.style.height = `${paramsThumbs.slideHeight}px`; });
    }
  });

  mainSlider.on('slideChangeTransitionStart', function (swiper) {
    thumbSlider.slideTo(swiper.activeIndex);
  });

  mainSlider.on('paginationUpdate', function (swiper) {
    thumbSlider.slideTo(swiper.activeIndex);
  });

  // THUMBS
  //
  thumbSlider.on('transitionStart', function (swiper) {
    mainSlider.slideTo(swiper.activeIndex);
  });

} // END LayoutThumbs