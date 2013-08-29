/**
   * Cufon
*/

	Cufon.replace('h1, h2, h3, h4, h5, h6', {hover: true});

/**
   * Ready
*/

	jQuery(document).ready(function() {

		jQuery("nav").pk_menu();
		jQuery(".pk_boxed_tabs").pk_tabs();
		jQuery(".pk_toggles").pk_toggles();
		jQuery(".pk_zoom_icon, .pk_play_icon, .pk_page_icon, .pk_link_icon").pk_image_rollover();
		
		if(jQuery("body").find("a[rel^='prettyPhoto']").length >= 1) {
			jQuery("a[rel^='prettyPhoto']").prettyPhoto({
				allow_resize:false,
				default_width: 820,
				default_height: 461,
				slideshow: 5000, /* false OR interval time in ms */
				autoplay_slideshow: false, /* true/false */
				opacity: 0.80,/* Value between 0 and 1 */
				theme: 'dark_square' /* dark_square / facebook */
			});
		}
		
		pkFixPixels();

	});


/**
   * PK Menu
*/

	(function($) {
		$.fn.pk_menu = function(options) {
			var defaults = {
				easing: "easeOutExpo",
				speedIn: 400,
				speedOut: 400
			};
		
			var settings = $.extend({}, defaults, options);
		
			return this.each(function () {
				var $root = $(this);
				var $lists = $("ul", this);
				var $buttons = $lists.find("ul").parent();
				
				$("ul", $root).each(function() {
					$("li:last-child", this).addClass("last");
				});

				$("ul ul li", $root).each(function() {
					$(this).hover(function() {
						$("a", this).stop().animate({ "padding-left" : "13" }, (settings.speedIn / 2), "linear");
					}, function() {
						$("a", this).stop().animate({ "padding-left" : "10" }, (settings.speedIn / 2), "linear");
					});
				});

				function showMenu($element) {

					if(jQuery.browser.msie && parseInt(jQuery.browser.version) < 9) {
						$element.css({visibility:'visible'}).show();
					} else {
						$element.css({visibility:'visible'}).fadeIn(settings.speedIn);
					}

				}
 
    			function hideMenu($element, $current) {
   
    				if(jQuery.browser.msie && parseInt(jQuery.browser.version) < 9) {
						$element.hide();
					} else {
						$element.fadeOut(settings.speedOut, function() {
    						$element.hide();
    					});
					}

    			}

				$buttons.each(function() {
					var $btn = $(this);

					$btn.click(function() {
						var $targetul = $(this).find("ul:first");
						$targetul.hide();
					});

					$btn.hoverIntent(function() {

						var $targetul = $(this).find("ul:first");
						showMenu($targetul);

					}, function() {

						var $targetul = $(this).find("ul:first");
						hideMenu($targetul, $(this));

					});

				});

			});
		};
	})(jQuery);


