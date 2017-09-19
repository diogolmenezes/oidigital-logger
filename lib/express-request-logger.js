const uuidv4 = require('uuid/v4');
const pretty = require('pretty-format');
const has = require('lodash.has');
const set = require('lodash.set');

class ExpressRequestLogger {

    constructor() {
        this.logger = undefined;
        this.timer = undefined;
    };

    _requestLog(req) {
        req.id = uuidv4();

        this.timer = process.hrtime();

        let simpleRequest = {
            headers: this._hideData(req.headers),
            body: this._hideData(req.body)
        };

        this.logger(this.customData(req), `REQUEST [${req.id}] [${req.method} ${req.path}]`, simpleRequest);
    };

    _responseLog(req, res) {
        let self = this;
        let temp = res.send

        res.send = function () {
            let elapsed = process.hrtime(this.timer)[1] / 1000000;
            let responseData = self._hideData(arguments);

            self.logger(this.customData(req), responseData, `RESPONSE [${res.statusCode}] para [${req.id}] [${req.method} ${req.path}] em ${elapsed.toFixed(2)} ms`);

            temp.apply(this, arguments);
        };
    };

    _hideData(data) {
        for (let key of this.hide) {
            if (has(data, key))
                set(data, key, '*****');
        };
        return data;
    };

    configure(options, req, res, next) {
        let opts = options || {};
        this.logger = require('./logger')(opts.applicationName, opts.applicationVersion, opts.applicationUrl, (opts.logger || null));
        this.hide = opts.hide || ['password', 'senha', 'secret', 'cvv'];
        this._requestLog(req);
        this._responseLog(req, res);
        next();
    };
};

module.exports = function (options, req, res, next) {
    var log = new ExpressRequestLogger();
    return log.configure.bind(log, options);
};