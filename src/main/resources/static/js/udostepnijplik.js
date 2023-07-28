const url = "https://localhost:443/pliki";
//const url = "https://141.148.241.107:443/pliki";
const uploadUrl = "https://localhost:443/wyslij";
//const uploadUrl = "https://141.148.241.107:443/wyslij";
const deleteUrl = "https://localhost:443/pliki";
//const deleteUrl = "https://141.148.241.107:443/pliki";
const shareUrl = "https://localhost:443/udostepnijplik";

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

function pobierzPlik(url) {
	const elementA = document.createElement('a');
	elementA.href = url;
	elementA.download = url.split('/').pop();
	elementA.click();
	showMessage("Pobrano plik: " + elementA.download);
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

function pobierzZip(urls) {
	const zip = new JSZip();
	const count = urls.length;
	let downloaded = 0;

	function checkComplete() {
		if (downloaded === count) {
			zip.generateAsync({ type: 'blob' }).then(function(content) {
				const elementA = document.createElement('a');
				elementA.href = URL.createObjectURL(content);
				const currentDate = new Date().toLocaleDateString('pl-PL');
				const currentTime = getCurrentTime();
				const newFileName = "pobrane_" + currentTime + "_" + currentDate;
				elementA.download = newFileName + '.zip';
				elementA.click();
				showMessage("Pobrano plik ZIP: " + elementA.download);
			});
		}
	}

	urls.forEach(function(url) {
		fetch(url)
			.then(function(response) {
				return response.blob();
			})
			.then(function(blob) {
				const fileName = url.split('/').pop();
				zip.file(fileName, blob);

				downloaded++;
				checkComplete();
			});
	});
}

let shouldReplaceFile = null;

async function wyslijPliki(files) {
	const promises = [];
	const filesToReplace = [];

	for (let i = 0; i < files.length; i++) {
		const file = files[i];

		if (wyslanePliki.includes(file.name)) {
			if (shouldReplaceFile === null) {
				shouldReplaceFile = await showReplacementPrompt(file.name);
			}

			if (!shouldReplaceFile) {
				continue;
			}
			filesToReplace.push(file.name);
		}

		const formData = new FormData();
		formData.append('file', file);

		const promise = fetch(uploadUrl, {
			method: 'POST',
			body: formData
		});

		promises.push(promise);
	}

	try {
		await Promise.all(promises);
		showMessage('Pliki zostały wysłane! Odświeżymy stronę!');
		if (filesToReplace.length > 0) {
			showMessage(`Zastąpione pliki: ${filesToReplace.join(", ")}`);
		}
		setTimeout(function() {
			window.location.reload();
		}, 2000);
	} catch (error) {
		console.error(error);
		showMessage('Wystąpił błąd. Pliki nie zostały wysłane.');
	}
}
async function usunPlik(nazwaPliku) {
	showConfirmationModal(`Czy na pewno chcesz usunąć plik "${nazwaPliku}"?`, async (confirmed) => {
		if (confirmed) {
			try {
				const response = await fetch(`${deleteUrl}/${nazwaPliku}`, {
					method: 'DELETE'
				});

				if (!response.ok) {
					throw new Error(response.statusText);
				}

				showMessage('Plik został usunięty!');
				setTimeout(function() {
					window.location.reload();
				}, 2000);
			} catch (error) {
				console.error(error);
				showMessage('Wystąpił błąd. Plik nie został usunięty.');
			}
		}
	});
}

function showMessage(message) {
	const messageContainer = document.getElementById("message-container");
	messageContainer.innerHTML = `<div class="alert alert-info">${message}</div>`;
}

fetchData();

const przyciskPobierz = document.getElementById('pobierz');
przyciskPobierz.addEventListener('click', function() {
	const zaznaczonePliki = Array.from(document.querySelectorAll('input[name="plik"]:checked')).map(function(checkbox) {
		return checkbox.value;
	});

	if (zaznaczonePliki.length === 1) {
		pobierzPlik(zaznaczonePliki[0]);
	} else if (zaznaczonePliki.length > 1) {
		pobierzZip(zaznaczonePliki);
	} else {
		showMessage('Nie zaznaczono żadnego pliku!');
	}
});

const form = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');

form.addEventListener('submit', function(event) {
	event.preventDefault();
	const files = fileInput.files;

	if (files.length > 0) {
		wyslijPliki(files);
	} else {
		showMessage('Nie wybrano żadnych plików!');
	}
}

);

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
function showConfirmationModal(message, callback) {
	const confirmationMessageElement = document.getElementById("confirmationMessage");
	confirmationMessageElement.textContent = message;

	const confirmButton = document.getElementById("confirmDelete");
	confirmButton.addEventListener("click", () => {
		$('#confirmationModal').modal('hide');
		callback(true);
	});

	$('#confirmationModal').modal('show');
}
async function showReplacementPrompt(fileName) {
	return new Promise((resolve) => {
		const replacementMessageElement = document.getElementById("replacementMessage");
		replacementMessageElement.textContent = `Plik "${fileName}" jest już na dysku.`;


		const cancelButton = document.getElementById("cancelReplace");
		cancelButton.addEventListener("click", () => {
			$('#replacementModal').modal('hide');
			resolve(false);
		});

		$('#replacementModal').modal('show');
	});
}