/**
   * PK Media Slider
*/

	(function($) {
		$.fn.pk_media_slider = function(options) {
			var defaults = {
				sliderWidth:600,
				sliderHeight:320,
				sliderPadding:0,
				sliderBackgroundColor:"#000",

				buttonInfoLabelColor:"#000",
				buttonInfoOpenLabel:"info",
				buttonInfoCloseLabel:"close info",

				infoTextAlign:"left",
				infoTextColor:"#ccc",
				infoBackgroundAlpha:1,
				infoBackgroundColor:"#000",

				slideshow:true,
				slideshowAutoStart:false,
				slideshowInterval:5,

				easing: "easeOutExpo",
				speedIn: 400,
				speedOut: 400
			};

			var settings = $.extend({}, defaults, options);

			return this.each(function() {
				var root = $(this);
				var content_width = (settings.sliderWidth - 2) - (settings.sliderPadding * 2);
				var content_height = (settings.sliderHeight - 2) - (settings.sliderPadding * 2);
				var is_slideshow = (settings.slideshow == true && settings.slideshowAutoStart == true) ? true : false;
				var tot_items = $(".pk_slider_item", root).length;
				var slideshow_interval = undefined;
				var is_video = false;
				var info_open = false;
				var old_item = -1;
				var new_item = 0;

				var slider_media = [];
				var slider_descriptions = [];

				function initSlider() {

					root.css({ "width" : settings.sliderWidth + "px", "height" : (settings.sliderHeight + 25) + "px", "overflow" : "hidden" });

					$(".pk_slider_content", root).css({ "overflow" : "hidden", "padding" : settings.sliderPadding + "px", "width" : content_width + "px", "height" : content_height + "px" });
					$(".pk_slider_item", root).each(function(e) {
						slider_media[e] = $(".pk_slider_item_media", this).html();
						slider_descriptions[e] = $(".pk_slider_item_info_content", this).html();

						$(this).css({ "position" : "absolute", "width" : content_width + "px", "height" : content_height + "px", "overflow" : "hidden" });
						$(".pk_slider_item_media", this).empty();
						$(".pk_slider_item_info", this).hide();

						/* Position Info */

						$(".pk_slider_item_info", this).css({ "position" : "absolute", "padding" : "10px 20px", "width" : content_width + "px" });
						$(".pk_slider_item_info_content p", this).css({ "margin" : "0px 20px 5px 0px" });
						
						var info_height = $(".pk_slider_item_info", this).outerHeight() + (settings.sliderPadding * 2) + 8;
						$(".pk_slider_item_info", this).css({ "margin-top" : -(info_height), "text-align" : settings.infoTextAlign, "zIndex" : "10" }).hide();
						$(".pk_slider_item_info_content", this).css({ "position" : "absolute", "width" : (content_width - 20) + "px" });
						$(".pk_slider_item_info_background", this).css({ "position" : "absolute", "top" : "0", "left" : "0", "width" : content_width + "px", "height" : info_height });
						
						$(this).hide();
					});

					if(tot_items > 1) { createNavigation(); }
					createInfoButton();
					changeItem(new_item);
					
					setColors();

				}

				function setColors() {

					$(".pk_slider_content", root).css({ "background-color" : settings.sliderBackgroundColor });
					$(".pk_slider_info_button", root).css({ "color" : settings.buttonInfoLabelColor });
					$(".pk_slider_item_info_content", root).css({ "color" : settings.infoTextColor });
					$(".pk_slider_item_info_background", root).css({ "opacity" : settings.infoBackgroundAlpha, "background-color" : settings.infoBackgroundColor });

				}

				function createNavigation() {

					var button_prev = '<span class="pk_button_prev">prev</span>';
					var button_next = '<span class="pk_button_next">next</span>';
					var button_slideshow = '<span class="pk_button_slideshow">play/pause</span>';

					root.append('<div class="pk_slider_thumbs"></div>');

					$(".pk_slider_content", root).append(button_prev + button_next + button_slideshow);
					$(".pk_button_prev", root).css({ "margin-top" : ((content_height / 2) - ($(".pk_button_prev", root).height() / 2)) + "px", "margin-left" : "15px" });
					$(".pk_button_next", root).css({ "margin-top" : ((content_height / 2) - ($(".pk_button_next", root).height() / 2)) + "px", "margin-left" : (content_width - ($(".pk_button_next", root).width() + 15)) + "px" });
					$(".pk_button_slideshow", root).css({ "margin-top" : "15px", "margin-left" : (content_width - ($(".pk_button_slideshow", root).width() + 15)) + "px" });
					$(".pk_button_next, .pk_button_prev, .pk_button_slideshow", root).hide();
					
					for(i = 0; i < tot_items; i++) {
						$(".pk_slider_thumbs", root).append('<a href="#" title="">' + (i + 1) + '</a>');
					}

					$(".pk_slider_thumbs a", root).each(function(e) {
						$(this).removeAttr("href").css({ "cursor" : "pointer" });
						$(this).click(function() {

							if(e == new_item) {
							
								return true;	
								
							}

							old_item = new_item;
							new_item = e;

							changeItem();

						});
					});

					$(".pk_button_prev", root).click(function() {

						var current_item = new_item;
						(current_item - 1 < 0) ? current_item = tot_items - 1 : current_item = current_item - 1;
						$(".pk_slider_thumbs a", root).filter(":eq("+ current_item +")").trigger("click", [true]);

					});

					$(".pk_button_next", root).click(function() {

						var current_item = new_item;
						(current_item + 1 > tot_items - 1) ? current_item = 0 : current_item = current_item + 1;
						$(".pk_slider_thumbs a", root).filter(":eq("+ current_item +")").trigger("click", [true]);

					});
					
					$(".pk_button_slideshow", root).click(function() {

						if(is_slideshow == false) {

							is_slideshow = true;
							$(".pk_button_next", root).trigger("click", [true]);
							$(".pk_button_slideshow", root).css("background-position" , "0px -25px");

						} else {

							is_slideshow = false;
							stopSlideshow()
							$(".pk_button_slideshow", root).css("background-position" , "0px 0px");

						}
						
					});

					$(".pk_slider_content", root).mouseenter(function() {

						(jQuery.browser.msie && parseInt(jQuery.browser.version) < 9) ? $(".pk_button_next, .pk_button_prev, .pk_button_slideshow", root).show() : $(".pk_button_next, .pk_button_prev, .pk_button_slideshow", root).fadeIn(200);

					}).mouseleave(function() {

						(jQuery.browser.msie && parseInt(jQuery.browser.version) < 9) ? $(".pk_button_next, .pk_button_prev, .pk_button_slideshow", root).hide() : $(".pk_button_next, .pk_button_prev, .pk_button_slideshow", root).fadeOut(400);

					});

				}

				function createInfoButton() {

					root.append('<span class="pk_slider_info_button">' + settings.buttonInfoOpenLabel + '</span>');

					$(".pk_slider_info_button", root).css({ "font-size" : "11px", "cursor" : "pointer"}).hide();
					$(".pk_slider_info_button", root).click(function() {

						if(info_open == false) {

							$(this).text(settings.buttonInfoCloseLabel);
							info_open = true;
							stopSlideshow();
							showInfo();

						} else {

							$(this).text(settings.buttonInfoOpenLabel);
							info_open = false;
							startSlideshow();
							hideInfo();

						}
	
					});

				}

				function changeItem() {

					$(".pk_slider_slideshow_bar").stop().animate({ "width" : 0 + "px" }, 100, "easeOutExpo");

					var current_old_item = $(".pk_slider_item", root).filter(":eq(" + old_item + ")");
					var current_item = $(".pk_slider_item", root).filter(":eq(" + new_item + ")");
					
					current_old_item.fadeOut(settings.speedOut, function() { $(".pk_slider_item_media", current_old_item).empty(); });

					$(".pk_slider_item_media", current_item).html(slider_media[new_item]);
					current_item.fadeIn(settings.speedIn, function() {
						$(".pk_slider_thumbs a", root).each(function(e) { $(this).css({ "background-position" : "0px 0px" }) });
						$(".pk_slider_thumbs a", root).filter(":eq(" + new_item + ")").css({ "background-position" : "0px -15px" });
						$(".pk_zoom_icon, .pk_play_icon, .pk_page_icon, .pk_link_icon").pk_image_rollover();

						startSlideshow();
					});

					($(".pk_slider_item_media .pk_video", current_item).length >= 1) ? is_video = true : is_video = false;
					(slider_descriptions[new_item] == "" || slider_descriptions[new_item] == null) ? $(".pk_slider_info_button", root).fadeOut(200) : $(".pk_slider_info_button", root).fadeIn(200);
					if(info_open == true) { $(".pk_slider_info_button", root).trigger("click", [true]); }

				}

				function showInfo() {

					if(slider_descriptions[new_item] == "" || slider_descriptions[new_item] == null) {

						return true;
					}

					var current_item = $(".pk_slider_item", root).filter(":eq(" + new_item + ")");
					var current_info = $(".pk_slider_item_info", current_item);

					(jQuery.browser.msie && parseInt(jQuery.browser.version) < 9) ? current_info.show() : current_info.fadeIn(settings.speedOut);

				}

				function hideInfo() {

					(jQuery.browser.msie && parseInt(jQuery.browser.version) < 9) ? $(".pk_slider_item_info", root).hide() : $(".pk_slider_item_info", root).fadeOut(settings.speedOut);

				}
				
				function startSlideshow() {

					if(is_slideshow == false || is_video == true) {
						
						return true;
						
					}
					
					clearInterval(slideshow_interval);
					
					function delay() {

						clearInterval(slideshow_interval);
						$(".pk_button_next", root).trigger("click", [true]);
						
					}
					
					slideshow_interval = setInterval(delay, (settings.slideshowInterval * 1000));

				}

				function stopSlideshow() {

					clearInterval(slideshow_interval);

				}

				initSlider();
			});
		};
	})(jQuery);


