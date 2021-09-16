const nodemailer = require('nodemailer');
const mailer = {
    host:'smtp.ethereal.email',
    port:587,
    secure:false,
    auth: {
        user:'vsk6a6vmmo3tb75e@ethereal.email',
        pass:'ntJ4EhKxRFtsPa71bR',
    }
}

let transporter = nodemailer.createTransport(mailer);

// Public method that actually sends the email
exports.sendMail = function(fromAddress, toAddress, subject, content, next){
    var success = true;
    var mailOptions = {
      // NOTE: the fromAdress can actually be different than the email address you're sending it from. Which is good and bad I suppose. Use it wisely.
      from: 'waleed' + ' <' + fromAddress + '>',
      to: toAddress,
      replyTo: fromAddress,
      subject: subject,
      html: content
    };
    
    // send the email!
    transporter.sendMail(mailOptions, function(error, response){
      if(error){
        console.log('[ERROR] Message NOT sent: ', error);
        success = false;
      }
      else {
        console.log('[INFO] Message Sent: ' + response.toAddress);
      }
      next(error, success);
    });
  };
