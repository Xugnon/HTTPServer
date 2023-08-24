function bodyParser(request, callback) {
  let body = '';

  //Enquanto for chegando um evento com o nome 'data', ou seja, com uma partezinha do body, a função vai concatenando dentro da "let body"
  request.on('data', (chunk) => {
    body += chunk;
  });

  // Quando chega a ultima mensagem, é feita a chamada do evento 'end', onde é feito o parse do body, assim transformando a string em um objeto JSON, injeta o body dentro do request.body e chama a função de callback
  request.on('end', () => {
    body = JSON.parse(body);
    request.body = body;
    callback();
  });
}

module.exports = bodyParser;
