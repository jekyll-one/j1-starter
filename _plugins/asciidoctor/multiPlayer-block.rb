# ------------------------------------------------------------------------------
# ~/_plugins/asciidoctor-extensions/multiplayer-block.rb
# Asciidoctor extension for J1 Video Player
#
# Product/Info:
# https://jekyll.one
#
# Copyright (C) 2026 Juergen Adams
#
# J1 Template is licensed under the MIT License.
# See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
# ------------------------------------------------------------------------------
require 'asciidoctor/extensions' unless RUBY_ENGINE == 'opal'
include Asciidoctor

# A block macro that embeds a multiplayer block into the output document
#
# Usage
#
#   multiplayer::player_id[role="additional classes"]
#
# Example:
#
#   .The multiplayer title
#   multiplayer::player-_1[role="mt-4 mb-5"]
#
Asciidoctor::Extensions.register do

  class MultiplayerBlockMacro < Extensions::BlockMacroProcessor
    use_dsl

    named :multiplayer
    name_positional_attributes 'role'
    default_attrs 'role' => 'mt-4 mb-4'

    def process parent, target, attributes

      title_html = (attributes.has_key? 'title') ? %(<div id="video_title" class="video-title"> <i class="mdib mdib-video mdib-24px mr-2"></i> <span id="video_title_text">#{attributes['title']}</span> </div>\n) : nil

      html = %(
        <div class="#{attributes['role']}">
          #{title_html}
          <div id="#{target}_parent" class="multiplayer not-spoken"></div>
        </div>
      )

      create_pass_block parent, html, attributes, subs: nil
    end
  end

  block_macro MultiplayerBlockMacro
end
