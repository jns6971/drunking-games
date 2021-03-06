var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    postcss = require('gulp-postcss'),
    imageResize = require('gulp-image-resize'),
    parallel = require("concurrent-transform"),
    os = require("os"),
    cp = require('child_process');

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['styles', 'jekyll-build'], function() {
  browserSync.init({
    server: {
      baseDir: '_site'
    },
    startPath: "/index.html"
  });
});

// To support opacity in IE 8
var opacity = function(css) {
  css.walkDecls(function(decl, i) {
    if (decl.prop === 'opacity') {
      decl.parent.insertAfter(i, {
        prop: '-ms-filter',
        value: '"progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (parseFloat(decl.value) * 100) + ')"'
      });
    }
  });
};

/**
 * Compile files from sass into both assets/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('styles', function() {
  return gulp.src('_scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(autoprefixer({browsers: ['last 2 versions', 'Firefox ESR', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1']}))
    .pipe(postcss([opacity]))
    .pipe(gulp.dest('assets/css'));
});

//minify css
gulp.task('css-minify', function () {
    gulp.src('assets/css')
        .pipe(rename({suffix: '.min'}))
        .pipe(minifyCSS())
        .pipe(gulp.dest('assets/css'));
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
// gulp.task('sass', function () {
//     return gulp.src('_scss/main.scss')
//         .pipe(sass({
//             includePaths: ['scss'],
//             onError: browserSync.notify
//         }))
//         .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
//         .pipe(gulp.dest('_site/css'))
//         .pipe(browserSync.reload({stream:true}))
//         .pipe(gulp.dest('css'));
// });

/**
 * Automatically resize post feature images and turn them into thumbnails
 */
gulp.task("thumbnails", function () {
  gulp.src("assets/images/hero/*")
    .pipe(imageResize({ width : 350 }))
    .pipe(gulp.dest("assets/images/thumbnail"))
});
gulp.task('thumbnails2', function () {
  gulp.src('assets/images/hero/shark.jpg')
    .pipe(imageResize({
      width : 250,
      crop : true,
      upscale : false
    }))
    .pipe(gulp.dest('assets/images/thumbnail'));
});

// gulp.task

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll
 * Watch _site generation, reload BrowserSync
 */
// gulp.task('watch', function() {
//   gulp.watch('_scss/**/*.scss', ['styles']);
//   gulp.watch('assets/images/hero/*.{jpg,png}', ['thumbnails']);
//   gulp.watch(['*.html',
//           '*.txt',
//           'about/**',
//           '_posts/*.markdown',
//           'assets/javascripts/**/**.js',
//           'assets/images/**',
//           'assets/fonts/**',
//           '_layouts/**',
//           '_includes/**',
//           'assets/css/**'
//         ],
//         ['jekyll-build']);
//   gulp.watch("_site/index.html").on('change', browserSync.reload);
// });

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('_scss/**/*.scss', ['styles']);
    gulp.watch([  '*.html',
                  '*.txt',
                  'about/**',
                  '_posts/*',
                  'assets/javascripts/**/**.js',
                  'assets/images/**',
                  'assets/fonts/**',
                  '_layouts/**',
                  '_includes/**',
                  'assets/css/**'
                ], 
                ['jekyll-rebuild']);
});

gulp.task('jekyll', function() {
  gulp.watch(['*.html',
          '*.txt',
          'about/**',
          '_posts/*.markdown',
          'assets/javascripts/**/**.js',
          'assets/images/**',
          'assets/fonts/**',
          '_layouts/**',
          '_includes/**',
          'assets/css/**'
        ],
        ['jekyll-build']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
// gulp.task('default', ['thumbnails', 'browser-sync', 'watch2']);
gulp.task('default', ['browser-sync', 'watch']);