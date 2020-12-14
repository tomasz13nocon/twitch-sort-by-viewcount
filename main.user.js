// ==UserScript==
// @name         Sort channels by viewcount
// @namespace    https://github.com/tomasz13nocon
// @version      1.0
// @description  Reorders the followed channels list in the sidebar based on viewcount.
// @author       Tomasz Nocoń
// @match        https://www.twitch.tv/*
// @grant        none
// @homepageURL  https://github.com/tomasz13nocon/twitch-sort-by-viewcount
// @license      MIT
// ==/UserScript==

(function() {
	'use strict';

	let sidebar = document.getElementsByClassName("side-bar-contents")[0];
	// We're mutating DOM inside a DOM mutation event callback. This flag prevents infinite loop.
	let weMutatedDom = false;

	new MutationObserver((mutations) => {

		if (weMutatedDom) {
			weMutatedDom = false;
			return;
		}

		// We're only interested in "new nodes added" and "text changed" mutations.
		let relevantMutation = false;
		for (let mutation of mutations) {
			if (mutation.addedNodes[0] || mutation.type === "characterData") {
				relevantMutation = true;
				break;
			}
		}
		if (!relevantMutation)
			return;

		// If the compact version of the followed channels list is being displayed, then there is no way to sort.
		if (document.getElementsByClassName("side-nav--expanded").length === 0)
			return;

		let sections = sidebar.getElementsByClassName("side-nav-section");
		let followedSection = sections[0]; // this depends on the DOM order of these sections, while the for loop below depends on the "followed channels" text. Which one is less likely to change in the future?
		/*let followedSection;
		for (let section of sections) {
			if (section.textContent.toLowerCase().includes("followed channels"))
				followedSection = section;
		}*/

		// Mapping to 2 parents up, as that's the outermost element for a single channel
		let streams = [...followedSection.getElementsByClassName("side-nav-card")].map(el => el.parentNode.parentNode);

		// return viewcount of a given side-nav-card element
		function viewcount(element) {
			let viewcountString = element.getElementsByClassName("side-nav-card__live-status")[0].textContent;
			let viewcount = parseFloat(viewcountString);
			if (viewcountString.toLowerCase().includes("k"))
				viewcount *= 1000;
			else if (viewcountString.toLowerCase().includes("m"))
				viewcount *= 1000000;
			return viewcount;
		}

		streams.sort((a, b) => {
			let av = viewcount(a), bv = viewcount(b);
			if (av > bv)
				return -1;
			if (av < bv)
				return 1;
			return 0;
		});

		weMutatedDom = true;
		streams[0].parentNode.append(...streams);

	}).observe(sidebar, { childList: true, subtree: true, characterData: true });

})();