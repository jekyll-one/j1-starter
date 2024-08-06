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
    name_positional_attributes 'caption', 'start', 'poster', 'theme', 'zoom', 'role'
    default_attrs 'caption' => 'true',
                  'start' => '00:00:00',
                  'poster' => '/assets/video/gallery/videojs-poster.png',
                  'theme' => 'uno',
                  'zoom' => false,
                  'role' => 'mt-3 mb-3'

    def process parent, target, attributes

      chars           = [('a'..'z'), ('A'..'Z'), ('0'..'9')].map(&:to_a).flatten
      video_id        = (0...11).map { chars[rand(chars.length)] }.join

      title_html      = (attributes.has_key? 'title') ? %(<div class="video-title">#{attributes['title']}</div>\n) : %(<div class="video-title">VideoJS Video</div>\n)
      poster_image    = (poster = attributes['poster']) ? %(#{poster}) : nil
      theme_name      = (theme  = attributes['theme'])  ? %(#{theme}) : nil
      caption_enabled = (caption  = attributes['caption'])  ? true : false

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
        </div>

        <script>
          $(function() {

            function addCaptionAfterImage(imageSrc) {
              const image = document.querySelector(`img[src="${imageSrc}"]`);

              if (image) {
                // create div|caption container
                const newDiv = document.createElement('div');
                newDiv.classList.add('caption');
                newDiv.textContent = '#{attributes['title']}';

                // insert div|caption container AFTER the image
                image.parentNode.insertBefore(newDiv, image.nextSibling);
              } else {
                console.error(`No image found for  src="${imageSrc}".`);
              }
            } // END addCaptionAfterImage

            var appliedOnce = false;
            videojs("#{video_id}").ready(function() {
              var vjs_player    = document.getElementById("#{video_id}");
              var videojsPlayer = this;

              if ('#{caption_enabled}' === 'true') {
                addCaptionAfterImage('#{poster_image}');
              }

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
              // ---------------------------------------------------------------
              videojsPlayer.on("play", function() {
                var startFromSecond = new Date('1970-01-01T' + "#{attributes['start']}" + 'Z').getTime() / 1000;
                if (!appliedOnce) {
                  videojsPlayer.currentTime(startFromSecond);
                  appliedOnce = true;
                }
              }); // END start position

              // scroll to player top position
              // ---------------------------------------------------------------
              vjs_player.addEventListener('click', function(event) {
                var scrollOffset        = (window.innerWidth >= 720) ? -130 : -110;
                const targetDiv         = document.getElementById("#{video_id}");
                const targetDivPosition = targetDiv.offsetTop;

                window.scrollTo(0, targetDivPosition + scrollOffset);
              }); // END EventListener 'click'

            }); // END VJS player ready
          }); // END document ready
        </script>
      )

      create_pass_block parent, html, attributes, subs: nil
    end
  end

  block_macro VideoJSBlockMacro
end
