$(document).ready(function() {
	$('#admin_form').submit(function(event) {
		event.preventDefault();

		var value = $('#admin_input').val();

		if (value) {
			$.ajax({
				url: '/Panel_Administatora',
				type: 'POST',
				data: { adminpliki: value },
				success: function(response) {
					listaPlikow();
					ukryjPowiadomienieBlad();
				},
				error: function(error) {
					pokazPowiadomienieBlad("Wystąpił błąd podczas wysyłania danych: " + error);
				}
			});
		}
	});
});

const plikiAdminaUrl = "https://localhost:443/plikiAdmin";
//const plikiAdminaUrl = "https://twojepliki.tech:443/plikiAdmin";

const tabelaPlikow = document.getElementById("tabelkaListaPlikow");

async function listaPlikow() {
	try {
		const response = await fetch(plikiAdminaUrl);
		const data = await response.json();
		wyswietlPliki(data);
	} catch (error) {
		pokazPowiadomienieBlad("Wystąpił błąd podczas pobierania danych z API lub nie znaleziono użytkownika.");
	}
}

function wyswietlPliki(pliki) {
	const tbody = document.getElementById("tabelkaListaPlikow").getElementsByTagName('tbody')[0];
	tbody.innerHTML = "";

	if (pliki.length === 0) {
		const emptyRow = tbody.insertRow();
		const emptyCell = emptyRow.insertCell();
		emptyCell.colSpan = 1;
		emptyCell.textContent = "Brak plików do wyświetlenia.";
		return;
	}

	pliki.forEach((plik) => {
		const row = tbody.insertRow();
		const nameCell = row.insertCell();

		nameCell.textContent = plik.name;
	});
}

function pokazPowiadomienieBlad(powiadomienie) {
	const DivPowiadomienieBlad = document.getElementById("powiadomienie_bledu");
	DivPowiadomienieBlad.textContent = powiadomienie;
	DivPowiadomienieBlad.style.display = "block";
}

function ukryjPowiadomienieBlad() {
	const DivPowiadomienieBlad = document.getElementById("powiadomienie_bledu");
	DivPowiadomienieBlad.style.display = "none";
}

listaPlikow();