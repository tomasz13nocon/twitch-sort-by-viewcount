// ==UserScript==
// @name         Sort channels by viewcount
// @namespace    https://github.com/tomasz13nocon
// @version      1.1
// @description  Reorders the followed channels list in the sidebar based on viewcount.
// @author       Tomasz Nocoń
// @match        https://www.twitch.tv/*
// @grant        none
// @homepageURL  https://github.com/tomasz13nocon/twitch-sort-by-viewcount
// @license      MIT
// ==/UserScript==

(async function() {
	'use strict';

	// Returns a float parsed from a localized viewcount string for a given language.
	// The values for text representing million are untested or flat out not present,
	// since it's impossible to test them without a million viewer Andy. And those are rare.
	// TODO: Access internal react data to get viewcounts as numbers if it's even possible,
	// and avoid this ugly parsing.
	function parseViewcount(str, lang) {
		// IIFE spreading keys containing commas to seperate keys in the following object
		const langs = (obj => {
			let keys = Object.keys(obj);
			for (let i = 0; i < keys.length; ++i) {
				let key = keys[i],
						subkeys = key.split(", "),
						target = obj[key];
				delete obj[key];
				subkeys.forEach(key => { obj[key] = target; });
			}
			return obj;
		})({ // mappings for determining multiplier text based on language
			"en-US, en-GB, es-MX, fr-FR, nl-NL, no-NO, ro-RO, th-TH": {
				k: "k",
				m: "m",
			},
			"pl-PL": {
				k: "tys",
				m: "mil",
			},
			"da-DK": {
				k: "t",
				m: "m",
			},
			"es-ES, pt-PT, pt-BR": {
				k: "mil",
			},
			"hu-HU": {
				k: "e",
				m: "m",
			},
			"sk-SK, cs-CZ": {
				k: "tis",
				m: "mil",
			},
			"fi-FI": {
				k: "t",
				m: "m",
			},
			"sv-SE": {
				k: "tn",
				m: "mn",
			},
			"vi-VN": {
				k: "n",
				m: "t",
			},
			"tr-TR": {
				k: "b",
				m: "m",
			},
			"el-GR": {
				k: "χιλ",
				m: "εκα",
			},
			"bg-BG": {
				k: "хил",
				m: "млн",
			},
			"ru-RU": {
				k: "тыс",
				m: "млн",
			},
			// These ones are actually 10k modifiers:
			"zh-CN, ja-JP": {
				k: "万",
			},
			"zh-TW": {
				k: "萬",
			},
			"ko-KR": {
				k: "만",
			},
		});

		// Some languages use commas as decimals
		str = str.replace(",", ".");
		// These languages use dot (or comma) as seperator (123.456 == 123456)
		if (["de-DE", "it-IT", "zh-CN", "zh-TW", "ja-JP", "ko-KR"].includes(lang)) {
			str = str.replace(".", "");
		}

		let viewcount = parseFloat(str);
		if (langs[lang]) {
			if (str.toLowerCase().includes(langs[lang].k)) {
				if (["zh-CN", "zh-TW", "ja-JP", "ko-KR"].includes(lang))
					viewcount *= 10000;
				else
					viewcount *= 1000;
			}
			else if (str.toLowerCase().includes(langs[lang].m))
				viewcount *= 1000000;
		}
		return viewcount;
	}

	// Returns viewcount of a given side-nav-card element
	function viewcount(element) {
		let viewcountString = element.getElementsByClassName("side-nav-card__live-status")[0].textContent;
		return parseViewcount(
			viewcountString,
			document.getElementsByTagName("html")[0].getAttribute("lang")
		);
	}


	let sidebar;
	// Delay querying the element until it loads
	while ((sidebar = document.getElementsByClassName("side-bar-contents")[0]) === undefined) {
		console.log("side-bar-contents not found. retrying in 0.5 seconds");
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