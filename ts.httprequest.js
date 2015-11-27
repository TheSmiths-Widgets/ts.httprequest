require('pinkie');

/**
 * @class Request
 * **Request library** creates and handles HTTP request using Titanium's HTTPClient.
 * An HTTPClient object is intended to be used for a single request.
 *
 * Usage:
 *
 *     @example
 *     new Request({ url, method, success, error });
 *
 */
var TAG = "HTTPRequest";

var Request = module.exports = (function() {
    /**
     * @constructor
     * Constructs a new Request object
     *
     * @param {Object} config Config object with properties:
     * @param {String} config.url URL to reach with the request.
     * @param {String} [config.method="GET"] defines method (POST, GET, PUT, DELETE).
     * @param {Object} [config.headers={}] defines request's headers.
     * @param {Object} [config.data={}] defines request's datas.
     * @param {Number} [config.timeout=10000] defines request's timeout (milliseconds).
     * @param {Function} config.success success callback.
     * @param {Mixed} config.success.response Server's response.
     * @param {Function} config.error error callback.
     * @param {String} config.error.responseText Server's text response (error).
     */
    function Request(config) {
        var baseUrl = config.baseUrl || 'http://',
            method  = config.method || 'GET',
            headers = config.headers || {},
            data    = config.data || {},
            query,
            protocol;

        Object.defineProperties(this, {
            progressHandler: { value: config.progress, enumerable: true },
            url: { value: config.url, enumerable: true, writable: true },
            method: { value: method, enumerable: true }
        });

        if(method === 'GET' || method === 'DELETE') {
            if(query = Request.prototype.toQueryString(config.data)) {
                this.url += "?" + query;
            }
        } else { // POST || PUT
            if (config.headers && config.headers['Content-Type'] === "application/x-www-form-urlencoded") {
                this.data = Request.prototype.toQueryString(config.data);
            } else if (config.headers && config.headers['Content-Type'] === "application/json") {
                this.data = JSON.stringify(config.data);
            } else {
                this.data = config.data;
            }
        }

        protocol = this.url.slice(0, 5);
        if(protocol !== 'http:' && protocol !== 'https') {
            this.url = baseUrl + (this.url.charAt(0) !== '/' ? '/' : '') + this.url;
        }

        return new Promise((resolve, reject) => {
            this.successCallback = resolve;
            this.errorCallback = reject;

            this.httpClient = Ti.Network.createHTTPClient({
                onload: (function (request) { return function () {
                    Request.prototype.handleSuccess.call(this, request); };}(this)),
                onerror: (function (request) { return function (error) {
                    Request.prototype.handleError.call(this, request, error); };}(this)),
                onsendstream: (function (request) { return function (progress) {
                    Request.prototype.handleProgress.call(this, request, progress); };}(this)),
                timeout: config.timeout || 10000
            });

            this.httpClient.open(method, this.url);

            if(config.headers) {
                for(let type in config.headers) {
                    this.httpClient.setRequestHeader(type, config.headers[type]);
                }
            }

            if (this.method === "GET") {
                this.httpClient.send();
            } else {
                this.httpClient.send(this.data);
            }
        });
    }

    /**
    * Handle request when it succeeds and call success custom callback.
    * @private
    * @param {appcelerator: HTTPClient} Request the request object
    */
    Request.prototype.handleSuccess = function(Request) {
        Ti.API.info(TAG, "handleSuccess for url " + "(" + Request.method + ") " + Request.url);
        var response = this.responseText;

        if (this.getResponseHeader("Content-Type").match(/application\/json/)) {
            try {
                response = JSON.parse(response);
            } catch (e) {
                Ti.API.error(TAG, 'Tried to parse response, but it was not valid json.');

                // Execute callback
                if(typeof Request.errorCallback === "function") {
                    Request.errorCallback("Tried to parse response, but it was not valid json.");
                }

                return;
            }
        }

        // Execute callback
        if(typeof Request.successCallback === "function") {
            Request.successCallback(response);
        }
    };

    /**
    * Handle request when it fails and call error custom callback.
    * @private
    * @param {appcelerator: HTTPClient} Request the request object
    */
    Request.prototype.handleError = function(Request, error) {
        Ti.API.error(TAG, "handleError for url " + "(" + Request.method + ") " + Request.url);
        Ti.API.error(TAG, JSON.stringify(error, null, "\t"));
        Ti.API.error(TAG, this.responseText);

        // Execute callback
        if (typeof Request.errorCallback === "function") {
            Request.errorCallback(error);
        }
    };

    /**
    * Handle request sending stream, calls custom handler.
    * @private
    * @param {appcelerator: HTTPClient} Request the request object
    */
    Request.prototype.handleProgress = function(Request, event) {
        // Execute handler
        if (typeof Request.progressHandler === "function") {
            Ti.API.info(TAG, "handleProgress for url " + "(" + Request.method + ") " + Request.url, event.progress);
            Request.progressHandler(event.progress);
        }
    };

    /**
    * Converts the supplied object into a query string
    * @private
    * @param {Object} data Data object to be serialized
    * @return {String} Serialized data
    */
    Request.prototype.toQueryString = function(data) {
        var query = [],
            queryString = '',
            key;

        for (key in data) {
            query.push(Ti.Network.encodeURIComponent(key) + '=' +
                Ti.Network.encodeURIComponent(data[key]));
        };

        if(query.length) {
            queryString = query.join('&');
        }

        return queryString;
    };

    return Request;
})();
