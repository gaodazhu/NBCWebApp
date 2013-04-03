/*
 * GET home page.
 */
var mongoOperate = require('.././mongo/mongoOperate');
exports.index = function (req, res) {
    //mongoOperate.test();

    res.render('cytoscape', { title: 'Express' });
};