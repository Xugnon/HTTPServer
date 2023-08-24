const http = require('http');
const { URL } = require('url');

const bodyParser = require('./helpers/bodyParser');
const routes = require('./routes');

const server = http.createServer((request, response) => {
  // Analise da url para consguir extrair os QUERY PARAMS
  const parsedUrl = new URL(`http://localhost:3000${request.url}`);
  console.log(
    `Request method: ${request.method} | Endpoint: ${parsedUrl.pathname}`
  );

  let { pathname } = parsedUrl;
  let id = null;

  //Split do endpoint nas barras (/), para identificar quando o usuário está mandando um ID
  const splitEndpoint = pathname.split('/').filter(Boolean);

  if (splitEndpoint.length > 1) {
    pathname = `/${splitEndpoint[0]}/:id`;
    id = splitEndpoint[1];
  }

  /* Pesquisa dentro do array de rotas (routes.js), alguma rota que faça o match tanto do endpoint quanto do metodo 
  com o que está chegando na URL */
  const route = routes.find(
    (routeObj) =>
      routeObj.endpoint === pathname && routeObj.method === request.method
  );

  if (route) {
    //Injeção do QUERY PARAMS dentro do request.query e do ID dentro do request.params
    request.query = Object.fromEntries(parsedUrl.searchParams);
    request.params = { id };

    //Metodo send para facilitar a resposta pro cliente, assim não precisar ficar repetindo código dentro dos controllers
    response.send = (statusCode, body) => {
      response.writeHead(statusCode, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(body));
    };

    //Verificação do metodo HTTP que está chegando, é do tipo POST, PUT OU PATCH. Se tiver, o bodyParser pega a string do body e trasnforma em um objeto JSON
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      // O fato de ser um stream, faz com que a informação vá chegando aos poucos. Feito então, dentr d bodyParser, uma função de callback
      bodyParser(request, () => route.handler(request, response));
    } else {
      route.handler(request, response);
    }
  } else {
    // Se não existir a requisição recebida, é feita uma tratativa de erro, com o metodo e a rota que a aplicação não conhece
    response.writeHead(404, { 'Content-Type': 'text/html' });
    response.end(`Cannot ${request.method} ${parsedUrl.pathname}`);
  }
});

server.listen(3000, () =>
  console.log('Server started at http://localhost:3000')
);
