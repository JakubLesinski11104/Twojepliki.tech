function togglePasswordVisibility(inputId) {
	var passwordInput = document.getElementById(inputId);
	var icon = passwordInput.nextElementSibling;

	if (passwordInput.type === "password") {
		passwordInput.type = "text";
		icon.classList.remove("fa-eye");
		icon.classList.add("fa-eye-slash");
	} else {
		passwordInput.type = "password";
		icon.classList.remove("fa-eye-slash");
		icon.classList.add("fa-eye");
	}
}


function togglePasswordVisibility(inputId) {
	var passwordInput = document.getElementById(inputId);
	var icon = passwordInput.nextElementSibling;

	if (passwordInput.type === "password") {
		passwordInput.type = "text";
		icon.classList.remove("fa-eye");
		icon.classList.add("fa-eye-slash");
	} else {
		passwordInput.type = "password";
		icon.classList.remove("fa-eye-slash");
		icon.classList.add("fa-eye");
	}
}


function sprawdzHaslo() {
	var haslo = document.getElementById("haslo").value;
	var hasloPowtorzone = document.getElementById("hasloPowtorzone").value;

	var hasloErrorMsg = document.getElementById("hasloErrorMsg");
	var hasloPowtorzoneErrorMsg = document.getElementById("hasloPowtorzoneErrorMsg");

	if (haslo !== hasloPowtorzone) {
		hasloErrorMsg.textContent = "Wprowadzone hasła nie są identyczne. Proszę wprowadzić poprawne hasło.";
		hasloPowtorzoneErrorMsg.textContent = "Wprowadzone hasła nie są identyczne. Proszę wprowadzić poprawne hasło.";
		event.preventDefault();
	} else {
		hasloErrorMsg.textContent = "";
		hasloPowtorzoneErrorMsg.textContent = "";
	}
}