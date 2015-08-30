/*
 * grunt-filerev-usemin
 * https://github.com/Lanfei/grunt-filerev-usemin
 *
 * Copyright (c) 2015 Lanfei
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

var STYLE_FILE_RE = /(css|sass|less)$/;
var ASSETS_RE = /(['"(])([^'":# \(\)\?]+\.[^'":# \(\)\?]+)(['")?#])/g;

module.exports = function (grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('filerev_usemin', 'Replace references to grunt-rev files.', function () {
    if (!grunt.filerev || !grunt.filerev.summary) {
      throw new Error('Grunt task `filerev` is required.');
    }

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      root: '.'
    });
    var summary = grunt.filerev.summary;

    // Iterate over all specified file groups.
    this.files.forEach(function (file) {
      // Process the root dir.
      var root = options.root;
      var orig = file.orig;
      var cwd = '';
      if (orig.expand && orig.cwd) {
        cwd = orig.cwd;
        root = path.join(cwd, root);
      }
      // Replace paths.
      file.src.forEach(function (filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        }

        grunt.log.writeln('✔ '.green + filepath);

        var isStyleFile = STYLE_FILE_RE.test(filepath);
        var fileDir = path.dirname(filepath);
        var source = grunt.file.read(filepath);
        source = source.replace(ASSETS_RE, function ($, $1, $2, $3) {
          var referenceDir;
          var relativePath;

          if (isStyleFile) {
            referenceDir = fileDir;
          } else {
            referenceDir = root;
          }
          relativePath = path.join(referenceDir, $2);

          var result = summary[relativePath];
          if (result) {
            result = path.relative(referenceDir, result);
            grunt.log.writeln('  ' + $2 + ' ==> '.grey + result);

            return $1 + result + $3;
          } else {
            return $;
          }
        });

        grunt.file.write(filepath, source);
      });
    });
  });

};
