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

const wyslijAdminURL = "https://localhost:443/wyslijAdmin";
//const wyslijAdminURL = "https://twojepliki.tech:443/wyslijAdmin";

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
		emptyCell.colSpan = 4;
		emptyCell.textContent = "Brak plików do wyświetlenia.";
		return;
	}

	pliki.forEach((plik) => {
		const row = tbody.insertRow();
		const nameCell = row.insertCell();

		if (!plik.name.includes('.')) {
			const iconImg = document.createElement('img');
			iconImg.src = 'assets/katalog.png';
			iconImg.alt = 'Katalog';
			iconImg.style.width = '25px';
			iconImg.style.height = '25px';
			iconImg.style.marginLeft = '10px';
			nameCell.appendChild(iconImg);
		}

		const nameSpan = document.createElement('span');
		nameSpan.textContent = plik.name;
		nameCell.appendChild(nameSpan);

		const urlCell = row.insertCell();
		const link = document.createElement('a');
		link.classList.add('a_tabela_plikow_uzytkownikow');
		link.href = plik.url;
		link.target = "_blank";
		link.textContent = "Pobierz";
		urlCell.appendChild(link);

		const deleteCell = row.insertCell();
		const deleteButton = document.createElement('button');
		deleteButton.classList.add('btn', 'btn-danger', 'btn-sm', 'btn-usun');
		deleteButton.textContent = "Usuń";
		deleteButton.addEventListener('click', () => usunPlik(plik.name));
		deleteCell.appendChild(deleteButton);

		const previewCell = row.insertCell();
		const previewButton = document.createElement('button');

		previewButton.classList.add('btn-sm', 'btn-outline-secondary', 'btn-podglad');
		previewButton.textContent = "Podgląd";
		previewButton.addEventListener('click', () => pokazPodglad(plik.url));

		previewCell.appendChild(previewButton);
	});
}

function pokazPodglad(url) {
	const rozszerzenie = url.slice(-3).toLowerCase();

	axios.get(url, { responseType: 'blob' })
		.then(response => {
			const blob = new Blob([response.data], { type: response.headers['content-type'] });
			const plikUrl = URL.createObjectURL(blob);

			const LightboxDiv = document.getElementById('lightboxDiv');
			const lightboxZawartosc = document.getElementById('lightboxZawartosc');

			lightboxZawartosc.innerHTML = '';

			let zawartoscPliku;

			if (rozszerzenie === 'mp3' || rozszerzenie === 'wav' || rozszerzenie === 'flac' || rozszerzenie === 'ogg' || rozszerzenie === 'aac' || rozszerzenie === 'wma' || rozszerzenie === 'ape') {
				zawartoscPliku = document.createElement('audio');
				zawartoscPliku.src = plikUrl;
				zawartoscPliku.controls = true;
			} else if (rozszerzenie === 'txt' || rozszerzenie === 'cmd' || rozszerzenie === 'bat') {
				zawartoscPliku = document.createElement('iframe');
				zawartoscPliku.src = plikUrl;
				zawartoscPliku.style.width = '800px';
				zawartoscPliku.style.height = '600px';
			} else if (['jpg', 'png', 'jpeg', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'psd', 'ico', 'jp2'].includes(rozszerzenie)) {
				zawartoscPliku = document.createElement('img');
				zawartoscPliku.src = plikUrl;
				zawartoscPliku.style.maxWidth = '800px';
				zawartoscPliku.style.maxHeight = '600px';
			} else if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp', 'rm'].includes(rozszerzenie)) {
				zawartoscPliku = document.createElement('video');
				zawartoscPliku.src = plikUrl;
				zawartoscPliku.controls = true;
				zawartoscPliku.style.maxWidth = '800px';
				zawartoscPliku.style.maxHeight = '600px';
			} else {
				pokazPowiadomienieBlad('Nieobsługiwany plik.');
				return;
			}

			if (zawartoscPliku) {
				lightboxZawartosc.appendChild(zawartoscPliku);

				LightboxDiv.style.display = 'flex';
				document.addEventListener("click", kliknieciePodglad);
			}
		})
		.catch(error => {
			console.error(error);
			pokazPowiadomienieBlad('Wystąpił błąd podczas pobierania pliku.');
		});
}

function kliknieciePodglad(event) {
	const LightboxDiv = document.getElementById('lightboxDiv');
	const lightboxZawartosc = document.getElementById('lightboxZawartosc');

	if (!event.target.closest("#lightboxZawartosc")) {
		LightboxDiv.style.display = 'none';
		lightboxZawartosc.innerHTML = '';
		document.removeEventListener("click", kliknieciePodglad);
	}
}

let czyPodgladWlaczony = false;

document.addEventListener("click", function(event) {
	if (czyPodgladWlaczony) {
		const LightboxDiv = document.getElementById('lightboxDiv');
		const podgladButton = document.getElementById('podglad');
		const zaznaczonyCheckbox = document.querySelector('input[name="plik"]:checked');

		if (!event.target.closest("#lightboxZawartosc")) {
			LightboxDiv.style.display = 'none';
			podgladButton.textContent = 'Podgląd';

			if (zaznaczonyCheckbox) {
				zaznaczonyCheckbox.checked = false;
			}

			czyPodgladWlaczony = !czyPodgladWlaczony;
		}
	}
});

async function usunPlik(nazwaPliku) {
	try {
		const response = await fetch(`${plikiAdminaUrl}/${encodeURIComponent(nazwaPliku)}`, {
			method: "DELETE"
		});

		if (!response.ok) {
			throw new Error(response.statusText);
		}

		listaPlikow();
		pokazPowiadomienieBlad("Poprawnie usunięto plik!");
	} catch (error) {
		console.error(error);
		pokazPowiadomienieBlad("Wystąpił błąd. Plik nie został usunięty.");
	}
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

const wyslijForm = document.getElementById("wyslijAdminForm");

wyslijForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	const formData = new FormData(wyslijForm);

	try {
		const uploadResponse = await fetch(wyslijAdminURL, {
			method: "POST",
			body: formData
		});

		if (!uploadResponse.ok) {
			throw new Error(uploadResponse.statusText);
		}
		pokazPowiadomienieBlad("Plik został wysłany!");
	} catch (error) {
		console.error(error);
		pokazPowiadomienieBlad("Wystąpił błąd. Plik nie został wysłany.");
	}
});