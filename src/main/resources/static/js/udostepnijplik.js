const url = "https://localhost:443/pliki";
//const url = "https://twojepliki.tech:443/pliki";

const shareUrl = "https://localhost:443/udostepnijplik";
//const shareUrl = "https://twojepliki.tech:443/udostepnijplik";

let wyslanePliki = [];

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

async function fetchData() {
	const response = await fetch(url);
	const data = await response.json();
	const container = document.getElementById("data");

	data.forEach((customer) => {
		const card = document.createElement("div");
		card.className = "col-md-4 ";
		card.innerHTML = `
                        <div class="card-body mb-4">
                         <p class="card-text">${customer.name}</p>
              <div class="d-flex justify-content-between align-items-center">
                  <button class="btn btn-primary btn-block" onclick="udostepnijPlik('${customer.url}', '${customer.name}')">Udostępnij</button>
              </div>
            </div>
       `;
		container.appendChild(card);
		wyslanePliki.push(customer.name);
	});
}

fetchData();

function udostepnijPlik(url, fileName) {
	fetch(url)
		.then(response => response.blob())
		.then(blob => {
			const currentDate = new Date().toISOString().slice(0, 10);
			const currentTime = getCurrentTime();
			const newFileName = "UDOSTEPNIONE dnia " + currentDate + " o godzinie " + currentTime + " " + fileName;
			const newFormData = new FormData();
			newFormData.append('file', blob, newFileName);

			fetch(shareUrl, {
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
	const messageContainer = document.getElementById("message-container");
	messageContainer.innerHTML = `<div class="alert alert-info">${message}</div>`;
}