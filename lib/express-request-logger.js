const uuidv4 = require('uuid/v4');
const pretty = require('pretty-format');
const has = require('lodash.has');
const set = require('lodash.set');

class ExpressRequestLogger {
    constructor() {
        this.logger = undefined;
        this.timer = undefined;
        this.id = undefined;
    };

    requestLog(req) {
        this.id = uuidv4();
        this.timer = process.hrtime();

        let simpleRequest = {
            headers: this.hideData(req.headers),
            body: this.hideData(req.body)
        };

        if (this.logger.length == 2)
            this.logger(simpleRequest, `REQUEST [${this.id}] [${req.method} ${req.path}]`);
        else
            this.logger(`REQUEST [${this.id}] [${req.method} ${req.path}] [${pretty(simpleRequest)}]`);
    };

    responseLog(req, res) {
        let self = this;
        let temp = res.send

        res.send = function () {
            let elapsed = process.hrtime(this.timer)[1] / 1000000;
            let responseData = self.hideData(arguments);

            if (self.logger.length == 2)
                self.logger(responseData, `RESPONSE [${res.statusCode}] para [${self.id}] [${req.method} ${req.path}] em ${elapsed.toFixed(2)} ms`);
            else
                self.logger(`RESPONSE [${res.statusCode}] para [${self.id}] [${req.method} ${req.path}] [${pretty(responseData)}] em ${elapsed.toFixed(2)} ms`);

            temp.apply(this, arguments);
        };
    };

    hideData(data) {
        for (let key of this.hide) {
            if (has(data, key))
                set(data, key, '*****');
        };
        return data;
    };

    configure(options, req, res, next) {
        let opts = options || {};
        this.logger = opts.logger || console.log;
        this.hide = opts.hide || ['password', 'senha', 'secret'];
        this.requestLog(req);
        this.responseLog(req, res);
        next();
    };
};

module.exports = function (options, req, res, next) {
    var log = new ExpressRequestLogger();
    return log.configure.bind(log, options);
};