$(document).ready(function() {
	$('#value-form').submit(function(event) {
		event.preventDefault();

		var value = $('#value-input').val();

		if (value) {
			$.ajax({
				url: '/Panel_Administatora',
				type: 'POST',
				data: { adminpliki: value },
				success: function(response) {
					fetchFiles();
					hideErrorMessage();
				},
				error: function(error) {
					displayErrorMessage("Wystąpił błąd podczas wysyłania danych: " + error);
				}
			});
		}
	});
});

const apiUrl = "https://localhost:443/plikiAdmin";
//const apiUrl = "https://141.148.241.107:443/plikiAdmin";
//const apiUrl = "https://wspoldzielenieplikow.me:443/plikiAdmin";

const fileListDiv = document.getElementById("fileList");

async function fetchFiles() {
	try {
		const response = await fetch(apiUrl);
		const data = await response.json();
		displayFiles(data);
	} catch (error) {
		displayErrorMessage("Wystąpił błąd podczas pobierania danych z API lub nie znaleziono użytkownika.");
	}
}

function displayFiles(files) {
	const tbody = document.getElementById("fileList").getElementsByTagName('tbody')[0];
	tbody.innerHTML = "";

	if (files.length === 0) {
		const emptyRow = tbody.insertRow();
		const emptyCell = emptyRow.insertCell();
		emptyCell.colSpan = 1;
		emptyCell.textContent = "Brak plików do wyświetlenia.";
		return;
	}

	files.forEach((file) => {
		const row = tbody.insertRow();
		const nameCell = row.insertCell();

		nameCell.textContent = file.name;
	});
}

function displayErrorMessage(message) {
	const errorMessageDiv = document.getElementById("error-message");
	errorMessageDiv.textContent = message;
	errorMessageDiv.style.display = "block";
}

function hideErrorMessage() {
	const errorMessageDiv = document.getElementById("error-message");
	errorMessageDiv.style.display = "none";
}

fetchFiles();