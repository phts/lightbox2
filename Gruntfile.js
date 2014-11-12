module.exports = function(grunt) {

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
          var pkg = require('./package.json');
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

  DESC = "Make zip archive with all required files";
  grunt.registerTask('zip', DESC, function() {
    grunt.task.run('jshint');
    grunt.task.run('uglify');
    grunt.task.run('exec:zip');
  });

  DESC = 'Increment version and makes a release file';
  grunt.registerTask('release', DESC, function(type) {
    type = type || 'minor';
    grunt.task.run('bump:'+type);
    grunt.task.run('zip');
  });

};
