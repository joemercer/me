module.exports = function(grunt) {
  'use strict';

  // displays the elapsed execution time of grunt tasks when done
  require('time-grunt')(grunt);
  // only load the plugins required for each task
  require('jit-grunt')(grunt, {
    bower: 'grunt-bower-task',
    simplemocha: 'grunt-simple-mocha'
  });

  // define some app specific options
  var ops = {

    // output filenames:
    // styles.css
    // main.js
    name: {
      css: 'styles',
      js: 'main'
    },

    // input filenames:
    // main.less imports the rest of the less files
    // main.js requires the rest of the javascript files
    src: {
      css: 'main',
      js: 'main'
    },

    // don't change options below here
    // _____________________________

    // options for built directory naming
    built: {
      css: 'built-styles',
      js: 'app.browserify',
      test: 'tests.browserify'
    }
  };

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ops: ops,

    // deletes files
    clean: {
      scripts: ['public/js'],
      styles: ['public/css', 'build/<%= ops.built.css %>.css'],
      templates: ['public/**/*.html'],
      img: ['public/img'],
      dev: {
        src: ['public', 'build']
      },
      prod: ['dist']
    },

    // copies files
    // TODO(joe) would be nice to create copy:dev from copy:scripts, copy:styles, etc to improve code resuse
    copy: {
      scripts: {
        files: [{
          src: 'build/<%= ops.built.js %>.js',
          dest: 'public/js/<%= ops.name.js %>.js'
        }]
      },
      styles: {
        files: [{
          src: 'build/<%= ops.built.css %>.css',
          dest: 'public/css/<%= ops.name.css %>.css'
        }]
      },
      fonts: {
        files: [{
          expand: true,
          cwd: 'client/fonts',
          src: '**/*',
          dest: 'public/fonts'
        },
        {
          expand: true,
          cwd: 'client/requires/fontawesome/fonts',
          src: '**/*',
          dest: 'public/fonts'
        }]
      },
      img: {
        files: [{
          expand: true,
          cwd: 'client/img',
          src: '**/*',
          dest: 'public/img'
        }]
      },
      dev: {
        files: [{
          src: 'build/<%= ops.built.js %>.js',
          dest: 'public/js/<%= ops.name.js %>.js'
        }, {
          src: 'build/<%= ops.built.css %>.css',
          dest: 'public/css/<%= ops.name.css %>.css'
        },
        {
          expand: true,
          cwd: 'client/fonts',
          src: '**/*',
          dest: 'public/fonts'
        },
        {
          expand: true,
          cwd: 'client/requires/fontawesome/fonts',
          src: '**/*',
          dest: 'public/fonts'
        },
        {
          expand: true,
          cwd: 'client/img',
          src: '**/*',
          dest: 'public/img'
        }]
      },
      prod: {
        files: [{
          expand: true,
          cwd: 'client/fonts',
          src: '**/*',
          dest: 'dist/fonts'
        },
        {
          expand: true,
          cwd: 'client/requires/fontawesome/fonts',
          src: '**/*',
          dest: 'dist/fonts'
        },
        {
          expand: true,
          cwd: 'client/img',
          src: '**/*',
          dest: 'dist/img'
        }]
      }
    },

    // front end package manager
    // like npm but for the front end
    bower: {
      install: {
        options: {
          targetDir: 'client/requires',
          layout: 'byComponent'
        }
      }
    },

    // front end dependency management
    // use node require() style to include modules
    // note: vendor.js includes all javascript from dependencies in bower.json
    // but we're ignoring the bootstrap js files
    browserify: {
      app: {
        files: {
          'build/<%= ops.built.js %>.js': [
            'client/src/lib.js',
            'client/src/main.js'
          ]
        },
        options: {
          // browserify-shim makes CommonJS-incompatible files browserifyable
          // hbsfy allows you to require handlebars templates in your javascript
          transform: ['browserify-shim', 'hbsfy'],
          watch: true
        }
      },
      test: {
        files: {
          'build/<%= ops.built.test %>.js': [
            'client/spec/**/*.test.js'
          ]
        },
        options: {
          transform: ['browserify-shim', 'hbsfy'],
          watch: true
        }
      }
    },

    // checks for good JavaScript coding practices
    jshint: {
      all: ['Gruntfile.js', 'client/src/**/*.js', 'client/spec/**/*.js'],
      dev: ['client/src/**/*.js'],
      test: ['client/spec/**/*.js'],
      server: ['Gruntfile.js', 'spec/**/*.js'],
      options: {
        debug: true,
        smarttabs: true
      }
    },

    // compiles less files to css files
    less: {
      transpile: {
        files: {
          'build/<%= ops.built.css %>.css': [
            'client/styles/less/main.less'
          ]
        }
      }
    },

    // precompiles handlebars templates to html on the server
    // TODO(joe) check this for helpers and partials
    'compile-handlebars': {
      dev: {
        template: 'client/templates/views/**/*.hbs',
        templateData: 'client/templates/views/**/*.json',
        output: 'public/**/*.html',
        //helpers: 'client/templates/helpers/**/*.js',
        //partials: 'client/templates/partials/**/*.hbs',
        globals: [
          'client/data/global.json'
        ]
      },
      prod: {
        template: 'client/templates/views/**/*.hbs',
        templateData: 'client/templates/views/**/*.json',
        output: 'dist/**/*.html',
        //helpers: 'client/templates/helpers/**/*.js',
        //partials: 'client/templates/partials/**/*.hbs',
        globals: [
          'client/data/global.json'
        ]
      }
    },

    // css minification
    // puts the file in /dist
    cssmin: {
      minify: {
        src: ['build/<%= ops.built.css %>.css'],
        dest: 'dist/css/<%= ops.name.css %>.css'
      }
    },

    // javascript minification
    // puts the file in /dist
    uglify: {
      compile: {
        options: {
          compress: true,
          verbose: true
        },
        files: [{
          src: 'build/<%= ops.built.js %>.js',
          dest: 'dist/js/<%= ops.name.js %>.js'
        }]
      }
    },

    // runs tasks when code changes
    // TODO(joe) test this and make sure it works
    // TODO(joe) test a watcher for images
    watch: {
      scripts: {
        files: ['client/src/**/*.js'],
        tasks: ['jshint:dev', 'clean:scripts', 'copy:scripts']
      },
      less: {
        files: ['client/styles/**/*.less'],
        tasks: ['clean:styles', 'less:transpile', 'copy:styles']
      },
      templates: {
        files: ['client/templates/views/**/*.hbs', 'client/templates/views/**/*.json', 'client/data/**/*.json'],
        tasks: ['clean:templates', 'compile-handlebars:dev']
      },
      karma: {
        files: ['build/<%= ops.built.test %>.js'],
        tasks: ['jshint:test', 'karma:watcher:run']
      }
    },

    // restarts server when server.js or watchedFolders files change
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          nodeArgs: ['--debug'],
          watch: ['server.js', 'Gruntfile.js'],
          ignore: [],
          env: {
            PORT: '3300'
          }
        }
      }
    },

    // run slow tasks concurrently to speed them up
    // can also run multiple blocking tasks (like nodemon and watch)
    concurrent: {
      dev: {
        tasks: ['nodemon:dev', 'watch:scripts', 'watch:less', 'watch:templates'],
        options: {
          logConcurrentOutput: true
        }
      },
      test: {
        tasks: ['watch:karma'],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    // runs arbitrary shell commands
    // supports background processes
    shell: {

    },

    // runs server tests
    simplemocha: {
      options: {
        globals: ['expect', 'sinon'],
        timeout: 3000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      },

      server: {
        src: ['spec/spechelper.js', 'spec/**/*.test.js']
      }
    },

    // for front-end tdd
    karma: {
      options: {
        configFile: 'karma.conf.js',
        files: [
          'build/<%= ops.built.test %>.js'
        ]
      },
      watcher: {
        background: true,
        singleRun: false
      },
      test: {
        singleRun: true
      }
    },

    // host site using github pages
    // puts dist directory in a gh-pages branch and pushes to origin remote
    'gh-pages': {
      options: {
        base: 'dist'
      },
      src: ['**']
    }

  });

  // cleans the build, then downloads front end packages
  grunt.registerTask('init:dev', ['clean', 'bower']);

  // builds dev
  // 1. deletes /public
  // 2. builds assets
  // 3. copies assets to /public
  // TODO(joe) consider not copying over images and other large files
  grunt.registerTask('build:dev', ['clean:dev', 'browserify:app', 'browserify:test', 'jshint:dev', 'less:transpile', 'compile-handlebars:dev', 'copy:dev']);
  // builds prod
  grunt.registerTask('build:prod', ['clean:prod', 'browserify:app', 'jshint:all', 'less:transpile', 'compile-handlebars:prod', 'cssmin', 'uglify', 'copy:prod']);

  // builds dev then starts the server
  grunt.registerTask('server', ['build:dev', 'concurrent:dev']);
  // tests the server code
  grunt.registerTask('test:server', ['jshint:server', 'simplemocha:server']);

  // tests the client code
  grunt.registerTask('test:client', ['jshint:test', 'browserify:test', 'karma:test']);
  // continuously tests the client code when files change
  // TODO(joe): get this working
  grunt.registerTask('tdd', ['karma:watcher:start', 'concurrent:test']);

  // runs all the tests once
  grunt.registerTask('test', ['test:server', 'test:client']);

  // release the site via hosting on github pages
  grunt.registerTask('release', ['build:prod', 'gh-pages']);
};
