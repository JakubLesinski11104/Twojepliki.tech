const url = "https://localhost:443/pliki";
//const url = "https://141.148.241.107:443/pliki";
const uploadUrl = "https://localhost:443/wyslij";
//const uploadUrl = "https://141.148.241.107:443/wyslij";
const deleteUrl = "https://localhost:443/pliki";
//const deleteUrl = "https://141.148.241.107:443/pliki";
let wyslanePliki = [];

async function fetchData() {
	const response = await fetch(url);
	const data = await response.json();
	const container = document.getElementById("data");

	data.forEach((customer) => {
		const card = document.createElement("div");
		card.className = "col-md-4";
		card.innerHTML = `
          <div class="card mb-4 box-shadow">
            <div class="card-body">
              <p class="card-text">${customer.name}</p>
              <div class="d-flex justify-content-between align-items-center">
                <div class="btn-group">
                  <button type="button" class="btn btn-sm btn-outline-secondary btn-pobierz" onclick="pobierzPlik('${customer.url}')">Pobierz</button>
                  <label for="${customer.url}">Zaznacz:</label>
                  <input type="checkbox" id="${customer.url}" name="plik" value="${customer.url}">
                </div>
                <button type="button" class="btn btn-sm btn-outline-secondary btn-usun" onclick="usunPlik('${customer.name}')">Usuń</button>
              </div>
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

async function wyslijPliki(files) {
	const promises = [];

	for (let i = 0; i < files.length; i++) {
		const file = files[i];

		if (wyslanePliki.includes(file.name)) {
			const shouldReplace = confirm(`Plik "${file.name}" jest już na dysku. Czy chcesz go zastąpić?`);
			if (!shouldReplace) {
				continue;
			}
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
		alert('Pliki zostały wysłane!');
		window.location.reload();
	} catch (error) {
		console.error(error);
		alert('Wystąpił błąd. Pliki nie zostały wysłane.');
	}
}

async function usunPlik(nazwaPliku) {
	const shouldDelete = confirm(`Czy na pewno chcesz usunąć plik "${nazwaPliku}"?`);
	if (shouldDelete) {
		try {
			const response = await fetch(`${deleteUrl}/${nazwaPliku}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error(response.statusText);
			}

			alert('Plik został usunięty!');
			window.location.reload();
		} catch (error) {
			console.error(error);
			alert('Wystąpił błąd. Plik nie został usunięty.');
		}
	}
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
		alert('Nie zaznaczono żadnego pliku!');
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
		alert('Nie wybrano żadnych plików!');
	}
});