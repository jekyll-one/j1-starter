# ------------------------------------------------------------------------------
# ~/_plugins/asciidoctor-extensions/youtube-block.rb
# Asciidoctor extension for YouTube Video
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
# A block macro that embeds a video from the YouTube platform
# into the output document
#
# Usage:
#
#   youtube::video_id[poster="full_image_path" theme="vjs_theme_name" role="CSS classes"]
#
# Example:
#
#   .Video title
#   youtube::nV8UZJNBY6Y[poster="/assets/image/icons/videojs/videojs-poster.png" theme="city" role="mt-5 mb-5"]
#
# ------------------------------------------------------------------------------
# See:
# https://www.tutorialspoint.com/creating-a-responsive-video-player-using-video-js
# ------------------------------------------------------------------------------
# NOTE
# Bei YouTube Nocookie handelt es sich um einen Code zum
# Einbetten inklusive entsprechender URL, der es Webseitenbetreibern
# erlaubt, Videos ohne Tracking Cookies auf ihren Webseiten zu
# integrieren. Der Code muss für jedes eingebettete Video generiert
# und eingefügt werden.
#
# See: https://www.datenschutz.org/youtube-nocookie/
# ------------------------------------------------------------------------------

Asciidoctor::Extensions.register do

  class YouTubeBlockMacro < Extensions::BlockMacroProcessor
    use_dsl

    named :youtube
    name_positional_attributes 'poster', 'theme', 'role'
    default_attrs 'poster' => '/assets/image/icons/videojs/videojs-poster.png',
                  'theme' => 'uno',
                  'role' => 'mt-3 mb-3'

    def process parent, target, attributes

      chars         = [('a'..'z'), ('A'..'Z'), ('0'..'9')].map(&:to_a).flatten
      video_id      = (0...11).map { chars[rand(chars.length)] }.join

      title_html    = (attributes.has_key? 'title') ? %(<div class="video-title">#{attributes['title']}</div>\n) : nil
      poster_image  = (poster = attributes['poster']) ? %(#{poster}) : nil
      theme_name    = (theme  = attributes['theme'])  ? %(#{theme}) : nil

      html = %(
        <div class="youtube-player bottom #{attributes['role']}">
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
              "techOrder": [
                "youtube", "html5"
              ],
              "sources": [{
                "type": "video/youtube",
                "src": "//youtube.com/watch?v=#{target}"
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
                console.error(`No image found for: src="${imageSrc}"`);
              }
            }

            var dependencies_met_page_ready = setInterval (function (options) {
              var pageState      = $('#content').css("display");
              var pageVisible    = (pageState == 'block') ? true : false;
              var j1CoreFinished = (j1.getState() === 'finished') ? true : false;
              var atticFinished   = (j1.adapter.attic.getState() == 'finished') ? true : false;

              if (j1CoreFinished && pageVisible && atticFinished) {
                addCaptionAfterImage('#{poster_image}');

                // scroll to player top position
                // -------------------------------------------------------------
                var vjs_player = document.getElementById("#{video_id}");

                vjs_player.addEventListener('click', function(event) {
                  var scrollOffset = (window.innerWidth >= 720) ? -130 : -110;

                  // scroll player to top position
                  const targetDiv         = document.getElementById("#{video_id}");
                  const targetDivPosition = targetDiv.offsetTop;
                  window.scrollTo(0, targetDivPosition + scrollOffset);
                }); // END EventListener 'click'

                clearInterval(dependencies_met_page_ready);
              }
            }, 10);
          });
        </script>
      )

      create_pass_block parent, html, attributes, subs: nil
    end
  end

  block_macro YouTubeBlockMacro
end
