// ==UserScript==
// @name         🐭️ MouseHunt - Mouse Links
// @version      1.3.3
// @description  Add links to the MouseHunt wiki & MHDB for mice.
// @license      MIT
// @author       bradp
// @namespace    bradp
// @match        https://www.mousehuntgame.com/*
// @icon         https://i.mouse.rip/mouse.png
// @grant        none
// @run-at       document-end
// @require      https://cdn.jsdelivr.net/npm/mousehunt-utils@1.5.2/mousehunt-utils.js
// ==/UserScript==

((function () {
  'use strict';

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

    return `<a href="${href}" target="_mouse" class="mousehuntActionButton tiny"><span>${text}</span></a>`;
  };

  /**
   * Get the markup for the mouse links.
   *
   * @param {string} name The name of the mouse.
   *
   * @return {string} The markup for the mouse links.
   */
  const getLinkMarkup = (name) => {
    return makeLink('MHCT AR', `https://www.mhct.win/attractions.php?mouse$name=${name}`, true) +
			makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${name}_Mouse`) +
			makeLink('mhdb', `https://dbgames.info/mousehunt/mice/${name}_Mouse`);
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

  addStyles(`.mouseView-titleContainer {
    height: 26px;
  }

  .mouseView-values {
    float: none;
    padding: 5px 0 10px;
    padding-bottom: 8px;
    font-size: 0.9em;
    line-height: unset;
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
  }
  `);

  onAjaxRequest(addLinks, 'managers/ajax/mice/getstat.php');
  onOverlayChange({ show: addLinks });
  onOverlayChange({ show: addMapLinks });
})());
