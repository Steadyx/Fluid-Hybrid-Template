var gulp = require( 'gulp' );
var path = require( 'path' );
var zip = require( 'gulp-zip' );
var pug = require( 'gulp-pug' );
var sass = require( 'gulp-sass' );
var inlineCss = require( 'gulp-inline-css' );
var neat = require( 'node-neat' )
  .includePaths;
var browserSync = require( 'browser-sync' )
  .create(),
  reload = browserSync.reload;

var path = {
  html: './src/*.html',
  htmlFiles: './**/*.html',
  buildHTML: './src/build/*.html',
  buildCSS: './src/build/css/*.css',
  sass: './src/styles/**/*.scss',
  pug: './src/**/*.pug'
}

gulp.task( 'serve', function() {

  browserSync.init( {
    proxy: 'localhost:3000/build'
  } )

  gulp.watch( path.sass, [ 'sass' ] );

} );

gulp.task( 'inlineHTML', function() {
  gulp
    .src( path.html )
    .pipe( inlineCss( {
      preserveMediaQueries: true,
      applyStyleTags: true,
      applyLinkTags: true,
      removeStyleTags: false,
      removeLinkTags: false,
      applyTableAttributes: false,
      removeHtmlSelectors: false,
      applyWidthAttributes: false
    } ) )
    .pipe( gulp.dest( './src/build' ) )
    .pipe( browserSync.stream() );

} );

gulp.task( 'zip', function() {

  return gulp
    .src( './src/build/**' )
    .pipe( zip( 'build.zip' ) )
    .pipe( browserSync.stream() )
    .pipe( gulp.dest( 'production' ) );
} );

gulp.task( 'sass', function() {

  return gulp
    .src( path.sass )
    .pipe( sass( {
      includePaths: [ 'styles' ].concat( neat )
    } ) )
    .pipe( gulp.dest( './src/css' ) )
    .pipe( browserSync.stream() )
    .pipe( gulp.dest( './src/build/css' ) )
    .on( 'error', sass.logError );

  gulp
    .watch( path.html )
    .on( 'change', reload );
} );

function complete( file ) {

  var folder = path
    .basename( file.path )
    .replace( /\..*html/, '/' );

  return './build/templates' + folder;

}

gulp
  .task( 'pug', function() {

    gulp
      .src( path.pug )
      .pipe( pug() )
      .pipe( gulp.dest( './build/*.html' ) )
      .on( 'done', complete );

  } )

gulp.task( 'watch', function() {

  gulp.watch( path.html, [ 'inlineHTML' ] );
  gulp.watch( path.buildCSS, [ 'inlineHTML' ] );
  gulp.watch( path.buildCSS, [ 'zip' ] );
  gulp.watch( path.buildHTML, [ 'inlineHTML' ] );
  gulp.watch( path.buildHTML, [ 'zip' ] );
  gulp.watch( path.pug, [ 'pug' ] );

} );

gulp.task( 'default', [
  'serve', 'watch', 'zip', 'sass'
], function() {

  gulp.start( 'sass' );

} );
