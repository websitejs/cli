'use strict';

var git = require('nodegit'),
    fs = require('fs-extra'),
    path = require('path'),
    shell = require('shelljs');

/**
 * Handles Git repositories
 * @module websitejs/repos
 */
var Repos = module.exports = {

    /**
     * @property {string} cwd Current working directory
     */
    cwd: process.cwd(),

    /**
     * Clones a repository and installs npm dependencies.
     * @param {object} [options] Cli parameters.
     * @param {string} options.dir Local destination path.
     */
    cloneRepository: function(options) {

        // default repo data
        var url = 'https://github.com/websitejs/websitejs.git',
            dir = (typeof options.dir === 'undefined') ? path.join(Repos.cwd, '/') : path.join(options.dir, '/'),
            cloneOptions = {
                checkoutBranch: 'master'
            },
            cloneRepository = git.Clone(url, dir, cloneOptions);

        // do the cloning
        cloneRepository.catch(Repos.onCloneError).then(function(repository) {

            // remove .git dir
            if (!repository.isBare()) {
                fs.remove(path.join(dir + '.git'), function(err) {
                    if (err) {
                        console.log(err);
                        process.exit(1);
                    }

                    // install default dependencies
                    if (shell.exec('npm install').code !== 0) {
                        shell.echo('Error installing npm packages!');
                        shell.exit(1);
                    } else {
                        console.log();
                        console.log('======================================');
                        console.log('Project created.');
                        shell.exit();
                        process.exit();
                    }
                });
            }

        });

    },

    onCloneError: function(error) {
        console.log(error);
        process.exit(1);
    }

};
