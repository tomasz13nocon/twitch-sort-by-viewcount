# twitch-sort-by-viewcount
[Recently twitch changed the way the followed channels list in the sidebar appears to some users.](https://twitter.com/TwitchSupport/status/1336452058279522306)

This userscript reorders that list based on viewcount.
Whenever a new channel goes live or some channels' viewcounts get updated the script reorders the list accordingly.

## Caveats
If some live channels are hidden (as in you need to press "Show More" to show them) they cannot be sorted, since twitch fetches their names and viewcounts dynamically.
What this means is that there might still be channels with higher viewcounts, that are not being shown.

One way to solve this is to enable the "Auto Expand Followed Channels List" option in [BTTV](https://betterttv.com/).

Also if the followed channels list is collapsed (only streamers' avatars are displayed) they cannot be sorted, since there's no viewcount to sort by.


## Installation
In order to use this, you need a userscript extension such as [Violentmonkey](https://violentmonkey.github.io/get-it/) (Greasemonkey and Tampermonkey will work as well).

Then go to https://greasyfork.org/en/scripts/418625-sort-channels-by-viewcount and press "Install this script". A page should open where you can review the source code, and depending on the extension there should be a button such as "Confirm installation" or "Install".

Refresh twitch and it should be working.

You can disable it at any time by opening the Violentmonkey (or equivalent) extension popup, toggling the script and refreshing the page.
