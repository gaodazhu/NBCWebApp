
/*
 * GET home page.
 */
var mongoOperate = require('.././mongo/mongoOperate');
exports.index = function(req, res){
  mongoOperate.testaa();

  res.render('index', { title: 'Express' });
};