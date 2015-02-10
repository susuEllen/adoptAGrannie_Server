var http = require('http')
var querystring = require('querystring');
var Buffer = require('buffer').Buffer;

var mail_parser = require('cloud/mail-parser.js');

// Initialization class
var Mailjet = function(apiKey, secretKey) {
  this._apiKey = apiKey;
  this._secretKey = secretKey;
  this._authentificate = new Buffer(apiKey + ':' + secretKey).toString('base64');
};

Mailjet.prototype = {};

// Email sending code
Mailjet.prototype.sendContent = function(from, to, subject, type, content) {

  if (arguments.length < 4)
    throw new Error('Missing required argument');

  if (typeof(to) == 'string')
      to = [to];
  var recipients = mail_parser.parse_recipient_type(to);
  // Build the HTTP POST body text

  if (type == 'html') {
      var body = querystring.stringify({
        from: from,
        // Handle many destinations
        to: recipients['to'].join(', '),
        cc: recipients['cc'].join(', '),
        bcc: recipients['bcc'].join(', '),
        subject: subject,
        html: content
      });
  }
  else if (type == 'text') {
      var body = querystring.stringify({
        from: from,
        // Handle many destinations
        to: recipients['to'].join(', '),
        cc: recipients['cc'].join(', '),
        bcc: recipients['bcc'].join(', '),
        subject: subject,
        text: content
      });
  }
  else {
      throw new Error('Wrong email type');
  }

  Parse.Cloud.httpRequest({
  method: 'POST',
  url: 'https://api.mailjet.com/v3/send/',
  headers: {
    'Authorization': 'Basic ' + this._authentificate,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(body)
  },
  body: body,
  success: function(response) {console.log('got a response from mailjet'); console.log(response);},
	error: function(response) {console.log('got an error from mailjet'); console.log(response);}
  }); 
};

module.exports = Mailjet;