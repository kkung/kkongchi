var net = require('net');
var sys = require('sys');

var ircServer = { 
  host: 'irc.ozinger.org',
  port: 6667,
  channel: '#langdev'
};

var botConfig = {
  nick: '꽁치',
  user: 'kkongchi',
  verbose: false
};

var sock = net.createConnection(ircServer.port, ircServer.host);
sock.setEncoding('utf8');

packetHandlers = [
  [ /^\:[a-zA-Z0-9_\.]+\s001/, function(socket) { writeln(socket,"JOIN "+ircServer.channel);} ],
  [ /^PING\s\:(.+)/, function(socket,line,m) { writeln(socket, "PONG :" + m[1]);} ],
  [ /^\:(.+)\sPRIVMSG\s(.+)\s\:(.+)/, function(socket,line,m) {

    var from = m[1]; 
    var ch = m[2];
    var text = m[3];

    /*if ( /낚지/.test(text) == true ) { 
      writeln(socket,"PRIVMSG " + ch + " :국산 산낚지는 안전하지 말입니다");
    }*/

    var hlize = /^\;hlize(\([a-z]{2}\))?\s(.*)/.exec(text);
    if ( hlize != null ) {
      var ln = hlize[1];
      if ( ln != undefined ) {
        ln = ln.replace('(','').replace(')','');
      } 
      hangulize(sock, ch, hlize[2],ln);
    }
  } ]
];

sock.on('connect', function() {
  log("connected");
  writeln(sock,"USER " + botConfig.user +" 0 * :"+botConfig.user);
  writeln(sock,"NICK " + botConfig.nick);

});

sock.on('data', function(data) {

  if ( botConfig.verbose == true ) { log(data); }

  var lines = data.split("\r\n");
  lines.forEach(function(line) {
    
    packetHandlers.forEach(function(obj) {

      var exp = obj[0];
      var fun = obj[1];
      var m = exp.exec(line);

      if ( m != null ) {
        fun(sock, line, m);
      }
      
    });

  });

});



function log(text) {
  sys.log(text); 
};

function writeln(socket,data) {
  socket.write(data+"\r\n");
};


function hangulize(sock,ch,data,lang) {

  require('./hangulize').hangulize( data, function(result, respData) {
    
    var lang = respData.request.lang;
    var word = respData.request.word;

    require('sys').log(JSON.stringify(respData));
    
    if ( result == true && respData.response.success == true ) {
      writeln(sock, "PRIVMSG " + ch + " :"+word+"("+lang+") => " + respData.response.result);
    } else {
     if ( respData.response.reason != undefined ) {
       writeln(sock, "PRIVMSG " + ch + " :"+word+"("+lang+") => " + respData.response.reason);
     } else {
       writeln(sock, "PRIVMSG " + ch + " :"+word+"("+lang+") => 오류"); 
     }
    }
  }, lang);

};
