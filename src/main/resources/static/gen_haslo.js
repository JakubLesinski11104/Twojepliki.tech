 function generatePassword(length) {
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
      var password = '';
      for (var i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return password;
    }
    
    function generateAndDisplayPassword() {
      var length = 10; // Długość hasła
      var password = generatePassword(length);
      document.getElementById('passwordField').value = password;
    }