/**
   * PK Tour
*/

	(function($) {
		$.fn.pk_tour = function(options) {
			var defaults = {
				tour_width:940,
				navigation_width:200,
				navigation_align:"left",
				navigation_margin_top:0,
				navigation_margin_left:0,
				navigation_margin_right:10,
				easing: "easeOutExpo",
				speed: 1000
			};
	
			var settings = $.extend({}, defaults, options);
		
			return this.each(function () {
				var root = $(this);
				var root_width = settings.tour_width;
				var tour_tot_items = $(".pk_tour_content .pk_tour_content_item", root).length;

				var navigation_width = settings.navigation_width;
				var navigation_align = settings.navigation_align;
				var navigation_margin_top = settings.navigation_margin_top;
				var navigation_margin_left = settings.navigation_margin_left;
				var navigation_margin_right = settings.navigation_margin_right;
				
				var document_is_loaded = false;

				function init() {
					
					root.css({ "width" : root_width + "px" });
					$(".pk_tour_navigation", root).css({ "display" : "block", "float" : navigation_align, "margin" : navigation_margin_top + "px " + navigation_margin_right + "px 0px " + navigation_margin_left + "px", "width" : navigation_width + "px" });
					$(".pk_tour_content", root).css({ "width" : (root_width - navigation_width - navigation_margin_right - navigation_margin_left) + "px" });
					$(".pk_tour_content .pk_tour_content_items", root).css({ "width" : (((root_width - navigation_width) * tour_tot_items) + (20 * tour_tot_items)) + "px" });
					$(".pk_tour_content .pk_tour_content_item", root).each(function(i) {

						$(this).css({ "float" : "left", "margin-right" : "20px", "width" : $(".pk_tour_content", root).width() + "px" });

					});
					
					createNavigation();
					
				}

				function createNavigation() {

					$(".pk_tour_navigation a", root).each(function(i) {
						if(navigation_align == "right") { $(this).css({ "text-align" : "right" }); }
						$(this).removeAttr("href").css({ "cursor" : "pointer" });
						$(this).click(function() {
							resetNavigation($(this));

							$(".pk_tour_content .pk_tour_content_items", root).stop().animate({ "margin-left" : -(($(".pk_tour_content", root).width() + 20) * i) + "px" }, settings.speed, settings.easing);
							if(document_is_loaded == false) {

								root.css({ "height" : $(".pk_tour_content .pk_tour_content_item", root).filter(":eq(" + i + ")").height() + "px" });
							
							} else {
								
								root.stop().animate({ "height" : $(".pk_tour_content .pk_tour_content_item", root).filter(":eq(" + i + ")").height() + "px" }, settings.speed, settings.easing);
									
							}
						});
					});
					
					$(".pk_tour_navigation a", root).filter(":eq(0)").trigger("click", [true]);
					document_is_loaded = true;
					
				}
				
				function resetNavigation(button) {

					$(".pk_tour_navigation a", root).each(function() {
						$(this).removeClass($(this).attr("class"));
					});

					(navigation_align == "left") ?  button.addClass("pk_left_current") :  button.addClass("pk_right_current");
					
				}

				init();
				
			});
		}
	})(jQuery);


