# ------------------------------------------------------------------------------
# ~/_plugins/asciidoctor-extensions/amplitude-block.rb
# Asciidoctor extension for J1 Amplitude (Audio)
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
# A block macro that embeds a (Amplitude) player (parent) block
# into the output document
#
# Usage:
#
#   amplitude::player_id[role="additional classes"]
#
# Example:
#
#   .Player title
#   amplitude::example_player[role="mt-3 mb-5"]
#
# ------------------------------------------------------------------------------
Asciidoctor::Extensions.register do

  class AmplitudeBlockMacro < Extensions::BlockMacroProcessor
    use_dsl

    named :amplitude
    name_positional_attributes 'role'
    default_attrs 'role' => 'mt-3 mb-3'

    def process parent, target, attributes

      title_html = (attributes.has_key? 'title') ? %(<div class="player-title"> <i class="mdib mdib-ear-hearing mdib-24px mr-2"></i> #{attributes['title']} </div>\n) : nil

      html = %(
        <div class="audioblock #{attributes['role']}">
          #{title_html}
          <div id="#{target}_parent" class="amplitude-player"></div>
        </div>
      )

      create_pass_block parent, html, attributes, subs: nil
    end
  end

  block_macro AmplitudeBlockMacro
end
