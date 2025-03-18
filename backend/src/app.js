"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var helmet_1 = require("helmet");
var cors_1 = require("cors");
var app = (0, express_1.default)();
//security middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
//for json parsing
app.use(express_1.default.json({ limit: '100kb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/', function (req, res) {
    res.json({ message: "Hello world" });
});
exports.default = app;
