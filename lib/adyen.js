var crypto = require('crypto');
var error = require('errs');
var zlib = require('zlib');


var settings = {
    'sandbox': true,
    'merchantAccount': "PresiveCOM",
    'prefix': "Presive.com order ",
    'secret': "secret",
    'testSecret': "secret",
    'name': "Adyen",
    'postUrl': 'https://live.adyen.com/hpp/pay.shtml',
    'testPostUrl': 'https://test.adyen.com/hpp/pay.shtml',
    'sessionValidity': 4, // hours in the future
    'shipBeforeDate': '5',
    'skinCode': 'HECGm2i0',
    'testSkinCode': 'HECGm2i0'
};

var Adyen = exports.Adyen = function(data) {
  this.checkOptionsOk(data);
  this.setOptions(data);
};

Adyen.prototype.setOptions = function(options) {
  for (option in options){  
    settings[option] = options[option];
  }
};

Adyen.prototype.checkOptionsOk = function(options) {
    if (!options) {
        throw new Error('no options');
    }
    if (!options.merchantReference) {
        throw new Error('merchantReference');
    }
    if (!options.paymentAmount) {
        throw new Error('paymentAmount');
    }
    if (!options.currencyCode) {
        throw new Error('currencyCode');
    }
    if (!options.orderDataRaw) {
        throw new Error('orderDataRaw');
    }
    if (!options.shopperEmail) {
        throw new Error('shopperEmail');
    }
};


Adyen.prototype.getMerchantSignature = function(callback) {
    var plain_text = '';
    var callback = callback;
        
    var input = settings.orderDataRaw;
    zlib.gzip(input, function(err, buffer) {
      if (!err) {
        settings.signature = buffer.toString('base64');
                
        var now = new Date();
        var delta = 4*60*60*1000;
        now.setTime( now.getTime() + delta);
        settings.sessionValidity = now.toISOString();
        
        var hmacData = settings.paymentAmount+settings.currencyCode+settings.shipBeforeDate+settings.merchantReference+settings.testSkinCode+settings.merchantAccount+settings.sessionValidity+settings.shopperEmail;
        var hmac = crypto.createHmac('sha1', 'secret')
        var merchantSignature = hmac.update(hmacData);
        var mySignature = merchantSignature.digest(encoding='base64');
        
        settings.signature = mySignature;
        callback( settings );
      }
    });

};