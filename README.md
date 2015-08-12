PyBingo
=======

This is a re-implementation of [Oldham Bingo][].  It is a web-based bingo game
with integrated chat room.

Instructions
------------

### Setup

You'll need to have Python 3, with pip, and pyvenv working for it.

```bash
git submodule init
git submodule update # this will take a while to get emoji stuff
pyvenv venv          # substitute whatever works for Python 3 on your system
. venv/bin/activate
pip install -r requirements.txt
```

### Running

Just run the `pybingo.py` file with a board name to start serving.  However, by
default this will be on `localhost:8888`.  You can specify a hostname with `-H`,
and a port with `-P` (you'll need root for port 80).

    ./pybingo.py tekin.txt -H my.host.name -P 8888


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
[LICENSE.txt]: LICENSE.txt
