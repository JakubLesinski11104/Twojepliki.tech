const url = "https://localhost:443/pliki";
//const url = `https://141.148.241.107:443/pliki`;

const uploadUrl = "https://localhost:443/wyslij";
//const uploadUrl = `https://141.148.241.107:443/pliki`;

async function fetchData() {
	const response = await fetch(url);
	const data = await response.json();
	const tableBody = document.querySelector("table#data tbody");

	data.forEach((customer) => {
		const row = document.createElement("tr");
		row.innerHTML = `
          <td>${customer.name}</td>
          <td><a href="${customer.url}">Pobierz</a></td>
          <td><input type="checkbox" name="plik" value="${customer.url}"></td>
        `;
		tableBody.appendChild(row);
	});
}

function pobierzPlik(url) {
	const elementA = document.createElement('a');
	elementA.href = url;
	elementA.download = url.split('/').pop();
	elementA.click();
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
				elementA.download = 'pobrane_pliki.zip';
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

async function wyslijPlik(file) {
	const formData = new FormData();
	formData.append('file', file);

	try {
		const response = await fetch(uploadUrl, {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			throw new Error(response.statusText);
		}

		alert('Plik został wysłany!');
		window.location.reload();
	} catch (error) {
		console.error(error);
		alert('Wystąpił błąd. Plik nie został wysłany.');
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
	const file = fileInput.files[0];

	if (file) {
		wyslijPlik(file);
	} else {
		alert('Nie wybrano żadnego pliku!');
	}
});