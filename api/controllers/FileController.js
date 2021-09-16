const models = require('../models');
const authService = require('../services/auth.service');
var Promise = require('bluebird');
var GoogleCloudStorage = Promise.promisifyAll(require('@google-cloud/storage'));

const FileController = () => {

	var storage = GoogleCloudStorage({
		projectId: '68aef361df63627bab33bdab0250af4360c404cf',
		keyFilename: './keyfile.json'
	});
	var BUCKET_NAME = 'cashify-bucket'
	// https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/0.39.0/storage/bucket
	var myBucket = storage.bucket(BUCKET_NAME)
	// check if a file exists in bucket
	// https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/0.39.0/storage/file?method=exists
	var file = myBucket.file('myImage.png')
	file.existsAsync()
	.then(exists => {
			if (exists) {
			// file exists in bucket
			}
	})
	.catch(err => {
			return err
	})



	// upload file to bucket
	// https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/0.39.0/storage/bucket?method=upload


	// get public url for file
	var getPublicThumbnailUrlForItem = file_name => {
	return `https://storage.googleapis.com/${BUCKET_NAME}/${file_name}`
	}

	const uploadFile = (req, res)=> {
	if (!req.files)
	return res.status(400).send('No files were uploaded.');
	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let file = req.files.file;

	// Use the mv() method to place the file somewhere on your server
	const filename = `${_.random(1, 5000000)}_${file.name}`;
	const localFileLocation=`./uploads/${filename}`;
	file.mv(localFileLocation, function(err) {
    if (err)
      return res.status(500).send(err);
		myBucket.uploadAsync(localFileLocation, { public: true })
		.then(file => {
			return res.status(200).json({url: `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`});
			// file saved
		}).catch(err=>{
			return res.status(400).json({ "message": 'Something went wrong' });
		})
  });

	}

	return {
		uploadFile
	};
}

module.exports = FileController;
