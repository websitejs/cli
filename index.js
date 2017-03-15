#!/usr/bin/env node

'use strict';

var name = 'WebsiteJS',
    version = require('./package').version,
    program = require('commander'),

    repos = require('./src/repos.js')/*,
    files = require('./src/files')*/;


program
    .version(version)
    .description(name + ' Command Line Interface v' + version)
    //.usage('[command] [options]')
    .on('--help', function() {
        console.log('  Examples:');
        console.log('');
        console.log('    $ ' + name + ' init --help');
        console.log('    $ ' + name + ' create -h');
        console.log('');
    });

program
    .command('init')
    .description('Initializes a ' + name + ' project in current folder.')
    //.option("-f, --force", "Force file creation even if not in a project root")
    .option("-d, --dir <dir>", 'Set directory to create ' + name + ' project into.')
    .action(repos.cloneRepository)
    // .action(function() {
    //     console.log('DONE!');
    //     process.exit();
    // })
    .on('--help', function () {
        console.log('  Example:');
        console.log();
        console.log('    $ init');
        console.log('    $ init -d path/to/dir');
        console.log();
    });

program
    .command('create <type> <name>')
    .description('create an '+ name + ' element or component')
    .option("-f, --force", "Force file creation even if not in a project root")
    .option("--html", "Skips html file creation")
    .option("--scss", "Skips sass file creation")
    .option("--js", "Skips javascript file creation")
    .option("--gspec", "Skips test file creation")
    //.action(files.createFiles)
    .action(function() {
        console.log('CREATED %s!', program.type);
        process.exit();
    })
    .on('--help', function () {
        console.log('  Examples:');
        console.log();
        console.log('    $ create component [options] <component name>');
        console.log('    $ create element [options] <element name>');
        console.log();
    });

program.parse(process.argv);

if (!program.args.length) {
    program.help();
};
