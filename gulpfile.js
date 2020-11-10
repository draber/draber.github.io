'use strict';

const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
//const eslint = require('gulp-eslint');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const resourceCompiler = require('resource-compiler');

const paths = {
	scss: './project/scss/',
	css: './project/css/',
	jsSource: './project/js/source.js',
	jsConsole: './project/js/console.js',
	bookmarklet: './project/bookmarklet/bookmarklet.href',
	widgetCss: './project/css/widget.min.css',
	siteCss: './project/css/site.min.css',
	indexTpl: './project/html/index.tpl',
	favicon: './project/img/favicon.png',
	package: './package.json'
};

// CSS task
function css() {
	return gulp
		.src(paths.scss + '**/*.scss')
		.pipe(sass({
			outputStyle: 'expanded'
		}))
		.pipe(gulp.dest(paths.css))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(postcss([autoprefixer(), cssnano()]))
		.pipe(gulp.dest(paths.css));
}


// Watch files
function watch() {
	gulp.watch(paths.scss + '**/*', css);
	gulp.watch(paths.jsSource, resourceCompiler.console);
	gulp.watch(paths.jsConsole, resourceCompiler.bookmarklet);
	gulp.watch(paths.bookmarklet, resourceCompiler.index);
	gulp.watch(paths.widgetCss, resourceCompiler.console);
	gulp.watch(paths.siteCss, resourceCompiler.index);
	gulp.watch(paths.indexTpl, resourceCompiler.index);
	gulp.watch(paths.favicon, resourceCompiler.index);
	gulp.watch(paths.package, resourceCompiler.console);
  }


exports.default = watch;