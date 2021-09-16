const models = require('../models');
const authService = require('../services/auth.service');
const QRCode = require('qrcode');
const ImageDataURI = require('image-data-uri');
const fs = require('fs');
const archiver = require('archiver');
const rn = require('random-number');
var uuid = require("uuid");

const QRCodeController = () => {

    const create = (req, res) => {
      const segs = [
        { data: 'ABCDEFG', mode: 'alphanumeric' },
        { data: '0123456', mode: 'numeric' }
      ]
      const options = {
        min:  1
      , max:  10000000
      , integer: true
      }
      req.checkBody('quantity', 'quantity is required').notEmpty();
      const filestoDel = [];
      const outputPath = `./uploads/${new Date().valueOf()}.zip`;
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip');
      output.on('close', () => {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        filestoDel.forEach(path => {
          fs.unlink(path);
        })
        res.download(outputPath);
      });
      archive.pipe(output);
      const body = req.body;
      const quantity = parseInt(body.quantity, 10);
      var urls = [];
      var qrcodes = [];
      for(let i=0; i<quantity ; i++) {
        const text =  uuid.v4();
        QRCode.toDataURL(text , function (err, url) {
          qrcodes.push({code: text});
          const fileName = `${new Date().valueOf()}${rn(options)}.png`;
          const localFileLocation = `./uploads/${fileName}`;
          ImageDataURI.outputFile(url, localFileLocation).then(()=>{
            filestoDel.push(localFileLocation);
            archive.append(fs.createReadStream(localFileLocation), { name: fileName });
            if(archive._entriesCount === quantity) {
              models.QRcode.bulkCreate(qrcodes).then(() => {
                archive.finalize();
              });

            }
          });
        })
      }
    };

    return {
      create,
    };
}

module.exports = QRCodeController;