/**
   * PK Mini Slider
*/

	(function($) {
		$.fn.pk_mini_slider = function(options) {
			var defaults = {
				slider_width:940,
				slider_height:"auto",
				easing: "easeOutExpo",
				speed: 800
			};
	
			var settings = $.extend({}, defaults, options);
		
			return this.each(function () {
				var root = $(this);
				var root_width = settings.slider_width;
				var root_height = (settings.slider_height != "auto") ? settings.slider_height : "auto";
				var slider_tot_items = $(".pk_mini_slider_content li", root).length;

				function init() {
					
					root.css({ "width" : root_width + "px", "height" : (root_height + 2) + "px" });
					$(".pk_mini_slider_content", root).css({ "height" : root_height + "px" });
					$(".pk_mini_slider_content ul", root).css({ "display" : "block", "width" : (root_width * slider_tot_items) + "px" });
					$(".pk_mini_slider_content ul li", root).css({ "float" : "left", "width" : (root_width - 40) + "px" });//40 è la somma del padding destro e sinistro settati nel css
					
					createNavigation();
					
				}

				function createNavigation() {

					if(slider_tot_items <= 1) {
						
						return true;
					}

					$(".pk_mini_slider_content ul", root).before('<div class="pk_mini_slider_navigation"></div>');
					for(var i = slider_tot_items; i > 0; i--) {
						$(".pk_mini_slider_navigation", root).append('<a title="">' + i + '</a>');
					}

					$(".pk_mini_slider_navigation a", root).each(function() {
						$(this).css({ "cursor" : "pointer" });
						$(this).click(function() {
							
							var id = Number($(this).text() - 1);
							var new_height = $(".pk_mini_slider_content ul li", root).filter(":eq(" + id + ")").height();
							
							resetNavigation($(this));
							$(".pk_mini_slider_content ul", root).stop().animate({ "margin-left" : -(root_width * id) + "px" }, settings.speed, settings.easing);
							if(settings.slider_height == "auto"){
								root.animate({ "height" : new_height + 2 + "px" }, settings.speedIn, settings.easing);
								$(".pk_mini_slider_content", root).animate({ "height" : new_height + "px" }, settings.speed, settings.easing);
							}
							
						});
					});
					
					$(".pk_mini_slider_navigation a", root).filter(":eq(" + (slider_tot_items - 1) + ")").trigger("click", [true]);
					
				}
				
				function resetNavigation(button) {

					$(".pk_mini_slider_navigation a", root).each(function() {
						$(this).removeClass("pk_current");
					});

					button.addClass("pk_current");
					
				}

				init();
				
			});
		}
	})(jQuery);


