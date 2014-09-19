var $ = require('jquery');
var _ = require('lodash');

// # Rotate Effect
// ________________

$.fn.rotate = function(degrees) {
		$(this).css({'-webkit-transform' : 'rotate('+ degrees +'deg)',
									'-moz-transform' : 'rotate('+ degrees +'deg)',
									'-ms-transform' : 'rotate('+ degrees +'deg)',
									'transform' : 'rotate('+ degrees +'deg)'});
};

$(function(){
	'use strict';

	var $window = $(window);

	// # Nav
	// - when the nav covers the header, we reveal the same set of icons as part of the nav so that they can still be accessed
	// _______

	var $nav = $('.nav-container');

	var Nav = {
		$window: $window,
		$nav: $nav,
		$navItems: $nav.find('.nav-item'),
		$navItemsContainer: $nav.find('.nav'),
		navHeight: $nav.outerHeight(),
		navMarginTop: parseInt($nav.css('margin-top')),
		$navBuffer: $('.nav-fixed-buffer'),
		$header: $('.header .header-inner'),
		$headerCover: $('.header-cover'),
		previousHideTimeoutId: -1,
		setTrigger: function() {
			if (this.$nav.hasClass('fixed')) {
				this.trigger = this.$navBuffer.offset().top - this.navMarginTop;
			}
			else {
				this.trigger = this.$nav.offset().top - this.navMarginTop;
			}
			if ($window.width() <= 767) {
				// 767 is @screen-xs-max
				// always be fixed on mobile, even if they scroll into negative space
				this.trigger = -100;
			}
		},
		maybeFixNav: function() {
			if (this.$window.scrollTop() >= this.trigger) {
				if (!this.$nav.hasClass('fixed')) {
					this.$nav.addClass('fixed');
					this.$navBuffer.removeClass('hide');
					this.$header.addClass('hide');
					this.$headerCover.removeClass('hide');
					this.$nav.find('.nav-inner-container').addClass('container');
				}
			}
			else {
				if (this.$nav.hasClass('fixed')) {
					this.$nav.removeClass('fixed');
					this.$navBuffer.addClass('hide');
					this.$header.removeClass('hide');
					this.$headerCover.addClass('hide');
					this.$nav.find('.nav-inner-container').removeClass('container');
				}
			}
		},
		toggleNav: function() {
			var showNav = false;
			if (this.$navItemsContainer.hasClass('before-hide')) {

				// then cancel the previous setTimeout
				clearTimeout(this.previousHideTimeoutId);
				// and remove the class
				this.$navItemsContainer.removeClass('before-hide');

				// and run the code for showing the nav
				showNav = true;
			}
			if (showNav || this.$navItemsContainer.hasClass('hide')) {

				// then show the nav
				this.$navItemsContainer.removeClass('hide');

				// wait 50 ms for elements to un-hide
				window.setTimeout(function(){
					// set the proper animation classes
					// TODO(joe): consider doing this in css by changing
					// the definition of these classes under different classes
					Nav.$navItems.first().removeClass('nav-item-transition-3');
					Nav.$navItems.first().addClass('nav-item-transition-1');
					Nav.$navItems.last().removeClass('nav-item-transition-1');
					Nav.$navItems.last().addClass('nav-item-transition-3');

					// trigger the animation
					Nav.$navItems.removeClass('opacity-hide').addClass('active');

					// hard set to the final state for multiple fast clicks
					Nav.$navItemsContainer.removeClass('hide');
				}, 50);

				return true;
			}
			else {
				// set a class on the element when the removed animation starts
				// that will be removed once the animation ends
				this.$navItemsContainer.addClass('before-hide');

				// set the proper animation classes
				this.$navItems.first().removeClass('nav-item-transition-1');
				this.$navItems.first().addClass('nav-item-transition-3');
				this.$navItems.last().removeClass('nav-item-transition-3');
				this.$navItems.last().addClass('nav-item-transition-1');

				// trigger the animation
				this.$navItems.addClass('opacity-hide').removeClass('active');

				// wait 3s for elements to finish animation
				// then hide the nav
				this.previousHideTimeoutId = window.setTimeout(function(){

					// hide the nav
					Nav.$navItemsContainer.addClass('hide');
					Nav.$navItemsContainer.removeClass('before-hide');

					// hard set to the final state for multiple fast clicks
					Nav.$navItems.first().removeClass('nav-item-transition-1');
					Nav.$navItems.first().addClass('nav-item-transition-3');
					Nav.$navItems.last().removeClass('nav-item-transition-3');
					Nav.$navItems.last().addClass('nav-item-transition-1');
					Nav.$navItems.addClass('opacity-hide').removeClass('active');
				}, 1500);

				return false;
			}
		}
	};

	// ## Fix nav to the top of the window

	Nav.setTrigger();
	Nav.maybeFixNav();

	$window.resize(function(e){
		// recalculate the trigger when window is resized
		Nav.setTrigger();
		Nav.maybeFixNav();
	});

	$window.scroll(function(){
		Nav.maybeFixNav();
	});

	// ## Toggle the nav open and closed

	var rotateForwardAmount = 360 * 4;
	var rotateBackwardAmount = -1 * rotateForwardAmount;
	var rotateOffset = 0;
	$('.toggle-nav').click(function(e){
		var addedNav = Nav.toggleNav();
		if (addedNav) {
			rotateOffset += (rotateForwardAmount);
		}
		else {
			rotateOffset += (rotateBackwardAmount);
		}
		$(this).rotate(rotateOffset);
	});

	// # Slow scroll on Nav links
	// _____________________________

	$('.scroll-to').click(function(e){
		var scrollTarget = $(e.target).data().scrollTarget;
		var scrollTo = $(scrollTarget).offset().top - Nav.navHeight - Nav.navMarginTop + 1;
		$('html, body').animate({scrollTop: scrollTo}, 2000);
	});

	// # Hover Links
	// _______________

	var colors = [
		'yellow',
		'amber',
		'orange',
		'sunset',
		'red',
		'fuchsia',
		'purple',
		'indigo',
		'blue',
		'aqua',
		'green',
		'lime'
	];

	var $links = $('.hover-link');

	$links.mouseenter(function(e){
		var $target = $(e.target).closest('.hover-link');
		var i = Math.floor(11.1111111 * Math.random());
		$target.addClass(colors[i]);
	});

	$links.mouseleave(function(e){
		var $target = $(e.target).closest('.hover-link');
		_($target.attr('class').split(/\s+/)).forEach(function(i){
			if (_(colors).contains(i)) {
				$target.removeClass(i);
			}
		});
	});

	var $title = $('.intro-title-header-link');
	var prevI = 8;
	window.setInterval(function(){
		$title.removeClass(colors[prevI]);
		var i = Math.floor(11.1111111 * Math.random());
		prevI = i;
		$title.addClass(colors[i]);
	}, 1000);

});