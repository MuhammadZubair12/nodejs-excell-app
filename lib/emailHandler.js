// include our dependencies
const jadeCompiler = require('./jadeCompiler'),
      logger = require('../config/logger'),
      mailer = require('../config/mailer');
const FROM_ADDRESS = 'info@martondoor.com';

const sendMail = (mailingInfo)=>{
  // get compiled template first
  jadeCompiler.compile(mailingInfo.templatePath, mailingInfo, function(err, html){
    if(err){
      throw new Error('Problem compiling template(double check relative path): '+ mailingInfo.templatePath);
    }
    // now we have the html populated with our data so lets send an email!
    mailer.sendMail(FROM_ADDRESS, mailingInfo.to, mailingInfo.subject, html, function(err, success){
      if(err){
        console.error('Problem sending email to: ' + mailingInfo.to);
      } else {
        logger.info(`Email Sent to ${mailingInfo.to}!😄`);
      }

      // Yay! Email was sent, now either do some more stuff or send a response back to the client
    });
  });
}

module.exports = {sendMail};
