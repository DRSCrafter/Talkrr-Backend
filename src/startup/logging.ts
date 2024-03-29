// @ts-nocheck

import winston from 'winston';
import 'express-async-errors';

module.exports = function () {
    winston.handleExceptions(
        new winston.transports.File({filename: 'uncaughtExceptions.log'})
    );

    process.on('unhandledRejection', (ex) => {
        throw ex;
    });

    winston.add(winston.transports.File, {filename: 'logfile.log'});
}