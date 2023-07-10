 function generujhaslo(length) {
      var znaki = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
      var haslo = '';
      for (var i = 0; i < length; i++) {
        haslo += znaki.charAt(Math.floor(Math.random() * znaki.length));
      }
      return haslo;
    }
    
    function generujiwyswietlhaslo() {
      var dlugosc = 10;
      var haslo = generujhaslo(dlugosc);
      document.getElementById('polehasla').value = haslo;
    }