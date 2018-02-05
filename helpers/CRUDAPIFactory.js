const qb = require('node-querybuilder').QueryBuilder(require('../db'), 'mysql', 'single');

class CRUDAPIFactory {

    constructor(router, config) {
        this.table = config.table;
        this.slug = config.slug;
        this.indexField = config.indexField;
        this.router = router;
        this.mountRoutes();
    }

    create(data, callback) {
        qb.insert(this.table, data, callback);
    }

    get(index, callback) {
        let payload = {};
        payload[this.indexField] = index;
        qb.select('*').get_where(this.table, payload, callback);
    }

    update(index, data, callback) {
        let payload = {};
        payload[this.indexField] = index;
        qb.update(this.table, data, payload, callback);
    }

    remove(index, callback) {
        let payload = {};
        payload[this.indexField] = index;
        qb.delete(this.table, payload, callback)
    }

    find(filters, callback) {
        let query = {};

        if (filters.where && filters.like) {
            query = qb.limit(filters.limit ? filters.limit : 50)
                .select(filters.fields ? filters.fields : '*')
                .where(filters.where)
                .like(filters.like);
        }else if(filters.where){
            query = qb.limit(filters.limit ? filters.limit : 50)
                .select(filters.fields ? filters.fields : '*')
                .where(filters.where)
        }else{
            query = qb.limit(filters.limit ? filters.limit : 50)
                .select(filters.fields ? filters.fields : '*')
                .like(filters.like);
        }

        query.get(this.table, (err, res) => {
            console.log(qb.last_query());
            callback(err, res);
        });
    }

    mountRoutes() {

        this.router.post(this.slug, (req, res, next) =>
            this.create(req.body, (error, results) =>
                res.json(error ? {error} : results)));

        this.router.get(`${this.slug}/:${this.indexField}`, (req, res, next) =>
            this.get(req.params[this.indexField], (error, results) =>
                res.json(error ? {error} : results)));

        this.router.post(`${this.slug}/:${this.indexField}`, (req, res, next) =>
            this.update(req.params[this.indexField], req.body, (error, results) =>
                res.json(error ? {error} : results)));

        this.router.delete(`${this.slug}/:${this.indexField}`, (req, res, next) =>
            this.remove(req.params[this.indexField], (error, results) =>
                res.json(error ? {error} : results)));

        this.router.post(`/find${this.slug}`, (req, res, next) =>
            this.find(req.body, (error, results) =>
                res.json(error ? {error} : results)));

    }

}

module.exports = (router, configs) => configs.map((config) => new CRUDAPIFactory(router, config));