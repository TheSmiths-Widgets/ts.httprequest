# HTTPRequest [![Titanium](http://www-static.appcelerator.com/badges/titanium-git-badge-sq.png)](http://www.appcelerator.com/titanium/) [![Alloy](http://www-static.appcelerator.com/badges/alloy-git-badge-sq.png)](http://www.appcelerator.com/alloy/) [![License](http://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat)](http://choosealicense.com/licenses/apache-2.0/)

This module for the [Appcelerator](http://www.appcelerator.com) Titanium Alloy MVC framework is
built on the top of the Titanium HTTPClient. It provides simple abstractions and methods to common
HTTP operations.

The module defines some shortcut to quickly set headers or data for a request. Also, it will
automatically parse the response and return a JSON object if the corresponding header is
`application/json`. 

## Quick Start

### Get it [![gitTio](http://gitt.io/badge.png)](http://gitt.io/component/ts.httprequest) 

**Download this repository and install it**

* In your application's `tiapp.xml` file, add the module to the modules section: 

```xml
<modules>
    <module platform="commonjs">ts.httprequest</module>
</modules>
```

* Copy the `ts.httprequest-commonjs-x.x.x.zip` bundle into your root app directory.

**Or use your favorite package manager** 

- [gitTio](http://gitt.io/cli): `gittio install ts.httprequest`

### Use it

```javascript
var HTTPRequest = require('ts.httprequest');

var request = new HTTPRequest({
    method: 'POST',
    url: 'http://www.url.com'
    data: {
        key: 'value'
    },
    headers: {
        key: 'value'
    },
}).then(handleSuccess).catch(handleError);
```

### API

##### new HTTPRequest(config) :: Promise

> *Create a new request ready to be sent*
>
> - `{Object}` **config** Config object with the following properties:
>   - `{String}` **config.url** URL to reach with the request
>   - `{String}` **[config.method="GET"]** defines method (POST, GET, PUT, DELETE)
>   - `{Object}` **[config.headers={}]** defines request's headers
>   - `{Object}` **[config.data={}]** defines request's data
>   - `{Number}` **[config.timeout=10000]** defines request's timeout (ms)
>   - `{Function}` **config.success** progress callback 
>   
> - **return** `{Promise}` A Promise resolved with the request response (formatted)


## Changelog
* 1.4 Upgrade
    - An es6-promise is now returned by the constructor
    - A `progress` option is now available as a callback to handle progress

* 1.3 Upgrade
    - Mainly fixes and refactor in the code 
    - Remove the dependency to underscore

* 1.0 First version

[![wearesmiths](http://wearesmiths.com/media/logoGitHub.png)](http://wearesmiths.com)

Appcelerator, Appcelerator Titanium and associated marks and logos are trademarks of Appcelerator, Inc.  
Titanium is Copyright (c) 2008-2015 by Appcelerator, Inc. All Rights Reserved.  
Titanium is licensed under the Apache Public License (Version 2).  
