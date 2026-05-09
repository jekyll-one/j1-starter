---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/amplitude.js (44)
 # Liquid template to adapt J1 Amplitude
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  amplitude_options:  {{ amplitude_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment         = site.environment %}
{% assign asset_path          = "/assets/theme/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config     = site.data.j1_config %}
{% assign blocks              = site.data.blocks %}
{% assign modules             = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign amplitude_default   = modules.defaults.amplitude.defaults %}
{% assign amplitude_player    = modules.amplitude_player.settings %}
{% assign amplitude_playlist  = modules.amplitude_playlist.settings %}

{% comment %} Set config data (test)
--------------------------------------------------------------------------------
{% assign amplitude_default_test   = modules.defaults.amplitude_test.defaults %}
{% assign amplitude_player_test    = modules.amplitude_player_test.settings %}
{% assign amplitude_playlist_test  = modules.amplitude_playlist_test.settings %}
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config options
{% assign amplitude_options_test   = amplitude_default_test | deep_merge: amplitude_player_test, amplitude_playlist_test %}
-------------------------------------------------------------------------------- {% endcomment %}
{% assign amplitude_options   = amplitude_default | deep_merge: amplitude_player, amplitude_playlist %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/amplitude.js (44)
 # J1 Adapter for the amplitude module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
"use strict";

j1.adapter.amplitude = ((j1, window) => {

  // J1 Amplitude optimizations #1
  const isDev = '{{environment}}' === "development" || '{{environment}}' === "dev";

  // Adapter GLOBAL settings
  // ---------------------------------------------------------------------------
  var environment   = '{{environment}}';
  var cookie_names  = j1.getCookieNames();
  var user_state    = j1.readCookie(cookie_names.user_state);
  var state         = 'not_started';

  // ---------------------------------------------------------------------------
  // control|logging
  // ------------------------------------
  var consoleFilterSettings = {};
  var _this;
  var logger;
  var logText;
  var toJSON;
  var toText;

  // ---------------------------------------------------------------------------
  // date|time monitoring
  // ---------------------------------------------------------------------------
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // ---------------------------------------------------------------------------  
  // Amplitude GLOBAL settings
  // ---------------------------------------------------------------------------
  const requiredForATP = false;

  const AUDIO_ERROR = {
    SUCCESSFUL:         0,
    ABORTED:            1,
    NETWORK_ERROR:      2,
    DECODE_ERROR:       3,
    SRC_NOT_SUPPORTED:  4,
    GENERIC_ERROR:      5
  };

  const AUDIO_ERROR_NAMES = {
    0:                  "successful",
    1:                  "aborted",
    2:                  "network error",
    3:                  "decode error",
    4:                  "not supported",
    5:                  "generic error",
  };

  const AT_PLAYER_STATE = {
    ENDED:              0,
    PLAYING:            1,
    PAUSED:             2,
    STOPPED:            3,
    PREVIOUS:           4,
    NEXT:               5,
    CHANGED:            6,
  };

  const AT_PLAYER_STATE_NAMES = {
    0:                "ended",
    1:                "playing",
    2:                "paused",
    3:                "stopped",
    4:                "previous",
    5:                "next",
    6:                "changed",
  };

  var playersUILoaded                   = { state: false };
  var apiInitialized                    = { state: false };
  var playerCounter                     = 0;
  var load_dependencies                 = {};
  var playersProcessed                  = [];
  var playersHtmlLoaded                 = false;
  var processingPlayersFinished         = false;
  var isFadingIn                        = false;
  var isFadingOut                       = false;

  var amplitudePlayerState;
  var amplitudeDefaults;
  var amplitudePlayers;
  var amplitudeOptioss;

  var ytPlayer;
  var ytpPlaybackRate;

  var xhrLoadState;
  var dependency;
  var pluginManagerEnabled;
  var playerExistsInPage;

  
  // Amplitude DEFAULT settings
  // ---------------------------------------------------------------------------

  // PLAYER settings
  // ---------------------------------------------------------------------------
  var playerDefaultPluginManager        = {{amplitude_default.player.plugin_manager.enabled}};
  var playerDefaultType                 = '{{amplitude_default.player.type}}';
  var playerDefaultVolume               = {{amplitude_default.player.volume_slider.preset_value}};
  var playerRepeat                      = {{amplitude_default.player.player_repeat}};
  var playerShuffle                     = {{amplitude_default.player.player_shuffle}};
  var playerPlayNextTitle               = {{amplitude_default.player.play_next_title}};
  var playerPauseNextTitle              = {{amplitude_default.player.pause_next_title}};
  var playerDelayNextTitle              = {{amplitude_default.player.delay_next_title}};
  var playerForwardBackwardSkipSeconds  = {{amplitude_default.player.forward_backward_skip_seconds}};
  var playerHoverPageScrollDisabled     = {{amplitude_default.player.player_hover_page_scroll_disabled}};

  var playerSongElementHeigthMobile     = {{amplitude_default.player.player_song_element_heigth_mobile}};  
  var playerSongElementHeigthDesktop    = {{amplitude_default.player.player_song_element_heigt_desktop}};
  var playerScrollerSongElementMin      = {{amplitude_default.player.player_scroller_song_element_min}};
  var playerScrollControl               = {{amplitude_default.player.player_scroll_control}};
  var playerAutoScrollSongElement       = {{amplitude_default.player.player_auto_scroll_song_element}};

  // ---------------------------------------------------------------------------
  // PLAYLIST settings
  // ---------------------------------------------------------------------------
  var playlistAudioInfo                 = {{amplitude_default.playlist.audio_info}};

  // ---------------------------------------------------------------------------
  // UNUSED settings
  // ---------------------------------------------------------------------------
  // var playerWaveformsEnabled            = {{amplitude_default.player.waveforms.enabled}};
  // var playerWaveformsSampleRate         = {{amplitude_default.player.waveforms.sample_rate}};
  // var playerVisualizationEnabled        = {{amplitude_default.player.visualization.enabled}};
  // var playerVisualizationName           = '{{amplitude_default.player.visualization.name}}';

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------
  function forceJsError() {
    throw new Error("GENERATED JavaScript error!");
  }

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // set console log filters (early)
      // -----------------------------------------------------------------------
      // consoleFilterSettings = {
      //   debug: false,
      // };
      // j1.api.consoleFilters.filter(consoleFilterSettings);  
      j1.api.consoleFilters.filter();

      // -----------------------------------------------------------------------
      // set error log filters (JS early)
      // -----------------------------------------------------------------------
      // j1.api.errorFilters.filter();

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name:  'j1.adapter.amplitude',
        generated:    '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      amplitudeDefaults = $.extend({}, {{amplitude_default  | replace: 'nil', 'null' | replace: '=>', ':' }});
      amplitudePlayers  = $.extend({}, {{amplitude_player   | replace: 'nil', 'null' | replace: '=>', ':' }});
      amplitudeOptioss  = $.extend({}, {{amplitude_options  | replace: 'nil', 'null' | replace: '=>', ':' }});

//    var amplitudeDefaultTest = $.extend({}, {{amplitude_default_test  | replace: 'nil', 'null' | replace: '=>', ':' }});
//    var amplitudePlayerTest  = $.extend({}, {{amplitude_player_test   | replace: 'nil', 'null' | replace: '=>', ':' }});
//    var amplitudeOptionsTest = $.extend({}, {{amplitude_options_test  | replace: 'nil', 'null' | replace: '=>', ':' }});

      // set Amplitude data for later use (e.g events)
      // -----------------------------------------------------------------------
      j1.modules.amplitudejs                              = {};
      j1.modules.amplitudejs.songIndex                    = false;
      j1.modules.amplitudejs.defaults                     = amplitudeDefaults;
      j1.modules.amplitudejs.players                      = amplitudePlayers || {};
      j1.modules.amplitudejs.data                         = {};
      j1.modules.amplitudejs.data.activePlayer            = 'not_set';
      j1.modules.amplitudejs.data.playerSongElementHeigth = playerSongElementHeigthDesktop;      
      j1.modules.amplitudejs.data.atp                     = {};
      j1.modules.amplitudejs.data.ytp                     = {};

      // set INITIAL Amplitude data
      // -----------------------------------------------------------------------
      j1.modules.amplitudejs.data.atp.activeIndex         = false;
      j1.modules.amplitudejs.data.atp.playlist            = false
      j1.modules.amplitudejs.data.atp.apiError            = false;
      j1.modules.amplitudejs.data.atp.apiReady            = false ;
      j1.modules.amplitudejs.data.atp.playlist            = false;
      j1.modules.amplitudejs.data.atp.players             = {};
      j1.modules.amplitudejs.data.ytp.apiError            = false;
      j1.modules.amplitudejs.data.ytp.apiReady            = false;
      j1.modules.amplitudejs.data.ytp.players             = {};
      j1.modules.amplitudejs.data.ytp.plugin              = false;

      // -----------------------------------------------------------------------
      // control|logging settings
      // -----------------------------------------------------------------------
      _this  = j1.adapter.amplitude;
      logger = log4javascript.getLogger('j1.adapter.amplitude');

      // save amplitudejs data for later use (e.g. events)
      // -----------------------------------------------------------------------
      j1.adapter.amplitude.data             = {};
      j1.adapter.amplitude.data.atpGlobals  = {};
      j1.adapter.amplitude.data.ytpGlobals  = {};      
      j1.adapter.amplitude.data.ytPlayers   = {};

      // initial amplitudejs data
      // -----------------------------------------------------------------------
      j1.adapter.amplitude.data.playerSongElementHeigth     = playerSongElementHeigthDesktop;
      j1.adapter.amplitude.data.activePlayer                = 'not_set';
      j1.adapter.amplitude.data.atpGlobals.activePlayerType = 'not_set';
      j1.adapter.amplitude.data.atpGlobals.ytpInstalled     = false;
      j1.adapter.amplitude.data.ytpGlobals.activePlayerType = 'not_set';

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true : false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;
        var atticFinished  = (j1.adapter.attic.getState() == 'finished') ? true : false;

        if (j1CoreFinished && pageVisible && atticFinished) {
          startTimeModule = Date.now();

          _this.setState('started');
          isDev && logger.debug('\n' + `module state: ${_this.getState()}`);
          isDev && logger.info('\n' + 'module is being initialized');

          // test data for console filters
          // -------------------------------------------------------------------
          // console.warn("consoleFilters: Diese WARNUNG wird gefiltert.");
          // isDev && logger.warn("consoleFilters: Diese WARNUNG wird gefiltert.");
          // console.warn("consoleFilters: Diese Meldung wird nicht gefiltert.");
          // isDev && logger.warn("consoleFilters: Diese Meldung wird nicht gefiltert.");

          // test data for error filters
          // -------------------------------------------------------------------
          // forceJsError();

          // -------------------------------------------------------------------
          // create global playlist (songs)
          // -------------------------------------------------------------------
          var songs = [];
          _this.songLoader(songs);

          // -------------------------------------------------------------------
          // load all players (HTML|UI)
          // -------------------------------------------------------------------
          _this.playerHtmlLoader(playersUILoaded);

          // -------------------------------------------------------------------
          // inititialize amplitude api
          // -------------------------------------------------------------------
          var dependencies_met_players_loaded = setInterval (() => {
            if (playersUILoaded.state) {
              _this.initApi(songs);
              // var playbackRate = ytPlayer.getPlaybackRate();

              clearInterval(dependencies_met_players_loaded);
            } // END if playersUILoaded
          }, 10); // END dependencies_met_players_loaded

          // -------------------------------------------------------------------
          // initialize player specific events
          // -------------------------------------------------------------------
          var dependencies_met_api_initialized = setInterval (() => {
            if (apiInitialized.state) {
              _this.initPlayerUiEvents();

              clearInterval(dependencies_met_api_initialized);
            } // END if apiInitialized
          }, 10); // END dependencies_met_api_initialized

          // initialize viewPort specific (GLOBAL) settings
          $(window).bind('resizeEnd', function() {
            var viewPortSize = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            //do something, window hasn't changed size in 500ms
            if (viewPortSize > 578) {
              j1.adapter.amplitude.data.playerSongElementHeigth = playerSongElementHeigthDesktop;
            } else {
              j1.adapter.amplitude.data.playerSongElementHeigth = playerSongElementHeigthMobile;
            }
          });

          $(window).resize(function() {
            if (this.resizeTO) clearTimeout(this.resizeTO);
            this.resizeTO = setTimeout(function() {
              $(this).trigger('resizeEnd');
            }, 500);
         });

          clearInterval(dependencies_met_page_ready);
        } // END pageVisible
      }, 10); // END dependencies_met_page_ready

    }, // END init

    // -------------------------------------------------------------------------
    // Create global playlist|songs (API)
    // -------------------------------------------------------------------------
    songLoader: (songs) => {

      isDev && logger.info('\n' + 'creating global playlist (API): started');

      // -----------------------------------------------------------------------
      // initialize amplitude songs
      // -----------------------------------------------------------------------

      {% for playlist in amplitude_playlist.playlists %} {% if playlist.enabled %}
        var song_items = $.extend({}, {{playlist.items | replace: 'nil', 'null' | replace: '=>', ':' }});

        for (var i = 0; i < Object.keys(song_items).length; i++) {
          if (song_items[i].enabled) {
            var item = song_items[i];
            var song = {};

            // map config settings|amplitude song items
            // -----------------------------------------------------------------
            for (const key in item) {
              // skip properties NOT needed for a song
              if (key === 'item' || key === 'audio_base' || key === 'enabled') {
                continue;
              } else if (key === 'audio') {
                song.url = item.audio_base + '/' + item[key];
                continue;
              } else if (key === 'title') {
                song.name = item[key];
                continue;
              } else if (key === 'name') {
                song.album = item[key];
                continue;
              } else if (key === 'cover_image') {
                song.cover_art_url = item[key];
                continue;
              } else if (key === 'audio_info') {
                song.audio_info = item[key];
                continue;
              } else if (key === 'rating') {
                song.rating = item[key];
                continue; 
              } else if (key === 'playlist') {
                song.playlist = item[key];
                continue;                            
              } else if (key === 'shuffle') {
                song.shuffle = ((!!item[key]) === false) ? playerShuffle : item[key];
                continue;
              } else if (key === 'repeat') {
                song.repeat = ((!!item[key]) === false) ? playerRepeat : item[key];
                continue;                
              } else if (key === 'start') {
                song.start = ((!!item[key]) === false) ? '00:00:00' : item[key];
                continue;                 
              } else if (key === 'end') {
                song.end = ((!!item[key]) === false) ? '00:00:00' : item[key];
                continue;                 
              } else {
                song[key] = item[key];
              } // END if key
            } // END for item
          } // END id enabled

          songs.push(song);
        } // END for song_items

      {% endif %} {% endfor %}

      isDev && logger.info('\n' + 'creating global playlist (API): finished');
    }, // END songLoader

    // -------------------------------------------------------------------------
    // load players HTML portion (UI)
    // -------------------------------------------------------------------------
    playerHtmlLoader: (playersLoaded) => {
      var playerExistsInPage;

      // -----------------------------------------------------------------------
      // initialize HTML portion (UI) for all players configured|enabled
      // -----------------------------------------------------------------------
      isDev && logger.info('\n' + 'loading player HTML components (UI): started');

      {% for player in amplitude_options.players %} {% if player.enabled %}
        {% assign xhr_data_path = amplitude_options.xhr_data_path %}
        {% capture xhr_container_id %}{{player.id}}_audio{% endcapture %}

        // load players only that are configured in current page
        //
        playerExistsInPage = ($('#' + '{{xhr_container_id}}')[0] !== undefined) ? true : false;
        if (playerExistsInPage) {
          playerCounter++;
          isDev && logger.debug('\n' + 'load player UI on ID #{{player.id}}: started');

          j1.loadHTML({
            xhr_container_id: '{{xhr_container_id}}',
            xhr_data_path:    '{{xhr_data_path}}',
            xhr_data_element: '{{player.id}}'
            },
            'j1.adapter.amplitude',
            'data_loaded'
          );

          // dynamic loader variable to setup the player on ID {{player.id}}
          dependency                    = 'dependencies_met_html_loaded_{{player.id}}';
          load_dependencies[dependency] = '';

          // -------------------------------------------------------------------
          // initialize amplitude instance (when player UI loaded)
          // -------------------------------------------------------------------
          load_dependencies['dependencies_met_html_loaded_{{player.id}}'] = setInterval (() => {
            // check if HTML portion of the player is loaded successfully
            xhrLoadState = j1.xhrDOMState['#' + '{{xhr_container_id}}'];

            if (xhrLoadState === 'success') {
              playersProcessed.push('{{xhr_container_id}}');
              isDev && logger.debug('\n' + 'load player UI on ID #{{player.id}}: finished');

              clearInterval(load_dependencies['dependencies_met_html_loaded_{{player.id}}']);
            }
          }, 10); // END dependencies_met_html_loaded
        } // END if playerExistsInPage

      {% endif %} {% endfor %}

      load_dependencies['dependencies_met_players_loaded'] = setInterval (() => {

        if (playersProcessed.length === playerCounter) {
          processingPlayersFinished = true;
        }

        if (processingPlayersFinished) {
          isDev && logger.info('\n' + 'loading player HTML components (UI): finished');

          clearInterval(load_dependencies['dependencies_met_players_loaded']);
          playersLoaded.state = true;
        }
      }, 10); // END dependencies_met_players_loaded

    }, // END playerHtmlLoader

    // -------------------------------------------------------------------------
    // initApi
    // -------------------------------------------------------------------------
    initApi: (songlist) => {

      isDev && logger.info('\n' + 'initialze API: started');

      {% comment %} collect playlists
      --------------------------------------------------------------------------  {% endcomment %}
      {% assign playlists_enabled = 0 %}
      {% for list in amplitude_playlist.playlists %} {% if list.enabled %}
        {% assign playlists_enabled = playlists_enabled | plus: 1 %}
      {% endif %} {% endfor %}

      {% assign playlists_processed = 0 %}
      {% for list in amplitude_playlist.playlists %} {% if list.enabled %}
        {% assign playlist_items = list.items %}
        {% assign playlist_name  = list.name %}
        {% assign playlist_title = list.title %}

        {% comment %} collect song items
        NOTE: configure all properties avaialble in songs array
        ------------------------------------------------------------------------ {% endcomment %}
        {% for item in playlist_items %} {% if item.enabled %}
          {% capture song_item %}
          {
            "name":           "{{item.title}}",
            "artist":         "{{item.artist}}",
            "playlist":       "{{item.playlist}}",
            "album":          "{{item.name}}",
            "url":            "{{item.audio_base}}/{{item.audio}}",
            "audio_info":     "{{item.audio_info}}",
            "rating":         "{{item.rating}}",
            "start":          "{{item.start}}",
            "end":            "{{item.end}}",
            "shuffle":        "{{item.shuffle}}",
            "repeat":         "{{item.repeat}}",
            "duration":       "{{item.duration}}",
            // "audio_fade_in":  "{{item.audio_fade_in}}",
            // "audio_fade_out": "{{item.audio_fade_out}}",
            "cover_art_url":  "{{item.cover_image}}"
          }{% if forloop.last %}{% else %},{% endif %}
          {% endcapture %}
          {% capture song_items %}{{song_items}} {{song_item}}{% endcapture %}

          {% comment %} create playlist
          ---------------------------------------------------------------------- {% endcomment %}
          {% if forloop.last %}
            {% capture playlist %}
            "{{playlist_name}}": {
              "title": "{{playlist_title}}",
              "songs": [
                {{song_items}}
              ]
            }
            {% endcapture %}
            {% assign playlists_processed = playlists_processed | plus: 1 %}

            {% comment %} reset song_items
            --------------------------------------------------------------------  {% endcomment %}
            {% capture song_items %}{% endcapture %}
          {% endif %}
        {% endif %} {% endfor %}

        {% comment %} collect playlists players enabled
        ------------------------------------------------------------------------ {% endcomment %}
        {% capture playlists %}
          {{playlists}} {{playlist}} {% if playlists_processed == playlists_enabled %}{% else %},{% endif %}
        {% endcapture %}

      {% endif %} {% endfor %}

      // See:  https://521dimensions.com/open-source/amplitudejs/docs
      // NOTE: slider VALUE (volume) is set by DEFAULT settings (player)
      Amplitude.init({

        bindings: {
          33:  'play_pause',
          37:  'prev',
          39:  'next'
        },
        songs: songlist,
        playlists: {
          {{playlists}}
        },
        callbacks: {
          initialized: function() {
            onInitialized();
          },
          error: function(event) {
            if (event === undefined) {
              onAudioError(0);
            } else {
              onAudioError(event);
            }
          },
          play: function() {
            // make sure the player is playing
            setTimeout(() => {
              onPlayerStateChange(1);
            }, 150);
          },
          pause: function() {
            // make sure the player is paused
            setTimeout(() => {
              onPlayerStateChange(2);
            }, 150);
          },
          stop: function() {
            // make sure the player is stopped
            setTimeout(() => {
              onPlayerStateChange(3);
            }, 150);
          },
          song_change: function() {
            // make sure the player has changed
            setTimeout(() => {
              var currentState = Amplitude.getPlayerState();
              if (currentState === 'stopped') {
                // onPlayerStateChange(3);
                return;
              } else {
                onPlayerStateChange(6);
              }
            }, 150);
          },
          prev: function() {
            var currentState = Amplitude.getPlayerState();
            onPlayerStateChange(4);
            if (playerDelayNextTitle) {
              isDev && logger.debug('\n' + `delay on previous title: ${songMetaData.name} with titleIndex ${songMetaData.index}`);
            }

            if (playerPauseNextTitle) {
              amplitudePlayerState = Amplitude.getPlayerState();
              if (amplitudePlayerState === 'playing' || amplitudePlayerState === 'stopped' ) {
                setTimeout(() => {
                  // pause playback of next title
                  isDev && logger.debug('\n' + `paused on next title: ${songMetaData.name}`);
                  Amplitude.pause();
                }, 150);
              } // END if playing
            } // END if pause on next title

            return;
          },
          next: function() {
            onPlayerStateChange(5);
            if (playerDelayNextTitle) {
              isDev && logger.debug('\n' + `delay on next title: ${songMetaData.name} with titleIndex ${songMetaData.index}`);
            }

            if (playerPauseNextTitle) {
              amplitudePlayerState = Amplitude.getPlayerState();
              if (amplitudePlayerState === 'playing' || amplitudePlayerState === 'stopped' ) {
                setTimeout(() => {
                  // pause playback of next title
                  isDev && debug('\n' + `paused on next title: ${songMetaData.name}`);
                  Amplitude.pause();
                }, 150);
              } // END if playing
            } // END if pause on next title

            return;
          },
          ended: function() {
            onPlayerStateChange(0);
            return;            
          }
        }, // END callbacks

        // waveforms: {
        //   sample_rate:    playerWaveformSampleRate
        // },

        continue_next:    playerPlayNextTitle,
        volume:           playerDefaultVolume,

      }); // END Amplitude init

      // -----------------------------------------------------------------------
      // atpFadeInAudio
      // -----------------------------------------------------------------------
      function atpFadeInAudio(params) {
        const cycle = 1;
        var   settings, currentStep, steps, sliderID, volumeSlider;

        isFadingIn = true;

        // current fade-in settings using DEFAULTS (if available)
        settings =  {
          playerID:     params.playerID,
          targetVolume: params.targetVolume = 50,
          speed:        params.speed = 'default'
        };

        // number of iteration steps to INCREASE the players volume on fade-in
        // NOTE: number of steps controls how long and smooth the fade-in 
        // transition will be
        const iterationSteps = {
          'default':  150,
          'slow':     250,
          'slower':   350,
          'slowest':  500
        };

        sliderID     = 'volume_slider_' + settings.playerID;
        volumeSlider = document.getElementById(sliderID);
        steps        = iterationSteps[settings.speed];
        currentStep  = 1;

        if (volumeSlider === undefined || volumeSlider === null) {
          isDev && logger.warn('\n' + `no volume slider found at playerID: ${settings.playerID}`);
          return;
        }

        // Start the players volume muted
        Amplitude.setVolume(0);

        const fadeInInterval = setInterval(() => {
          const newVolume = settings.targetVolume * (currentStep / steps);

          Amplitude.setVolume(newVolume);
          volumeSlider.value = newVolume;
          currentStep++;

          if (currentStep > steps) {
            isFadingIn = false;
            clearInterval(fadeInInterval);
          } 

        }, cycle);

      } // END atpFadeInAudio

      // -----------------------------------------------------------------------
      // atpFadeAudioOut
      //
      // returns true if fade-out is finished
      // -----------------------------------------------------------------------
      function atpFadeAudioOut(params) {
        const cycle = 1;
        var   settings, currentStep, steps, sliderID, songs,
              startVolume, newVolume, defaultVolume, volumeSlider;

        // current fade-out settings using DEFAULTS (if available)
        settings =  {
          playerID:       params.playerID,
          speed:          params.speed = 'default'
        };

        isFadingOut = true;

        // number of iteration steps to INCREASE the players volume on fade-in
        // NOTE: number of steps controls how long and smooth the fade-in 
        // transition will be
        const iterationSteps = {
          'default':  150,
          'slow':     250,
          'slower':   350,
          'slowest':  500
        };

        sliderID      = 'volume_slider_' + settings.playerID;
        volumeSlider  = document.getElementById(sliderID);
        startVolume   = Amplitude.getVolume();
        steps         = iterationSteps[settings.speed];
        currentStep   = 1;
        defaultVolume = 50;

        var songMetaData  = Amplitude.getActiveSongMetadata();
        var songEndTS     = songMetaData.end;
        var playlist      = songMetaData.playlist;
        var songIndex     = songMetaData.index;
        var trackID       = songIndex + 1;

        // save AT player data for later use (e.g. events)
        // ---------------------------------------------------------------------
        j1.modules.amplitudejs.data.atp.activeIndex = songIndex;
        j1.modules.amplitudejs.data.atp.playlist = playlist;

        if (volumeSlider !== null) {
          const fadeOutInterval = setInterval(() => {
            newVolume = startVolume * (1 - currentStep / steps);

            Amplitude.setVolume(newVolume);
            volumeSlider.value = newVolume;
            currentStep++;

            // seek current audio to total end to continue on next track
            if (currentStep > steps) {
              songs = Amplitude.getSongsInPlaylist(playlist);

              if (songIndex === songs.length-1) {
                isDev && logger.debug('\n' + `restore player volume on last trackID|volume at: ${trackID}|${defaultVolume}`);
                volumeSlider.value  =  defaultVolume;              
              }

              isFadingOut = false;
              clearInterval(fadeOutInterval);
            } 
          }, cycle);
        } // END if volumeSlider

      } // END atpFadeAudioOut

      // -----------------------------------------------------------------------
      // doNothingOnStateChange(state)
      //
      // wrraper for states that are not processed
      // -----------------------------------------------------------------------
      function doNothingOnStateChange(state) {
        var playlist, playerID, songMetaData,
            songIndex, trackID;
        
        playlist      = Amplitude.getActivePlaylist();
        playerID      = playlist + '_large';
        songMetaData  = Amplitude.getActiveSongMetadata();
        songIndex     = songMetaData.index;
        trackID       = songIndex + 1;

        // save AT player data for later use (e.g. events)
        // ---------------------------------------------------------------------
        j1.modules.amplitudejs.data.atp.activeIndex = songIndex;
        j1.modules.amplitudejs.data.atp.playlist = playlist;

        isDev && logger.warn('\n' + `DO NOTHING on StateChange for playlist: ${playlist} at trackID|state: ${trackID}|${AT_PLAYER_STATE_NAMES[state]}`);

      } // END doNothingOnStateChange

      // -----------------------------------------------------------------------
      // processOnStateChangePlaying()
      //
      // wrraper to process the ACTIVE player on state PLAYING
      // -----------------------------------------------------------------------      
      function processOnStateChangePlaying(state) {
        var songMetaData, songIndex,  playlist, trackID;

        songMetaData  = Amplitude.getActiveSongMetadata();
        songIndex     = songMetaData.index;
        playlist      = Amplitude.getActivePlaylist();
        trackID       = songIndex + 1;

        // save AT player data for later use (e.g. events)
        // ---------------------------------------------------------------------
        j1.modules.amplitudejs.data.atp.activeIndex = songIndex;
        j1.modules.amplitudejs.data.atp.playlist = playlist;

        isDev && logger.debug('\n' + `PLAY audio on AT Player at playlist|trackID: ${playlist}|${trackID}`);

        // save player GLOBAL data for later use (e.g. events)
        j1.adapter.amplitude.data.activePlayer  = 'atp';

        // set song (manually) active at index in playlist
        _this.setSongActive(playlist, songIndex);

        // stop active YT players
        // ---------------------------------------------------------------------
        _this.atpStopParallelActivePlayers(j1.adapter.amplitude.data.ytPlayers);

        // update song rating in playlist-screen|meta-container
        // ---------------------------------------------------------------------
        _this.atpUpdatMetaContainers(songMetaData);

        // scroll active song in players playlist
        // ---------------------------------------------------------------------
        _this.atPlayerScrollToActiveElement(songMetaData);

        // process audio for AT players at configured START position
        // ---------------------------------------------------------------------
        _this.atpProcessAudioStartPosition();

        // process audio for AT players at configured END position
        // ---------------------------------------------------------------------
        _this.atpProcessAudioEndPosition();

        // save YT player data for later use (e.g. events)
        // ---------------------------------------------------------------------
        j1.adapter.amplitude.data.activePlayer = 'atp';
        j1.adapter.amplitude.data.atpGlobals.activePlayerType = 'large';

      }; // END processOnStateChangePlaying

      // -----------------------------------------------------------------------
      // onInitialized
      //
      // Errors fired by the YT API
      // -----------------------------------------------------------------------
      function onInitialized() {
        // indicate api failed on initialization
        apiInitialized.state = true;
        j1.modules.amplitudejs.data.atp.apiReady = apiInitialized.state;
      } // END onInitialized

      // -----------------------------------------------------------------------
      // onAudioError
      //
      // Errors fired by the YT API
      // -----------------------------------------------------------------------
      function onAudioError(event) {
        if (event > 0) {
          isDev &&  logger.warn('\n' + `Audio API error occured: ${AUDIO_ERROR_NAMES[event]}`);
        }
      } // END onAudioError

      // -----------------------------------------------------------------------
      // onPlayerStateChange
      //
      // process all AT Player specific state changes
      // -----------------------------------------------------------------------
      // NOTE:
      // The AT API fires a lot of INTERMEDIATE states. MOST of them gets
      // ignored (do nothing). Currently, only state PLAYING is actively
      // processed.
      // -----------------------------------------------------------------------      
      function onPlayerStateChange(state) {

        // process all state changes fired by AT API
        // --------------------------------------------------------------------- 
        switch(state) {
          case AT_PLAYER_STATE.UNSTARTED:
            doNothingOnStateChange(AT_PLAYER_STATE.UNSTARTED);
            break;
          case AT_PLAYER_STATE.STOPPED:
            doNothingOnStateChange(AT_PLAYER_STATE.STOPPED);
            break;            
          case AT_PLAYER_STATE.PAUSED:
            doNothingOnStateChange(AT_PLAYER_STATE.PAUSED);
            break;
          case AT_PLAYER_STATE.PREVIOUS:
            doNothingOnStateChange(AT_PLAYER_STATE.PREVIOUS);
            break;            
          case AT_PLAYER_STATE.NEXT:
            doNothingOnStateChange(AT_PLAYER_STATE.NEXT);
            break;
          case AT_PLAYER_STATE.CHANGED:
            doNothingOnStateChange(AT_PLAYER_STATE.CHANGED);
            break;
          case AT_PLAYER_STATE.PLAYING:
            processOnStateChangePlaying(AT_PLAYER_STATE.PLAYING);
            break;
          case AT_PLAYER_STATE.ENDED:
            doNothingOnStateChange(AT_PLAYER_STATE.ENDED);
            break;
          default:
            logger.error('\n' + `UNKNOWN state on StateChange fired: ${state}`);
        } // END switch state
      } // END onPlayerStateChange

    }, // END initApi

    // -------------------------------------------------------------------------
    // monitorPlayerActiveElementChanges
    //
    // -------------------------------------------------------------------------
    // monitorPlayerActiveElementChanges: () => {
    //   // var playerSongContainers = document.getElementsByClassName("large-player-title-list");
    //   var playerSongContainers = document.getElementsByClassName("large-player-title-list");
    //   for (var i=0; i<playerSongContainers.length; i++) {
    //     var scrollableList = document.getElementById(playerSongContainers[0].id);
    //     var observer = new MutationObserver((mutationsList, observer) => {
    //       for (const mutation of mutationsList) {
    //         if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
    //           // Überprüfen, ob das geänderte Element jetzt die aktive Klasse besitzt
    //           if (mutation.target.classList.contains('amplitude-active-song-container')) {
    //             scrollableList.scrollTop = mutation.target.offsetTop;
    //           }
    //         }
    //       }
    //     }); // END observer

    //     // Optionen für den Observer: Nur Änderungen an Attributen beobachten
    //     observer.observe(scrollableList, {
    //       attributes: true,
    //       subtree:    true
    //     }); // END observer options

    //   } // END for playerSongContainers
    // }, // END monitorPlayerActiveElementChanges

    // -------------------------------------------------------------------------
    // initPlayerUiEvents
    // -------------------------------------------------------------------------
    initPlayerUiEvents: () => {

      var dependencies_met_player_instances_initialized = setInterval (() => {
        if (apiInitialized.state) {
          var parentContainer = (document.getElementById('{{xhr_container_id}}') !== null) ? true : false;
          var parentContainerExist = ($('#' + '{{xhr_container_id}}')[0] !== undefined) ? true : false;

          isDev &&  logger.info('\n' + 'initialize player specific UI events: started');
          
          {% for player in amplitude_options.players %} {% if player.enabled %}
            {% assign xhr_data_path = amplitude_options.xhr_data_path %}
            {% capture xhr_container_id %}{{player.id}}_audio{% endcapture %}

            // dynamic loader variable to setup the player on ID {{player.id}}
            dependency                    = 'dependencies_met_player_loaded_{{player.id}}';
            load_dependencies[dependency] = '';

            // -----------------------------------------------------------------
            // initialize player instance (when player UI is loaded)
            // -----------------------------------------------------------------
            load_dependencies['dependencies_met_player_loaded_{{player.id}}'] = setInterval (() => {
              var xhrDataLoaded      = (j1.xhrDOMState['#' + '{{xhr_container_id}}'] === 'success') ? true : false;
              var playerExistsInPage = ($('#' + '{{xhr_container_id}}')[0] !== undefined) ? true : false;

              // check the player HTML portion is loaded and player exists (in page)
              if (xhrDataLoaded && playerExistsInPage) {
                var playerID      = '{{player.id}}';
                var playerType    = '{{player.type}}';
                var playlist      = '{{player.playlist}}';
                var playlistName  = '{{player.playlist.name}}';
                var playlistTitle = '{{player.playlist.title}}';

                isDev && logger.debug('\n' + 'initialize audio player instance on id: {{player.id}}');

                // set song (title) specific audio info links
                // -------------------------------------------------------------
                if (playlistAudioInfo) {
                  var infoLinks = document.getElementsByClassName('audio-info-link');
                  _this.setAudioInfo(infoLinks);
                }

                // set player specific UI events
                // -------------------------------------------------------------
                isDev && logger.debug('\n' + 'setup audio player specific UI events on ID #{{player.id}}: started');

                var dependencies_met_api_initialized = setInterval (() => {
                  if (apiInitialized.state) {
                    amplitudePlayerState = Amplitude.getPlayerState();

                    {% comment %} process UI events for all MINI Players
                    ------------------------------------------------------------ {% endcomment %}
                    {% if player.id contains 'mini' %}
                    if (document.getElementById('{{player.id}}') !== null) {

                      {% comment %} PREPARED event listener for LATER use
                      ----------------------------------------------------------
                      // click on play_pause button (MINI player)
                      var miniPlayerPlayPauseButton = document.getElementsByClassName('mini-player-play-pause');
                      for (var i=0; i<miniPlayerPlayPauseButton.length; i++) {
                        if (miniPlayerPlayPauseButton[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing (managed by plugin)
                        } else {
                          // var currentPlaylist = compactPlayerPlayPauseButton[i].dataset.amplitudePlaylist;
                          // if (currentPlaylist === playlistName) {
                          if (miniPlayerPlayPauseButton[i].id === 'mini_player_play_pause_{{player.id}}') {
                            miniPlayerPlayPauseButton[i].addEventListener('click', function(event) {
                              var ytpPlayer;

                              // save YT player data for later use (e.g. events)
                              j1.adapter.amplitude.data.activePlayer = 'atp';
                              j1.adapter.amplitude.data.atpGlobals.activePlayerType = 'mini';

                            }); // addEventListener END
                          } // END if miniPlayerPlayPauseButton
                        } // END if ATP
                      } // END for miniPlayerPlayPauseButton
                      ----------------------------------------------------------
                      {% endcomment %}

                      // add listeners to all progress bars found (MINI Player)
                      // -------------------------------------------------------
                      var progressBars = document.getElementsByClassName("mini-player-progress");
                      for (var i=0; i<progressBars.length; i++) {
                        if (progressBars[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing for YTP (managed by plugin)
                        } else {
                          progressBars[i].addEventListener('click', function(event) {
                            var offset = this.getBoundingClientRect();
                            var xpos   = event.pageX - offset.left;
  
                            Amplitude.setSongPlayedPercentage(
                              (parseFloat(xpos)/parseFloat(this.offsetWidth))*100);

                          }); // END addEventListener
                        } // END if progressBars
                      } // END for progressBars

                    } // END mini player UI events
                    {% endif %}


                    {% comment %} process UI events for all COMPACT Players
                    ------------------------------------------------------------ {% endcomment %}
                    {% if player.id contains 'compact' %}                 
                    if (document.getElementById('{{player.id}}') !== null) {

                      // show|hide scrollbar in playlist (compact player)
                      // -------------------------------------------------------                   
                      const songsInPlaylist = Amplitude.getSongsInPlaylist(playlistName);
                      if (songsInPlaylist.length <= playerScrollerSongElementMin) {
                        const titleListCompactPlayer = document.getElementById('compact_player_title_list_' + playlistName);
                        if (titleListCompactPlayer !== null) {
                          titleListCompactPlayer.classList.add('hide-scrollbar');
                        }
                      } // END if songsInPlaylist

                      // show playlist
                      // -------------------------------------------------------
                      var showPlaylist = document.getElementById("show_playlist_{{player.id}}");
                      if (showPlaylist !== null) {
                        showPlaylist.addEventListener('click', function(event) {
                          var scrollOffset = (window.innerWidth >= 720) ? -130 : -110;

                          // scroll player to top position
                          const targetDiv         = document.getElementById("show_playlist_{{player.id}}");
                          const targetDivPosition = targetDiv.offsetParent.offsetTop;
                          window.scrollTo(0, targetDivPosition + scrollOffset);

                          // open playlist
                          var playlistScreen = document.getElementById("playlist_screen_{{player.id}}");

                          playlistScreen.classList.remove('slide-out-top');
                          playlistScreen.classList.add('slide-in-top');
                          playlistScreen.style.display = "block";
                          playlistScreen.style.zIndex = "199";

                          // disable scrolling (if window viewport >= BS Medium and above)
                          if (window.innerWidth >= 720) {
                            if ($('body').hasClass('stop-scrolling')) {
                              return false;
                            } else {
                              $('body').addClass('stop-scrolling');
                            }
                          }

                        }); // END EventListener
                      } // END if showPlaylist

                      // hide playlist
                      // -------------------------------------------------------                    
                      var hidePlaylist = document.getElementById("hide_playlist_{{player.id}}");
                      if (hidePlaylist !== null) {
                        hidePlaylist.addEventListener('click', function(event) {
                          var playlistScreen = document.getElementById("playlist_screen_{{player.id}}");

                          playlistScreen.classList.remove('slide-in-top');
                          playlistScreen.classList.add('slide-out-top');
                          playlistScreen.style.display = "none";
                          playlistScreen.style.zIndex = "1";

                          // enable scrolling
                          if ($('body').hasClass('stop-scrolling')) {
                            $('body').removeClass('stop-scrolling');
                          }

                        }); // END addEventListener
                      } // END if hidePlaylist

                      // add listeners to all progress bars found (compact-player)
                      // -------------------------------------------------------
                      var progressBars = document.getElementsByClassName("compact-player-progress");
                      for (var i=0; i<progressBars.length; i++) {
                        if (progressBars[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing for YTP (managed by plugin)
                        } else {
                          progressBars[i].addEventListener('click', function(event) {
                            var offset = this.getBoundingClientRect();
                            var xpos   = event.pageX - offset.left;

                            Amplitude.setSongPlayedPercentage(
                              (parseFloat(xpos)/parseFloat(this.offsetWidth))*100);

                            }); // END EventListener 'click'
                        } // END if progressBars
                      } // END for progressBars

                      // add listeners to all Next Buttons found (COMPACT player)
                      // -------------------------------------------------------

                      {% comment %} PREPARED event listener for LATER use
                      ----------------------------------------------------------
                      var compactNextButtons = document.getElementsByClassName("compact-player-next");
                      for (var i=0; i<compactNextButtons.length; i++) {
                        if (compactNextButtons[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing for YTP (managed by plugin)
                        } else {                        
                          if (compactNextButtons[i].id === 'compact_player_next_{{player.id}}' || compactNextButtons[i].id === 'compact_player_list_next_{{player.id}}') {
                            compactNextButtons[i].addEventListener('click', function(event) {
                              var atpPlayerID     = this.id;
                              var atpPlayerActive = atpPlayerID.split('_');
    
                              j1.adapter.amplitude.data.atpGlobals.activePlayerType = 'compact';

                            }); // END EventListener 'click'
                          } // END if ID
                        }
                      } // END Next Buttons (COMPACT player)
                      ----------------------------------------------------------
                      {% endcomment %}

                      {% comment %} PREPARED event listener for LATER use
                      ----------------------------------------------------------
                      // add listeners to all Previous Buttons found
                      var compactPreviousButtons = document.getElementsByClassName("compact-player-previous");
                      for (var i=0; i<compactPreviousButtons.length; i++) {
                        if (compactPreviousButtons[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing for YTP (managed by plugin)
                        } else { 
                          if (compactPreviousButtons[i].id === 'compact_player_previous_{{player.id}}' || compactPreviousButtons[i].id === 'compact_player_list_previous_{{player.id}}') {
                            compactPreviousButtons[i].addEventListener('click', function(event) {
                              var atpPlayerID     = this.id;
                              var atpPlayerActive = atpPlayerID.split('_');
    
                              j1.adapter.amplitude.data.atpGlobals.activePlayerType = 'compact';

                            }); // END EventListener 'click'
                          } // END if ID
                        }
                      } // END Previous Buttons (COMPACT player)
                      ----------------------------------------------------------
                      {% endcomment %}

                      {% comment %} PREPARED event listener for LATER use
                      ---------------------------------------------------------- 
                      // click on play_pause button (COMPACT player)
                      var compactPlayerPlayPauseButton = document.getElementsByClassName('compact-player-play-pause');
                      for (var i=0; i<compactPlayerPlayPauseButton.length; i++) {
                        if (compactPlayerPlayPauseButton[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing (managed by plugin)
                        } else {
                          // var currentPlaylist = compactPlayerPlayPauseButton[i].dataset.amplitudePlaylist;
                          // if (currentPlaylist === playlistName) {
                          if (compactPlayerPlayPauseButton[i].id === 'compact_player_play_pause_{{player.id}}' || compactPlayerPlayPauseButton[i].id === 'compact_player_list_play_pause_{{player.id}}') {
                            compactPlayerPlayPauseButton[i].addEventListener('click', function(event) {
                              var ytpPlayer;
                              var ytpPlayerState;
                              var playerState;

                              // stop active YT players
                              const ytPlayers = Object.keys(j1.adapter.amplitude.data.ytPlayers);
                              for (let i=0; i<ytPlayers.length; i++) {
                                const playerID = ytPlayers[i];
                                const playerProperties = j1.adapter.amplitude.data.ytPlayers[playerID];
                                isDev && logger.debug('\n' + `process player id: ${playerID}`);
                                ytpPlayer       = j1.adapter.amplitude.data.ytPlayers[playerID].player;
                                playerState     = ytpPlayer.getPlayerState();
                                ytpPlayerState  = YT_PLAYER_STATE_NAMES[playerState];

                                if (ytpPlayerState === 'playing' || ytpPlayerState === 'paused' || ytpPlayerState === 'buffering') {
                                  isDev && logger.debug('\n' + `process player id: ${playerID} stopped`);
                                  ytpPlayer.stopVideo();
                                }
                              }

                              // save YT player data for later use (e.g. events)
                              j1.adapter.amplitude.data.activePlayer = 'atp';
                              j1.adapter.amplitude.data.atpGlobals.activePlayerType = 'compact';

                              });
                          }
                        }
                      } // END play_pause button (COMPACT player)
                      ----------------------------------------------------------
                      {% endcomment %}

                      // click on skip forward|backward (COMPACT player)
                      // See: https://github.com/serversideup/amplitudejs/issues/384
                      // -------------------------------------------------------

                      // add listeners to all SkipForwardButtons found
                      var compactPlayerSkipForwardButtons = document.getElementsByClassName("compact-player-skip-forward");
                      for (var i=0; i<compactPlayerSkipForwardButtons.length; i++) {
                        if (compactPlayerSkipForwardButtons[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing for YTP (managed by plugin)
                        } else {                         
                          if (compactPlayerSkipForwardButtons[i].id === 'skip-forward_{{player.id}}') {
                            compactPlayerSkipForwardButtons[i].addEventListener('click', function(event) {

                              // load player settings
                              // playerForwardBackwardSkipSeconds = (playerSettings.forward_backward_skip_seconds === undefined) ? playerForwardBackwardSkipSeconds: playerSettings.forward_backward_skip_seconds;

                              const skipOffset  = parseFloat(playerForwardBackwardSkipSeconds);
                              const duration    = Amplitude.getSongDuration();
                              const currentTime = parseFloat(Amplitude.getSongPlayedSeconds());
                              const targetTime  = parseFloat(currentTime + skipOffset);

                              if (currentTime > 0) {
                                Amplitude.setSongPlayedPercentage((targetTime / duration) * 100);
                              }

                            }); // END EventListener 'click'
                          } // END if ID
                        }
                      } // END SkipForwardButtons (COMPACT player)

                      // add listeners to all SkipBackwardButtons found
                      var compactPlayerSkipBackwardButtons = document.getElementsByClassName("compact-player-skip-backward");
                      for (var i=0; i<compactPlayerSkipBackwardButtons.length; i++) {
                        if (compactPlayerSkipBackwardButtons[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing for YTP (managed by plugin)
                        } else {                         
                          if (compactPlayerSkipBackwardButtons[i].id === 'skip-backward_{{player.id}}') {
                            compactPlayerSkipBackwardButtons[i].addEventListener('click', function(event) {

                              // load player settings
                              // playerForwardBackwardSkipSeconds = (playerSettings.forward_backward_skip_seconds === undefined) ? playerForwardBackwardSkipSeconds: playerSettings.forward_backward_skip_seconds;

                              const skipOffset  = parseFloat(playerForwardBackwardSkipSeconds);
                              const duration    = Amplitude.getSongDuration();
                              const currentTime = parseFloat(Amplitude.getSongPlayedSeconds());
                              const targetTime  = parseFloat(currentTime - skipOffset);

                              if (currentTime > 0) {
                                Amplitude.setSongPlayedPercentage((targetTime / duration) * 100);
                              }

                            }); // END EventListener 'click'
                          } // END if ID
                        }
                      } // END SkipBackwardButtons (COMPACT player)

                      // click on shuffle button
                      var compactPlayerShuffleButton = document.getElementById('compact_player_shuffle');
                      if (compactPlayerShuffleButton) {
                        compactPlayerShuffleButton.addEventListener('click', function(event) {
                          var shuffleState = (document.getElementById('compact_player_shuffle').className.includes('amplitude-shuffle-on')) ? true : false;

                          Amplitude.setShuffle(shuffleState)

                        }); // END EventListener 'click'
                      } // END PlayerShuffleButton (COMPACT player)

                      // click on repeat button
                      var compactPlayerRepeatButton = document.getElementById('compact_player_repeat');
                      if (compactPlayerRepeatButton) {
                        compactPlayerRepeatButton.addEventListener('click', function(event) {
                          var repeatState = (document.getElementById('compact_player_repeat').className.includes('amplitude-repeat-on')) ? true : false;

                          Amplitude.setRepeat(repeatState)

                        }); // END EventListener 'click'
                      } // END PlayerRepeatButton (COMPACT player)

                    } // END compact player UI events
                    {% endif %}


                    {% comment %} process UI events for all LARGE Players
                    ------------------------------------------------------------ {% endcomment %}
                    {% if player.id contains 'large' %}

                    if (document.getElementById('{{player.id}}') !== null) {
                      // var playlist = '{{player.id}}_yt';
                      var playlistInfo  = {{player.playlist | replace: 'nil', 'null' | replace: '=>', ':'}};
                      var playlist      = playlistInfo.name;

                      {% comment %} PREPARED event listener for LATER use
                      ----------------------------------------------------------
                      // add listeners to all SongContainers found (LARGE player)
                      // -------------------------------------------------------                      
                      var largePlayerSongContainer = document.getElementsByClassName("amplitude-song-container");
                      for (var i=0; i<largePlayerSongContainer.length; i++) {
                        if (largePlayerSongContainer[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing for YTP (managed by plugin)
                        } else {
                          var currentPlaylist = largePlayerSongContainer[i].dataset.amplitudePlaylist;
                          if (currentPlaylist === playlist) {
                          // if (largePlayerSongContainer[i].id === 'large-player-play-pause_{{player.id}}' || largePlayerSongContainer[i].id === 'large-player-play-pause_{{player.id}}') {
                            largePlayerSongContainer[i].addEventListener('click', function(event) {
                              var ytpPlayer, ytpPlayerState, ytpPlayerState, atpPlayerState,
                                  playerState, classArray, atpPlayerActive, metaData,
                                  playlist, playlistIndex;

                              classArray      = [].slice.call(this.classList, 0);
                              atpPlayerActive = classArray[0].split('-');
                              playlist        = this.getAttribute("data-amplitude-playlist");
                              playlistIndex   = parseInt(this.getAttribute("data-amplitude-song-index"));
                              metaData        = Amplitude.getActiveSongMetadata();
                              atpPlayerState  = Amplitude.getPlayerState();

                              // stop active YT players
                              // -----------------------------------------------
                              const ytPlayers = Object.keys(j1.adapter.amplitude.data.ytPlayers);
                              for (let i=0; i<ytPlayers.length; i++) {
                                const playerID = ytPlayers[i];
                                const playerProperties = j1.adapter.amplitude.data.ytPlayers[playerID];
                                isDev && logger.debug('\n' + 'process player id: ' + playerID);
                                ytpPlayer       = j1.adapter.amplitude.data.ytPlayers[playerID].player;
                                playerState     = ytpPlayer.getPlayerState();
                                ytpPlayerState  = YT_PLAYER_STATE_NAMES[playerState];

                                if (ytpPlayerState === 'playing' || ytpPlayerState === 'paused' || ytpPlayerState === 'buffering') {
                                  isDev && logger.debug('\n' + `process player id: ${playerID} stopped`);
                                  ytpPlayer.stopVideo();
                                }
                              }

                              // save YT player data for later use (e.g. events)
                              // -----------------------------------------------
                              j1.adapter.amplitude.data.activePlayer = 'atp';
                              j1.adapter.amplitude.data.atpGlobals.activePlayerType = atpPlayerActive[3];

                            }); // END add EventListener
                          } // END if currentPlaylist
                        } // ENF if largePlayerSongContainer
                      } // END for largePlayerSongContainer
                      ----------------------------------------------------------
                      {% endcomment %}

                      // click on prev button
                      var largePlayerPreviousButton = document.getElementById('large_player_previous');
                      if (largePlayerPreviousButton && largePlayerPreviousButton.getAttribute("data-amplitude-source") === 'youtube') {
                        // do nothing for YTP (managed by plugin)
                      }

                      {% comment %} PREPARED event listener for LATER use
                      ----------------------------------------------------------
                      // add listeners to all PlayPause Buttons found (LARGE player)
                      // -------------------------------------------------------                      
                      var largePlayerPlayPauseButton = document.getElementsByClassName('large-player-play-pause');
                      for (var i=0; i<largePlayerPlayPauseButton.length; i++) {
                        if (largePlayerPlayPauseButton[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing for YTP (managed by plugin)
                        } else {
                          var currentPlaylist = largePlayerPlayPauseButton[i].dataset.amplitudePlaylist;                          
                          if (currentPlaylist === playlist) {                        
                            largePlayerPlayPauseButton[i].addEventListener('click', function(event) {
                              var ytpPlayer, ytpPlayerState, playlist, metaData, playerState;

                              metaData = Amplitude.getActiveSongMetadata();
                              playlist = this.getAttribute("data-amplitude-playlist");

                            });
                          }
                        }
                      } // END play_pause button (LARGE player)
                      ----------------------------------------------------------
                      {% endcomment %}

                      // add listeners to all progress bars found (LARGE player)
                      // -------------------------------------------------------
                      var progressBars = document.getElementsByClassName("large-player-progress");
                      for (var i=0; i<progressBars.length; i++) {
                        if (progressBars[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing for YTP (managed by plugin)
                        } else {
                          progressBars[i].addEventListener('click', function(event) {
                            var offset = this.getBoundingClientRect();
                            var xpos   = event.pageX - offset.left;

                            if (Amplitude.getPlayerState() === 'playing') {
                              Amplitude.setSongPlayedPercentage((parseFloat(xpos)/parseFloat(this.offsetWidth))*100);
                            }

                          }); // END EventListener 'click'
                        }
                      } // END for

                      {% comment %} PREPARED event listener for LATER use
                      ----------------------------------------------------------
                      // add listeners to all Next Buttons found (LARGE player)
                      // -------------------------------------------------------                      
                      var largeNextButtons = document.getElementsByClassName("large-player-next");
                      for (var i=0; i<largeNextButtons.length; i++) {
                        if (largeNextButtons[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing for YTP (managed by plugin)
                        } else {                        
                          if (largeNextButtons[i].id === 'large_player_next_{{player.id}}') {
                            largeNextButtons[i].addEventListener('click', function(event) {
                              var atpPlayerID, atpPlayerActive, metaData, playlist;
                           
                              atpPlayerID     = this.id;
                              atpPlayerActive = atpPlayerID.split('_');
                              playlist        = this.getAttribute("data-amplitude-playlist");
                              metaData        = Amplitude.getActiveSongMetadata();

                            }); // END EventListener 'click'
                          } // END addEventListener
                        } // END if largeNextButtons
                      } // END for Next Buttons
                      ----------------------------------------------------------
                      {% endcomment %}

                      {% comment %} PREPARED event listener for LATER use
                      ----------------------------------------------------------
                      // add listeners to all Previous Buttons found
                      // -------------------------------------------------------
                      var largePreviousButtons = document.getElementsByClassName("large-player-previous");
                      for (var i=0; i<largePreviousButtons.length; i++) {
                        if (largePreviousButtons[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing for YTP (managed by plugin)
                        } else {                          
                          if (largePreviousButtons[i].id === 'large_player_previous_{{player.id}}') {
                            largePreviousButtons[i].addEventListener('click', function(event) {
                              var atpPlayerID, atpPlayerActive, metaData, playlist;

                              atpPlayerID     = this.id;
                              atpPlayerActive = atpPlayerID.split('_');
                              playlist        = this.getAttribute("data-amplitude-playlist");
                              metaData        = Amplitude.getActiveSongMetadata();

                              // update song rating in screen controls
                              var largePlayerSongAudioRating = document.getElementsByClassName("audio-rating-screen-controls");
                              if (largePlayerSongAudioRating.length) {
                                for (var i=0; i<largePlayerSongAudioRating.length; i++) {
                                  var currentPlaylist = largePlayerSongAudioRating[i].dataset.amplitudePlaylist;
                                  if (currentPlaylist === playlist) {
                                    if (metaData.rating) {
                                      var trackID = metaData.index + 1;
                                      isDev && logger.debug('\n' + `UPDATE song rating on updatMetaContainers for trackID|playlist at: ${trackID}|${playlist} with a value of: ${metaData.rating}`);
                                      largePlayerSongAudioRating[i].innerHTML = '<img src="/assets/image/pattern/rating/scalable/' + metaData.rating + '-star.svg"' + 'alt="song rating">';
                                    } else {
                                      largePlayerSongAudioRating[i].innerHTML = '';
                                    }
                                  }
                                }
                              } // END if largePlayerSongAudioRating

                              // scroll song active at index in player
                              if (playerAutoScrollSongElement) {
                                j1.adapter.amplitude.atPlayerScrollToActiveElement(Amplitude.getActiveSongMetadata());
                              }                              

                              // scroll song active at index in player
                              if (playerAutoScrollSongElement) {
                                j1.adapter.amplitude.atPlayerScrollToActiveElement(Amplitude.getActiveSongMetadata());
                              }  

                              // save YT player data for later use (e.g. events)
                              j1.adapter.amplitude.data.activePlayer = 'atp';
                              j1.adapter.amplitude.data.atpGlobals.activePlayerType = atpPlayerActive[0];

                            }); // END addEventListener
                          } // END if largePreviousButtons
                        } // END if largePreviousButtons
                      } // END for Previous Buttons
                      ----------------------------------------------------------
                      {% endcomment %}

                      // add listeners to all SkipForward Buttons found
                      // See: https://github.com/serversideup/amplitudejs/issues/384
                      // -------------------------------------------------------
                      var largePlayerSkipForwardButtons = document.getElementsByClassName("large-player-skip-forward");
                      for (var i=0; i<largePlayerSkipForwardButtons.length; i++) {
                        if (largePlayerSkipForwardButtons[i].id === 'skip-forward_{{player.id}}') {
                          if (largePlayerSkipForwardButtons[i].dataset.amplitudeSource === 'youtube') {
                            // do nothing for YTP (managed by plugin)
                          } else {
                            largePlayerSkipForwardButtons[i].addEventListener('click', function(event) {
                              const skipOffset  = parseFloat(playerForwardBackwardSkipSeconds);
                              const duration    = Amplitude.getSongDuration();
                              const currentTime = parseFloat(Amplitude.getSongPlayedSeconds());
                              const targetTime  = parseFloat(currentTime + skipOffset);

                              if (currentTime > 0) {
                                isDev && logger.debug('\n' + `SKIP forward on Button skipForward for ${skipOffset} seconds`);
                                Amplitude.setSongPlayedPercentage((targetTime / duration) * 100);
                              }
                            }); // END addEventListener
                          } // END largePlayerSkipForwardButtons
                        } // END if largePlayerSkipForwardButtons
                      } // END for SkipForwardButtons

                      // add listeners to all SkipBackward Buttons found
                      // -------------------------------------------------------
                      var largePlayerSkipBackwardButtons = document.getElementsByClassName("large-player-skip-backward");
                      for (var i=0; i<largePlayerSkipBackwardButtons.length; i++) {
                        if (largePlayerSkipBackwardButtons[i].id === 'skip-backward_{{player.id}}') {
                          if (largePlayerSkipBackwardButtons[i].dataset.amplitudeSource === 'youtube') {
                            // do nothing for YTP (managed by plugin)
                          } else {
                            largePlayerSkipBackwardButtons[i].addEventListener('click', function(event) {
                              const skipOffset  = parseFloat(playerForwardBackwardSkipSeconds);
                              const duration    = Amplitude.getSongDuration();
                              const currentTime = parseFloat(Amplitude.getSongPlayedSeconds());
                              const targetTime  = parseFloat(currentTime - skipOffset);

                              if (currentTime > 0) {
                                isDev && logger.debug('\n' + `SKIP backward on Button skipForward for ${skipOffset} seconds`);
                                Amplitude.setSongPlayedPercentage((targetTime / duration) * 100);
                              }
                            }); // END addEventListener
                          } // END else
                        } // END if largePlayerSkipBackwardButtons
                      } // END for SkipBackwardButtons

                      // click on shuffle button
                      var largePlayerShuffleButton = document.getElementById('large_player_shuffle');
                      if (largePlayerShuffleButton) {
                        largePlayerShuffleButton.addEventListener('click', function(event) {
                          var shuffleState = (document.getElementById('large_player_shuffle').className.includes('amplitude-shuffle-on')) ? true : false;
                          isDev && logger.debug('\n' + `Set shuffle state to: ${shuffleState}`);
                          Amplitude.setShuffle(shuffleState)
                        }); // END addEventListener
                      } // END if largePlayerShuffleButton

                      // click on repeat button
                      var largePlayerRepeatButton = document.getElementById('large_player_repeat');
                      if (largePlayerRepeatButton) {
                        largePlayerRepeatButton.addEventListener('click', function(event) {
                          var repeatState = (document.getElementById('large_player_repeat').className.includes('amplitude-repeat-on')) ? true : false;
                          isDev && logger.debug('\n' + `Set repeat state to: ${repeatState}`);
                          Amplitude.setRepeat(repeatState)
                        }); // END addEventListener
                      } // END if largePlayerRepeatButton

                      // enable|disable PAGE scrolling on players playlist (LARGE player)
                      // -------------------------------------------------------
                      // if (playerHoverPageScrollDisabled && document.getElementById('large_player_right') !== null) {
                      if (playerHoverPageScrollDisabled) {                        

                        // show|hide scrollbar in playlist
                        // -----------------------------------------------------
                        const songsInPlaylist = Amplitude.getSongsInPlaylist(playlistName);
                        if (songsInPlaylist.length <= playerScrollerSongElementMin) {
                          const titleListLargePlayer = document.getElementById('large_player_title_list_' + playlistName);
                          if (titleListLargePlayer !== null) {
                            titleListLargePlayer.classList.add('hide-scrollbar');
                          }
                        } // END show|hide scrollbar in playlist

                        // scroll player to top position (LARGE player)
                        //
                        // Bootstrap grid breakpoints
                        //   SN:     576px           Mobile
                        //   MD:     768px           Small Desktop|Tablet
                        //   LG:     992px           Default Desktop
                        //   XL:     1200px          Large Desktop
                        //   XXL:    1400px          X Large Desktop
                        // -----------------------------------------------------

                        var largePlayerTitleHeader = document.getElementById("large_player_title_header_{{player.id}}");
                        largePlayerTitleHeader.addEventListener('click', function(event) {
                          var playerRight     = document.getElementById("{{player.id}}");
                          var playlistHeader  = document.getElementById("playlist_header_{{player.id}}");
                          var scrollOffset    = (window.innerWidth >= 992) ? -130 : -44;

                          // scroll player|playlist to top position (LARGE player)
                          // NOTE: depending on WINDOW SIZE the relation changes to TOP POSITION (targetDivPosition)
                          // -- ------------------------------------------------
                          const targetDivPlayerRight            = playerRight;
                          const targetDivPositionPlayerRight    = targetDivPlayerRight.offsetTop;
                          const targetDivPlaylistHeader         = playlistHeader;
                          const targetDivPositionplaylistHeader = targetDivPlaylistHeader.offsetTop;

                          if (targetDivPositionPlayerRight > targetDivPositionplaylistHeader) {
                            window.scrollTo(0, targetDivPositionPlayerRight + targetDivPlaylistHeader.offsetParent.firstElementChild.clientHeight + scrollOffset);
                          } else {
                            window.scrollTo(0, targetDivPositionplaylistHeader + scrollOffset);
                          }

                        }); // END addEventListener

                        var largePlayerPlaylistHeader = document.getElementById("playlist_header_{{player.id}}");
                        largePlayerPlaylistHeader.addEventListener('click', function(event) {
                          var playerRight     = document.getElementById("{{player.id}}");
                          var playlistHeader  = document.getElementById("playlist_header_{{player.id}}");
                          var scrollOffset    = (window.innerWidth >= 992) ? -130 : -44;

                          // scroll player|playlist to top position (LARGE player)
                          //
                          const targetDivPlayerRight            = playerRight;
                          const targetDivPositionPlayerRight    = targetDivPlayerRight.offsetTop;
                          const targetDivPlaylistHeader         = playlistHeader;
                          const targetDivPositionplaylistHeader = targetDivPlaylistHeader.offsetTop;

                          // NOTE: depending on WINDOW SIZE the relation changes to TOP POSITION (targetDivPosition)
                          //
                          if (targetDivPositionPlayerRight > targetDivPositionplaylistHeader) {
                            window.scrollTo(0, targetDivPositionPlayerRight + targetDivPlaylistHeader.offsetParent.firstElementChild.clientHeight + scrollOffset);
                          } else {
                            window.scrollTo(0, targetDivPositionplaylistHeader + scrollOffset);
                          }

                        }); // END addEventListener

                        // disable scrolling (if window viewport >= BS Medium and above)
                        document.getElementById('large_player_right').addEventListener('mouseenter', function() {
                          if (window.innerWidth >= 720) {
                            if ($('body').hasClass('stop-scrolling')) {
                              return false;
                            } else {
                              $('body').addClass('stop-scrolling');
                            }
                          }
                        }); // END addEventListener

                        // enable scrolling
                        document.getElementById('large_player_right').addEventListener('mouseleave', function() {
                          if ($('body').hasClass('stop-scrolling')) {
                            $('body').removeClass('stop-scrolling');
                          }
                        }); // END addEventListener

                      } // END enable|disable PAGE scrolling on players playlist

                      // set volume slider presets (for the player when exists|enabled)
                      //
                      var volumeSlider = document.getElementById('volume_slider_{{player.id}}');
                      if (volumeSlider !== null) {
                        const volumeMin     = parseInt('{{player.volume_slider.min_value}}'); 
                        const volumeMax     = parseInt('{{player.volume_slider.max_value}}'); 
                        const volumeValue   = parseInt('{{player.volume_slider.preset_value}}'); 
                        const volumeStep    = parseInt('{{player.volume_slider.slider_step}}'); 
  
                        // if player has NO slider presets, use amplitude defaults
                        //
                        volumeSlider.min    = (isNaN(volumeMin))   ? parseInt('{{amplitude_default.player.volume_slider.min_value}}')    : volumeMin;
                        volumeSlider.max    = (isNaN(volumeMax))   ? parseInt('{{amplitude_default.player.volume_slider.max_value}}')    : volumeMax;
                        volumeSlider.value  = (isNaN(volumeValue)) ? parseInt('{{amplitude_default.player.volume_slider.preset_value}}') : volumeValue;
                        volumeSlider.step   = (isNaN(volumeStep))  ? parseInt('{{amplitude_default.player.volume_slider.slider_step}}')  : volumeStep; 
                      } // END volumeSlider exists

                    } // END large player UI events
                    {% endif %}

                    {% comment %} END process UI events for all LARGE Players
                    ------------------------------------------------------------ {% endcomment %}

                    // ---------------------------------------------------------
                    // START configured player features

                    isDev && logger.debug('\n' + `set play next title: ${playerPlayNextTitle}`);
                    isDev && logger.debug('\n' + `set delay between titles: ${playerDelayNextTitle}ms`);
                    isDev && logger.debug('\n' + `set repeat (album): ${playerRepeat}`);
                    isDev && logger.debug('\n' + `set shuffle (album): ${playerShuffle}`);

                    // set delay between titles (songs)
                    Amplitude.setDelay(playerDelayNextTitle);
                    // set repeat (album)
                    Amplitude.setRepeat(playerRepeat);
                    // set shuffle (album)
                    Amplitude.setShuffle(playerShuffle);

                    // ---------------------------------------------------------
                    // END configured player features

                    // finished messages
                    // ---------------------------------------------------------
                    isDev && logger.debug('\n' + `current player state: ${amplitudePlayerState}`);
                    isDev && logger.debug('\n' + 'setup player specific UI events on ID #{{player.id}}: finished');

                    clearInterval(dependencies_met_api_initialized);
                  } // END if apiInitialized
                }, 10); // END dependencies_met_api_initialized

                playerExistsInPage   = (document.getElementById('{{player.id}}_audio') !== null) ? true : false;
                pluginManagerEnabled = ('{{player.plugin_manager.enabled}}'.length > 0 && '{{player.plugin_manager.enabled}}' === 'true') ? true : playerDefaultPluginManager;

                var ytpPluginInstalled = j1.adapter.amplitude.data.atpGlobals.ytpInstalled;
                if (playerExistsInPage && pluginManagerEnabled && !ytpPluginInstalled) {
                  _this.pluginManager('{{player.plugin_manager.plugins}}');
                }

                clearInterval(load_dependencies['dependencies_met_player_loaded_{{player.id}}']);
              } // END if xhrLoadState success
            }, 10); // END dependencies_met_html_loaded

          {% endif %} {% endfor %}

          isDev && logger.info('\n' + 'initialize player specific UI events: finished');

          _this.setState('finished');
          isDev && logger.debug('\n' + `module state: ${_this.getState()}`);
          isDev && logger.info('\n' + 'module initialized successfully');

          endTimeModule = Date.now();
          isDev && logger.info('\n' + `module initializing time: ${(endTimeModule-startTimeModule)}ms`);

          clearInterval(dependencies_met_player_instances_initialized);
        } // END if apiInitialized
      }, 10); // END initialize player specific UI events
    }, // END initPlayerUiEvents

    // -------------------------------------------------------------------------
    // START setAudioInfo
    setAudioInfo: (audioInfo) => {
      // jadams: ??? new config setting 'pause_on_audio_info' ???
      // when the audioInfo link is clicked, stop all propagation so
      // Amplitude doesn't play the song.
      for (var i=0; i<audioInfo.length; i++) {
        audioInfo[i].addEventListener('click', function (event) {
          event.stopPropagation();
        });
      }
    }, // END setAudioInfo

    // -------------------------------------------------------------------------
    // songEvents
    // -------------------------------------------------------------------------
    songEvents: (songs) => {
      isDev && logger.debug('\n' + `initializing title events for player on ID #${playerID}: started`);

      for (var i = 0; i < songs.length; i++) {
        // ensure that on mouseover, CSS styles don't get messed up for active songs
        songs[i].addEventListener('mouseover', function() {
          // active song indicator (mini play button) in playlist
          if (!this.classList.contains('amplitude-active-song-container')) {
            if (this.querySelectorAll('.play-button-container')[0] !== undefined) {
              this.querySelectorAll('.play-button-container')[0].style.display = 'block';
            }
          } // END mini play button in playlist
        }); // END EventListener 'mouseover' (songlist)

        // ensure that on mouseout, CSS styles don't get messed up for active songs
        songs[i].addEventListener('mouseout', function() {
          if (this.querySelectorAll('.play-button-container')[0] !== undefined) {
            this.querySelectorAll('.play-button-container')[0].style.display = 'none';
          }
        }); // END EventListener 'mouseout' (songlist)

        // show|hide the (mini) play button when the song is clicked
        songs[i].addEventListener('click', function () {
          if (this.querySelectorAll('.play-button-container')[0] !== undefined) {
            this.querySelectorAll('.play-button-container')[0].style.display = 'none';
          }
        }); // END EventListener 'click' (songlist)
      }

      isDev && logger.debug('\n' + `initializing title events for player on ID #${playerID}: finished`);
    }, // END songEvents

    // -------------------------------------------------------------------------
    // pluginManager()
    // -------------------------------------------------------------------------
    pluginManager: (plugin) => {      

      function isPluginLoaded(pluginName) {
        const scripts     = document.scripts;
        const pluginFile  = pluginName + '.js';

        for (let i = 0; i < scripts.length; i++) {
          if (scripts[i].src.includes(pluginFile)) {
            return true;
          }
        }
        return false;
      }

      if (plugin !== '' && plugin === 'ytp') {        
        var tech;
        var techScript;

        tech        = document.createElement('script');
        tech.id     = 'tech_' + plugin;
        tech.src    = '/assets/theme/j1/modules/amplitudejs/js/tech/' + plugin + '.js';
        techScript  = document.getElementsByTagName('script')[0];

        techScript.parentNode.insertBefore(tech, techScript);
      }

      if (plugin !== '' && isPluginLoaded(plugin)) {     
        isDev && logger.debug('\n' + `plugin loaded: ${plugin}`);

        // make sure the plugin installed only ONCE
        j1.adapter.amplitude.data.atpGlobals.ytpInstalled = true;
      }      
    }, // END pluginManager

    // -------------------------------------------------------------------------
    // atPlayerScrollToActiveElement(metaData)
    // -------------------------------------------------------------------------  
    atPlayerScrollToActiveElement: (metaData) => {
      var scrollableList, songIndex, playlist,
          activeElement, activeElementOffsetTop, numSongs,
          songElementMin, playerSongElementHeigthCompact;

      if (!playerAutoScrollSongElement) {
        // do nothing if playerAutoScrollSongElement is false
        return;
      }

      songIndex       = metaData.index;
      songElementMin  = playerScrollerSongElementMin;
      playlist        = metaData.playlist;
      scrollableList  = document.getElementById('large_player_title_list_' + playlist);
      activeElement   = scrollableList.querySelector('.amplitude-active-song-container');
      numSongs        = Amplitude.getSongsInPlaylist(playlist).length;

      if (activeElement === null || scrollableList === null)  {
        // do nothing if NO scrollableList or ACTIVE element found (failsafe)
        return;
      }

      // LARGE players
      // -----------------------------------------------------------------------
      if (songIndex > 0 && numSongs >= songElementMin) {
        activeElementOffsetTop    = songIndex * j1.adapter.amplitude.data.playerSongElementHeigth;
        scrollableList.scrollTop  = activeElementOffsetTop;        
      } else {
        // do nothing if songIndex is 0 or less than songElementMin
        return; 
      }

      // save AT player data for later use (e.g. events)
      // -----------------------------------------------------------------------
      j1.modules.amplitudejs.data.atp.activeIndex = songIndex;
      j1.modules.amplitudejs.data.atp.playlist = playlist;

      // COMPACT players (WIP)
      // -----------------------------------------------------------------------
      // playerSongElementHeigthCompact  = 74.00; 
      // if (songIndex > 0 && numSongs >= songElementMin) {
      //   // scrollableList            = document.getElementById('compact_player_title_list_' + metaData.playlist);
      //   // activeElement             = scrollableList.querySelector('.amplitude-active-song-container');
      //   activeElementOffsetTop    = (songIndex * playerSongElementHeigthCompact);
      //   scrollableList.scrollTop  = activeElementOffsetTop;        
      // } else {
      //   // do nothing if songIndex is 0 or less than songElementMin
      //   return; 
      // }

    }, // END atPlayerScrollToActiveElement

    // -------------------------------------------------------------------------
    // atpUpdatMetaContainers(playlist, rating)
    // update song rating in playlist-screen|meta-container
    // for all (compact|large) players
    // -------------------------------------------------------------------------
    atpUpdatMetaContainers: (metaData) => {
      var activePlayist   = metaData.playlist;
      var rating          = parseInt(metaData.rating);
      var trackID         = metaData.index + 1;
      const notRequiredForATP = true

      isDev && logger.debug('\n' + `UPDATE metadata on atpUpdatMetaContainers for trackID|playlist at: ${trackID}|${activePlayist}`);

      // properties automatically set by AT API
      if (requiredForATP) {
        // update SONG NAME in meta-containers
        var songName = document.getElementsByClassName("song-name");
        if (songName.length) {
          for (var i=0; i<songName.length; i++) {    
            var currentPlaylist = songName[i].dataset.amplitudePlaylist;
            if (currentPlaylist === activePlayist) {
              songName[i].innerHTML = metaData.name;
            }
          }
        }
      }

      // properties automatically set by AT API
      if (requiredForATP) {
        // update SONG ARTIST name in meta-containers
        var artistName = document.getElementsByClassName("artist");
        if (artistName.length) {
          for (var i=0; i<artistName.length; i++) {    
            var currentPlaylist = songName[i].dataset.amplitudePlaylist;
            if (currentPlaylist === activePlayist) {
              artistName[i].innerHTML = metaData.artist;
            }
          }
        }
      }

      // properties automatically set by AT API
      if (requiredForATP) {
        // update SONG ALBUM name in meta-containers
        var albumName = document.getElementsByClassName("album");
        if (albumName.length) {
          for (var i=0; i<albumName.length; i++) {    
            var currentPlaylist = albumName[i].dataset.amplitudePlaylist;
            if (currentPlaylist === activePlayist) {
              albumName[i].innerHTML = metaData.album;
            }
          }
        }
      }

      // update SONG RATING in screen controls
      var screenControlRatingElements = document.getElementsByClassName('audio-rating-screen-controls');
      if (rating) {
        for (let i=0; i<screenControlRatingElements.length; i++) {
          var ratingElement = screenControlRatingElements[i];
          if (ratingElement.dataset.amplitudePlaylist === activePlayist && ratingElement.classList.contains('audio-rating-screen-controls')) {          
            ratingElement.innerHTML = '<img src="/assets/image/pattern/rating/scalable/' + rating + '-star.svg"' + 'alt="song rating">';
          }
        }
      }

      // update SONG INFO in screen controls
      var songAudioInfo = document.getElementsByClassName("audio-info-link-screen-controls");
      if (songAudioInfo.length) {
        for (var i=0; i<songAudioInfo.length; i++) {
          var currentPlaylist = songAudioInfo[i].dataset.amplitudePlaylist;
          if (currentPlaylist === activePlayist) {
            if (metaData.audio_info) {
              songAudioInfo[i].setAttribute("href", metaData.audio_info);
            }
          }
        }
      } // END if songAudioInfo

    }, // END atpUpdatMetaContainers

    // -------------------------------------------------------------------------
    // atpStopParallelActivePlayers(players)
    // stop active YT players (running in parallel to AT players)
    // -------------------------------------------------------------------------
    atpStopParallelActivePlayers: (players) => {
      var ytPlayer, playerState, ytPlayerState;

      const ytPlayers = Object.keys(players);
      for (var i=0; i<ytPlayers.length; i++) {
        const ytPlayerID = ytPlayers[i];    

        ytPlayer      = players[ytPlayerID].player;
        playerState   = ytPlayer.getPlayerState();
        ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

        // stop YT players running in parallel
        // ---------------------------------------------------------------------
        var isValidPlayerState = /playing|paused|buffering/.test(ytPlayerState);
        if (isValidPlayerState) {        
          isDev && logger.debug('\n' + `STOP YT player on id: ${playerID}`);
          ytPlayer.stopVideo();
        }

        // toggle PlayPause buttons playing => puased
        // ---------------------------------------------------------------------
        var ytpButtonPlayerPlayPause = document.getElementsByClassName("large-player-play-pause-" + ytPlayerID);        
        for (var j=0; j<ytpButtonPlayerPlayPause.length; j++) {

          var htmlElement = ytpButtonPlayerPlayPause[j];
          if (htmlElement.dataset.amplitudeSource === 'youtube') {
            if (htmlElement.classList.contains('amplitude-playing')) {        
              htmlElement.classList.remove('amplitude-playing');
              htmlElement.classList.add('amplitude-paused');
            }           
          }
        } // END for ytpButtonPlayerPlayPause

      } // END for ytPlayers
    }, // END atpStopParallelActivePlayers

    // -------------------------------------------------------------------------
    // atpProcessAudioStartPosition()
    // process audio for configured START position
    // -------------------------------------------------------------------------
    atpProcessAudioStartPosition: () => {
      var songMetaData, songIndex, playlist,
          songStartSec, songStartTS, trackID;

      songMetaData  = Amplitude.getActiveSongMetadata();
      songIndex     = songMetaData.index;
      songStartTS   = songMetaData.start;
      songStartSec  = _this.timestamp2seconds(songStartTS);
      playlist      = Amplitude.getActivePlaylist();
      trackID       = songIndex + 1;

      if (!songStartSec) {
        return;
      }

      // save AT player data for later use (e.g. events)
      // -----------------------------------------------------------------------
      j1.modules.amplitudejs.data.atp.activeIndex = songIndex;
      j1.modules.amplitudejs.data.atp.playlist = playlist;

      var checkIsFading = setInterval (() => {
        if (!isFadingIn) {
          var currentAudioTime = Amplitude.getSongPlayedSeconds();
          if (songStartSec && currentAudioTime <= songStartSec) {
            var songDurationSec = _this.timestamp2seconds(songMetaData.duration); 

            // seek audio to configured START position
            // NOTE: use setSongPlayedPercentage for seeking to NOT
            //       generation any addition state changes like stopped
            //       or playing
            isDev && logger.debug( '\n' + `seek audio in on playlist: ${playlist} at|to trackID|timestamp: ${trackID}|${songStartTS}`);
            Amplitude.setSongPlayedPercentage((songStartSec / songDurationSec) * 100);

            // fade-in audio (if enabled)
            var fadeAudioIn = (songMetaData.audio_fade_in === 'true') ? true : false;
            if (fadeAudioIn) {
              isDev && logger.debug('\n' + `fade audio in on playlist: ${playlist} at|to trackID|timestamp: ${trackID}|${songStartTS}`);
              atpFadeInAudio({ playerID: playerID });
            } // END if fadeAudio

          } // END if songStartSec

          clearInterval(checkIsFading);
        }
      }, 100); // END checkIsFading
    }, // END atpProcessAudioStartPosition      

    // -------------------------------------------------------------------------
    // atpProcessAudioEndPosition()
    // process audio for configured END position
    // -------------------------------------------------------------------------
    atpProcessAudioEndPosition: () => {
      var songMetaData, songIndex, playlist,
          songStartSec, songStartTS, songEndSec, songEndTS,
          trackID;

      songMetaData  = Amplitude.getActiveSongMetadata();
      songIndex     = songMetaData.index;
      songStartTS   = songMetaData.start;
      songStartSec  = _this.timestamp2seconds(songStartTS);      
      songEndTS     = songMetaData.end;
      songEndSec    = _this.timestamp2seconds(songEndTS);
      playlist      = Amplitude.getActivePlaylist();
      trackID       = songIndex + 1;

      // save AT player data for later use (e.g. events)
      // -----------------------------------------------------------------------
      j1.modules.amplitudejs.data.atp.activeIndex = songIndex;
      j1.modules.amplitudejs.data.atp.playlist = playlist;

      if (songEndSec > songStartSec) {
        var checkIsOnVideoEnd = setInterval(() => {
          if (!isFadingOut) {              
            var currentAudioTime = Amplitude.getSongPlayedSeconds();
            if (currentAudioTime >= songEndSec) {                
              songMetaData  = Amplitude.getActiveSongMetadata();             
              songIndex     = songMetaData.index;
              trackID       = songIndex + 1;

              // seek audio out to END position
              // NOTE:
              // ---------------------------------------------------------------
              // use setSongPlayedPercentage for seeking to NOT
              // generation any addition state changes like stopped
              // or playing                  
              isDev && logger.debug('\n' + `seek audio to end on playlist: ${playlist} at trackID|timestamp: ${trackID}|${songEndTS}`);
              Amplitude.setSongPlayedPercentage(99.99);
              
              // fade-out audio (if enabled)
              var fadeAudioOut = (songMetaData.audio_fade_out === 'true') ? true : false;
              if (fadeAudioOut) {
                isDev && logger.debug('\n' + `fade audio out on playlist: ${playlist} at trackID|timestamp: ${trackID}|${songEndTS}`);
                atpFadeAudioOut({ playerID: playerID });
              } // END if fadeAudio

              clearInterval(checkIsOnVideoEnd);
            } // END if currentAudioTime
          } // END if !isFading
        }, 100); // END checkIsOnVideoEnd
      } // END if songEndSec

    }, // END atpProcessAudioEndPosition     

    // -------------------------------------------------------------------------
    // setSongActive(currentPlayList, currentIndex)
    // set song active at index in playlist
    // -------------------------------------------------------------------------
    setSongActive: (currentPlayList, currentIndex) => {
      var playlist, songContainers, songIndex;

      songIndex = currentIndex;

      // clear ALL active song containers
      // -----------------------------------------------------------------------
      songContainers = document.getElementsByClassName("amplitude-song-container");
      for (var i=0; i<songContainers.length; i++) {
        songContainers[i].classList.remove("amplitude-active-song-container");
      }

      // find current song container and activate the element
      // -------------------------------------------------------------------------
      songContainers = document.querySelectorAll('.amplitude-song-container[data-amplitude-song-index="' + songIndex + '"]');          
      for (var i=0; i<songContainers.length; i++) {
        if (songContainers[i].hasAttribute("data-amplitude-playlist")) {
          playlist = songContainers[i].getAttribute("data-amplitude-playlist");
          if (playlist === currentPlayList) {
            songContainers[i].classList.add("amplitude-active-song-container");

            // save AT player data for later use (e.g. events)
            // -----------------------------------------------------------------
            j1.modules.amplitudejs.data.atp.activeIndex = songIndex;
            j1.modules.amplitudejs.data.atp.playlist = playlist;
          }
        }
      }

    }, // END setSongActive

    // -------------------------------------------------------------------------
    // timestamp2seconds(timestamp)
    // converts a timestamp of hh:mm:ss into seconds
    // -------------------------------------------------------------------------
    // TODO:
    // Add support for timestamp w/o hours like mm:ss
    // -------------------------------------------------------------------------
    timestamp2seconds: (timestamp) => {
      // split timestamp
      const parts = timestamp.split(':');

      // check timestamp format
      if (parts.length !== 3) {
        // return "invalid timestamp";
        return false;
      }

      // convert parts to integers
      const hours   = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);

      // check valid timestamp values
      if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) ||
          hours   < 0 || hours   > 23 ||
          minutes < 0 || minutes > 59 ||
          seconds < 0 || seconds > 59) {
        return "invalid timestamp";
      }

      const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

      return totalSeconds;
    }, // END timestamp2seconds

    // -------------------------------------------------------------------------
    // seconds2timestamp(seconds)
    // converts seconds into a timestamp of hh:mm:ss
    // -------------------------------------------------------------------------
    seconds2timestamp: (seconds) => {
      if (isNaN(seconds)) {
        return false;
      }

      const hours         = Math.floor(seconds / 3600);
      const minutes       = Math.floor((seconds % 3600) / 60);
      const remainSeconds = seconds % 60;
      const tsHours       = hours.toString().padStart(2, '0');
      const tsMinutes     = minutes.toString().padStart(2, '0');
      const tsSeconds     = remainSeconds.toString().padStart(2, '0');
    
      return `${tsHours}:${tsMinutes}:${tsSeconds}`;
    }, // END seconds2timestamp

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      isDev && logger.debug('\n' + logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // place handling of command|action here
        //

        isDev && logger.info('\n' + message.text);
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