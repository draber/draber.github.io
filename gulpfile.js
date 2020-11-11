'use strict';

const autoprefixer = require('autoprefixer');
const bookmarklet = require('bookmarklet');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
var sass = require('gulp-dart-sass');
const fileIncluder = require('file-includer');
const fs = require('fs');
const configIncluder = require('config-includer');

const paths = {
	scss: './project/scss/',
	css: './project/css/',
	jsSource: './project/js/source.js',
	jsConsole: './project/js/console.js',
	indexTpl: './project/html/index.tpl',
	indexHtml: './index.html'
};

// CSS task
const css = () => {
	return gulp
		.src(paths.scss + '**/*.scss')
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(gulp.dest(paths.css))
		.pipe(postcss([autoprefixer()]))
		.pipe(gulp.dest(paths.css));
}

const js = () => {
	fs.readFile(paths.jsSource, 'utf8', (error, data) => {
		if (error) {
			console.error(error);
		}
		data = fileIncluder(data);
		data = configIncluder(data);
		return fs.writeFile(paths.jsConsole, data, error => {
			if (error) {
				console.error(error);
			}
		});
	});
}

// Build webpage
async function build() {
	configIncluder.set('bookmarklet', bookmarklet.convert(fs.readFileSync(paths.jsConsole, 'utf8'), {
		style: false,
		script: false
	}));

	fs.readFile(paths.indexTpl, 'utf8', (error, data) => {
		if (error) {
			console.error(error);
		}
		data = fileIncluder(data);
		data = configIncluder(data);
		return fs.writeFile(paths.indexHtml, data, error => {
			if (error) {
				console.error(error);
			}
		});
	});
}


// Watch files
const watch = () => {
	gulp.watch(paths.scss + '**/*', css);
	gulp.watch(paths.jsSource, js);
}

exports.build = build;
exports.default = watch;