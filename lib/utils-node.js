const fs = require("fs");

function Storage() {
  this.walletsUrl = new URL('file:///' + process.env.HOME + '/.alf-wallets');

  if (!fs.existsSync(this.walletsUrl)){
    fs.mkdirSync(this.walletsUrl);
  }

  this.remove = function(name) {
    fs.unlinkSync(new URL(this.walletsUrl.toString() + '/' + name + '.dat'));
  }

  this.load = function(name) {
    const buffer = fs.readFileSync(new URL(this.walletsUrl.toString() + '/' + name + '.dat'));
    if (typeof buffer !== 'undefined') {
      return JSON.parse(buffer.toString());
    }
    return null;
  }

  this.save = function(name, json) {
    const str = JSON.stringify(json);
    const data = new Uint8Array(Buffer.from(str));
    fs.writeFileSync(new URL(this.walletsUrl.toString() + '/' + name + '.dat'), data);
  };

  this.list = function() {
    var xs = [];
    try {
      const files = fs.readdirSync(this.walletsUrl)
      files.forEach(function (file) {
        if (file.endsWith('.dat')) {
          xs.push(file.substring(0, file.length - 4));
        }
      })
    } catch(e) {
      return [];
    }

    return xs;
  }
}

exports.Storage = new Storage();
