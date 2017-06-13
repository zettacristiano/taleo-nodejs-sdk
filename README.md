Taleo Node.js REST API SDK
==========================

[![Build Status](https://travis-ci.org/paulholden2/taleo-nodejs-sdk.svg?branch=master)](https://travis-ci.org/paulholden2/taleo-nodejs-sdk) [![Coverage Status](https://coveralls.io/repos/github/paulholden2/taleo-nodejs-sdk/badge.svg?branch=master)](https://coveralls.io/github/paulholden2/taleo-nodejs-sdk?branch=master)

This SDK provides a limited feature set, as it was created and is developed primarily for internal IT work at Stria.

To use this SDK, you must create a `.env` file in the root of your project that defines some environment variables used to access Taleo. Alternatively, you can simply define these when running your application, like so:

```
TALEO_COMPANY_CODE=STG_MYACCOUNT npm start
```

Note: All of the following variables are *required*.

| Variable | Description |
|----------|-------------|
| TALEO_COMPANY_CODE | This code is used to identify which account to log into |
| TALEO_USERNAME | Your Taleo account username. |
| TALEO_PASSWORD | Your Taleo account password. |

Should you opt to use a `.env` file, please do **not** share or publish it in **any way**. This file obviously contains sensitive information regarding your Taleo account, and should be manually created and never stored in source control or similar shared media. Create it to provide your application access to Taleo, and destroy it when it is no longer needed.

MIT License
===========

Copyright (c) 2017 Stria, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
