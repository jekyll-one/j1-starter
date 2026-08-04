---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/attic.js (3)
 # Liquid template to adapt Backstretch Core functions for
 # all attics (top page headers)
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment           = site.environment %}
{% assign template_version      = site.version %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config       = site.data.j1_config %}
{% assign blocks                = site.data.blocks %}
{% assign modules               = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign attic_defaults       = modules.defaults.attics.defaults %}
{% assign attic_settings       = modules.attics.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign attic_options        = attic_defaults | merge: attic_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/attic.js (3)
 # Backstretch v.2.1.16 implementation for J1 Theme.
 # JS Adapter for J1 Master Header (attic)
 #
 # Product/Info:
 # https://jekyll.one
 # http://www.jquery-backstretch.com/
 #
 # Copyright (C) 2023-2026 Juergen Adams
 # Copyright (C) 2012 Scott Robbin
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # Backstretch is licensed under the MIT License.
 # For details, see https://github.com/jquery-backstretch/jquery-backstretch
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
"use strict";
j1.adapter.attic = ((j1, window) => {

  const environment = '{{environment}}';
  const isDev       = (environment === "development" || environment === "dev") ? true : false;

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var state         = 'not_started';
  var moduleOptions = {};

  var atticFilters;
  var filterArray;
  var filterStr;

  var _this;
  var logger;

  // J1 Adapter optimizations #1
  // bound the page-ready poller. Previously, if `#no_flicker` never
  // reached `display: block` (e.g. a bug elsewhere in the boot sequence,
  // an aborted navigation, an extension hiding the element), this 10ms
  // interval ran for the lifetime of the tab. Cap it and log a
  // warning so the failure mode is visible in the console instead of
  // silently burning CPU.
  //
  var dependenciesTimeout;

  // date|time
  // Removed unused variables 'startTime', 'endTime', 'timeSeconds'
  // (only startTimeModule and endTimeModule are used)
  var startTimeModule;
  var endTimeModule;

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.attic',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.attic;
      logger  = log4javascript.getLogger('j1.adapter.attic');

      // initialize state flag
      _this.state = 'pending';

      // create settings object from frontmatter
      var frontmatterOptions  = options != null ? $.extend({}, options) : {};

      // create settings object from attic options
      var atticDefaults = $.extend({}, {{attic_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      var atticSettings = $.extend({}, {{attic_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      var atticOptions  = $.extend(true, {}, atticDefaults, atticSettings, frontmatterOptions);

      // save frontmatterOptions and atticOptions in the j1 namespace
      // to be used later by j1.template.init() to load the header
      //
      _this['frontmatterOptions'] = frontmatterOptions;
      _this['atticOptions']       = atticOptions;

      // -----------------------------------------------------------------------
      // adapter initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState   = $('#no_flicker').css("display");
        var pageVisible = (pageState === 'block') ? true: false;

        if (pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          isDev && logger.debug('state: ' + _this.getState());
          logger.info('module is being initialized');

          {% if attic_options.enabled %}
          logger.info('module initializaton: started');

          if (atticOptions.hide_page_oninit) {
            // hide whole page while attic is being created
            // jadams, 2023-05-12: page visible while loading the attic
            // cause high numbers for cumulative layout shift (CLS)
            //
            isDev && logger.debug('hide attic on initialization');
            $('#no_flicker').css('display', 'none');
          }

          _this.createAllAttics();
          clearInterval(dependencies_met_page_ready);
          // J1 Adapter optimizations #1
          // clear the safety timeout on the happy path
          //
          if (dependenciesTimeout) {
            clearTimeout(dependenciesTimeout);
            dependenciesTimeout = null;
          }
          {% else %}
          isDev && logger.warn('found module attics disabled');
          // add additional top space if attics are disabled
          $('#no_flicker').addClass('mt-5');
          clearInterval(dependencies_met_page_ready);
          // J1 Adapter optimizations #1
          // clear the safety timeout on the happy path
          //
          if (dependenciesTimeout) {
            clearTimeout(dependenciesTimeout);
            dependenciesTimeout = null;
          }
          {% endif %}
        }
      }, 10);

      // J1 Adapter optimizations #1
      // safety bound paired with the 10ms poller above
      //
      dependenciesTimeout = setTimeout(function () {
        if (dependencies_met_page_ready) {
          clearInterval(dependencies_met_page_ready);
          logger.warn('attic init aborted: page-ready conditions not met within 5s');
        }
      }, 5000);
    }, // END init

    // -------------------------------------------------------------------------
    // createAllAttics()
    // initialize all header supported
    // -------------------------------------------------------------------------
    createAllAttics: () => {
      var frontmatterOptions  = _this.frontmatterOptions;

      // merge all attic options
      var atticOptions = $.extend(true, {}, _this.atticOptions, _this.frontmatterOptions);

      {% comment %} Load data from attic config (yaml data files)
      -------------------------------------------------------------------------- {% endcomment %}
      {% for item in attic_options.attics %}
        {% if item.attic.enabled %}
          {% assign attic_id = item.attic.id %}

          // create RUNNER for id: {{attic_id}}
          function {{attic_id}}_runner (atticOptions) {
            var atticOptionsFilters = {};
            var atticItemFilters    = {};
            var atticFilters        = {};
            var my_attic      	    = $.extend({}, {{item.attic | replace: 'nil', 'null' | replace: '=>', ':' }});

            // collect attic filter settings to object to array to string
            //
            {% if item.attic.filters %}
              atticItemFilters = $.extend({}, {{item.attic.filters | replace: 'nil', 'null' | replace: '=>', ':' }});
            {% endif %}

            atticOptionsFilters = atticOptions.filters;
            atticFilters        = $.extend(true, {}, atticOptionsFilters, atticItemFilters);
            filterArray         = [];

            $.each(atticFilters, (idx2, val2) => {
              var str = idx2 + '(' + val2 + ')';
              filterArray.push(str);
            });
            filterStr = filterArray.join(' ');

            // fire backstretch for all slides on attic_id
            if ($('#{{attic_id}}').length) {
              $('#{{attic_id}}').backstretch(
                atticOptions.slides, {
                  debug:                          atticOptions.debug,
                  spinner:                        atticOptions.spinner,
                  alignX:                         atticOptions.alignX,
                  alignY:                         atticOptions.alignY,
                  scale:                          atticOptions.scale,
                  transition:                     atticOptions.transition,
                  transitionDuration:             atticOptions.transitionDuration,
                  animateFirst:                   atticOptions.animateFirst,
                  duration:                       atticOptions.duration,
                  paused:                         atticOptions.paused,
                  start:                          atticOptions.start,
                  preload:                        atticOptions.preload,
                  preloadSize:                    atticOptions.preloadSize,
                  bypassCss:                      atticOptions.bypassCss,
                  alwaysTestWindowResolution:     atticOptions.alwaysTestWindowResolution,
                  resolutionRefreshRate:          atticOptions.resolutionRefreshRate,
                  resolutionChangeRatioThreshold: atticOptions.resolutionChangeRatioThreshold,
                  isVideo:                        atticOptions.isVideo,
                  loop:                           atticOptions.loop,
                  mute:                           atticOptions.mute
              });
            } else {
              isDev && logger.warn('no attic container found on id: {{attic_id}}');
            }

            {% comment %} Add a spinner if configured
            -------------------------------------------------------------------- {% endcomment %}
            if (atticOptions.spinner) {
              $('.backstretch').addClass(atticOptions.spinner);
            }

            // collect backstretch instance data for Backstretch callbacks
            var backstretch_instance_data = $('#{{attic_id}}').data('backstretch');

            // add event for pauseOnHover
            if (atticOptions.pauseOnHover) {
              // Bug fix: was using literal string '#attic_id' instead of the
              // Liquid-templated '#{{attic_id}}'. The hover event was bound
              // to a non-existent element, so pauseOnHover never worked.
              $('#{{attic_id}}').hover (
                () => {
                  $('#{{attic_id}}').backstretch('pause'); },
                () => {
                  $('#{{attic_id}}').backstretch('resume'); }
              );
            }

            // run callback backstretch before
            $(window).on('backstretch.before', (e, instance, index) => {
              // Removed unused variables 'evt', 'inst', 'idx' that were
              // assigned but never referenced in this callback
              var atticOptions       = _this.atticOptions;
              var textOverlayTitle   = instance.images[index].title;
              var textOverlayTagline = instance.images[index].tagline;
              var textOverlayHTML;

              // console.log('module attic - set state: backstretch_before');
              _this.setState('backstretch_before');

              if (index === backstretch_instance_data.images.length -1) {
                if (atticOptions.circuit === false) {
                  // Stop the slideshow after reached the last image
                  $('#{{attic_id}}').backstretch('pause');
                }
                // remove class for the backstretch_intro background
                $('.backstretch').removeClass(atticOptions.spinner);
              }

              // Add collected CSS filters
              $('.backstretch').css('filter', filterStr);

              // mute the overlay content while sliding
              $('.textOverlay').css('opacity', '0');

              // mute the badge while sliding
              $('.attic-caption').css('opacity', '0');

              // re-initialze particles on a slideshow if exists
              if ($('.particles-js-canvas-el').length > 0) {
                j1.adapter.particles.init();
              }

            }); // // END callback backstretch.before

            // run callback backstretch.after
            // NOTE: add a 'caption' or 'badge' if configured
            // SEE:  https://github.com/jquery-backstretch/jquery-backstretch/issues/194
            //
            $(window).on('backstretch.after', (e, instance, index) => {
              var textOverlayTitle    = instance.images[index].title;
              var textOverlayTagline  = instance.images[index].tagline;
              var atticOptions        = _this.atticOptions;
              var frontmatterOptions  = _this.frontmatterOptions;
              var textOverlayHTML;

              // apply FRONTMATTER settings for title|tagline if
              // NOT set with the FIRST backstretch (image) instance
              //
              if (index === 0) {
                if (typeof instance.images[index].title === 'undefined') {
                  textOverlayTitle = frontmatterOptions.title;
                }
                if (typeof instance.images[index].tagline === 'undefined') {
                  textOverlayTagline = frontmatterOptions.tagline;
                }
              }

              if (typeof instance.images[index].badge != 'undefined') {
                var bType       = instance.images[index].badge.type;
                var bAuthor     = instance.images[index].badge.author;
                var bAuthorInfo = instance.images[index].badge.author_info || 'Image';
                var bLink       = instance.images[index].badge.href;
              }

              _this.setState('backstretch_after');

              if (typeof instance.images[index].caption != 'undefined') {
                var cText = instance.images[index].caption.text;
                var cLink = instance.images[index].caption.href;

                if (cLink) {
                  $('.attic-caption').html('<a class="j1-masthead-caption-anchor" href="' + cLink + '" target="_blank">'+cText+'</a>').show();
                } else {
                  $('.attic-caption').text(cText).show();
                }
              } else if (typeof instance.images[index].badge != 'undefined') {

                if (bType === 'ai') {
                  var badgeHTML = ''
                      + '<div class="attic__badge animate__animated animate__fadeIn animate__slower">'
                      + ' <a class="attic__badge_unsplash link-no-decoration"'
                      + '  href="' + bLink + '"'
                      + '  target="_blank"'
                      + '  rel="noopener noreferrer"'
                      + '  title="' + bAuthorInfo + ' is ' + bAuthor + '">'
                      + '  <span class="attic__badge_unsplash_icon">'
                      + '    <svg xmlns="http://www.w3.org/2000/svg"'
                      + '	   class="attic__badge_ai_icon-size"'
                      + '      viewBox="0 0 5.6 5.6">'
                      + '      <path d="m 2.7536906,1.6771374 c 0.02445,0 0.036683,-0.013105 0.042796,-0.033693 0.063168,-0.3125793 0.059098,-0.3200622 0.4136794,-0.3818338 0.02445,-0.00374 0.038718,-0.016842 0.038718,-0.039307 0,-0.022457 -0.014268,-0.035562 -0.038718,-0.039307 C 2.8576195,1.1174956 2.8678098,1.1100046 2.7964866,0.8011707 2.7903766,0.7805828 2.7781406,0.7674778 2.7536906,0.7674778 c -0.024458,0 -0.036683,0.013105 -0.042796,0.0336929 -0.071323,0.308834 -0.059098,0.3163248 -0.4136794,0.3818259 -0.022415,0.00375 -0.038718,0.01685 -0.038718,0.039307 0,0.022465 0.016303,0.03557 0.038718,0.039307 0.3545811,0.065517 0.3505032,0.069254 0.4136794,0.3818338 0.00611,0.020588 0.018337,0.033693 0.042796,0.033693 z M 1.7673829,2.9648773 c 0.038718,0 0.065211,-0.022464 0.06928,-0.056149 0.073366,-0.4997549 0.091704,-0.4997549 0.6541504,-0.5989488 0.036683,-0.00562 0.063167,-0.028079 0.063167,-0.06364 0,-0.033693 -0.026484,-0.058026 -0.063167,-0.06364 C 1.9283665,2.1113765 1.907986,2.0945255 1.8366629,1.5854194 c -0.00407,-0.033685 -0.030562,-0.058018 -0.06928,-0.058018 -0.036683,0 -0.063176,0.024333 -0.067254,0.059895 -0.067245,0.5016156 -0.095781,0.4997469 -0.6541417,0.5952034 -0.036683,0.00749 -0.0631762,0.029947 -0.0631762,0.06364 0,0.03743 0.026493,0.058018 0.0713232,0.06364 0.5542911,0.082351 0.5787494,0.095456 0.6459947,0.5952034 0.00408,0.03743 0.030571,0.059895 0.067254,0.059894 z m 1.3816498,2.0719875 c 0.052986,0 0.091704,-0.035562 0.1018853,-0.086097 0.1446895,-1.0257038 0.3016039,-1.1810551 1.4061082,-1.293362 0.057064,-0.00561 0.095782,-0.044921 0.095782,-0.09358 0,-0.048667 -0.038718,-0.086105 -0.095782,-0.093588 C 3.5525219,3.3579315 3.3956075,3.2025802 3.250918,2.1768843 3.2407364,2.126349 3.2020186,2.0926561 3.1490327,2.0926561 c -0.052986,0 -0.091704,0.033693 -0.099851,0.084228 C 2.9044922,3.20258 2.7455432,3.3579313 1.6430648,3.4702382 c -0.05909,0.00748 -0.097807,0.044921 -0.097807,0.093588 0,0.048659 0.038718,0.087966 0.097807,0.09358 1.1004351,0.1328948 1.2532717,0.2695349 1.4061169,1.293362 0.00815,0.050535 0.046865,0.086097 0.099851,0.086097 z"></path>'
                      + '    </svg>'
                      + '  </span>'
                      + '  <span class="attic__badge_unsplash_text">' + bAuthor + '</span>'
                      + ' </a>'
                      + '</div>';
                      $('.attic-caption').html(badgeHTML).hide();
                }

                if (bType === 'unsplash') {
                  var badgeHTML = ''
                      + '<div class="attic__badge animate__animated animate__fadeIn animate__slower">'
                      + ' <a class="attic__badge_unsplash link-no-decoration"'
                      + '  href="' + bLink + '"'
                      + '  target="_blank"'
                      + '  rel="noopener noreferrer"'
                      + '  title="' + bAuthorInfo + ' from ' + bAuthor + '">'
                      + '  <span class="attic__badge_unsplash_icon">'
                      + '    <svg xmlns="http://www.w3.org/2000/svg"'
                      + '	   class="attic__badge_unsplash_icon-size"'
                      + '      viewBox="0 0 32 32">'
                      + '      <path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path>'
                      + '    </svg>'
                      + '  </span>'
                      + '  <span class="attic__badge_unsplash_text">' + bAuthor + '</span>'
                      + ' </a>'
                      + '</div>';
                      $('.attic-caption').html(badgeHTML).hide();
                }

              }

              // TODO: Add additional styles to head-title-text|head-tagline (e.g. text-center)
              textOverlayHTML = ''
                + '<div id="head-title" class="head-title animate__animated ">'
                + '  <h2 id="head-title-text" class="notoc text-' + atticOptions.title_align + ' text-emphasis-stronger">' + textOverlayTitle + '</h2>'
                + '</div>'
                + '<div id="head-tagline" class="head-tagline animate__animated ">'
                + '  <h3 id="head-tagline-text" class="notoc text-' + atticOptions.tagline_align + '">' + textOverlayTagline + '</h3>'
                + '</div>';

              // hide textOverlay while animate classes are being applied
              $('.textOverlay').html(textOverlayHTML).hide();

              // collect individual title options
              var title_animate             = !!my_attic.title_animate ? my_attic.title_animate : atticOptions.title_animate;
              var title_animate_delay       = !!my_attic.title_animate_delay ? my_attic.title_animate_delay : atticOptions.title_animate_delay;
              var title_animate_duration    = !!my_attic.title_animate_duration ? my_attic.title_animate_duration : atticOptions.title_animate_duration;

              // consolidated repeated jQuery selector lookups into single
              // chained calls. Each $('#id') triggers a DOM query; chaining
              // reuses the same jQuery object.
              $('#head-title').addClass(title_animate)
                .addClass(title_animate_delay)
                .addClass(title_animate_duration);

              // collect individual tagline options
              var tagline_animate           = !!my_attic.tagline_animate ? my_attic.tagline_animate : atticOptions.tagline_animate;
              var tagline_animate_delay     = !!my_attic.tagline_animate_delay ? my_attic.tagline_animate_delay : atticOptions.tagline_animate_delay;
              var tagline_animate_duration  = !!my_attic.tagline_animate_duration ? my_attic.tagline_animate_duration : atticOptions.tagline_animate_duration;

              $('#head-tagline').addClass(tagline_animate)
                .addClass(tagline_animate_delay)
                .addClass(tagline_animate_duration);

              // show configured textOverlay
              $('.textOverlay').show().css('opacity', '1');

              // jadams, 2022-08-19: show a badge only if configured
              if (typeof instance.images[index].badge != 'undefined') {
                $('.attic-caption').show().css('opacity', '1');
              }

              // show page if attic finalized
              $('#no_flicker').css('display', 'block');

              // jadams, 2022-08-09:
              // resize the (background-)image to make sure the 'attic'
              // container is changed in size (heigth) if title/tagline
              // expands 'multiline' on small viewports
              // e.g. on mobile devices
              //
              $('#{{attic_id}}').backstretch('resize');

             _this.setState('finished');
             isDev && logger.debug('state: ' + _this.getState());
             logger.info('initialize attic on id {{attic_id}}: finished');
             logger.info('module initializaton: finished');

             endTimeModule = Date.now();
             logger.info('module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');
            }); // END callback backstretch.after
          } // END if attic_id exists

          // run attic found in page: {{attic_id}}
          if ($('#{{attic_id}}').length) {
            // apply CSS styles
            // NOTE: unclear why title_size|tagline_size evaluated to 1 if NOT set
            //
            {% for item in attic_options.attics %}
              {% if item.attic.id == attic_id %}

                {% assign raised_level          = item.attic.raised_level %}
                {% assign r_text                = item.attic.r_text %}
                {% assign text_emphasis         = item.attic.text_emphasis %}
                {% assign padding_top           = item.attic.padding_top %}
                {% assign padding_bottom        = item.attic.padding_bottom %}
                {% assign margin_bottom         = item.attic.margin_bottom %}

                {% if item.attic.title.size != 1 %}
                {% assign title_size            = item.attic.title.size %}
                {% endif %}
                {% assign title_color           = item.attic.title.color %}
                {% assign title_animate         = item.attic.title.animate %}
                {% assign title_align           = item.attic.title.align %}

                {% comment %}
                   Added missing tagline property assignments. These were
                   referenced in atticOptionsHeader below but never assigned
                   from the item config, so per-attic tagline overrides from
                   the YAML header config were silently ignored.
                {% endcomment %}
                {% if item.attic.tagline.size != 1 %}
                {% assign tagline_size          = item.attic.tagline.size %}
                {% endif %}

                {% assign tagline_color         = item.attic.tagline.color %}
                {% assign tagline_animate       = item.attic.tagline.animate %}
                {% assign tagline_align         = item.attic.tagline.align %}

                {% assign background_color_1    = item.attic.background_color_1 %}
                {% assign background_color_2    = item.attic.background_color_2 %}

                {% assign type                  = item.attic.type %}
                {% assign slides                = item.attic.slides %}
                {% assign opacity               = item.attic.opacity %}
                {% assign spinner               = item.attic.spinner %}
                {% assign alignX                = item.attic.alignX %}
                {% assign alignY                = item.attic.alignY %}
                {% assign scale                 = item.attic.scale %}
                {% assign animateFirst          = item.attic.animateFirst %}
                {% assign paused                = item.attic.paused %}
                {% assign start                 = item.attic.start %}
                {% assign preload               = item.attic.preload %}
                {% assign preloadSize           = item.attic.preloadSize %}
                {% assign bypassCss             = item.attic.bypassCss %}
                {% assign transition            = item.attic.transition %}
                {% assign duration              = item.attic.duration %}
                {% assign transitionDuration    = item.attic.transitionDuration %}
                {% assign sound                 = item.attic.sound %}

                // Create and json object for HEADER options taken from
                // header config (YAML data file)
                /* eslint-disable */
                var atticOptionsHeader = {
                  {% if opacity %}              "opacity":                {{ opacity | json }}, {% endif %}
                  {% if raised_level %}         "raised_level":           {{ raised_level | json }}, {% endif %}
                  {% if r_text %}               "r_text":                 {{ r_text | json }}, {% endif %}
                  {% if text_emphasis %}        "text_emphasis":          {{ text_emphasis | json }}, {% endif %}
                  {% if padding_top %}          "padding_top":            {{ padding_top | json }}, {% endif %}
                  {% if padding_bottom %}       "padding_bottom":         {{ padding_bottom | json }}, {% endif %}
                  {% if margin_bottom %}        "margin_bottom":          {{ margin_bottom | json }}, {% endif %}
                  {% if title_size %}           "title_size":             {{ title_size | json }}, {% endif %}
                  {% if title_color %}          "title_color":            {{ title_color | json }}, {% endif %}
                  {% if title_animate %}        "title_animate":          {{ title_animate | json }}, {% endif %}
                  {% if title_align %}          "title_align":            {{ title_align | json }}, {% endif %}
                  {% if tagline_size %}         "tagline_size":           {{ tagline_size | json }}, {% endif %}
                  {% if tagline_color %}        "tagline_color":          {{ tagline_color | json }}, {% endif %}
                  {% if tagline_animate %}      "tagline_animate":        {{ tagline_animate | json }}, {% endif %}
                  {% if tagline_align %}        "tagline_align":          {{ tagline_align | json }}, {% endif %}
                  {% if background_color_1 %}   "background_color_1":     {{ background_color_1 | json }}, {% endif %}
                  {% if background_color_2 %}   "background_color_2":     {{ background_color_2 | json }}, {% endif %}
                }
                /* eslint-enable */

                {% comment %} trans-script header|backstretch options
                ---------------------------------------------------------------- {% endcomment %}
                {% if type == 'video' %}
                  {% assign isVideo = true %}
                  {% if sound %} {% assign mute = false %} {% else %} {% assign mute = true %} {% endif %}
                  {% comment %}
                     Bug fix: both branches set loop=true, making videos always
                     loop. The else branch must set loop=false to honor config. 
                  {% endcomment %}
                  {% if loop %}  {% assign loop = true %}  {% else %} {% assign loop = false %} {% endif %}
                {% endif %}

                // Create an json object for BACKSTRETCH options taken from
                // header config (yaml data file)
                /* eslint-disable */
                var atticOptionsBackstretch = {
                  {% if spinner %}              "spinner":                {{ spinner | json }}, {% endif %}
                  {% if opacity %}              "opacity":                {{ opacity | json }}, {% endif %}
                  {% if slides %}               "slides":                 {{ slides | json }}, {% endif %}
                  {% if alignX %}               "alignX":                 {{ alignX | json }}, {% endif %}
                  {% if alignY %}               "alignY":                 {{ alignY | json }}, {% endif %}
                  {% if scale %}                "scale":                  {{ scale | json }}, {% endif %}
                  {% if animateFirst %}         "animateFirst":           {{ animateFirst | json }}, {% endif %}
                  {% if paused %}               "paused":                 {{ paused | json }}, {% endif %}
                  {% if start %}                "start":                  {{ start | json }}, {% endif %}
                  {% if preload %}              "preload":                {{ preload | json }}, {% endif %}
                  {% if preloadSize %}          "preloadSize":            {{ preloadSize | json }}, {% endif %}
                  {% if bypassCss %}            "bypassCss":              {{ bypassCss | json }}, {% endif %}
                  {% if transition %}           "transition":             {{ transition | json }}, {% endif %}
                  {% if isVideo %}              "isVideo":                {{ isVideo | json }}, {% endif %}
                  {% if mute %}                 "mute":                   {{ mute | json }}, {% endif %}
                  {% if loop %}                 "loop":                   {{ loop | json }}, {% endif %}
                  {% if transitionDuration %}   "transitionDuration":     {{ transitionDuration | json }}, {% endif %}
                  {% if duration %}             "duration":               {{ duration | json }}, {% endif %}
                }
                /* eslint-enable */

                // merge|overload Attic OPTIONS
                //
                atticOptions = $.extend({}, atticOptions, atticOptionsHeader, atticOptionsBackstretch);

                // overload Attic OPTIONS by settings from frontmatterOptions
                //
                if (frontmatterOptions.background_color_1) atticOptions.background_color_1 = frontmatterOptions.background_color_1;
                if (frontmatterOptions.background_color_2) atticOptions.background_color_2 = frontmatterOptions.background_color_2;
              {% else %}
                {% continue %}
              {% endif %} // ENDIF attic_id
            {% endfor %} // ENDFOR item in header_config.attics

            // frontmatter takes precedence (over header options)
            //
            if (frontmatterOptions) {
              if (typeof frontmatterOptions.raised_level != 'undefined') { atticOptions.raised_level = frontmatterOptions.raised_level; }
              if (typeof frontmatterOptions.r_text != 'undefined') { atticOptions.r_text = frontmatterOptions.r_text; }
              if (typeof frontmatterOptions.text_emphasis != 'undefined') { atticOptions.text_emphasis = frontmatterOptions.text_emphasis; }
              if (typeof frontmatterOptions.padding_top != 'undefined') { atticOptions.padding_top = frontmatterOptions.padding_top; }
              if (typeof frontmatterOptions.padding_bottom != 'undefined') { atticOptions.padding_bottom = frontmatterOptions.padding_bottom; }
              if (typeof frontmatterOptions.margin_bottom != 'undefined') { atticOptions.margin_bottom = frontmatterOptions.margin_bottom; }

              if (typeof frontmatterOptions.title != 'undefined') {
                if (typeof frontmatterOptions.title.color != 'undefined') { atticOptions.title_color = frontmatterOptions.title.color; }
                if (typeof frontmatterOptions.title.size != 'undefined') { atticOptions.title_size = frontmatterOptions.title.size; }
                if (typeof frontmatterOptions.title.animate != 'undefined') { atticOptions.title_animate = frontmatterOptions.title.animate; }
                if (typeof frontmatterOptions.title.align != 'undefined') { atticOptions.title_align = frontmatterOptions.title.align; }
              }

              if (typeof frontmatterOptions.tagline != 'undefined') {
                if (typeof frontmatterOptions.tagline.color != 'undefined') { atticOptions.tagline_color = frontmatterOptions.tagline.color; }
                if (typeof frontmatterOptions.tagline.size != 'undefined') { atticOptions.tagline_size = frontmatterOptions.tagline.size; }
                if (typeof frontmatterOptions.tagline.animate != 'undefined') { atticOptions.tagline_animate = frontmatterOptions.tagline.animate; }
                if (typeof frontmatterOptions.tagline.align != 'undefined') { atticOptions.tagline_align = frontmatterOptions.tagline.align; }
              }

              if (typeof frontmatterOptions.spinner != 'undefined') { atticOptions.spinner = frontmatterOptions.spinner; }
              if (typeof frontmatterOptions.opacity != 'undefined') { atticOptions.opacity = frontmatterOptions.opacity; }
              if (typeof frontmatterOptions.alignX != 'undefined') { atticOptions.alignX = frontmatterOptions.alignX; }
              if (typeof frontmatterOptions.alignY != 'undefined') { atticOptions.alignY = frontmatterOptions.alignY; }
              if (typeof frontmatterOptions.scale != 'undefined') { atticOptions.scale = frontmatterOptions.scale; }
              if (typeof frontmatterOptions.start != 'undefined') { atticOptions.start = frontmatterOptions.start; }
              if (typeof frontmatterOptions.animateFirst != 'undefined') { atticOptions.animateFirst = frontmatterOptions.animateFirst; }
              if (typeof frontmatterOptions.preload != 'undefined') { atticOptions.preload = frontmatterOptions.preload; }
              if (typeof frontmatterOptions.preloadSize != 'undefined') { atticOptions.preloadSize = frontmatterOptions.preloadSize; }
              if (typeof frontmatterOptions.mute != 'undefined') { atticOptions.mute = frontmatterOptions.mute; }
              if (typeof frontmatterOptions.bypassCss != 'undefined') { atticOptions.bypassCss = frontmatterOptions.bypassCss; }
              if (typeof frontmatterOptions.isVideo != 'undefined') { atticOptions.isVideo = frontmatterOptions.isVideo; }
              if (typeof frontmatterOptions.loop != 'undefined') { atticOptions.loop = frontmatterOptions.loop; }
              if (typeof frontmatterOptions.paused != 'undefined') { atticOptions.paused = frontmatterOptions.paused; }
              if (typeof frontmatterOptions.transition != 'undefined') { atticOptions.transition = frontmatterOptions.transition; }
              if (typeof frontmatterOptions.duration != 'undefined') { atticOptions.duration = frontmatterOptions.duration; }
              if (typeof frontmatterOptions.transitionDuration != 'undefined') { atticOptions.transitionDuration = frontmatterOptions.transitionDuration; }
              if (typeof frontmatterOptions.slides != 'undefined') { atticOptions.slides = frontmatterOptions.slides; }
            }

            // add r-text|raised_level settings
            //
            if (atticOptions.r_text === 'enabled') { $('#{{attic_id}}').addClass('r-text'); }
            var raised_level = 'raised-z' +atticOptions.raised_level;

            // chained repeated jQuery selector lookups
            $('#{{attic_id}}').addClass(raised_level);
            $('#head-title').addClass(atticOptions.title_animate)
              .addClass(atticOptions.title_animate_delay)
              .addClass(atticOptions.title_animate_duration);
 
            // Added missing tagline_animate_delay class (was applied in
            // backstretch.after callback but omitted here during initial setup)
            $('#head-tagline').addClass(atticOptions.tagline_animate)
              .addClass(atticOptions.tagline_animate_delay)
              .addClass(atticOptions.tagline_animate_duration);

            var text_emphasis = 'text-emphasis-' +atticOptions.text_emphasis;
            $('#head-title-text').addClass(text_emphasis);
            $('#head-tagline-text').addClass(text_emphasis);

            // check if attic should be translated
            //
            if (atticOptions.notranslate) {
              $('#{{attic_id}}').addClass('notranslate');
            }

            // add header CSS styles to <HEAD>
            //
            var attic_style = '';

            // initialze header background gradient
            //
            // Removed obsolete vendor-prefixed gradient syntax:
            // - '-webkit-gradient()' (Chrome < 10, Safari < 5.1)
            // - '-o-linear-gradient()' (Opera < 12.1)
            // - 'filter: progid:DXImageTransform' (IE 6-9)
            // The standard 'linear-gradient' and '-webkit-linear-gradient'
            // cover all currently supported browsers.
            //
            attic_style += '<style> .attic { ';
            attic_style += 'background-image: -webkit-linear-gradient(top, ' +atticOptions.background_color_1 + ' 0%, ' +atticOptions.background_color_2 + ' 100%) !important;';
            attic_style += 'background-image: linear-gradient(to bottom, ' +atticOptions.background_color_1 + ' 0%, ' +atticOptions.background_color_2 + ' 100%) !important;';
            attic_style += '} </style>';
            $('head').append(attic_style);

            // collect individual (title|tagline) options
            //
            var my_attic      	= $.extend({}, {{item.attic | replace: 'nil', 'null' | replace: '=>', ':' }});
            var padding_top     = !!my_attic.padding_top ? my_attic.padding_top : atticOptions.padding_top;
            var padding_bottom  = !!my_attic.padding_bottom ? my_attic.padding_bottom : atticOptions.padding_bottom;
            var margin_bottom   = !!my_attic.margin_bottom ? my_attic.margin_bottom : atticOptions.margin_bottom;

            // frontmatter options takes precedence
            //
            if (typeof frontmatterOptions.padding_top != 'undefined')     { padding_top    = frontmatterOptions.padding_top; }
            if (typeof frontmatterOptions.padding_bottom != 'undefined')  { padding_bottom = frontmatterOptions.padding_bottom; }
            if (typeof frontmatterOptions.margin_bottom != 'undefined')   { margin_bottom  = frontmatterOptions.margin_bottom; }

            attic_style = '';
            attic_style = '<style> .attic { padding-top: ' +padding_top+ 'px; padding-bottom: ' +padding_bottom+ 'px; margin-bottom: ' +margin_bottom+ 'px; text-shadow: 0 1px 0 rgba(0,0,0,.1); } </style>';

            // consolidated multiple $('head').append() calls into a single DOM insertion.
            $('head').append(
              attic_style
              + '<style> .attic .head-title h2 { color: ' +atticOptions.title_color+ ';font-size: ' +atticOptions.title_size+ ' !important; text-align: ' +atticOptions.title_align+ ';} </style>'
              + '<style> .attic .head-tagline h3 { color: ' +atticOptions.tagline_color+ ';font-size: ' +atticOptions.tagline_size+ ' !important; text-align: ' +atticOptions.tagline_align+ '; } </style>'
            );

            // Add opacity to ALL header (backstretch) images
            // See: https://tympanus.net/codrops/2013/11/07/css-overlay-techniques/
            //
            var item_opacity        = !!my_attic.opacity ? my_attic.opacity : atticOptions.opacity;
            var backstretch_opacity = '<style> .backstretch-item { opacity: ' +item_opacity+ '; } </style>';
            $('head').append(backstretch_opacity);

            _this.setState('initialized');
            isDev && logger.debug('state: ' + _this.getState());

            // start RUNNER on page 'ready'|module state 'initialized'
            //
            // $(() => {
            //   var dependencies_met_attic_ready = setInterval (() => {
            //     if (_this.getState() === 'initialized') {
            //       logger.info('initialize attic on id {{attic_id}}: started');
            //       {{attic_id}}_runner (atticOptions);
            //       clearInterval(dependencies_met_attic_ready);
            //     }
            //   }, 10);
            // });

            logger.info('initialize attic on id {{attic_id}}: started');
            {{attic_id}}_runner (atticOptions);

          } // END apply CSS styles|start ATTIC RUNNER

        {% else %}
          {% assign attic_id = item.attic.id %}
          _this.setState('finished');
          isDev && logger.debug('state: ' + _this.getState());
          logger.info('initialize attic on id {{attic_id}}: finished');
          logger.info('module initializaton: finished');

          // add additional top space if attic disabled
          //
          $('#no_flicker').addClass('mt-3');

          isDev && logger.warn('attic on id {{attic_id}}: disabled');
          $('#no_flicker').css('display', 'block');
        {% endif %} // END if header enabled
      {% endfor %} // END for item in header_config.attics

      // NO header found in page
      // if ($('#no_header').length) {
      //   _this.setState('completed');
      //   isDev && logger.debug('state: ' + _this.getState());
      //   isDev && logger.warn('no header configured or found in page');
      // }

      return true;

    }, // END createAllAttics

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      isDev && logger.debug(logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // place handling of command|action here
        //

        logger.info(message.text);
      }

      //
      // place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // setState()
    // sets the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: (stat) => {
      _this.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: () => {
      return _this.state;
    } // END getState

  }; // END main (return)
})(j1, window);

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}