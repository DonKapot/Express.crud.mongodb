const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://alex:42cy3TJF4E3kXFe@ds235053.mlab.com:35053/test-public'; 

function connect(url) {
  return MongoClient.connect(url,{useNewUrlParser: true}).then(client => {
    console.log("Connected successfully to server");
  	return client.db()
  });
}

module.exports = async () => await Promise.resolve( connect(url) );
