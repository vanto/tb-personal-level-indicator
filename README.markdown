Personal Level Indicators for Mozilla Thunderbird
=================================================

This add-on brings GMail's "personal level indicators" feature to Thunderbird. It displays little arrows next the emails subjects so you can tell if a message was addressed to you, a group, or a mailing list. A single arrow (›) indicates that a message is sent to you, and a group of others. A double arrow (») appears when the message is sent only to you. Arrows won't appear next to messages sent to a mailing list.

The add-on provides a new column "Personal Level Indicator" that can be enabled via the message list's column chooser.

Translations
------------
The add-on supports the following languages:

* English
* German
* Bulgarian, thanks to Marin Dimitrov
* Italian, thanks to Michele Mancioppi
* French, thanks to Ihab El Alami
* Swedish, thanks to Mikael Hiort af Ornäs
* Spanish, thanks to Carlos Pedrinaci

Changelog
---------
* v0.1 -- Initial release
* v0.2 -- Language support for de, bg, it and fr added.
* v0.3 -- Bug fix release (arrows were shown twice)
* v0.4 -- Language support for sv and es added.
* v0.5 -- Bug fix release (#3: email address matching was case sensitive)
* v0.6 -- Bug fix release (#7: PLI shows wrong indicators in Thunderbird 24)
* v0.7 -- New Feature: Indicator style is now configurable. Besides the "Gmail style" there also the "triple style", which shows a single arrow (›) if a message is sent only to you, a double arrow (») if it is sent to a group and a triple arrow if it is sent to a mailing list.
* v0.8 -- More robustness, addon will now notice changes in indentities and does not require a restart anymore. Also the default settings are properly initialized when the plugin is installed.
* v0.9 -- New "GMail Style with UTF-8 Characters" adapts to font style, thus fixes issues with dark themes.
