'use strict';

var gulp = require('gulp'),
    jsdoc = require('gulp-jsdoc3');

gulp.task('docs', function(cb) {
    require('./jsdoc.json');
    gulp.src(['./README.md', './index.js', './src/**/*.js'], {
        read: false
    })
    .pipe(jsdoc(cb));
});
