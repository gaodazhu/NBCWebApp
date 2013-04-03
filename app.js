/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path');
var app = express();


app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/users', user.list);

http.createServer(app).listen(app.get('port'), function () {
    var spawn = require('child_process').spawn,
        ls = spawn('hadoop', ['fs', '-cat', '/hs_err_pid21176.log']);

    ls.stdout.on('data', function (data) {
        console.log('stdout: ' + data);//命令执行结果
    });

    ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data);//输出错误数据
    });

    ls.on('exit', function (code) {
        console.log('child process exited with code ' + code);//退出命令
    });
    console.log("Express server listening on port " + app.get('port'));
});
