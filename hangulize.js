
var Detecter = function(word, _callback) {

  var self = this;
  var http=require('http'),
      qs=require('querystring');


  var url = '/ajax/services/language/detect?v=1.0&q=' + qs.escape(word);

  var client = http.createClient(443, "ajax.googleapis.com",true);
  var request = client.request('GET', url, { 'host': 'ajax.googleapis.com' });
  request.end();

  request.on('response', function(resp) {
    resp.setEncoding('utf8');
    if ( resp.statusCode == 200 ) { 
      resp.on('data', function(chunk) {
        var respObj = JSON.parse(chunk);
        _callback(true, respObj);
      });
    } else {
      _callback(false, resp);
    }
  });
  
};

var Hangulize = function(lang, word, _callback) {

  var self = this;
  var http=require('http'),
      qs=require('querystring');
  
  var client=http.createClient(80, 'www.hangulize.org');
  var url = '?lang='+lang+'&word='+qs.escape(word);
  var request = client.request('GET',url, { 
    'host': 'www.hangulize.org', 
    'Accept': 'application/json', 
    'X-Requested-With': 'XMLHttpRequest' 
  });

  request.end();
  request.on('response' ,function(resp) {
    if (resp.statusCode == 200 ) {
      resp.setEncoding('utf8');
      resp.on('data', function(chunk) { 
        var respObj = JSON.parse(chunk);
        _callback(true, { request: { 'word': word, 'lang': lang }, response: respObj});
      });
    } else {
      _callback(false, { request: {'word' : word, 'lang': lang}, response:  resp} );
    }
  });
};

if ( exports ) {
  exports.Hangulize = Hangulize;
  exports.Detecter = Detecter;

  exports.hangulize = function(word,_callback,lang) {

    if ( lang != undefined ) {
      return new Hangulize(lang,word,_callback);
    } else {
      new Detecter( word, function(result,data) {
        if ( result == true ) { 
          return new Hangulize(data.responseData.language, word, _callback);
        } else {
          _callback(false, data);
        }
      });
    }
  };
}

