const plikiurl = "https://localhost:443/pliki";
//const plikiurl = "https://twojepliki.tech:443/pliki";

const uploadUrl = "https://localhost:443/wyslij";
//const uploadUrl = "https://twojepliki.tech:443/wyslij";

const deleteUrl = "https://localhost:443/pliki";
//const deleteUrl = "https://twojepliki.tech:443/pliki";

let wyslanePliki = [];

async function fetchData() {
	const response = await fetch(plikiurl);
	const data = await response.json();
	const container = document.getElementById("data");

	data.forEach((customer) => {
		if (customer.name === "Twoja_notatka.txt") {
			return;
		}

		const card = document.createElement("div");
		card.className = "col-md-4 ";
		card.innerHTML = `
			<div class="card-body mb-4">
				${!customer.url.endsWith('/') && (customer.url.includes('.') || customer.url.endsWith('/')) ? `
					<p class="card-text">${customer.name}</p>
					<div class="d-flex justify-content-between align-items-center">
						<div class="btn-group">
							<label style="text-align:center; vertical-align:middle; font-size: 16px;" for="${customer.url}">&nbsp;</label>
							<input style="text-align:center; vertical-align:middle" type="checkbox" class="wiekszy" id="${customer.url}" name="plik" value="${customer.url}">
						</div>
						<div class="btn-group">
							<button type="button" class="btn btn-sm btn-outline-secondary btn-pobierz" onclick="pobierzPlik('${customer.url}')">Pobierz</button>
						</div>
						<button type="button" class="btn btn-sm btn-outline-secondary btn-usun" onclick="usunPlik('${customer.name}')">Usuń</button>
						<button id="podglad" class="btn-sm btn-outline-secondary btn-pobierz" onclick="togglePodglad()">Podgląd</button>
					</div>` : `
					<div class="container text-center">
					<p style="text-align: center; font-size: 18px; margin: 0;">Katalog: <b>${customer.name}</b></p>
					<div class="btn-group"></div>  
					</div>
					`}
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

//Podglad pliku

let isPodgladOpen = false;

function togglePodglad() {
    const lightboxContainer = document.getElementById('lightbox-container');
    const podgladButton = document.getElementById('podglad');
    const closeButton = document.getElementById('close-btn');

    if (isPodgladOpen) {
        lightboxContainer.style.display = 'none';
        podgladButton.textContent = 'Podgląd';
   	
   const checkedCheckbox = document.querySelector('input[name="plik"]:checked');
        if (checkedCheckbox) {
            checkedCheckbox.checked = false;
        }
    } else {
        const zaznaczonePliki = Array.from(document.querySelectorAll('input[name="plik"]:checked')).map(function(checkbox) {
            return checkbox.value;
        });

        if (zaznaczonePliki.length === 1) {
            const podgladUrl = zaznaczonePliki[0];

            const extension = podgladUrl.slice(-3).toLowerCase();

            axios.get(podgladUrl, { responseType: 'blob' })
                .then(response => {
                    const blob = new Blob([response.data], { type: response.headers['content-type'] });

                    const fileUrl = URL.createObjectURL(blob);

                    lightboxContainer.innerHTML = '';

                    let fileContent;

                    if (extension === 'mp3' || extension === 'wav' || extension === 'flac' || extension === 'ogg' || extension === 'aac' || extension === 'wma' || extension === 'ape') {
                        fileContent = document.createElement('audio');
                        fileContent.src = fileUrl;
                        fileContent.controls = true;
                    } else if (extension === 'txt' || extension === 'cmd' || extension === 'bat') {
                        fileContent = document.createElement('iframe');
                        fileContent.src = fileUrl;
                        fileContent.style.width = '800px';
                        fileContent.style.height = '600px';
                    } else if (['jpg', 'png', 'jpeg', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'psd', 'ico', 'jp2'].includes(extension)) {
                        fileContent = document.createElement('img');
                        fileContent.src = fileUrl;
                        fileContent.style.maxWidth = '800px';
                        fileContent.style.maxHeight = '600px';
                    } else if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp', 'rm'].includes(extension)) {
                        fileContent = document.createElement('video');
                        fileContent.src = fileUrl;
                        fileContent.controls = true;
                        fileContent.style.maxWidth = '800px';
                        fileContent.style.maxHeight = '600px';
                    } else if (extension === 'pdf' || extension === 'doc' || extension === 'ppt' || extension === 'xls'  || extension === 'xml' || extension === 'odt' || extension === 'zip' || extension === 'rar'|| extension === 'exe') {
                        showMessage('Nieobsługiwany plik.');
                    } else {
                        fileContent = document.createElement('iframe');
                        fileContent.src = fileUrl;
                        fileContent.style.width = '800px';
                        fileContent.style.height = '600px';
                    }

                    if (fileContent) {
                        lightboxContainer.appendChild(fileContent);
                        lightboxContainer.style.display = 'block';
                        podgladButton.textContent = 'Zamknij podgląd';
                    }
                })
                .catch(error => {
                    console.error(error);
                    showMessage('Wystąpił błąd podczas pobierania pliku.');
                });
        } else {
            showMessage('Proszę zaznaczyć jeden plik do podglądu.');
        }
    }

    isPodgladOpen = !isPodgladOpen;
}

//Podkatalog

 function FetchFiles() {}

    function hideErrorMessage() {}

    function displayErrorMessage(message) {}

    $(document).ready(function () {
        $('#value-form').submit(function (event) {
            event.preventDefault();

            var value = $('#value-input').val();

            if (value) {
                $.ajax({
                    url: '/katalog',
                    type: 'POST',
                    data: { pod_folder: value },
                    success: function (response) {
                        FetchFiles();
                        hideErrorMessage();
                    },
                    error: function (error) {
                        displayErrorMessage("Wystąpił błąd podczas wysyłania danych: " + error);
                    },
                    complete: function () {
                        location.reload();
                    }
                });
            }
        });
 
        $('#back-button').click(function () {
            $('#value-input').val('');
            $.ajax({
                url: '/katalog',
                type: 'POST',
                data: { pod_folder: null },
                success: function (response) {
                    FetchFiles();
                    hideErrorMessage();
                },
                error: function (error) {
                    displayErrorMessage("Wystąpił błąd podczas wysyłania danych: " + error);
                },
                complete: function () {
                    location.reload();
                }
            });
        });
    });
  
//Wysuwany formularz do podkatalogu  
    
    const expandButton = document.getElementById("expand-button");
	const hiddenDiv = document.getElementById("hidden-div");
	expandButton.addEventListener("click", () => {
		            if (hiddenDiv.style.display === "none") {
		                hiddenDiv.style.display = "block";
		            } else {
		                hiddenDiv.style.display = "none";
		            }
		        });