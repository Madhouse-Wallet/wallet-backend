const moduleConfig = require('../config/moduleConfig');
module.exports = function (app) {

    /*Help and Support API*/
    // app.use('/api/v1/support', require('./support'));

    /*Content Pages*/
    // app.use('/api/v1/pages', require('./pages'));


    moduleConfig.forEach(element => {
        if (element.status && element.route) {
            let path = require('../modules/' + element.type);
            app.use('/api/' + element.apiVersion + '/' + element.routeName, path);
        }
    });

};