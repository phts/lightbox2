module.exports = function(grunt) {

  function parsePackageJsonFile() {
    var fs = require("fs");
    return JSON.parse(fs.readFileSync("./package.json", "utf8"));
  }

  function getVersion() {
    return parsePackageJsonFile().version;
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    bump: {
      options: {
        files: ['package.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false
      }
    },
    jshint: {
      files: ['js/lightbox-phts.js']
    },
    uglify: {
      options: {
        preserveComments: 'some',
        sourceMap: true
      },
      dist: {
        files: {
          'js/<%= pkg.name %>.min.js': ['js/lightbox-phts.js']
        }
      }
    },
    exec: {
      zip: {
        cmd: function() {
          var pkg = parsePackageJsonFile();
          var zipfile = pkg.name + "-"+pkg.version+".zip";
          var files = ["css", "js", "img", "README.markdown"];
          return [
                   'mkdir -p releases',
                   'zip -r releases/' + zipfile + ' ' + files.join(' '),
                 ].join('&&');
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('default', ['jshint', 'uglify']);

  var DESC = "Update version in lightbox-phts.js file's comment";
  grunt.registerTask('update-comment', DESC, function(from) {
    from = "v"+from;
    var to = "v"+getVersion();
    var file = __dirname + "/js/lightbox-phts.js";

    var fs = require('fs');
    var data = fs.readFileSync(file, 'utf8');

    var result = data.replace(from, to);
    if (data == result) {
      return grunt.warn("Nothing was replaced")
    }

    fs.writeFileSync(file, result, 'utf8');

    grunt.log.ok("Version updated in the comment: "+from+" to "+to);
  });

  DESC = "Make zip archive with all required files";
  grunt.registerTask('zip', DESC, function() {
    grunt.task.run('jshint');
    grunt.task.run('uglify');
    grunt.task.run('exec:zip');
  });

  DESC = 'Increment version and makes a release file';
  grunt.registerTask('release', DESC, function(type) {
    type = type || 'minor';

    var from = getVersion();
    grunt.task.run('bump:'+type);
    grunt.task.run('update-comment:'+from);
    grunt.task.run('zip');
  });

};
