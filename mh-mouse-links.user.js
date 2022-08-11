// ==UserScript==
// @name         🐭️ MouseHunt - Mouse Links
// @version      1.0.1
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

	const addStyles = () => {
		const style = document.createElement('style');
		style.innerHTML = `
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
		}`;

		document.head.appendChild(style);
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

	const addLinks = (mouse) => {
		let links = makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${ mouse.name }`);
		links += makeLink('mhdb', `https://dbgames.info/mousehunt/mice/${ mouse.name }`);
		const title = document.querySelector('.mouseView-title');
		title.insertAdjacentHTML('beforeend', links);
	};

	$(document).ready(function () { // eslint-disable-line no-undef
		addStyles();
	});

	$(document).ajaxComplete(function (_event, _xhr, options) { // eslint-disable-line no-undef
		if (options.url.indexOf('managers/ajax/mice/getstat.php') !== -1) {
			if (_xhr.responseJSON.mice && _xhr.responseJSON.mice.length > 0) {
				addLinks(_xhr.responseJSON.mice[ 0 ]);
			}
		}
	});
}());
