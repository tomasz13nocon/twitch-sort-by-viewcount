# twitch-sort-by-viewcount
[Recently twitch changed the way the followed channels list in the sidebar appears to some users.](https://twitter.com/TwitchSupport/status/1336452058279522306)

This userscript reorders that list based on viewcount.
Whenever a new channel goes live or some channels' viewcounts get updated the script reorders the list accordingly.

## Caveats
If some live channels are hidden (as in you need to press "Show More" to show them) they cannot be sorted, since twitch fetches their names and viewcounts dynamically.
What this means is that there might still be channels with higher viewcounts, that are not being shown.

One way to solve this is to enable the "Auto Expand Followed Channels List" option in [BTTV](https://betterttv.com/).

Also if the followed channels list is collapsed (only streamers' avatars are displayed) they cannot be sorted, since there's no viewcount to sort by.
