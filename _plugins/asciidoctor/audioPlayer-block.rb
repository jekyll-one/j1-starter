# ------------------------------------------------------------------------------
# ~/_plugins/asciidoctor-extensions/audioPlayer-block.rb
# Asciidoctor extension for J1 audioPlayer
#
# Product/Info:
# https://jekyll.one
#
# Copyright (C) 2023-2026 Juergen Adams
#
# J1 Template is licensed under the MIT License.
# See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
# ------------------------------------------------------------------------------
require 'asciidoctor/extensions' unless RUBY_ENGINE == 'opal'
include Asciidoctor

# ------------------------------------------------------------------------------
# A block macro that embeds a (audioPlayer) player (parent) block
# into the output document
#
# Usage:
#
#   audioPlayer::player_id[role="additional classes"]
#
# Example:
#
#   .Player title
#   audioPlayer::example_player[role="mt-3 mb-5"]
#
# ------------------------------------------------------------------------------
Asciidoctor::Extensions.register do

  class AudioPlayerBlockMacro < Extensions::BlockMacroProcessor
    use_dsl

    named :audioPlayer
    name_positional_attributes 'role'
    default_attrs 'role' => 'mb-4'

    def process parent, target, attributes

      title_html = (attributes.has_key? 'title') ? %(<div class="amplitude-title"> <i class="mdib mdib-ear-hearing mdib-24px mr-2"></i> #{attributes['title']} </div>\n) : nil

      html = %(
        <div class="audioblock #{attributes['role']}">
          #{title_html}
          <div id="#{target}_audio" class="amplitude-player"></div>
          <div id="#{target}_video" class="yt-player"></div>
        </div>
      )

      create_pass_block parent, html, attributes, subs: nil
    end
  end

  block_macro AudioPlayerBlockMacro
end
