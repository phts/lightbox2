/**
 * Original script:
 *   Lightbox v2.7.1
 *   by Lokesh Dhakar - http://lokeshdhakar.com/projects/lightbox2/
 *
 * Improved by Phil Tsarik - http://github.com/phts/lightbox2
 */

(function() {
  // Use local alias
  var $ = jQuery;

  var defaults = {
    fadeDuration:                500,
    loaderFadeDuration:          "slow",
    imageFadeDuration:           "slow",
    detailsFadeDuration:         "fast",
    fitImagesInViewport:         true,
    resizeDuration:              700,
    positionFromTop:             50,
    showImageNumberLabel:        true,
    alwaysShowNavOnTouchDevices: false,
    wrapAround:                  false,
    hideImageDuringChange:       true,
    showPreviews:                false,
    overridePreviewsPosition:    "center",
    albumLabel:                  function(curImageNum, albumSize) {
                                   return "Image " + curImageNum + " of " + albumSize;
                                 }
  }

  var AlbumEntryFactory = function(lb) {
    this.lb = lb;

    var _types = {
      image: Img,
      youtube: Youtube
    };

    this.get = function($link) {
      var type = _getLinkType($link);
      var entry = new _types[type](lb, $link);
      entry.type = type;
      return entry;
    };

    this.getSupportedTypes = function() {
      return Object.keys(_types);
    };

    var _getLinkType = function($link) {
      if ($link.attr("href").search("youtube.com") != -1) {
        return "youtube";
      }
      return "image";
    };
  };

  var Img = function(lb, $link) {
    this.el = $link;
    this.link = $link.attr("href");
    this.thumbnail = $link.attr("data-lightbox-thumbnail") || this.link;
    this.title = $link.attr('data-title') || $link.attr('title');

    this.load = function() {
      var self = this;

      // When image to show is preloaded, we send the width and height to sizeContainer()
      var preloader = new Image();
      preloader.onload = function() {
        var $image = lb.$imageContainer.find(".lb-image");
        if (!$image[0]) {
          $image = $("<img class='lb-image' src='' />");
          lb.$imageContainer.html($image);
        }
        $image.attr('src', self.link);

        var $preloader = $(preloader);

        $image.width(preloader.width);
        $image.height(preloader.height);

        lb._fitImage(preloader.width, preloader.height, function(newImageWidth, newImageHeight){
          $image.width(newImageWidth);
          $image.height(newImageHeight);
        });
        lb.sizeContainer($image.width(), $image.height());
      };

      preloader.src = self.link;
    };
  };

  var Youtube = function(lb, $link) {
    this.el = $link;
    this.link = $link.attr("href");

    var videoId = this.link.split("=")[1];
    this.thumbnail = $link.attr("data-lightbox-thumbnail") || "//img.youtube.com/vi/"+videoId+"/0.jpg";
    this.title = $link.attr('data-title') || $link.attr('title');

    this.load = function() {
      var $iframe = $(['<iframe',
                          'src="//www.youtube.com/embed/'+videoId+'"',
                          'frameborder="0"',
                          'allowfullscreen',
                          'height="100%"',
                          'width="100%"',
                      '></iframe>'].join(" "));
      lb.$imageContainer.html($iframe);
      lb._fitImage(2000, 1600, function(newImageWidth, newImageHeight){
        $iframe.attr("width", newImageWidth);
        $iframe.attr("height", newImageHeight);
      });
      lb.sizeContainer($iframe.width(), $iframe.height());
      lb.$nav.hide();
    };
  }

  var Lightbox = (function() {
    function Lightbox(options) {
      this.options           = $.extend({}, defaults, options);
      this.album             = [];
      this.currentImageIndex = void 0;
      this.albumEntryFactory = new AlbumEntryFactory(this);
      this.init();
    }

    Lightbox.prototype.init = function() {
      this.enable();
      this.build();
    };

    // Loop through anchors and areamaps looking for data-lightbox attributes
    // When these are clicked, start lightbox.
    Lightbox.prototype.enable = function() {
      var self = this;
      $('body').on('click', 'a[data-lightbox], area[data-lightbox]', function(event) {
        self.start($(event.currentTarget));
        return false;
      });
    };

    // Build html for the lightbox and the overlay.
    // Attach event handlers to the new DOM elements. click click click
    Lightbox.prototype.build = function() {
      var self = this;
      var el =
        "<div id='lightboxOverlay' class='lightboxOverlay'></div>"+
        "<div id='lightbox' class='lightbox'>";
      if (this.options.showPreviews) {
        el +=
          "<div class='lb-previews-container'>"+
            "<div class='lb-preview-images-container'>"+
              "<div class='lb-prev-preview-container'>"+
                "<img class='lb-prev-preview' src='' />"+
              "</div>"+
              "<div class='lb-next-preview-container'>"+
                "<img class='lb-next-preview' src='' />"+
              "</div>"+
            "</div>"+
          "</div>";
      }
      el +=
          "<div class='lb-outerContainer'>"+
            "<div class='lb-container'>"+
              "<div class='lb-imageContainer'></div>"+
              "<div class='lb-nav'>"+
                "<a class='lb-prev' href='' ></a>"+
                "<a class='lb-next' href='' ></a>"+
              "</div>"+
              "<div class='lb-loader'>"+
                "<a class='lb-cancel'></a>"+
              "</div>"+
            "</div>"+
          "</div>"+
          "<div class='lb-dataContainer'>"+
            "<div class='lb-data'>"+
              "<div class='lb-details'>"+
                "<span class='lb-caption'></span>"+
                "<span class='lb-number'></span>"+
              "</div>"+
              "<div class='lb-closeContainer'>"+
                "<a class='lb-close'></a>"+
              "</div>"+
            "</div>"+
          "</div>"+
        "</div>";
      $(el).appendTo($('body'));

      // Cache jQuery objects
      this.$lightbox       = $('#lightbox');
      this.$overlay        = $('#lightboxOverlay');
      this.$outerContainer = this.$lightbox.find('.lb-outerContainer');
      this.$container      = this.$lightbox.find('.lb-container');
      this.$imageContainer = this.$lightbox.find('.lb-imageContainer');
      this.$loader         = this.$lightbox.find('.lb-loader');
      this.$nav            = this.$lightbox.find('.lb-nav');
      this.$prev           = this.$lightbox.find('.lb-prev');
      this.$next           = this.$lightbox.find('.lb-next');

      if (this.options.showPreviews) {
        this.$previewsContainer = this.$lightbox.find(".lb-previews-container");
        this.$prevPreviewContainer = this.$lightbox.find('.lb-prev-preview-container');
        this.$nextPreviewContainer = this.$lightbox.find('.lb-next-preview-container');
        this.$prevPreview = this.$lightbox.find('.lb-prev-preview');
        this.$nextPreview = this.$lightbox.find('.lb-next-preview');
      }

      // Store css values for future lookup
      this.containerTopPadding = parseInt(this.$container.css('padding-top'), 10);
      this.containerRightPadding = parseInt(this.$container.css('padding-right'), 10);
      this.containerBottomPadding = parseInt(this.$container.css('padding-bottom'), 10);
      this.containerLeftPadding = parseInt(this.$container.css('padding-left'), 10);

      // Hide by default
      this.$overlay.hide();
      this.$lightbox.hide();

      // Attach event handlers to the newly minted DOM elements
      var closeFunc = function() {
        self.end();
        return false;
      }
      this.$overlay.on('click', closeFunc);
      this.$lightbox.on('click', closeFunc);
      this.$lightbox.find('.lb-close').on('click', closeFunc);
      this.$outerContainer.on('click', function() { return false; });

      var clickPrev = function() {
        if (self.isFirstImage()) {
          self.changeImage(self.album.length - 1);
        } else {
          self.changeImage(self.currentImageIndex - 1);
        }
        return false;
      };

      var clickNext = function() {
        if (self.isLastImage()) {
          self.changeImage(0);
        } else {
          self.changeImage(self.currentImageIndex + 1);
        }
        return false;
      };

      this.$prev.on('click', clickPrev);
      this.$next.on('click', clickNext);

      if (this.options.showPreviews) {
        this.$previewsContainer.on('click', closeFunc);
        this.$prevPreview.on('click', clickPrev);
        this.$nextPreview.on('click', clickNext);
      }

    };

    // Show overlay and lightbox. If the image is part of a set, add siblings to album array.
    Lightbox.prototype.start = function($link) {
      var self    = this;
      var $window = $(window);

      $window.on('resize', $.proxy(this.sizeOverlay, this));

      $('select, object, embed').css({
        visibility: "hidden"
      });

      this.sizeOverlay();

      this.album = [];
      var imageNumber = 0;

      var dataLightboxValue = $link.attr('data-lightbox');
      var $links = $($link.prop("tagName") + '[data-lightbox="' + dataLightboxValue + '"]');
      for (var i = 0; i < $links.length; i = ++i) {
        var link = $links[i];
        var albumEntry = this.albumEntryFactory.get($(link));
        if (!albumEntry) {
          continue;
        }
        this.album.push(albumEntry);
        if (link === $link[0]) {
          imageNumber = i;
        }
      }

      // Position Lightbox
      var top  = $window.scrollTop() + this.options.positionFromTop;
      var left = $window.scrollLeft();
      this.$lightbox.css({
        top: top + 'px',
        left: left + 'px'
      }).fadeIn(this.options.fadeDuration);

      this.changeImage(imageNumber);
    };

    // Hide most UI elements in preparation for the animated resizing of the lightbox.
    Lightbox.prototype.changeImage = function(imageNumber) {
      this.disableKeyboardNav();

      this.$overlay.fadeIn(this.options.fadeDuration);

      this.$loader.fadeIn(this.options.loaderFadeDuration);
      this.$lightbox.find('.lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption').hide();
      if (this.options.hideImageDuringChange) {
        this.$imageContainer.hide();
      }

      this.$outerContainer.addClass('animating');

      this.currentImageIndex = imageNumber;
      var albumEntry = this.album[imageNumber];
      albumEntry.load();
      this._setAlbumEntryTypeToEl(this.$outerContainer, albumEntry);

      this.$lightbox.trigger("lightbox.changed", [albumEntry.el]);
    };

    Lightbox.prototype._fitImage = function(imageWidth, imageHeight, handlerFunc) {
      if (this.options.fitImagesInViewport) {
        // Fit image inside the viewport.
        // Take into account the border around the image and an additional 10px gutter on each side.

        var windowWidth    = $(window).width();
        var windowHeight   = $(window).height();
        var maxImageWidth  = windowWidth - this.containerLeftPadding - this.containerRightPadding - 20;
        var maxImageHeight = windowHeight - this.containerTopPadding - this.containerBottomPadding - 120;

        // Is there a fitting issue?
        if ((imageWidth > maxImageWidth) || (imageHeight > maxImageHeight)) {
          var newImageHeight, newImageWidth;
          if ((imageWidth / maxImageWidth) > (imageHeight / maxImageHeight)) {
            newImageWidth  = maxImageWidth;
            newImageHeight = parseInt(imageHeight / (imageWidth / newImageWidth), 10);
            handlerFunc.call(this, newImageWidth, newImageHeight);
          } else {
            newImageHeight = maxImageHeight;
            newImageWidth = parseInt(imageWidth / (imageHeight / newImageHeight), 10);
            handlerFunc.call(this, newImageWidth, newImageHeight);
          }
        }
      }
    };

    // Stretch overlay to fit the viewport
    Lightbox.prototype.sizeOverlay = function() {
      this.$overlay
        .width($(window).width())
        .height($(document).height());
    };

    // Animate the size of the lightbox to fit the image we are showing
    Lightbox.prototype.sizeContainer = function(imageWidth, imageHeight) {
      var self = this;

      var oldWidth  = this.$outerContainer.outerWidth();
      var oldHeight = this.$outerContainer.outerHeight();
      var newWidth  = imageWidth + this.containerLeftPadding + this.containerRightPadding;
      var newHeight = imageHeight + this.containerTopPadding + this.containerBottomPadding;

      function postResize() {
        self.$lightbox.find('.lb-dataContainer').width(newWidth);
        self.showImage(newWidth, newHeight);
      }

      if (oldWidth !== newWidth || oldHeight !== newHeight) {
        this.$outerContainer.animate({
          width: newWidth,
          height: newHeight
        }, this.options.resizeDuration, 'swing', function() {
          postResize();
        });
      } else {
        postResize();
      }
    };

    Lightbox.prototype.updatePreviews = function(imgWidth, imgHeight) {
      if (this.isFirstImage()) {
        this.$prevPreviewContainer.hide();
      } else {
        this.$prevPreviewContainer.show();
        this._setAlbumEntryTypeToEl(this.$prevPreviewContainer, this.album[this.currentImageIndex-1]);
        this.$prevPreview.attr('src', this.album[this.currentImageIndex-1].thumbnail);
      }

      if (this.isLastImage()) {
        this.$nextPreviewContainer.hide();
      } else {
        this.$nextPreviewContainer.show();
        this._setAlbumEntryTypeToEl(this.$nextPreviewContainer, this.album[this.currentImageIndex+1]);
        this.$nextPreview.attr('src', this.album[this.currentImageIndex+1].thumbnail);
      }

      if (this.options.overridePreviewsPosition == "center") {
        this.$previewsContainer.css({top: imgHeight/2 - this.$previewsContainer.height()/2 + "px"});
      }
    };

    Lightbox.prototype._setAlbumEntryTypeToEl = function($el, albumEntry) {
      $.each(this.albumEntryFactory.getSupportedTypes(), function(i, e) {
        $el.removeClass(e);
      });
      $el.addClass(albumEntry.type);
    };

    // Display the image and it's details and begin preload neighboring images.
    Lightbox.prototype.showImage = function(newWidth, newHeight) {
      this.$loader.hide();
      this.$imageContainer.fadeIn(this.options.imageFadeDuration);

      if (this.options.showPreviews) {
        this.updatePreviews(newWidth, newHeight);
      }

      this.updateNav();
      this.updateDetails();
      this.preloadNeighboringImages();
      this.enableKeyboardNav();
    };

    // Display previous and next navigation if appropriate.
    Lightbox.prototype.updateNav = function() {
      // Check to see if the browser supports touch events. If so, we take the conservative approach
      // and assume that mouse hover events are not supported and always show prev/next navigation
      // arrows in image sets.
      var alwaysShowNav = false;
      try {
        document.createEvent("TouchEvent");
        alwaysShowNav = (this.options.alwaysShowNavOnTouchDevices)? true: false;
      } catch (e) {}

      this.$nav.show();

      if (this.album.length > 1) {
        if (this.options.wrapAround) {
          if (alwaysShowNav) {
            this.$prev.css('opacity', '1');
            this.$next.css('opacity', '1');
          }
          this.$prev.show();
          this.$next.show();
        } else {
          if (!this.isFirstImage()) {
            this.$prev.show();
            if (alwaysShowNav) {
              this.$prev.css('opacity', '1');
            }
          }
          if (!this.isLastImage()) {
            this.$next.show();
            if (alwaysShowNav) {
              this.$next.css('opacity', '1');
            }
          }
        }
      }
    };

    // Display caption, image number, and closing button.
    Lightbox.prototype.updateDetails = function() {
      var self = this;

      // Enable anchor clicks in the injected caption html.
      // Thanks Nate Wright for the fix. @https://github.com/NateWr
      if (typeof this.album[this.currentImageIndex].title !== 'undefined' && this.album[this.currentImageIndex].title !== "") {
        this.$lightbox.find('.lb-caption')
          .html(this.album[this.currentImageIndex].title)
          .fadeIn(this.options.detailsFadeDuration)
          .find('a').on('click', function(event){
            location.href = $(this).attr('href');
          });
      }

      if (this.album.length > 1 && this.options.showImageNumberLabel) {
        this.$lightbox.find('.lb-number').text(this.options.albumLabel(this.currentImageIndex + 1, this.album.length)).fadeIn(this.options.detailsFadeDuration);
      } else {
        this.$lightbox.find('.lb-number').hide();
      }

      this.$outerContainer.removeClass('animating');

      this.$lightbox.find('.lb-dataContainer').fadeIn(this.options.resizeDuration, function() {
        return self.sizeOverlay();
      });
    };

    // Preload previous and next images in set.
    Lightbox.prototype.preloadNeighboringImages = function() {
      if (!this.isLastImage()) {
        var preloadNext = new Image();
        preloadNext.src = this.album[this.currentImageIndex + 1].link;
      }
      if (!this.isFirstImage()) {
        var preloadPrev = new Image();
        preloadPrev.src = this.album[this.currentImageIndex - 1].link;
      }
    };

    Lightbox.prototype.isFirstImage = function() {
      return this.currentImageIndex === 0;
    };

    Lightbox.prototype.isLastImage = function() {
      return this.currentImageIndex === this.album.length - 1;
    };

    Lightbox.prototype.enableKeyboardNav = function() {
      $(document).on('keyup.keyboard', $.proxy(this.keyboardAction, this));
    };

    Lightbox.prototype.disableKeyboardNav = function() {
      $(document).off('.keyboard');
    };

    Lightbox.prototype.keyboardAction = function(event) {
      var KEYCODE_ESC        = 27;
      var KEYCODE_LEFTARROW  = 37;
      var KEYCODE_RIGHTARROW = 39;

      var keycode = event.keyCode;
      var key     = String.fromCharCode(keycode).toLowerCase();
      if (keycode === KEYCODE_ESC || key.match(/x|o|c/)) {
        this.end();
      } else if (key === 'p' || keycode === KEYCODE_LEFTARROW) {
        if (!this.isFirstImage()) {
          this.changeImage(this.currentImageIndex - 1);
        } else if (this.options.wrapAround && this.album.length > 1) {
          this.changeImage(this.album.length - 1);
        }
      } else if (key === 'n' || keycode === KEYCODE_RIGHTARROW) {
        if (!this.isLastImage()) {
          this.changeImage(this.currentImageIndex + 1);
        } else if (this.options.wrapAround && this.album.length > 1) {
          this.changeImage(0);
        }
      }
    };

    // Closing time. :-(
    Lightbox.prototype.end = function() {
      this.disableKeyboardNav();
      $(window).off("resize", this.sizeOverlay);
      this.$lightbox.fadeOut(this.options.fadeDuration);
      this.$overlay.fadeOut(this.options.fadeDuration);
      $('select, object, embed').css({
        visibility: "visible"
      });
      this.$lightbox.trigger("lightbox.closed");
    };

    return Lightbox;

  })();

  window.Lightbox = Lightbox;

}).call(this);
