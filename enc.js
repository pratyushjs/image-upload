/*
  Node.Js Folder and files encryptor

  Required Modules :
    1. tar v.3.1.5 https://www.npmjs.com/package/tar
    2. fs and crypto modules

  Thanks for watching !! i will be making new video on this soon.
  Follow me :
  YouTube : https://www.youtube.com/amankharbanda14
  LinkedIn : https://www.linkedin.com/in/aman-kharbanda-04288b141/
*/

var fs = require('fs');
var tar = require('tar');
var crypto = require('crypto');
var key = 'secret_key!';
const algorithm = 'aes-256-ctr';
const ENCRYPTION_KEY = 'Put_Your_Password_Here'; // or generate sample key Buffer.from('FoCKvdLslUuB4y3EZlKate7XGottHski1LmyqJHvUhs=', 'base64');
const IV_LENGTH = 16;
let iv = crypto.randomBytes(IV_LENGTH);
let encryptor = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
// var encryptor = crypto.createCipheriv('aes-256-ctr', 'key','16')
var decryptor = crypto.createDecipheriv('aes-256-ctr', 'key')

function encrypt(folder) {
    var tar_name = 'tar_file.tgz'; // the tar file name you want to give
    tar.c({
        'file': tar_name
    }, folder).then(function() {
        var enc_writer = fs.createWriteStream(tar_name + '.enc');
        fs.createReadStream(tar_name).pipe(encryptor).pipe(enc_writer);
        fs.unlink(tar_name);
        console.log('done');
    });
}

function decrypt(filename) {

    var extractor = tar.x({
        trim: 1,
        'C': 'dir' // the dir you want to extract
    })
    fs.createReadStream(filename).pipe(decryptor).pipe(extractor);
}

// encrypt(['img.jpg.zip']);
decrypt('tar_file.tgz.enc');
