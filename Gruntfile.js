module.exports = function(grunt) {

    var cleanCssOptions = {

    };

    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', 'src/*.js'],
            options: {
                globals: {
                    angular: true
                }
            }
        },
        concat:{
            'build':{
                src  : [
                    'src/*.js',
                ],
                dest : 'build/datalist.js',
                filter: 'isFile'
            }
        },
        uglify:{
            build:{
                options: {
                    compress: {
                        drop_console: true
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'build/',
                    src: ['*.js', '!*.min.js'],
                    dest: 'build',
                    ext: '.min.js'
                }]
            }
        },
        ngtemplates:{
            'ambersive.datalist':{
                module:     'ambersive.datalist',
                src:        'src/views/**/*.html',
                dest:       'src/templates.js',
                options: {
                    htmlmin: {
                        collapseBooleanAttributes:      true,
                        collapseWhitespace:             true,
                        removeAttributeQuotes:          true,
                        removeComments:                 true, // Only if you don't use comment directives!
                        removeEmptyAttributes:          true,
                        removeRedundantAttributes:      true,
                        removeScriptTypeAttributes:     true,
                        removeStyleLinkTypeAttributes:  true
                    }
                }
            }
        },
        less:{
            'ambersive.datalist': {
                options: {
                    compress: false,
                    plugins: [

                    ]
                },
                files: {
                    'build/datalist.css': [
                        'src/less/datalist.less'
                    ]
                }
            },
            'ambersive.datalist.minify': {
                options: {
                    compress: true,
                    plugins: [
                    ]
                },
                files: {
                    'build/datalist.min.css': [
                        'src/less/datalist.less'
                    ]
                }
            }
        },
        watch: {
            files: ['src/*.js','src/views/**/*.html','src/less/*.less'],
            tasks: ['jshint','build']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('build', ['ngtemplates','concat','uglify','less']);

};