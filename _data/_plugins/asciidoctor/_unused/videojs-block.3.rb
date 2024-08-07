# ------------------------------------------------------------------------------
# ~/_plugins/asciidoctor-extensions/video-block.rb
# Asciidoctor extension for local HTML5 Video
#
# Product/Info:
# https://jekyll.one
#
# Copyright (C) 2023, 2024 Juergen Adams
#
# J1 Template is licensed under the MIT License.
# See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
# ------------------------------------------------------------------------------
require 'asciidoctor/extensions' unless RUBY_ENGINE == 'opal'
include Asciidoctor

# ------------------------------------------------------------------------------
# A block macro that embeds a local video using VideoJS into the output document
#
# Usage:
#
#   .Title
#   video::video_path[start="hh:mm:ss" poster="full_image_path" theme="vjs_theme_name" zoom="true|false" role="CSS classes"]
#
# Example:
#
#   .MP4 Video, Rolling Wild
#   videojs::/assets/video/gallery/html5/video2.mp4[start="00:00:50" poster="/assets/video/gallery/video1-poster.jpg" role="mt-4 mb-5"]
#
# ------------------------------------------------------------------------------
# See:
# https://www.tutorialspoint.com/creating-a-responsive-video-player-using-video-js
# ------------------------------------------------------------------------------

Asciidoctor::Extensions.register do

  class VideoJSBlockMacro < Extensions::BlockMacroProcessor
    use_dsl

    named :videojs
    name_positional_attributes 'start', 'poster', 'theme', 'zoom', 'role'
    default_attrs 'start' => '00:00:00',
                  'poster' => '/assets/video/gallery/videojs-poster.png',
                  'theme' => 'uno',
                  'zoom' => false,
                  'role' => 'mt-3 mb-3'

    def process parent, target, attributes

      chars         = [('a'..'z'), ('A'..'Z'), ('0'..'9')].map(&:to_a).flatten
      video_id      = (0...11).map { chars[rand(chars.length)] }.join

      caption_html  = (attributes.has_key? 'title') ? %(<div id="caption_#{video_id}" class="caption-video">#{attributes['title']}</div>\n) : nil
      title_html    = (attributes.has_key? 'title') ? %(<div class="video-title">#{attributes['title']}</div>\n) : nil
      poster_image  = (poster = attributes['poster']) ? %(#{poster}) : nil
      theme_name    = (theme  = attributes['theme'])  ? %(#{theme}) : nil

      html = %(
        <div class="videojs-player bottom #{attributes['role']}">
          #{title_html}
          <video
            id="#{video_id}"
            class="video-js vjs-theme-#{theme_name}"
            controls
            width="640" height="360"
            poster="#{poster_image}"
            alt="#{attributes['title']}"
            aria-label="#{attributes['title']}"
            data-setup='{
              "fluid" : true,
              "sources": [{
                "type": "video/mp4",
                "src": "#{target}"
              }],
              "controlBar": {
                "pictureInPictureToggle": false,
                "volumePanel": {
                  "inline": false
                }
              }
            }'
          > </video>

          <div class="bottom">
            #{caption_html}
          </div>

        </div>

        <script>
          $(function() {

            function appendDivAfterImage(imageSrc) {
              // Finde das Bild anhand des src-Attributs
              const image = document.querySelector(`img[src="${imageSrc}"]`);

              // Überprüfe, ob das Bild gefunden wurde
              if (image) {
                // Erstelle einen neuen div-Container
                const newDiv = document.createElement('div');
                // Füge dem neuen div-Container beliebigen Inhalt hinzu (optional)
                newDiv.textContent = 'Dies ist ein neuer Div-Container';

                // Füge den neuen div-Container nach dem Bild ein
                image.parentNode.insertBefore(newDiv, image.nextSibling);
              } else {
                console.error(`Kein Bild mit src="${imageSrc}" gefunden.`);
              }
            }

            var dependencies_met_page_ready = setInterval (function (options) {
              var pageState      = $('#content').css("display");
              var pageVisible    = (pageState == 'block') ? true : false;
              var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

              if (j1CoreFinished && pageVisible) {
                var caption = '<div class="caption">#{attributes['title']}</div>';
                appendDivAfterImage('#{poster_image}');

                var appliedOnce = false;
                videojs("#{video_id}").ready(function() {
                  var videojsPlayer = this;

                  // add playbackRates
                  videojsPlayer.playbackRates([0.5, 1, 1.5, 2]);

                  // add hotkeys plugin
                  videojsPlayer.hotkeys({
                    enableModifiersForNumbers: false
                  });

                  // add zoom plugin
                  videojsPlayer.zoomPlugin({
                    moveX:  0,
                    moveY:  0,
                    rotate: 0,
                    zoom:   1
                  });

                  // set start position of current video
                  videojsPlayer.on("play", function() {
                    var startFromSecond = new Date('1970-01-01T' + "#{attributes['start']}" + 'Z').getTime() / 1000;
                    if (!appliedOnce) {
                      videojsPlayer.currentTime(startFromSecond);
                      appliedOnce = true;
                    }
                  });
                });

                clearInterval(dependencies_met_page_ready);
              }
            }, 10);
          });
        </script>
      )

      create_pass_block parent, html, attributes, subs: nil
    end
  end

  block_macro VideoJSBlockMacro
end
