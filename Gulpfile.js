//Core
var gulp = require("gulp");
var sequence = require("gulp-sequence");

//Compile
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var less = require("gulp-less");
var autoprefixer = require("gulp-autoprefixer");
var jshint = require("gulp-jshint");
var extender = require("gulp-html-extend");

//Server
var connect = require("gulp-connect");
var livereload = require("gulp-livereload");

// Vendor
var bowerFiles = require("main-bower-files");
var bower = require("gulp-bower");

// IO
var del  = require("del");
var open = require("gulp-open");
var sftp = require("gulp-sftp");

//Watch
var	watch = require('gulp-watch');

var paths = {
	html: {
		all: ["src/views/**/*"],
		dist: "dist",
		root: "src/views"
	},
	js: {
		app: "src/js/**.js",
		vendor: ["src/vendor/angular/angular.js"],
		dist: "dist/js"
	},
	less: {
		main: "src/less/base.less",
		all: "src/less/**.less",
		dist: "dist/css"
	},
	fonts: {
		all: ["src/fonts/**"],
		dist: "dist/fonts",
	},
    images: {
        all: ["src/images/**"],
        dist: "dist/images",
    },
	vendor: "dist/vendor",
	dist: 'dist'
};

var sftpCredentials = {
	host: "",
	user: "", 
	pass: "",
	remotePath: ""
};

gulp.task("html", function () {
	return gulp.src(paths.html.all, {base: paths.html.root})
	//TODO: add html minifier
		.pipe(extender())
		.pipe(gulp.dest(paths.html.dist))
		.pipe(connect.reload());
});

gulp.task("fonts", function () {
	return gulp.src(paths.fonts.all)
		.pipe(gulp.dest(paths.fonts.dist));
});

gulp.task("images", function () {
    return gulp.src(paths.images.all)
        .pipe(gulp.dest(paths.images.dist));
});

/* Javascripts Tasks */
gulp.task("js", function () {
	return gulp.src(paths.js.app)
		.pipe(jshint())
		.pipe(jshint.reporter("jshint-stylish"))
		.on("error", function (error) {
		console.log(error.toString());
		this.emit("end");
	})
		.pipe(concat("app.js"))
		.pipe(gulp.dest(paths.js.dist))
		.pipe(livereload());
});


gulp.task("js:vendor", function () {
	return gulp.src(paths.js.vendor)
		.pipe(concat("vendor.js"))
		.pipe(uglify())
		.pipe(gulp.dest(paths.js.dist));
});

/* Less tasks. */
gulp.task("less", function () {
	return gulp.src(paths.less.main)
		.pipe(require("gulp-less")({ paths: [ paths.less.all ] }))
		.on("error", function (error) {
		console.log(error.toString());
		this.emit("end");
	})
		.pipe(autoprefixer
			  ("last 2 version all browsers"))
		.pipe(concat("app.css"))
		.pipe(gulp.dest(paths.less.dist))
		.pipe(livereload());
});

/* Bower tasks */
gulp.task("bower:cleanorig", function (cb) {
	del("bower_components", cb);
});

gulp.task("bower:clean", function (cb) {
	del(paths.js.vendor, cb);
});

gulp.task("bower:pull", function () {
	return bower();
});

gulp.task("bower:copy", function () {
	return gulp.src(bowerFiles(), {base: "bower_components"})
		.pipe(gulp.dest(paths.vendor));
});

gulp.task("bower", function (cb) {
	sequence("bower:pull", "bower:copy",  cb);//"bower:cleanorig","bower:clean"
});

// Deployment tasks
function sftpPush(host, user, pass, remotePath) {
  return gulp.src(paths.dist + "/**")
  .pipe(sftp({
    host: host,
    user: user,
    pass: pass,
    remotePath: remotePath,
    buffer: false
  }));
}

gulp.task("deploy:stage", ["build"], function () {
	return sftpPush(
		sftpCredentials.host, 
		sftpCredentials.user,
		sftpCredentials.pass.
		sftpCredentials.remotePath
		);
});


gulp.task("watch", function () {
	gulp.watch(paths.less.all, ["less"]);
	gulp.watch(paths.html.all, ["html"]);
	gulp.watch(paths.images.all, ["images"]);
    gulp.watch(paths.js.app, ["js"]);
	
	watch(paths.dist+"/**/*").pipe(connect.reload());
});

gulp.task("connect", function () {
	connect.server({
		port: 3000,
		root: 'dist',
		livereload: true
	});
	gulp.src("dist")
		.pipe(open("", {app: "google chrome", url: "http://localhost:3000"}));

});
gulp.task("build", ["js", "js:vendor", "html", "images", "fonts", "less"]);

gulp.task("default", ["help"]);

// gulp.task("dev", ["build","connect","watch"]);
gulp.task('dev', ['build'], function () {
	gulp.start('connect', 'watch');
});

gulp.task("pull", ["bower"]);

gulp.task("help", function () {
	console.log("\n"
		+ "******************************************************************\n"
		+ "1. gulp pull to get the third party libraries.\n\n"
		+ "2. gulp dev to build, watch and listen.\n\n"
		+ "3. A web server will get automatically launched on \n"
		+ "   http://localhost:3000\n\n"
		+ "4. gulp deploy:stage to upload a version to staging \n"
		+ "   check the README.md file for the staging URL.\n"
		+ "   make sure to run gulp pull before making a deployment\n"
		+ "   Run gulp pull on a regular basis to keep up to date.\n\n"
		+ "******************************************************************\n");
});
