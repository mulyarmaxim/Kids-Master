const gulp          = require('gulp'),
      sass          = require('gulp-sass'),
      plumber       = require('gulp-plumber'),
      postcss       = require('gulp-postcss'),
      autoprefixer  = require('autoprefixer'),
      minifyCSS     = require('gulp-csso'),
      rename        = require('gulp-rename'),
      imagemin      = require('gulp-imagemin'),
      server        = require('browser-sync').create(),
      run           = require('run-sequence'),
      spritePNG     = require('gulp.spritesmith'),
      del           = require('del');

gulp.task('style', () => {
    gulp.src('src/sass/style.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(gulp.dest('build/css'))
        .pipe(server.stream())
        .pipe(minifyCSS())
        .pipe(rename('style.min.css'))
        .pipe(gulp.dest('build/css'));
});

gulp.task('browser-sync', () => {
  server.init({
    server: 'build/'
  });

  gulp.watch('src/sass/**/*.scss', ['style']);
  gulp.watch('src/**/*.html', ['copyHTML']);
  gulp.watch('src/js/**/*.js', ['copyJS']);

});

gulp.task('imageOptimizer', () => {
  gulp.src('src/img/**/*.{svg,jpg,png,gif}')
      .pipe(imagemin([
          imagemin.gifsicle({interlaced: true}),
          imagemin.jpegtran({progressive: true}),
          imagemin.optipng({optimizationLevel: 3}),
          imagemin.svgo({
            plugins: [
              {removeViewBox: true},
              {cleanupIDs: false}
            ]
          })
      ]))
      .pipe(gulp.dest('build/img'));
});

gulp.task('spritePNG', () => {
  gulp.src('build/img/icons/icon-*.png')
      .pipe(spritePNG({
        imgName: 'sprite.png',
        cssName: 'sprite.css'
      }))
      .pipe(gulp.dest('build/img'));
});

gulp.task('copy', () => {
    gulp.src([
        'src/img/**',
        'src/fonts/**/*.{woff,woff2}'
    ], {
      base: 'src'
    })
        .pipe(gulp.dest('build'));
});

gulp.task('copyHTML', () => {
  gulp.src('src/*.html',
      {
        base: 'src'
      })
      .pipe(server.stream())
      .pipe(gulp.dest('build/'))
});

gulp.task('copyJS', () => {
  gulp.src('src/**/*.js',
      {
        base: 'src'
      }
      )
      .pipe(server.stream())
      .pipe(gulp.dest('build'));
});

gulp.task('clean', () => {
  return del('build');
});

gulp.task('build', (done) => {
    run(
        'clean',
        'copy',
        'copyJS',
        'style',
        'imageOptimizer',
        'spritePNG',
        'copyHTML',
        done);
});