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
# A block macro that embeds a local video into the output document
#
# Usage:
#
#   video::video_path[poster="full_image_path" role="CSS classes"]
#
# Example:
#
#   .Video title
#   video::/assets/video/gallery/html5/video2.mp4[poster="/assets/video/gallery/video2-poster.jpg" role="mt-5 mb-5"]
#
# ------------------------------------------------------------------------------

Asciidoctor::Extensions.register do

  class VideoBlockMacro < Extensions::BlockMacroProcessor
    use_dsl

    named :videoj1
    name_positional_attributes 'type', 'controls', 'poster', 'role'
    default_attrs 'type' => 'mp4',
                  'controls' => "controls",
                  'poster'   => '/assets/image/icons/videojs/videojs-poster.png',
                  'role'     => 'mt-3 mb-3'

    def process parent, target, attributes

      chars         = [('a'..'z'), ('A'..'Z'), ('0'..'9')].map(&:to_a).flatten
      video_id      = (0...11).map { chars[rand(chars.length)] }.join

      title_html    = (attributes.has_key? 'title') ? %(<div class="video-title">#{attributes['title']}</div>\n) : nil
      poster_image  = (poster = attributes['poster']) ? %(#{poster}) : nil
      controls_attr = (controls = attributes['controls']) ? %(#{controls}) : ''

      html = %(
        <div id="#{video_id}" class="html5-player #{attributes['role']}">
          #{title_html}
          <video
            #{controls_attr}>
            poster="#{poster_image}"
            src="#{target}" type="video/#{type}">
          </video>
        </div>
      )

      create_pass_block parent, html, attributes, subs: nil
    end
  end

  block_macro VideoBlockMacro
end