/**
   * PK Twitter
*/

	(function($) {
		$.fn.pk_twitter = function(options) {
			var defaults = {
				user: "parkerandkent",
				type: "list",
				count: 1
			};
	
			var settings = $.extend({}, defaults, options);
		
			String.prototype.linkify = function() {
				return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/, function(m) {
					return m.link(m);
				});
			};
		
			function get_time(time_value) {

	  			var values = time_value.split(" ");
	  			time_value = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
	 			var parsed_date = Date.parse(time_value);
	  			var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
	  			var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
	  			delta = delta + (relative_to.getTimezoneOffset() * 60);
	  
	  			var r = '';
	  			if (delta < 60) {
					r = 'a minute ago';
	  			} else if(delta < 120) {
					r = 'couple of minutes ago';
	  			} else if(delta < (45*60)) {
					r = (parseInt(delta / 60)).toString() + ' minutes ago';
	 			} else if(delta < (90*60)) {
					r = 'an hour ago';
	  			} else if(delta < (24*60*60)) {
					r = '' + (parseInt(delta / 3600)).toString() + ' hours ago';
	  			} else if(delta < (48*60*60)) {
					r = '1 day ago';
	  			} else {
					r = (parseInt(delta / 86400)).toString() + ' days ago';
	  			}
	  
	  			return r;

			};
		
			return this.each(function () {
				var $root = $(this);
			
				$.getJSON('http://twitter.com/status/user_timeline/' + settings.user + '.json?count=' + settings.count + '&callback=?', function(data){

					if(settings.type == "list") {

						$root.find("li").remove();
						$.each(data, function(index, item){
							$root.append('<li><p>' + item.text.linkify() + '<small>' + get_time(item.created_at) + '</small></p></li>');
						});

					} else {

						$root.find("li").remove();
						$.each(data, function(index, item){
							$("ul", $root).append('<li><p>' + item.text.linkify() + '</p></li>');
						});
						
					}

				});
			});
		}
	})(jQuery);


/**
   * PK Image Rollover
*/

	(function($) {
		$.fn.pk_image_rollover = function() {
			return this.each(function() {
				var root = $(this);

				root.hover(function() {
					if(jQuery.browser.msie && parseInt(jQuery.browser.version) < 9) {

						$(".pk_image_button_icon", this).show();
						$(".pk_image_button_back_ground", this).show();

					} else {

						$(".pk_image_button_icon", this).css("display" , "none").stop(true, true).fadeIn(400);
						$(".pk_image_button_back_ground", this).css("display" , "none").stop(true, true).fadeIn(400);

					}
				}, function() {
					if(jQuery.browser.msie && parseInt(jQuery.browser.version) < 9) {

						$(".pk_image_button_icon", this).hide();
						$(".pk_image_button_back_ground", this).hide();

					} else {

						$(".pk_image_button_icon", this).css("display" , "block").stop(true, true).fadeOut(400);
						$(".pk_image_button_back_ground", this).css("display" , "block").stop(true, true).fadeOut(400);
					}
				});
			});
		};
	})(jQuery);


