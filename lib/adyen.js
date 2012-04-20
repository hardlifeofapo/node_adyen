var crypto = require('crypto');
var error = require('errs');
var zlib = require('zlib');


var settings = {
    'sandbox': true,
    'merchantAccount': "",
    'prefix': "Presive.com order ",
    'secret': "",
    'testSecret': "",
    'name': "Adyen",
    'postUrl': 'https://live.adyen.com/hpp/pay.shtml',
    'testPostUrl': 'https://test.adyen.com/hpp/pay.shtml',
    'sessionValidity': '2',
    'shipBeforeDate': '5',
    'skinCode': '',
    'testSkinCode': ''
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
        now.setHours( now.getHours() +settings.sessionValidity );
        settings.sessionValidity = now.toISOString();
        
        var hmacData = settings.paymentAmount+settings.currencyCode+settings.shipBeforeDate+settings.merchantReference+settings.testSkinCode+settings.merchantAccount+settings.sessionValidity+settings.shopperEmail;
        console.info(hmacData);
        var hmac = crypto.createHmac('sha1', 'secret')
        var merchantSignature = hmac.update(hmacData);
        console.info("merchantSignature.toString('base64')");
        var mySignature = merchantSignature.digest(encoding='base64');
        console.info (mySignature.length);

/*
        if(mySignature.length % 4  == 0){
          mySignature += "=";
        }
*/        
         console.info (mySignature);
        
        settings.signature = mySignature;
        callback( settings );
      }
    });

};