const express = require('express');
const fs = require('fs');
const extract = require('extract-zip')
const formidable = require('formidable');
var multer = require('multer');
var upload = multer();
const path = require('path');
const uploadDir = path.join(__dirname, '/uploads/');
const extractDir = path.join(__dirname, '/app/');


if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(extractDir)) {
  fs.mkdirSync(extractDir);
}

const server = express();
// server.use(upload.array());
const extractZip = (file, destination, deleteSource) => {
  extract(file, { dir: destination }, (err) => {
    if (!err) {
      if (deleteSource) fs.unlinkSync(file);
      nestedExtract(destination, extractZip);
    } else {
      console.error(err);
    }
  });
};

const nestedExtract = (dir, zipExtractor) => {
  fs.readdirSync(dir).forEach((file) => {
    if (fs.statSync(path.join(dir, file)).isFile()) {
      if (path.extname(file) === '.zip') {
        // deleteSource = true to avoid infinite loops caused by extracting same file
        zipExtractor(path.join(dir, file), dir, true);
      }
    } else {
      nestedExtract(path.join(dir, file), zipExtractor);
    }
  });
};

const uploadMedia = (req, res, next) => {
  const form = new formidable.IncomingForm();
  // file size limit 100MB. change according to your needs
 console.log(req.body)
  form.keepExtensions = true;
  form.multiples = true;
  form.uploadDir = uploadDir;

  // collect all form files and fileds and pass to its callback
  form.parse(req, (err, fields, files) => {
    // when form parsing fails throw error
      console.log(files,'========================','files is','===================');

    if (err) return res.status(500).json({ error: err });

    if (Object.keys(files).length === 0) return res.status(400).json({ message: "no files uploaded" });

    // Iterate all uploaded files and get their path, extension, final extraction path
    const filesInfo = Object.keys(files).map((key) => {
      const file = files[key];
      const filePath = file.path;
      const fileExt = path.extname(file.name);
      const fileName = path.basename(file.name, fileExt);

      return { filePath, fileExt, fileName };
    });

    // Check whether uploaded files are zip files
    const validFiles = filesInfo.every(({ fileExt }) => fileExt === '.zip');

    // if uploaded files are not zip files, return error
    if (!validFiles) return res.status(400).json({ message: "unsupported file type" });

    res.status(200).json({ uploaded: true });

    // iterate through each file path and extract them
    filesInfo.forEach(({ filePath, fileName }) => {
      // create directory with timestamp to prevent overwrite same directory names
      const destDir = `${path.join(extractDir, fileName)}_${new Date().getTime()}`;

      // pass deleteSource = true if source file not needed after extraction
      extractZip(filePath, destDir, false);
    });
  });

  // runs when new file detected in upload stream
  form.on('fileBegin', function (name, file) {
    // get the file base name `index.css.zip` => `index.html`
    const fileName = path.basename(file.name, path.extname(file.name));
    const fileExt = path.extname(file.name);
    // create files with timestamp to prevent overwrite same file names
    file.path = path.join(uploadDir, `${fileName}_${new Date().getTime()}${fileExt}`);
  });
}

server.post('/upload', uploadMedia);

server.post('/generate',  function(req, res, next) {
    console.log(req.files);
    console.log(req.body);
    res.setHeader('Content-Type', 'application/zip');
    generator.pipeZipToRes(req, res);
});
    
server.listen(3000, (err) => {
    console.log('app running on port 3000')
  if (err) {
    console.log('the server has stopped redeploy again')
    throw err;}
});