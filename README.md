PyBingo
=======

This is a re-implementation of [Oldham Bingo][].  It is a web-based bingo game
with integrated chat room.

Instructions
------------

You need Python 3, and Tornado.

    pip install tornado

Or, just install from the requirements file (`pip install -r requirements.txt`).
Then, just run the `pybingo.py` file.  You need to specify a board as a text
file, which shuld have at least 24 lines (one for each cell).  You should also
provide your hostname as an argument (for the WebSocket URL in the JavaScript
code).  You can also specify a port.

    ./pybingo.py tekin.txt -H my.host.name -P 8668

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
