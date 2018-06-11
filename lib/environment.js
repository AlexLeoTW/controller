const child_process = require('child_process');
const fs = require('fs');

function test (userConfig) {

  var pass = true;

  // if tar installed
  try {
    var tar = child_process.execSync('which tar').toString().trim();
  } catch (e) {
    pass = false;
    tar = 'pbzip2 is not installed, install with `sudo apt install tar` command';
  }

  // if pbzip2 installed
  try {
    var pbzip2 = child_process.execSync('which pbzip2').toString().trim();
  } catch (e) {
    pass = false;
    pbzip2 = 'pbzip2 is not installed, install with `sudo apt install pbzip2` command';
  }

  // if java installed
  try {
    var java = child_process.execSync('which java').toString().trim();
  } catch (e) {
    pass = false;
    java = 'java is not installed \n    `http://www.webupd8.org/2012/09/install-oracle-java-8-in-ubuntu-via-ppa.html`';
  }

  // if  directory named `server` doesn't exist
  var server = (fs.existsSync('server') && fs.statSync('server').isDirectory());
  if (! server) { pass = false }

  // if  directory named `bungee` doesn't exist
  var bungee = (fs.existsSync('bungee') && fs.statSync('bungee').isDirectory());
  if (! bungee) {
    bungee = 'auto-create bungee';
    fs.mkdirSync('bungee');
  }

  return {
    pass, tar, pbzip2, java, server, bungee
  };
}

exports.test = test;
