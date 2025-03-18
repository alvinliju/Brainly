"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cluster_1 = require("cluster");
var os_1 = require("os");
if (cluster_1.default.isPrimary) {
    var numCPUs = os_1.default.cpus().length;
    for (var i = 0; i < numCPUs; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on('exit', function (worker) {
        console.log("Worker ".concat(worker.process.pid, " died"));
        cluster_1.default.fork();
    });
}
else {
    Promise.resolve().then(function () { return require('../backend/src/app'); }).then(function (_a) {
        var app = _a.default;
        var port = process.env.PORT || 3000;
        app.listen(port, function () {
            console.log("Worker ".concat(process.pid, " listening on port ").concat(port));
        });
    });
}
