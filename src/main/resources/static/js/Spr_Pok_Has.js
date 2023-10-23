function pokazHaslo(inputID) {
    var hasloInput = document.getElementById(inputID);
    var ikona = hasloInput.nextElementSibling;

    if (hasloInput.type === "password") {
        hasloInput.type = "text";
        ikona.classList.remove("fa-eye");
        ikona.classList.add("fa-eye-slash");
    } else {
        hasloInput.type = "password";
        ikona.classList.remove("fa-eye-slash");
        ikona.classList.add("fa-eye");
    }
}

function sprawdzHaslo() {
    var haslo = document.getElementById("haslo").value;
    var hasloPowtorzone = document.getElementById("hasloPowtorzone").value;

    var hasloPowiadomienieBlad = document.getElementById("hasloPowiadomienieBlad");
    var hasloPowtorzonePowiadomienieBlad = document.getElementById("hasloPowtorzonePowiadomienieBlad");

    if (haslo !== hasloPowtorzone) {
        hasloPowiadomienieBlad.textContent = "Wprowadzone hasła nie są identyczne. Proszę wprowadzić poprawne hasło.";
        hasloPowtorzonePowiadomienieBlad.textContent = "Wprowadzone hasła nie są identyczne. Proszę wprowadzić poprawne hasło.";
        return false;
    } else {
        hasloPowiadomienieBlad.textContent = "";
        hasloPowtorzonePowiadomienieBlad.textContent = "";
        return true;
    }
}


document.querySelector('.form-signup').addEventListener('submit', function(event) {
    if (!sprawdzHaslo()) {
        event.preventDefault();
    }
});