// ==UserScript==
// @name         🐭️ MouseHunt - Mouse Links
// @version      1.1.0
// @description  Add links to the MouseHunt wiki & MHDB for mice.
// @license      MIT
// @author       bradp
// @namespace    bradp
// @match        https://www.mousehuntgame.com/*
// @icon         https://brrad.com/mouse.png
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
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
	 * @param {Function} callback The callback to call when an ajax request is completed.
	 * @param {string}   url      The url to match. If not provided, all ajax requests will be matched.
	 */
	const onAjaxRequest = (callback, url) => {
		const req = XMLHttpRequest.prototype.open;
		XMLHttpRequest.prototype.open = function () {
			this.addEventListener('load', function () {
				const response = JSON.parse(this.responseText);
				if (response.success) {
					if (! url) {
						callback(this);
						return;
					}

					if (this.responseURL.indexOf(url) !== -1) {
						callback(this);
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
		observer.observe(
			document.getElementById('overlayBg'),
			{
				attributes: true,
				attributeFilter: ['class']
			}
		);
	};

	/**
	 * Return an anchor element with the given text and href.
	 *
	 * @param {string} text Text to use for link.
	 * @param {string} href URL to link to.
	 *
	 * @return {string} HTML for link.
	 */
	const makeLink = (text, href) => {
		href = href.replace(/\s/g, '_');
		return `<a href="${ href }" target="_mouse" class="mousehuntActionButton tiny mhMouseLinks"><span>${ text }</span></a>`;
	};

	/**
	 * Add links to the mouse overlay.
	 */
	const addLinks = () => {
		const title = document.querySelector('.mouseView-title');
		title.insertAdjacentHTML(
			'beforeend',
			makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${title.innerText}`) +
			makeLink('mhdb', `https://dbgames.info/mousehunt/mice/${title.innerText}`)
		);
	};

	addStyles(`
	.mouseView-titleContainer {
		height: 26px;
	}

	.mhMouseLinks {
		margin-left: 10px;
	}

	.mouseView-values {
		font-size: .9em;
	}

	.mouseView-title {
		font-size: 1.2em;
		line-height: 24px;
	}`);

	onAjaxRequest(addLinks, 'managers/ajax/mice/getstat.php');
	onOverlayChange({ show: addLinks });
}());
