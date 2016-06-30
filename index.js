var restify = require('restify'),
	port = process.env.PORT || 8080;

var server = restify.createServer({
  name: 'bostonfilm',
  version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/', function (req, res, next) {
  res.end('hi matt');
  return next();
});

server.listen(port, function () {
  console.log('%s listening at %s', server.name, server.url);
});