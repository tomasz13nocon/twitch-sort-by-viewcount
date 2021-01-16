// ==UserScript==
// @name         Sort channels by viewcount
// @namespace    https://github.com/tomasz13nocon
// @version      1.2
// @description  Reorders the followed channels list in the sidebar based on viewcount.
// @author       Tomasz Nocoń
// @match        https://www.twitch.tv/*
// @grant        none
// @homepageURL  https://github.com/tomasz13nocon/twitch-sort-by-viewcount
// @license      MIT
// ==/UserScript==

(async function() {
	'use strict';

	// Returns the react element from a dom node
	function findReact(dom) {
		const key = Object.keys(dom).find(key => key.startsWith("__reactInternalInstance$"));
		const domFiber = dom[key];
		if (domFiber == null) return null;

		let parentFiber = domFiber.return;
		while (typeof parentFiber.type == "string") {
			parentFiber = parentFiber.return;
		}
		return parentFiber.stateNode;
	}

	// Returns viewcount of a given element, or undefined if offline.
	// element has to be the grandparent of a side-nav-card element. That's the react component.
	function viewcount(element) {
		let component = findReact(element);
		// If "stream" property doesn't exist (optional chaining below) then the stream is offline.
		return component
			.props.children
			.props.children
			.props.stream?.content.viewersCount;
	}


	let sidebar;
	// Delay querying the element until it loads
	while ((sidebar = document.getElementsByClassName("side-bar-contents")[0]) === undefined) {
		await new Promise(r => setTimeout(r, 500));
	}
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
		let followedSection = sections[0];

		// Mapping to 2 parents up, as that's the outermost element for a single channel
		let streams = [...followedSection.getElementsByClassName("side-nav-card")].map(el => el.parentNode.parentNode);

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