'use strict';

var fs = require('fs-extra'),
    path = require('path'),
    fullname = require('fullname'),
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
            processed = 0,
            errors = 0;

        fileTypes.forEach(function(fType, i) {

            name = name.toLowerCase();

            var regex = /^[0-9A-Za-z\-\_\/]+$/,
                illegalName = regex.test(name);

            // sanity filename check
            if (!illegalName) {
                console.log('\nError: Only 0-9, a-z, A-Z, - and _ are allowed in the name of the %s.\n\n', type);
                process.exit(1);
            }

            // create path when slashes in filename 
            var resolvedPath = name.split('/');
            if (resolvedPath.length > 0) {
                // we need to create a path
                name = resolvedPath.splice(-1, 1)[0];
                destPath = destPath + '/' + resolvedPath.join('/');

                fs.mkdirs(destPath, '0777', function() {
                    console.log('Created dir: ', destPath);
                }); 
            }

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

                // get users 'full name'
                fullname().then(function(uName) {

                    // or fallback to 'username' and try to format it
                    if (!uName) {
                        var userNameArray = username.sync().split('.');
                        userNameArray[0].charAt(0).toUpperCase();
                        userNameArray[(userNameArray.length - 1)].charAt(0).toUpperCase();
                        uName = userNameArray.join(' ');
                    }

                    // capitalize name
                    var jsName = name.charAt(0).toUpperCase() + name.slice(1);

                    if (fType === 'js') {
                        // format name as js class
                        // TODO: this should be more elegant
                        var jsNameArray = name.split('-');
                        for (var j = 0; j < jsNameArray.length; j++) {
                            if (jsNameArray[j] !== '') {
                                jsNameArray[j] = jsNameArray[j].charAt(0).toUpperCase() + jsNameArray[j].slice(1);
                            }
                        }
                        jsNameArray = jsNameArray.join('').split('_');
                        for (var k = 0; k < jsNameArray.length; k++) {
                            if (jsNameArray[k] !== '') {
                                jsNameArray[k] = jsNameArray[k].charAt(0).toUpperCase() + jsNameArray[k].slice(1);
                            }
                        }
                        jsName = jsNameArray.join('');
                    }

                    // replace tpl values
                    data = data.replace(/{{name}}/gi, name);
                    data = data.replace(/{{ucfirst_name}}/gi, jsName);
                    data = data.replace(/{{author}}/gi, uName);
                    data = data.replace(/{{date}}/gi, months[d.getMonth()] + ' ' + d.getFullYear());

                    // write file
                    fs.outputFile(destFile, data, function(err) {

                        processed++;

                        if (err) {
                            console.log(err);
                            errors++;
                        } else {
                            // set files to full access
                            fs.chmodSync(destFile, '0777');
                            console.log('Created ' + destFile + '.');
                        }

                        if (processed === fileTypes.length) {
                            if (errors > 0) {
                                console.log('Done, but with errors (%d).', errors);
                                process.exit(1);
                            } else {
                                console.log('Done, succesfully created %s "%s".', type, name);
                                process.exit();
                            }
                        }
                    });
                });
            });
        });
    }
};