/**
   * PK Toggles
*/

	(function($) {
		$.fn.pk_toggles = function() {
			return this.each(function() {
				var root = $(this);
				var buttons = $(".pk_toggle_button", root);
				var icons_type = root.attr("class").split(" ")[1];

				$(".pk_toggle_content_wrapper", root).css({ "display" : "none", "margin" : "0px" });

				buttons.each(function(i) {

					this.is_open = false;

					(icons_type == "pk_light_icon") ? $(this).css({ "background-image" : "url(assets/toggle_icons/toggle_light_icon.png)" }) : $(this).css({ "background-image" : "url(assets/toggle_icons/toggle_dark_icon.png)" });
					$(this).css({ "padding-left" : "38px", "cursor" : "pointer", "background-position" : "-51px -5px" });

					$(this).click(function() {
						if(this.is_open == false) {

							this.is_open = true;

							$(this).css({ "background-position" : "-5px -50px" });

						} else {

							this.is_open = false;

							$(this).css({ "background-position" : "-51px -5px" });

						}
						
						$(this).next().slideToggle(600, "easeOutExpo");
					});

				});
			});
		};
	})(jQuery);


/**
   * PK Tabs
*/

	(function($) {
		$.fn.pk_tabs = function() {
			return this.each(function() {
				var root = $(this);
				var buttons = $(".pk_tabs_navigation a", root);
				var navigation_width = $(".pk_tabs_navigation", root).width() + 1;

				$(".pk_tabs_navigation", root).show();
				$(".pk_tabs_navigation li:last", root).css({ "margin-right" : "0px" });
				$(".pk_tab", root).css({ "position" : "absolute" }).hide();
				$(".pk_tabs", root).css({ "top" : "29px" });

				buttons.each(function(i) {

					$(this).removeAttr("href").css({ "cursor" : "pointer", "padding-bottom" : "0px" });

					$(this).click(function() {

						$(".pk_tab", root).filter(":visible").hide();
						$(".pk_tab", root).filter(":eq(" + i + ")").show();
						$(".pk_tabs", root).css({ "height" : $(".pk_tab", root).filter(":eq(" + i + ")").outerHeight() + "px" });

						root.css({ "height" : $(".pk_tab", root).filter(":eq(" + i + ")").outerHeight() + $(".pk_tabs_navigation", root).height() + "px" });

						buttons.each(function(i) {
							
							$(this).parent().removeClass("pk_active_tab").css({ "height" : "28px" });
							$(this).css({ "padding-bottom" : "0px" });

						});

						$(this).parent().addClass("pk_active_tab").css({ "height" : "29px" });

					});

				});

				buttons.filter(":eq(0)").trigger("click", [true]);
			});
		};
	})(jQuery);


/**
   * PK Contact Form
*/

	(function($) {
		$.fn.pk_contact_form = function(options) {
			var defaults = {
				sendMail:"php/sendMail.php",
				timer:4000,
				speedIn:400,
				speedOut:400
			};
		
			var settings = $.extend({}, defaults, options);
		
			return this.each(function () {
				var root = $(this);
				var button_send = $("input[type=submit]", root);
				var interval = undefined;
			
				function showResponse(message, type, timer) {

					if(interval) {
						clearInterval(interval);
						$(".pk_message_box", root).remove();
					}
					
					button_send.before('<div class="pk_message_box"><div class="pk_message_box_content"></div></div>');

					(type == "error") ? $(".pk_message_box", root).addClass("pk_error_box") : $(".pk_message_box", root).addClass("pk_success_box");

					$(".pk_message_box_content", root).html("<p>" + message + "</p>");
					$(".pk_message_box_content", root).css({ "padding-top" : "5px", "padding-bottom" : "5px" });
					$(".pk_message_box", root).css({ "display" : "none", "margin-bottom" : "10px" , "background-position" : "9px 1px"});
					$(".pk_message_box", root).fadeIn(settings.speedIn, function() {
						interval = setInterval(hideResponse, timer);
					});

				}
			
				function hideResponse() {

					clearInterval(interval);
					$(".pk_message_box", root).fadeOut(settings.speedOut, function() {
						$(".pk_message_box", root).remove();
					});

				}
			
				root.submit(function() {

					$.ajax({
						type: "POST",
						url: settings.sendMail,
						data: $(this).serialize(),
						success: function(output) {
							root.find(".pk_form_success, .pk_form_error").remove();
							root.append(output).children(".pk_form_success, .pk_form_error").hide();

							if($("p", root).attr('class') == 'pk_form_success') {
								$("input[type=text], input[type=email], textarea", root).val('');
								showResponse($(".pk_form_success", root).text(), "success", settings.timer * 2);
							} else {
								showResponse($(".pk_form_error", root).text(), "error", settings.timer);
							}
						}

					});

					return false;
				});
			});
		}
	})(jQuery);


