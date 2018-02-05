const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

let app = express();
let router = express.Router();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/v1', router);

const routeFactory = require('./helpers/CRUDAPIFactory');
routeFactory(router, [
    { table: 'dboclients', slug: '/customers', indexField: 'KundenNR'},
    { table: 'dboclients', slug: '/orders', indexField: 'KundenNR'},
    { table: 'dboclients', slug: '/forms', indexField: 'KundenNR'},
]);

app.use((err, req, res, next) => res.json({ status: err.status || 500, message: err.message}));

module.exports = app;
