$(document).ready(function() {
	$('#value-form').submit(function(event) {
		event.preventDefault();

		var value = $('#value-input').val();

		if (value) {
			$.ajax({
				url: '/udostepnij',
				type: 'POST',
				data: { udostepnij: value },
				success: function(response) {
					fetchFiles();
				},
				error: function(error) {
					console.error("Wystąpił błąd podczas wysyłania danych:", error);
				}
			});
		}
	});
});

// Pozostała część skryptu
const tableBody = document.querySelector("table#data tbody");
const fetchUrl = "https://localhost:443/pliki";
//const fetchUrl = "https://141.148.241.107:443/pliki";
const uploadUrl = "https://localhost:443/udostepnijplik";
//const uploadUrl = "https://141.148.241.107:443/udostepnijplik";
const messageContainer = document.getElementById("message-container");

async function fetchData() {
	try {
		const response = await fetch(fetchUrl);

		if (!response.ok) {
			throw new Error(response.statusText);
		}

		const data = await response.json();

		data.forEach((file) => {
			const row = document.createElement("tr");
			row.innerHTML = `
              <td>${file.name}</td>
              <td><button onclick="udostepnijPlik('${file.url}', '${file.name}')">Udostępnij</button></td>
            `;
			tableBody.appendChild(row);
		});
	} catch (error) {
		console.error(error);
		showMessage("Wystąpił błąd. Nie można pobrać danych.");
	}
}

function udostepnijPlik(url, fileName) {
	fetch(url)
		.then(response => response.blob())
		.then(blob => {
			const currentDate = new Date().toISOString().slice(0, 10);
			const currentTime = getCurrentTime();
			const newFileName = "UDOSTEPNIONE dnia " + currentDate + " o godzinie " + currentTime + " " + fileName;
			const newFormData = new FormData();
			newFormData.append('file', blob, newFileName);

			fetch(uploadUrl, {
				method: 'POST',
				body: newFormData
			})
				.then(response => {
					if (response.ok) {
						showMessage("Plik został udostępniony!");
					} else {
						throw new Error(response.statusText);
					}
				})
				.catch(error => {
					console.error(error);
					showMessage("Wystąpił błąd. Plik nie został udostępniony.");
				});
		})
		.catch(error => {
			console.error(error);
			showMessage("Wystąpił błąd. Plik nie został pobrany.");
		});
}

function getCurrentTime() {
	const date = new Date();
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();

	const time = `${padZero(hours)}.${padZero(minutes)}.${padZero(seconds)}`;
	return time;
}

function padZero(number) {
	return number.toString().padStart(2, "0");
}

function showMessage(message) {
	messageContainer.innerHTML = `<div class="alert alert-info"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>${message}</div>`;
}

fetchData();