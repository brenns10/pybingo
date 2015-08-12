PyBingo ![uses emoji](https://img.shields.io/badge/uses-emoji-ff69b4.svg) ![powered by cwru](https://img.shields.io/badge/powered%20by-cwru-0a304e.svg) ![runs on shitty js](https://img.shields.io/badge/runs_on-shitty_js-red.svg)
=======

This is a re-implementation of [Oldham Bingo][].  It is a web-based bingo game
with integrated chat room.

Features
--------

* CWRU themed Bingo board!  Show your school spirit while you goof off in class!
* Let the whole world know when you've won by turning up your speakers and
  listening for the blood curdling scream of "BINGO!!!".
* Integrated chat along the right side, so you can collaborate with your fellow
  classmates in real-time!  Even better than Slack or Google Docs.
* Full Emoji support by entering `:emoji_names:` or making faces (`:)`)!  Lower
  the barrier of communication with your classmates by adding new styles of
  nonverbal communication!
* Customizable chat nicknames, even include Emoji in your nickname!  Now, Prince
  isn't the only one who can have an unpronouncable name!
* We bring the CLI back to the web with exciting chat commands! (type `/help`
  for details)
* Now with notification support, so you never miss a message!

Instructions
------------

### Setup

You'll need to have Python 3, with pip, and pyvenv working for it.

```bash
git submodule init
git submodule update
pyvenv venv # substitute whatever works for Python 3 on your system
. venv/bin/activate
pip install -r requirements.txt
```

Unfortunately, the `git submodule` stuff will take a little time, cause it'll
download a truly epic-sized repository (~220MB) filled with assorted emoji
images.  You'd think I'd be able to find a CDN hosting that, but apparently not.
If you find something that you can get to work with [js-emoji][], by all means
shoot me a PR.

### Running

Just run the `pybingo.py` file with a board name to start serving.  However, by
default this will be on `localhost:8888`.  You can specify a hostname with `-H`,
and a port with `-P` (you'll need root for port 80).

    ./pybingo.py tekin.txt -H my.host.name -P 8888

Comments
--------

I'm not a huge fan of Javascript (actually, I kinda hate it).  But, it turns out
that when writing an interactive game with chat, you do most of the development
on the client side!  Who'da thunk?  All that to say, my JS code may not be the
greatest.  I also am not yet familiar with typical libraries like jQuery, which
may mean that my code won't run well on other/older browsers.  Sorry!

As for acknowledgements, I'm including the Tekin board copied verbatim from
[Oldham Bingo][].  So, thanks for that!  Also, check out the [js-emoji][]
library, and its associated [emoji-data][] repository that allows me to convert
various types of text (`:smile:` and `:)`) into Emoji images in a number of
different styles.

Finally, I'm definitely *not* responsible for anything that happens as a result
of using this software.  It's entirely for fun, and I don't recommend or endorse
actually playing this in any class!

Contributing
------------

I'd love to have GitHub issues - feature requests, bug reports, etc.  Or pull
requests, if you're willing.  Just make sure everything is PEP8, and try to
avoid trailing whitespace in your code.

License
-------

Copyright (c) 2015 Stephen Brennan.  All rights reserved.  Code is under the
Revised BSD license.  See [LICENSE.txt][] for more info.

[Oldham Bingo]: https://github.com/aaronneyer/oldham-bingo
[js-emoji]: https://github.com/iamcal/js-emoji
[emoji-data]: https://github.com/iamcal/emoji-data
[LICENSE.txt]: LICENSE.txt
