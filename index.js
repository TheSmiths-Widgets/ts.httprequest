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
            query;

        _.extend(this, {
            successCallback : config.success,
            errorCallback   : config.error,
            url             : config.url,
            method          : method
        });

        // TODO: progress handler
        this.httpClient = Ti.Network.createHTTPClient({
            onload  : _.partial(Request.prototype.handleSuccess, this),
            onerror : _.partial(Request.prototype.handleError, this),
            timeout : config.timeout || 10000
        });

        if(method === 'GET' || method === 'DELETE') {
            if(query = Request.prototype.toQueryString(config.data)) {
                this.url += (this.url.indexOf('?') > 0 ? '&' : '?') + query;
            }
        } else { // POST || PUT
            this.data = JSON.stringify(config.data);
        }

        var protocol = this.url.slice(0, 5);
        if(protocol !== 'http:' && protocol !== 'https') {
            this.url = baseUrl + (this.url.charAt(0) !== '/' ? '/' : '') + this.url;
        }

        this.httpClient.open(method, this.url);

        if(config.headers) {
            for(type in config.headers) {
                this.httpClient.setRequestHeader(type, config.headers[type]);
            }
        }

        // Debug trace
        Ti.API.warn(TAG, "(" + this.method + ") " + this.url);
        Ti.API.warn(TAG, this.data);
    }

    /**
     * Send the current request.
     * @method function
     * @param  {Object} data for everything but GET.
     */
    Request.prototype.send = function(data) {
        Ti.API.info(TAG, "send for url " + "(" + this.method + ") " + this.url, this.data);
        if(this.method != 'GET') {
            data = data || this.data;
            this.httpClient.send(data);
        } else {
            this.httpClient.send();
        }
    }

    /**
    * Handle request when it succeeds and call success custom callback.
    * @private
    * @param {appcelerator: HTTPClient} Request the request object
    */
    Request.prototype.handleSuccess = function(Request) {
        Ti.API.info(TAG, "handleSuccess for url " + "(" + Request.method + ") " + Request.url);
        var response;
        try {
            response = JSON.parse(this.responseText);
        } catch (e) {
            Ti.API.error(TAG, 'Tried to parse response, but it was not valid json.', e);
            Ti.API.error(TAG, this.responseText);
            response = this.responseText;
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
    Request.prototype.handleError = function(Request) {
        Ti.API.error(TAG, "handleError for url " + "(" + Request.method + ") " + Request.url);
        Ti.API.error(TAG, this.responseText);

        // Execute callback
        if(typeof Request.errorCallback === "function") {
            Request.errorCallback(this.responseText)
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

        _.each(data, function(value, key) {
            if(data.hasOwnProperty(key)) {
                query.push(Ti.Network.encodeURIComponent(key) + '=' + Ti.Network.encodeURIComponent(data[key]));
            }
        });

        if(query.length) {
            queryString = '?' + query.join('&');
        }

        return queryString;
    };

    return Request;
})();
