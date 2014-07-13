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
    // main.js
    name: {
      js: 'main'
    },

    // input filenames:
    // main.js requires the rest of the javascript files
    src: {
      js: 'main'
    },

    // don't change options below here
    // _____________________________

    // options for built directory naming
    built: {
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
      styles: ['public/css'],
      templates: ['public/**/*.html'],
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
      assets: {
        files: [{
          expand: true,
          cwd: 'client/assets',
          src: '**/*',
          dest: 'public'
        },
        {
          expand: true,
          cwd: 'client/requires/fontawesome/fonts',
          src: '**/*',
          dest: 'public/fonts'
        }]
      },
      dev: {
        files: [{
          src: 'build/<%= ops.built.js %>.js',
          dest: 'public/js/<%= ops.name.js %>.js'
        },
        {
          expand: true,
          cwd: 'client/assets',
          src: '**/*',
          dest: 'public'
        },
        {
          expand: true,
          cwd: 'client/requires/fontawesome/fonts',
          src: '**/*',
          dest: 'public/fonts'
        }]
      },
      prod: {
        files: [{
          expand: true,
          cwd: 'client/assets',
          src: '**/*',
          dest: 'dist'
        },
        {
          expand: true,
          cwd: 'client/requires/fontawesome/fonts',
          src: '**/*',
          dest: 'dist/fonts'
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
      dev: {
        files: [{
          expand: true,
          cwd: 'client/pages',
          src: ['**/*.less'],
          dest: 'public',
          ext: '.css'
        }]
      },
      prod: {
        options: {
          cleancss: true
        },
        files: [{
          expand: true,
          cwd: 'client/pages',
          src: ['**/*.less'],
          dest: 'dist',
          ext: '.css'
        }]
      }
    },

    // precompiles handlebars templates to html on the server
    // TODO(joe) check this for helpers and partials
    'compile-handlebars': {
      dev: {
        template: 'client/pages/**/*.hbs',
        templateData: 'client/pages/**/*.json',
        output: 'public/**/*.html',
        //helpers: 'client/templates/helpers/**/*.js',
        //partials: 'client/templates/partials/**/*.hbs',
        globals: [
          'client/assets/data/global.json'
        ]
      },
      prod: {
        template: 'client/pages/**/*.hbs',
        templateData: 'client/pages/**/*.json',
        output: 'dist/**/*.html',
        //helpers: 'client/templates/helpers/**/*.js',
        //partials: 'client/templates/partials/**/*.hbs',
        globals: [
          'client/assets/data/global.json'
        ]
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
        files: ['client/pages/**/*.less', 'client/styles/**/*.less'],
        tasks: ['clean:styles', 'less:dev']
      },
      templates: {
        files: ['client/pages/**/*.hbs', 'client/pages/**/*.json', 'client/data/**/*.json', 'client/templates/**/*.hbs'],
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
      },
      // 'gh-pages': {
      //   options: {
      //     base: 'dist'
      //   },
      //   src: ['**/*']
      // },
      'gh-user-page': {
        options: {
          base: 'dist',
          branch: 'master',
          repo: 'https://github.com/joemercer/joemercer.github.io.git'
        },
        src: ['**/*']
      }
    }

  });

  // cleans the build, then downloads front end packages
  grunt.registerTask('init:dev', ['clean', 'bower']);

  // builds dev
  // 1. deletes /public
  // 2. builds assets
  // 3. copies assets to /public
  // TODO(joe) consider not copying over images and other large files
  grunt.registerTask('build:dev', ['clean:dev', 'browserify:app', 'browserify:test', 'jshint:dev', 'less:dev', 'compile-handlebars:dev', 'copy:dev']);
  // builds prod
  grunt.registerTask('build:prod', ['clean:prod', 'browserify:app', 'jshint:all', 'less:prod', 'compile-handlebars:prod', 'uglify', 'copy:prod']);

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
