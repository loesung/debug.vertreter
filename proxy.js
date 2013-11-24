var http = require('http');
var buffer = require('buffer');
var url = require('url');

var socketPath = process.argv[2];
console.log(socketPath);

http.createServer(function(request, response){
    console.log('Request: ', request.url);
    var proxyRequest = http.request({
        socketPath: socketPath,
        path: request.url,
        method: request.method,
        headers: request.headers,
    });

    request.on('data', function(chunk){
        proxyRequest.write(chunk);
    });
    request.on('end', function(chunk){
        proxyRequest.end(chunk);
    });
    request.on('error', function(){
        response.writeHead(503);
        response.end('ERROR FROM PROXY: REQUEST ERROR.');
    });

    proxyRequest.on('response', function(proxyResponse){
        response.writeHeader(
            proxyResponse.statusCode,
            proxyResponse.headers
        );

        proxyResponse.on('data', function(chunk){
            response.write(chunk);
        });
        proxyResponse.on('end', function(chunk){
            response.end(chunk);
        });
    });
    proxyRequest.on('error', function(){
        response.writeHead(503);
        response.end('ERROR FROM PROXY: DESTINATION NOT IN REACH.');
    });

}).listen(2333);
