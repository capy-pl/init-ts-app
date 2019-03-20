#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const workingDirectory = process.cwd();
const resourcePath = path.resolve(__dirname, '..', 'src');

const name = process.argv[2];

function readDir(path) {
  return fs.readdirSync(path, { withFileTypes: true });
}

function copyFile(src, target) {
  fs.copyFileSync(src, target);
}

function mkdir(path) {
  fs.mkdirSync(path);
}

function copyDir(src, target) {
  mkdir(target);
  const files = readDir(src);
  files.forEach(file => {
    if (file.isDirectory()) {
      copyDir(path.resolve(src, file.name), path.resolve(target, file.name));
    } else {
      copyFile(path.resolve(src, file.name), path.resolve(target, file.name))
    }
  });
}

function copyApp(name) {
  if (typeof name == undefined) {
    throw Error('The target directory name is not given.')
  }
  try {
    mkdir(path.resolve(workingDirectory, name));
  } catch(err) {
    console.error(err);
  }

  // copy client files.
  copyDir(path.resolve(resourcePath, 'client'), path.resolve(workingDirectory, name, 'client'));

  // copy server files.
  copyDir(path.resolve(resourcePath, 'server'), path.resolve(workingDirectory, name, 'server'));

  // copy template files.
  copyDir(path.resolve(resourcePath, 'templates'), path.resolve(workingDirectory, name, 'spec'));

  // copy test files.
  copyDir(path.resolve(resourcePath, 'spec'), path.resolve(workingDirectory, name, 'spec'));

  // copy config files.
  const configFiles = readDir(path.resolve(resourcePath, 'config'));
  configFiles.forEach(file => {
    copyFile(
      path.resolve(resourcePath, 'config', file.name),
      path.resolve(workingDirectory, name, file.name)
    );
  });

  const packageJson = require('../src/config/package.json');
  packageJson.name = name;
  const packageFile = fs.openSync(path.resolve(workingDirectory, name, 'package.json'), 'w');
  fs.writeFileSync(packageFile, JSON.stringify(packageJson, null, '\t'));
}

copyApp(name);