/**
   *
*/

	function pkFixPixels() {
		
		jQuery("#pk_sidebar .pk_widget").filter(":last").addClass("pk_last_widget");
		jQuery("#pk_intro h2, #pk_intro h3").css("margin-left", "-2px");

		if((jQuery.browser.msie && jQuery.browser.version >= 9) || jQuery.browser.webkit == true) {
			jQuery("input[type=submit], button").css("padding-bottom", "0px");
		}
		
	}


/**
* hoverIntent is similar to jQuery's built-in "hover" function except that
* instead of firing the onMouseOver event immediately, hoverIntent checks
* to see if the user's mouse has slowed down (beneath the sensitivity
* threshold) before firing the onMouseOver event.
* 
* hoverIntent r5 // 2007.03.27 // jQuery 1.1.2+
* <http://cherne.net/brian/resources/jquery.hoverIntent.html>
* 
* hoverIntent is currently available for use in all personal or commercial 
* projects under both MIT and GPL licenses. This means that you can choose 
* the license that best suits your project, and use it accordingly.
* 
* // basic usage (just like .hover) receives onMouseOver and onMouseOut functions
* $("ul li").hoverIntent( showNav , hideNav );
* 
* // advanced usage receives configuration object only
* $("ul li").hoverIntent({
*	sensitivity: 7, // number = sensitivity threshold (must be 1 or higher)
*	interval: 100,   // number = milliseconds of polling interval
*	over: showNav,  // function = onMouseOver callback (required)
*	timeout: 0,   // number = milliseconds delay before onMouseOut function call
*	out: hideNav    // function = onMouseOut callback (required)
* });
* 
* @param  f  onMouseOver function || An object with configuration options
* @param  g  onMouseOut function  || Nothing (use configuration options object)
* @author    Brian Cherne <brian@cherne.net>
*/
	(function($) {
		$.fn.hoverIntent = function(f,g) {
			var cfg = {
				sensitivity: 7,
				interval: 100,
				timeout: 200
			};
			cfg = $.extend(cfg, g ? { over: f, out: g } : f );

			var cX, cY, pX, pY;
			var track = function(ev) {
				cX = ev.pageX;
				cY = ev.pageY;
			};

			var compare = function(ev,ob) {
				ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
				if ( ( Math.abs(pX-cX) + Math.abs(pY-cY) ) < cfg.sensitivity ) {
					$(ob).unbind("mousemove",track);
					ob.hoverIntent_s = 1;
					return cfg.over.apply(ob,[ev]);
				} else {
					pX = cX; pY = cY;
					ob.hoverIntent_t = setTimeout( function(){compare(ev, ob);} , cfg.interval );
				}
			};

			var delay = function(ev,ob) {
				ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
				ob.hoverIntent_s = 0;
				return cfg.out.apply(ob,[ev]);
			};

			var handleHover = function(e) {
				var p = (e.type == "mouseover" ? e.fromElement : e.toElement) || e.relatedTarget;
				while ( p && p != this ) { try { p = p.parentNode; } catch(e) { p = this; } }
				if ( p == this ) { return false; }

				var ev = jQuery.extend({},e);
				var ob = this;

				if (ob.hoverIntent_t) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); }

				if (e.type == "mouseover") {
					pX = ev.pageX; pY = ev.pageY;
					$(ob).bind("mousemove",track);
					if (ob.hoverIntent_s != 1) { ob.hoverIntent_t = setTimeout( function(){compare(ev,ob);} , cfg.interval );}
				} else {
					$(ob).unbind("mousemove",track);
					if (ob.hoverIntent_s == 1) { ob.hoverIntent_t = setTimeout( function(){delay(ev,ob);} , cfg.timeout );}
				}
			};

			return this.mouseover(handleHover).mouseout(handleHover);
		};
	})(jQuery);
