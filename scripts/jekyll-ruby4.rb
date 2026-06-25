# frozen_string_literal: true

require "liquid"
require "forwardable"
require "kramdown"

%w[
  liquid/tags/assign
  liquid/tags/break
  liquid/tags/capture
  liquid/tags/case
  liquid/tags/comment
  liquid/tags/continue
  liquid/tags/cycle
  liquid/tags/decrement
  liquid/tags/for
  liquid/tags/if
  liquid/tags/ifchanged
  liquid/tags/include
  liquid/tags/increment
  liquid/tags/raw
  liquid/tags/table_row
  liquid/tags/unless
].each { |path| require path }

module Jekyll
  module Tags
    Liquid = ::Liquid unless const_defined?(:Liquid)
  end

  module Drops
    Forwardable = ::Forwardable unless const_defined?(:Forwardable)
  end
end

%w[
  jekyll/filters/url_filters
  jekyll/filters/grouping_filters
  jekyll/filters/date_filters
  jekyll/tags/include
  jekyll/tags/link
  jekyll/tags/post_url
  jekyll/tags/highlight
  jekyll/command
  jekyll/drops/drop
  jekyll/drops/url_drop
  jekyll/drops/collection_drop
  jekyll/drops/document_drop
  jekyll/drops/excerpt_drop
  jekyll/drops/jekyll_drop
  jekyll/drops/site_drop
  jekyll/drops/static_file_drop
  jekyll/drops/theme_drop
  jekyll/drops/unified_payload_drop
  jekyll/hooks
  jekyll/plugin
  jekyll/convertible
  jekyll/page
  jekyll/converter
  jekyll/converters/identity
  jekyll/converters/markdown
  jekyll/converters/markdown/kramdown_parser
  jekyll/converters/smartypants
  jekyll/converters/scss
  jekyll/converters/sass
].each { |path| require path }

module Jekyll
  module Commands
    Command = Jekyll::Command unless const_defined?(:Command)
  end
end

%w[
  jekyll/commands/build
  jekyll/commands/clean
  jekyll/commands/doctor
  jekyll/commands/help
  jekyll/commands/new
  jekyll/commands/new_theme
  jekyll/commands/serve
].each { |path| require path }

require "jekyll"

jekyll_exe = File.join(Gem::Specification.find_by_name("jekyll").full_gem_path, "exe", "jekyll")
load jekyll_exe
