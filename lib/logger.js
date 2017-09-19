const os = require('os');
const bunyan = require('bunyan');
const prettyFormat = require('pretty-format');

class Logger {

    constructor(applicationName, applicationVersion, applicationUrl, bunyanObject) {

        this.applicationName = applicationName;
        this.applicationVersion = applicationVersion;
        this.applicationUrl = applicationUrl;

        this.hostname = os.hostname() || 'localhost';

        this.bunyan_obj = bunyanObject || bunyan.createLogger({
            name: 'oidigital-logger',
            streams: [
                {
                    level: 'info',
                    stream: process.stdout
                },
                {
                    level: 'error',
                    path: `logs/${this.hostname}.error.txt`,
                    type: 'rotating-file',
                    period: '1d',
                    count: 15
                },
                {
                    level: 'debug',
                    path: `logs/${this.hostname}.debug.log`,
                    type: 'rotating-file',
                    period: '1d',
                    count: 15
                }
            ]
        });
    };

    debug(identification, message, obj) {
        var tuple = this._write("debug", identification, message, obj);
        console.log(tuple);
    };

    error(identification, message, obj) {
        this._write("error", identification, message, obj);
    };

    info(identification, message, obj) {
        this._write("info", identification, message, obj);
    };

    _write(logType, identification, message, obj) {

        identification = identification || {};

        // configurando dados da aplicação base
        identification.aplicacao = {
            nome: this.applicationName,
            versao: this.applicationVersion,
            url: this.applicationUrl
        };

        // exibe warnings caso a identificação não esteja preenchida corretamente
        if (!identification.cliente || (!identification.cliente.cpf && !identification.cliente.msisdn && !identification.cliente.email))
            console.log("OIDIGITAL-LOGGER - ATENCAO => Você precisa definir uma identificação válida para o cliente com cpf, email ou msisdn.");

        if (!identification.aplicacao || (!identification.aplicacao.nome && !identification.aplicacao.versao))
            console.log("OIDIGITAL-LOGGER - ATENCAO => Você precisa definir os dados da aplicação com nome, endpoint, plataforma e versão.");


        // consolida as informações em uma linha de log
        var tuple = {
            oidigital: {
                aplicacao: this._toSafeString(identification.aplicacao),
                aplicacao_cliente: this._toSafeString(identification.aplicacao_cliente),
                identificacao: this._toSafeString(identification.cliente)
            },
            log: {
                mensagem: this._toSafeString(message),
                detalhe: prettyFormat(obj)
            }
        };

        this.bunyan_obj[logType](tuple);

        return tuple;
    };

    // converte todos os valores para string, dessa forma garantimos que o ES nunca levará
    // type mismatch por conta do cabeçalho.
    _toSafeString(object) {
        if (object && typeof (object) == 'object' && !Array.isArray(object)) {
            for (let key of Object.keys(object))
                object[key] = String(object[key]);
        }
        else
            object = String(object);

        return object;
    }
}

module.exports = function (applicationName, applicationVersion, applicationUrl, bunyanObject) {
    return new Logger(applicationName, applicationVersion, applicationUrl, bunyanObject);
};