# Lightbox-phts

This is a fork of [the original Lightbox 2.7.1](https://github.com/lokesh/lightbox2).

## Improvements

### v1.0.0

* Refactored in order to be able to set custom options and initialize `Lightbox` inside your code anywhere you need.
* Fixed image blicking during change especially when fade durations are small.
  Introduced a new option: `hideImageDuringChange`.
* Added options to tune more fade durations:
    - `loaderFadeDuration`
    - `imageFadeDuration`
    - `detailsFadeDuration`
* New feature: previews. Previous and next clickable image previews are shown.
    - Related options:
        - `showPreviews` - turns on/off the feature;
        - `overridePreviewsPosition` (values: "center") - if specified then the script overrides the previews position and ignores CSS.
    - Use element data attr `data-lightbox-thumbnail` to specify thumbnail image for a preview.
* Trigger events:
    - `lightbox.changed` on image change;
    - `lightbox.closed` on lightbox close.
* Disabled closing on image/loader click.
* Dropped support of `rel` attrs.
* EXPERIMENTAL: Added support of Youtube embedded videos.

---

The original lightbox script. Eight years later — still going strong!

## Demo and basic instructions
[Goto the Lightbox2 page](http://lokeshdhakar.com/projects/lightbox2/)


## Credits

### Author
by Lokesh Dhakar  
[lokeshdhakar.com](http://www.lokeshdhakar.com)  
[twitter.com/lokesh](http://twitter.com/lokesh)


### Thanks
* Scott Upton [(uptonic.com)](uptonic.com), Peter-Paul Koch [(quirksmode.com)](quirksmode.com), and Thomas Fuchs [(mir.aculo.us)](mir.aculo.us) for ideas, libs, and snippets.
* Artemy Tregubenko [(arty.name)](arty.name) for cleanup and help in updating to latest proto-aculous in v2.05.
* Matthias Vill [(https://github.com/TheConstructor)](https://github.com/TheConstructor)
* XhmikosR - [(https://github.com/XhmikosR)](https://github.com/XhmikosR)
* mwasson - [(https://github.com/mwasson)](https://github.com/mwasson)
* Heleen v.d. S - [(https://github.com/Heleen)](https://github.com/Heleen)
* careilly - [(https://github.com/careilly)](https://github.com/careilly)
* and many others. Thanks!!!

##License
Licensed under the [Creative Commons Attribution 2.5 License](http://creativecommons.org/licenses/by/2.5/)

* Free for use in both personal and commercial projects.
* Attribution requires leaving author name, author homepage link, and the license info intact.
