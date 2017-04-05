'use strict';

var fs = require('fs-extra'),
    path = require('path'),
    username = require('username');

/**
 * Handles file creation, modification and deletion
 * @module websitejs-cli/files
 */
var Files = module.exports = {

    /**
     * @property {string} cwd Current working directory
     */
    cwd: process.cwd(),

    /**
     * creates and writes component or element files
     * @param {string} type Type to create (component/element)
     * @param {string} name Name
     * @param {object} [options] Options defined in cli program call
     * @param {boolean} options.html True if defined in cli
     * @param {boolean} options.js True if defined in cli
     * @param {boolean} options.scss True if defined in cli
     * @param {boolean} options.force True if defined in cli
     */
    createFiles: function(type, name, options) {

        // TODO: check for project root

        var typeTplPath = '.project/tpl/elements',
            typeDestPath = 'src/elements';

        if (type === 'component') {
            typeTplPath = '.project/tpl/components';
            typeDestPath = 'src/components';
        }

        var tplLocation = path.join(Files.cwd, typeTplPath),
            destPath = path.join(Files.cwd, typeDestPath),
            fileTypes = ['scss', 'html', 'js', 'gspec'],
            errors = 0;

        fileTypes.forEach(function(fType, i) {

            var filename = name;
            if (fType === 'scss') {
                filename = '_' + name;
            }

            var tplFile = path.resolve(tplLocation, fType + '.tpl'),
                destFile = path.resolve(destPath, name, filename + '.' + fType);

            fs.readFile(tplFile, 'utf-8', function(err, data) {

                if (err) {
                    console.error('\nError: cannot read template: "' + tplFile + '".\n\n');
                    process.exit(1);
                }

                // replace template values
                var d = new Date(),
                    months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

                data = data.replace(/{{name}}/gi, name);
                data = data.replace(/{{ucfirst_name}}/gi, name.charAt(0).toUpperCase() + name.slice(1));
                data = data.replace(/{{author}}/gi, username.sync());
                data = data.replace(/{{date}}/gi, months[d.getMonth()] + ' ' + d.getFullYear());

                console.log(data);

                // write file
                fs.outputFile(destFile, data, function(err) {

                    if (err) {
                        console.log(err);
                        errors++;
                    } else {
                        // set files to full access
                        fs.chmodSync(destFile, '0777');
                        console.log('Created ' + destFile + '.');
                    }

                    if (errors > 0) {
                        console.log('Done, but with errors (%d).', errors);
                        process.exit(1);
                    } else {
                        console.log('Done, succesfully created %s "%s".', type, name);
                        process.exit();
                    }

                });
            });


        });

    }


};
