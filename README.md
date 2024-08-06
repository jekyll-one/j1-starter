# All you need for your new amazing site

Jekyll meets Bootstrap - and makes a lot of friends. J1 Theme combines
the best of OpenSource software for the Web and the Web site generator
`Jekyll`. J1 is OpenSource, and so are the packaged modules - no pain for
private or professional use. Explore this site to learn what's possible if
you go to the Jekyll Way.

![Screenshot](https://github.com/jekyll-one-org/j1-template/raw/main/j1-template-screenshot.jpg "J1 Template")

* Fully Responsive. J1 Theme supports modern web browsers on all
  devices for best results on PCs, Tablets, and SmartPhones.
* Full Bootstpap V5 support. Current Technology and Design. Excellent
  performance running desktop and mobile websites. Use Jekyll One to
  present your content at its best.
* Start in no time. No programming is needed to start using J1. The
  Template provides a large number of building blocks to create modern
  web pages in minutes.

**Create powerful modern Static Webs: Secure, Flexible and Fast.**

Have fun!


# Live Demo

The template comes with a Web included, a skeleton for your new Web site.
This Web is called the **Starter Web**, a general-purpose Website scaffold to
be modified for your needs. The built-in Starter Web can be visited live
at [Netlify](https://starter.jekyll.one/).

**Have fun exploring what a modern static web, a Jekyll site can do**!


# Features

The template combines the best free software for the web. Jekyll One Theme
is OpenSource and the modules included are free to use as well. No license
issues for private or professional use.

* Fully Responsive. J1 Theme supports modern web browsers on all
  devices for best results on PCs, Tablets, and SmartPhones.
* Full Bootstpap V5 support. Current Technology and Design. Excellent
  performance running desktop and mobile websites. Use Jekyll One to
  present your content at its best.
* Start in no time. No programming is needed to start using J1. The
  Template provides a large number of building blocks to create modern
  web pages in minutes.

## General

* Jekyll V4 support
* Ruby V3 support
* Asciidoc (Asciidoctor) and Markdown support
* Asciidoctor plugins included
* Bootstrap V5
* Responsive Design
* Material Design
* Responsive Text
* Responsive HTML tables
* Compressed HTML, CSS and Javascript support
* Themes support (Bootswatch)
* Icon Font support (MDI, FA, Iconify, Twitter Emoji)
* Themeable source code highlighting (Rouge)
* Desktop and Mobile Web and Navigation ready
* Fully configurable
* Highest Google Lighthouse scores

## Modules and Extensions

* Bootstrap extensions included
* Asciidoctor extensions included
* Smooth-srcoll support
* Full-text search engine included (Lunr)
* Blog Post navigation included
* GDPR compatible cookie consent module included
* Translator module (Google, Deepl) included
* Clipboard module included
* Floating Action Buttons included
* Navigation modules included
* Lightbox modules included
* Gallery modules included
* Carousel modules included
* Audio Player modules included (AmplitudeJS)
* Video Player modules included (VideoJS)

## Addons and Integrations

* Featured example content included
* Royalty free images included
* Comment provider support for Hyvor and Disqus
* Google Analytics support
* Deploy on Github Pages (source only), Netlify and Heroku ready


# Supported platforms

J1 is supported on all current x64-based OS:

* Windows 10, build >= 1903
* Windows WSL 2
* Linux, kernel version >= 4.15 (e.g. Ubuntu  18.x LTS)
* OSX, version >= 10.10.5 (Yosemite)

Note that 32-bit versions (x32) are generally **not** supported for all
platforms.


# Development languages and tools

To run the Development System for J1 Theme, the following languages and
tools expected to be in place with your OS:

* Ruby language, version v3
* Javascript (NodeJS), version >= 18
* NPM, version >= 8.5
* YARN, version >= 1.22
* Git, version >= 2.29

<1> required only for **full** Jupyter Notebook support

Note: More current or older versions may work, but not tested.


## Development packages

For some of the componentsJ1 is using, a working C/C++ development environment
is needed to compile platform-specific libraries. Ensure that all dev packages
are installed for your OS (Linux, OSX, or Windows).

### Development packages for Windows

For Ruby on Windows, a installation using RubyInstaller is recommended. A
current Ruby of version **3.1** is available at the
[RubyInstaller](https://github.com/oneclick/rubyinstaller2/releases/download/RubyInstaller-3.1.2-1/rubyinstaller-devkit-3.1.2-1-x64.exe)
site.

Note, to automatically install a development environment for Ruby on Windows,
a x64 version of Ruby should be installed that is already bundled with a
**DEVKIT** (MSYS2 toolchain).

### Development packages on Linux (Ubuntu)

In order to install all required development components on e.g. Ubuntu
you run:

``` sh
sudo apt-get -y install \
gcc g++ make \
autoconf bison build-essential \
libssl-dev \
libyaml-dev \
libreadline-dev \
zlib1g-dev \
libncurses5-dev \
libffi-dev \
libgdbm-dev
```

To install the required languages and tools, if not already in place, the
following commands can be used to do so:

``` sh
sudo apt-get -y install \
curl \
git-all \
nodejs \
ruby
```

Additionally, for Ruby and NodeJS the dev-packages are to be installed to
make all header files available for a working C/C++ development environment:

``` sh
sudo apt-get -y install \
nodejs-dev \
ruby-dev
```

Note that priviliged (administrative) user rights are needed to install
system-wide software packages for the OS.

### Development packages on OSX

For all OSX system, the installation of the Apple Developer Tools (XCode)
is expected. Development tools like Ruby, NodeJS, or the bash comes
with the OS are **not** recommended to use. Most of the software comes in
quite old versions and therefor unusable for J1 development.

To install recommended versions, the easiest way to install the missing
software is [Homebrew](https://brew.sh/). A lot of helpful information
how to manage package installations using Homebrew can be found on the
internet.

Beside the base installation of the recommend tools, all other recommendations
for Linux systems are for OSX the same.

## Upgrades needed for all platforms

If Ruby and NodeJS are in place, some packeages are to be upgraded to more
current versions. Install all packages system-wide with their respective
product installation pathes.

### Upgrades needed for Ruby <= v2.7

Install latest bundler for Ruby:

``` sh
  gem install bundler --no-document
```

Install latest RubyGems for Ruby:

``` sh
  gem install rubygems-update --no-document
  update_rubygems --no-document
  gem update --system
```

### Upgrades needed for NodeJS

NodeJS comes with NPM pre-installed. The native CLI for the NodeJS package
management is `npm`. Besides `npm` there's another quite handy CLI for NPM
available: *Yarn*.

The CLI `yarn` is developed at Facebook and can be used as a replacement
for `npm`. From a top-level perspective, both package management clients behave
pretty much the same. The syntax `yarn` uses is shorter in writing, making
the command-line look a bit more natural. Therefore, we prefer to use `yarn`.

NOTE: Yarn adds some additional features to the NodeJS package management
implemented for the needs at Facebook. Regarding the J1 development system,
those add-ons are neither needed nor used.

Install latest NPM and Yarn packages for NodeJS:

``` sh
  npm install -g npm@latest
  npm install -g yarn@latest
```


# Setting up the project

Running the J1 Theme project is very simple:

* Downlad the repo
* Setup the project
* Run and develop the buildin starter web

## Checkout the Repo

The repo for the J1 Theme development system is published on Github.
You can get it from Github by cloning the repository using `git`:

``` sh
git clone https://github.com/jekyll-one-org/j1-template.git
```

The repo gets written to folder `j1-template`. Have a look and browse the
folder. You'll see a structure like this:

j1 development repo
```
  ├──── .git
  │    └─── packages
  │         ├──  100_theme_css
  │         ├──  200_theme_js
  │         ├──  300_theme_src
  │         ├──  400_theme_site
  │         ├──  500_theme_gem
  │         └─── 600_theme_utilsrv
  ├──── .gitattributes
  ├──── .gitignore
  ├──── lerna.json
  ├──── LICENSE.md
  ├──── package.json
  └──── README.md
```

J1 Theme is a so-called *multi-package* project, a *Monorepo* managed by
Lerna. A Monorepo is a strategy where multiple (sub-)projects are stored in a
single repository instead of putting them into individual repositories.

All development *tasks* are defined as NPM *scripts* with the top-level project
config file `package.json`. For each package, package-level config files
are used having the same name `package.json` to manage specific tasks like
the generation of CSS and JS files, or creating the buildin starter web.

All **base** development *tasks* are defined with the top-level project
configuration; no need to dive into all the package-level configurations.
All is managed by Lerna, based on simple top-level *tasks*.

## Initialize the project

Initializing the project is managed by the top-level *task* `setup`. A bunch
of sub-tasks are fired, all of the managed by Lerna.

Let's start ...

``` sh
yarn setup
```

Because a lot of sub-tasks getting started for a (first) `setup`, see below
the output as a summary :

``` sh
Set up development system for first use ..
Bootstrap base modules ..
done.
Create project folders ..
done.

Create starter config files ..
lerna info Executing command in 1 package: "yarn run jekyll_files"
site: $ run-s -s jekyll_files:*
lerna success run Ran npm script 'jekyll_files' in 1 package in 2.2s:
lerna success - site
Bootstrap project modules ..
done.

Initialize development packages ..
lerna info Updating package.json
lerna info Updating lerna.json
lerna info Creating packages directory
lerna success Initialized Lerna files
lerna info Bootstrapping 6 packages
lerna info Installing external dependencies
lerna info Symlinking packages and binaries
lerna success Bootstrapped 6 packages
done.

Detect operating system ..
OS detected as: Windows_NT
Create links for shared resources ..
lerna info Executing command in 1 package: "yarn run setup-links"
site: $ cross-var if-env OS=Windows_NT && run-s -s link-default || cross-env OS=$(echo $(getos)) run-s -s switch-links
lerna success run Ran npm script 'setup-links' in 1 package in 2.4s:
lerna success - site
lerna info Executing command in 3 packages: "yarn run build"
css: $ npm run clean
js: $ npm run clean && npm run lint
site: $ run-s -s jekyll_build:*
css: > css@2024.3.8 clean path_to_\j1-template\packages\100_theme_css
css: > run-p -s clean:*
js: > js@2024.3.8 clean path_to_\j1-template\packages\200_theme_js
js: > run-p -s clean:*
site: > site@2024.3.8 bundle path_to_\j1-template\packages\400_theme_site
site: > run-s -s bundler:*
css: $ npm run build_css && npm run uglify_css
site: Create bundle ..
css: > css@2024.3.8 build_css path_to_\j1-template\packages\100_theme_css
css: > run-p -s theme_css:*
js: > js@2024.3.8 lint path_to_\j1-template\packages\200_theme_js
js: > run-p -s lint:*
css: Rendering Complete, saving .css file...
css: Wrote CSS to path_to_\j1-template\packages\100_theme_css\dist\icon-fonts\fontawesome.css
css: Rendering Complete, saving .css file...
css: Wrote CSS to path_to_\j1-template\packages\100_theme_css\dist\icon-fonts\iconify.css
css: Rendering Complete, saving .css file...
css: Rendering Complete, saving .css file...
css: Wrote CSS to path_to_\j1-template\packages\100_theme_css\dist\animate.css
..
js: $ npm run build-js
css: Rendering Complete, saving .css file...
css: Wrote CSS to path_to_\j1-template\packages\100_theme_css\dist\themes\uno-dark\bootstrap.css
css: Rendering Complete, saving .css file...
css: Wrote CSS to path_to_\j1-template\packages\100_theme_css\dist\icon-fonts\materialdesign.css
css: Rendering Complete, saving .css file...
css: Wrote CSS to path_to_\j1-template\packages\100_theme_css\dist\themes\uno-light\bootstrap.css
js: > js@2024.3.8 build-js path_to_\j1-template\packages\200_theme_js
js: > cross-var webpack --mode production --config $npm_package_wp_build
site: Bundle Rubies using user path ..
css: > css@2024.3.8 uglify_css path_to_\j1-template\packages\100_theme_css
css: > run-p -s uglify_css:*
js: $ npm run uglify-js && npm run deploy
js: > js@2024.3.8 uglify-js path_to_\j1-template\packages\200_theme_js
js: > terser dist/template.js -o dist/template.min.js -m --source-map
..
site: Fetching gem metadata from https://rubygems.org/..........
site: Fetching gem metadata from https://rubygems.org/.
site: Resolving dependencies...
site: Using rake 12.3.3
site: Using public_suffix 4.0.6
site: Using addressable 2.8.0
site: Using asciidoctor 1.5.8
site: Using rouge 3.26.0
..
site: Bundle complete! 31 Gemfile dependencies, 88 gems now installed.
..
site: Configuration file: path_to_/j1-template/packages/400_theme_site/_config.yml
site:             Source: path_to_/j1-template/packages/400_theme_site
site:        Destination: path_to_/j1-template/packages/400_theme_site/_site
site:  Incremental build: enabled
site:       Generating...
site:     J1 QuickSearch: creating search index ...
site:     J1 QuickSearch: finished, index ready.
site:       J1 Paginator: autopages, disabled|not configured
site:       J1 Paginator: pagination enabled, start processing ...
site:       J1 Paginator: finished, processed 1 pagination page|s

site: Build Process Summary:
site: | PHASE      |    TIME |
site: +------------+---------+
site: | RESET      |  0.0053 |
site: | READ       |  1.5589 |
site: | GENERATE   |  1.6977 |
site: | RENDER     | 31.5453 |
site: | CLEANUP    |  0.0241 |
site: | WRITE      |  1.1489 |
site: +------------+---------+
site: | TOTAL TIME | 35.9802 |
site:
site: Site Render Stats:
site: | Filename                                                                          | Count |     Bytes |    Time |
site: +-----------------------------------------------------------------------------------+-------+-----------+---------+
site: | _layouts/default.html                                                             |    60 |  5269.94K |  29.702 |
site: | _includes/themes/j1/procedures/layouts/default_writer.proc                        |   240 |  5299.72K |  28.394 |
site: | _includes/themes/j1/layouts/layout_module_generator.html                          |    60 |  1609.43K |  25.946 |
site: | _includes/themes/j1/procedures/layouts/module_writer.proc                         |  2280 |  1290.96K |  25.672 |
site: | _includes/themes/j1/procedures/global/set_base_vars_folders.proc                  |  2340 |    38.85K |  22.121 |
..
site: | _includes/themes/j1/procedures/global/get_category_item.proc                      |    72 |     3.59K |   0.009 |
site: | _layouts/home.html                                                                |     1 |     5.95K |   0.009 |
site: +-----------------------------------------------------------------------------------+-------+-----------+---------+
site: | TOTAL (for 50 files)                                                              | 14138 | 31708.37K | 140.026 |
site:
site:                     done in 36.018 seconds.
site:  Auto-regeneration: disabled. Use --watch to enable.
..
site: $ run-s -s jekyll_post_build:*
lerna success run Ran npm script 'build' in 3 packages in 55.8s:
lerna success - css
lerna success - js
lerna success - site
Configure environment ..
done.
Done in 139.92s.
```

The `setup` process will take a while - typically up to ten minutes for the
first run (depending on the performances of your Internet connection and your
workstations power). A bunch of NPM modules and Ruby Gems are downloaded and
linked for the packages part of the repo. See `setup` as an extended `install`
and `build` process to manage an initial setup for the (Lerna) Monorepo.

## Running the Starter Web

Running the buildin **Starter Web** for development is done like so:

``` sh
yarn site
```

The task `site` does a lot for you. Whatever is necessary for a full-stack
Web development. The task will put in place all needed CSS and JS components,
build the content, and finally run the website in a browser.

Go, go, go ..

``` sh
site: $ run-p -s develop:*
utls: $ run-p -s utilsrv
utls: Startup UTILSRV ..
utls: Log file exists :        messages_2021-08-11
utls: Server enabled:          false
utls: Environment detected as: dev
utls: Daemon path set to:      path_to_\j1-template\packages\600_theme_utilsrv
utls: Daemon verbosity set to: false
utls: Project path set to:     path_to_\j1-template\packages\600_theme_utilsrv/../400_theme_site
utls: Data path set to:        path_to_\j1-template\packages\600_theme_utilsrv/../400_theme_site/_data
utls: Log file set to:         path_to_\j1-template\packages\600_theme_utilsrv/../../log/messages_2021-08-11.log
utls: Stop the server. Exiting ...
utls: Reset file: messages_2021-08-11
site: i ｢wds｣: Project is running at http://localhost:41000/
site: i ｢wds｣: webpack output is served from /assets/themes/j1/core/js
site: i ｢wds｣: Content not from webpack is served from path_to_\j1-template\packages\400_theme_site\_site
site: Configuration file: C:/Temp/j1-template/packages/400_theme_site/_config.yml
site: i ｢wdm｣: wait until bundle finished: /assets/themes/j1/core/js/template.js
site: i ｢wdm｣:    53 modules
site: i ｢wdm｣: Compiled successfully.
site:             Source: C:/Temp/j1-template/packages/400_theme_site
site:        Destination: C:/Temp/j1-template/packages/400_theme_site/_site
site:  Incremental build: enabled
site:       Generating...
site:     J1 QuickSearch: creating search index ...
site:     J1 QuickSearch: finished, index ready.
site:       J1 Paginator: autopages, disabled|not configured
site:       J1 Paginator: pagination enabled, start processing ...
site:       J1 Paginator: finished, processed 1 pagination page|s
site:                     done in 10.093 seconds.
site:  Auto-regeneration: enabled for '.'
site:     Server address: http://localhost:4000/
site:   Server running... press ctrl-c to stop.
```

Finally, the J1 starter web get openend in your default browser.


## Reset the Development System

To start from the beginning, you can reset the development system to the
factory state. The top-level task `reset` does the resetting work for you
and cleans up each and everything except the **Git repo** and the NPM modules
folder `node_modules` stored in the project root. Both are kept untouched
by a reset.

``` sh
yarn reset
```

The cleanup runs some tasks for the root folder and in parallel sub-tasks
using Lerna for all packages:

``` sh
Reset development system to factory state ..
Clean up project root files ..
Remove bundle folder ..
Remove log folder ..
Remove log files ..

Clean up project packages ..
lerna info Executing command in 6 packages: "yarn run clean"
js: $ run-p -s clean:*
css: $ run-p -s clean:*
src: $ run-s clean:*
site: $ run-p -s clean:*
gem: $ run-p -s clean:* && run-p -s clean-bundle:*
utls: $ shx rm -f *.lock && shx rm -f package-lock.json

lerna success run Ran npm script 'clean' in 6 packages in 3.1s:
lerna success - css
lerna success - js
lerna success - src
lerna success - site
lerna success - gem
lerna success - utls

Remove js modules from all packages ..
lerna info clean removing path_to_\j1-template\packages\100_theme_css\node_modules
lerna info clean removing path_to_\j1-template\packages\200_theme_js\node_modules
lerna info clean removing path_to_\j1-template\packages\300_theme_src\node_modules
lerna info clean removing path_to_\j1-template\packages\400_theme_site\node_modules
lerna info clean removing path_to_\j1-template\packages\500_theme_gem\node_modules
lerna info clean removing path_to_\j1-template\packages\600_theme_utilsrv\node_modules
lerna success clean finished
done.

Done in 11.20s.
```

To reset the Development System *completely*, delete the folder `node_modules`
manually and start from the scratch by running the `setup` task again:

``` sh
yarn setup
```

Happy Jekylling!
