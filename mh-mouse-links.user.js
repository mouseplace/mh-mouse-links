// ==UserScript==
// @name         🐭️ MouseHunt - Mouse Links
// @version      1.2.7
// @description  Add links to the MouseHunt wiki & MHDB for mice.
// @license      MIT
// @author       bradp
// @namespace    bradp
// @match        https://www.mousehuntgame.com/*
// @icon         https://brrad.com/mouse.png
// @grant        none
// @run-at       document-end
// ==/UserScript==

((function () {
	'use strict';

	/**
	 * Add styles to the page.
	 *
	 * @param {string} styles The styles to add.
	 */
	const addStyles = (styles) => {
		const existingStyles = document.getElementById('mh-mouseplace-custom-styles');

		if (existingStyles) {
			existingStyles.innerHTML += styles;
		} else {
			const style = document.createElement('style');
			style.id = 'mh-mouseplace-custom-styles';

			style.innerHTML = styles;
			document.head.appendChild(style);
		}
	};

	/**
	 * Do something when ajax requests are completed.
	 *
	 * @param {Function} callback    The callback to call when an ajax request is completed.
	 * @param {string}   url         The url to match. If not provided, all ajax requests will be matched.
	 * @param {boolean}  skipSuccess Skip the success check.
	 */
	const onAjaxRequest = (callback, url = null, skipSuccess = false) => {
		const req = XMLHttpRequest.prototype.open;
		XMLHttpRequest.prototype.open = function () {
			this.addEventListener('load', function () {
				if (this.responseText) {
					let response = {};
					try {
						response = JSON.parse(this.responseText);
					} catch (e) {
						return;
					}

					if (response.success || skipSuccess) {
						if (! url) {
							callback(this);
							return;
						}

						if (this.responseURL.indexOf(url) !== -1) {
							callback(this);
						}
					}
				}
			});
			req.apply(this, arguments);
		};
	};

	/**
	 * Do something when the overlay is shown or hidden.
	 *
	 * @param {Object}   callbacks
	 * @param {Function} callbacks.show   The callback to call when the overlay is shown.
	 * @param {Function} callbacks.hide   The callback to call when the overlay is hidden.
	 * @param {Function} callbacks.change The callback to call when the overlay is changed.
	 */
	const onOverlayChange = (callbacks) => {
		const observer = new MutationObserver(() => {
			if (callbacks.change) {
				callbacks.change();
			}

			if (document.getElementById('overlayBg').classList.length > 0) {
				if (callbacks.show) {
					callbacks.show();
				}
			} else if (callbacks.hide) {
				callbacks.hide();
			}
		});

		const overlay = document.getElementById('overlayBg');
		if (! overlay) {
			return;
		}

		observer.observe(
			overlay,
			{
				attributes: true,
				attributeFilter: ['class']
			}
		);
	};

	/**
	 * Return an anchor element with the given text and href.
	 *
	 * @param {string}  text          Text to use for link.
	 * @param {string}  href          URL to link to.
	 * @param {boolean} encodeAsSpace Encode spaces as %20.
	 *
	 * @return {string} HTML for link.
	 */
	const makeLink = (text, href, encodeAsSpace) => {
		if (encodeAsSpace) {
			href = href.replace(/_/g, '%20');
		} else {
			href = href.replace(/\s/g, '_');
		}

		href = href.replace(/\$/g, '_');

		return `<a href="${ href }" target="_mouse" class="mousehuntActionButton tiny"><span>${ text }</span></a>`;
	};

	/**
	 * Get the markup for the mouse links.
	 *
	 * @param {string} name The name of the mouse.
	 *
	 * @return {string} The markup for the mouse links.
	 */
	const getLinkMarkup = (name) => {
		return makeLink('MHCT Attraction Rate', `https://www.mhct.win/attractions.php?mouse$name=${ name }`, true) +
			makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${ name }_Mouse`) +
			makeLink('mhdb', `https://dbgames.info/mousehunt/mice/${ name }_Mouse`);
	};

	/**
	 * Add links to the mouse overlay.
	 */
	const addLinks = () => {
		const title = document.querySelector('.mouseView-title');
		if (! title) {
			return;
		}

		const currentLinks = document.querySelector('.mh-mouse-links');
		if (currentLinks) {
			currentLinks.remove();
		}

		const div = document.createElement('div');
		div.classList.add('mh-mouse-links');
		div.innerHTML = getLinkMarkup(title.innerText);
		title.parentNode.insertBefore(div, title);

		// Move the values into the main text.
		const values = document.querySelector('.mouseView-values');
		const desc = document.querySelector('.mouseView-descriptionContainer');
		if (values && desc) {
			// insert as first child of desc
			desc.insertBefore(values, desc.firstChild);
		}
	};

	/**
	 * Add links to the mouse details on the map.
	 */
	const addMapLinks = () => {
		const overlayClasses = document.getElementById('overlayPopup').classList;
		if (! overlayClasses.contains('treasureMapPopup')) {
			return;
		}

		const mouseIcon = document.querySelectorAll('.treasureMapView-goals-group-goal');
		if (mouseIcon.length === 0) {
			setTimeout(addMapLinks, 500);
		}

		const mapViewClasses = document.querySelector('.treasureMapView.treasure');
		if (! mapViewClasses) {
			return;
		}

		if (mapViewClasses.classList.value.indexOf('scavenger_hunt') !== -1) {
			return;
		}

		mouseIcon.forEach((mouse) => {
			mouse.addEventListener('click', () => {
				const title = document.querySelector('.treasureMapView-highlight-name');
				if (! title) {
					return;
				}

				const div = document.createElement('div');
				div.classList.add('mh-mouse-links-map');
				div.innerHTML = getLinkMarkup(title.innerText);
				title.parentNode.insertBefore(div, title.nextSibling);
			});
		});
	};

	addStyles(`
	.mouseView-titleContainer {
		height: 26px;
	}

	.mouseView-values {
		float: none;
		padding: 5px 0 10px 0;
		line-height: unset;
		padding-bottom: 8px;
		font-size: 0.9em;
	}

	.mouseView-title {
		font-size: 1.2em;
		line-height: 24px;
	}

	.mh-mouse-links {
		display: inline-block;
		float: right;
		margin-right: 15px;
	}

	.mh-mouse-links-map {
		padding-bottom: 5px;
	}

	.mh-mouse-links a {
		margin-right: 10px;
	}

	.mh-mouse-links-map a {
		margin: 10px 10px 10px 0;
	}
	.mh-mouse-links-map .mousehuntActionButton.tiny {
		margin: 3px;
	}`);

	onAjaxRequest(addLinks, 'managers/ajax/mice/getstat.php');
	onOverlayChange({ show: addLinks });
	onOverlayChange({ show: addMapLinks });
})());
