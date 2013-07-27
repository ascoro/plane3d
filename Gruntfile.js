/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      js: {
        src: ['src/js/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
	  html:{
		  options: {
			banner: '<!-- This is the html -->\n',
			stripBanners: false
		  },
        src: ['src/html/<%= pkg.name %>.html'],
        dest: 'dist/<%= pkg.name %>.html'
      },
	  jquery:{
		  options: {
			banner: '',
			stripBanners: false
		  },
        src: ['lib/jquery-2.0.3.min.js'],
        dest: 'dist/jquery.js'
      },
	  glmatrix:{
		  options: {
			banner: '',
			stripBanners: false
		  },
        src: ['lib/glmatrix-0.9.5-min.js'],
        dest: 'dist/glmatrix-0.9.5-min.js'
      },
	  three:{
		  options: {
			banner: '',
			stripBanners: false
		  },
        src: ['lib/three.min.js'],
        dest: 'dist/three.js'
      }
    },
	copy: {
		main: {
			files: [
				{expand: true, cwd:'src/img/', src: ['*'], dest: 'dist/img', filter: 'isFile'}
			]
		}
	},
	uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.js.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task.
  grunt.registerTask('default', ['concat','uglify','copy']);

};
