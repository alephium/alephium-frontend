function Storage() {
  this.key = 'wallet';

  this.remove = function(name) {
    window.localStorage.removeItem(this.key + '-' + name);
  }

  this.load = function(name) {
    const str = window.localStorage.getItem(this.key + '-' + name);
    if (typeof str !== 'undefined') {
      return JSON.parse(str);
    }
    return null;
  }

  this.save = function(name, json) {
    const str = JSON.stringify(json);
    window.localStorage.setItem(this.key + '-' + name, str);
  };

  this.list = function() {
    const prefixLen = this.key.length + 1;
    var xs = [];
    for (var i = 0, len = localStorage.length; i < len; ++i) {
      const key = localStorage.key(i);
      if (key.startsWith(this.key)) {
        xs.push(key.substring(prefixLen));
      }
    }
    return xs;
  }
}

exports.Storage = new Storage();
