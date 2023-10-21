const plikiurl = "https://localhost:443/pliki";
//const plikiurl = "https://twojepliki.tech:443/pliki";

const wyslijUrl = "https://localhost:443/wyslij";
//const wyslijUrl = "https://twojepliki.tech:443/wyslij";

const usunUrl = "https://localhost:443/pliki";
//const usunUrl = "https://twojepliki.tech:443/pliki";

const podkatalogHiperlaczeUrl = 'https://localhost:443/pliki';
//const podkatalogHiperlaczeUrl = 'https://twojepliki.tech:443/pliki';

let wyslanePliki = [];

/*Windows*/
async function fetchData() {
	const response = await fetch(plikiurl);
	const data = await response.json();
	const container = document.getElementById("listaPlikow");

	data.forEach((plik) => {
		if (plik.name === "Twoja_notatka.txt" || !plik.name.includes('.')) {
			return;
		}

		const card = document.createElement("div");
		card.className = "col-md-4 ";
		card.innerHTML = `
			<div class="card-body mb-4">
				<p class="card-text">${plik.name}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group">
                        <label style="text-align:center; vertical-align:middle; font-size: 16px;" for="${plik.url}">&nbsp;</label>
                       
                        <input style="text-align:center; vertical-align:middle" type="checkbox" class="wiekszy" id="${plik.url}" name="plik" value="${plik.url}">
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-outline-secondary btn-pobierz" onclick="pobierzPlik('${plik.url}')">Pobierz</button>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-secondary btn-usun" onclick="usunPlik('${plik.name}')">Usuń</button>
                    <button id="podglad" class="btn-sm btn-outline-secondary btn-podglad" onclick="pokazPodglad()">Podgląd <img src="assets/podglad.png" alt="Podglad"></button>
                </div>
            </div>
        </div>`;

		container.appendChild(card);
		wyslanePliki.push(plik.name);
	});
}
/*Windows*/

/*Linux
async function fetchData() {
	const response = await fetch(plikiurl);
	const data = await response.json();
	const container = document.getElementById("listaPlikow");

	data.forEach((plik) => {
	if (plik.name === "Twoja_notatka.txt" || !plik.name.includes('.')) {
			return;
		}
    
 const fileNameParts = plik.name.split('.');
	const fileExtension = fileNameParts.length > 1 ? fileNameParts[fileNameParts.length - 1] : '';
		const isUdostepnioneFolder = plik.name === "Udostepnione";
	const card = document.createElement("div");
	card.className = "col-md-4 ";
	card.innerHTML = `
		<div class="card-body mb-4">
		   ${fileExtension !== '' ? `
				<p class="card-text">${plik.name}</p>
				<div class="d-flex justify-content-between align-items-center">
					<div class="btn-group">
						<label style="text-align:center; vertical-align:middle; font-size: 16px;" for="${plik.url}">&nbsp;</label>
						<input style="text-align:center; vertical-align:middle" type="checkbox" class="wiekszy" id="${plik.url}" name="plik" value="${plik.url}">
					</div>
					<div class="btn-group">
						<button type="button" class="btn btn-sm btn-outline-secondary btn-pobierz" onclick="pobierzPlik('${plik.url}')">Pobierz</button>
					</div>
					${isUdostepnioneFolder ? '' : `
						<button type="button" class="btn btn-sm btn-outline-secondary btn-usun" onclick="usunPlik('${plik.name}')">Usuń</button>
                    <button id="podglad" class="btn-sm btn-outline-secondary btn-podglad" onclick="pokazPodglad()">Podgląd <img src="assets/podglad.png" alt="Podglad"></button>
					`}
				</div>` : ``}
				</div>	
	</div>`;

	container.appendChild(card);
	wyslanePliki.push(plik.name);
});
}
Linux*/

function pobierzPlik(url) {
	const elementA = document.createElement('a');
	elementA.href = url;
	elementA.download = url.split('/').pop();
	elementA.click();
	pokazPowiadomienie("Pobrano plik: " + elementA.download);
}

function getObecnyCzas() {
	const data = new Date();
	const godzina = data.getHours();
	const minuty = data.getMinutes();
	const sekundy = data.getSeconds();
	const czas = `${padZero(godzina)}.${padZero(minuty)}.${padZero(sekundy)}`;
	return czas;
}

function padZero(number) {
	return number.toString().padStart(2, "0");
}

function pobierzZip(urls) {
	const zip = new JSZip();
	const count = urls.length;
	let pobranePliki = 0;

	function checkComplete() {
		if (pobranePliki === count) {
			zip.generateAsync({ type: 'blob' }).then(function(content) {
				const elementA = document.createElement('a');
				elementA.href = URL.createObjectURL(content);
				const obecnaData = new Date().toLocaleDateString('pl-PL');
				const obecnyCzas = getObecnyCzas();
				const nowaNazwaPliku = "pobrane_" + obecnyCzas + "_" + obecnaData;
				elementA.download = nowaNazwaPliku + '.zip';
				elementA.click();
				pokazPowiadomienie("Pobrano plik ZIP: " + elementA.download);
			});
		}
	}

	urls.forEach(function(url) {
		fetch(url)
			.then(function(response) {
				return response.blob();
			})
			.then(function(blob) {
				const nazwaPliku = url.split('/').pop();
				zip.file(nazwaPliku, blob);

				pobranePliki++;
				checkComplete();
			});
	});
}

document.getElementById("plikInput").addEventListener("change", function(e) {
	var plikWyslijPokaz = document.getElementById("plikWyslijPokaz");
	var wyslijPlikButton = document.getElementById("wyslijPlikButton");
	plikWyslijPokaz.innerHTML = "";
	for (var i = 0; i < e.target.files.length; i++) {
		var plikNazwa = e.target.files[i].name;
		var plikInfo = document.createElement("p");
		plikInfo.textContent = "Wybrany plik: " + plikNazwa;
		plikWyslijPokaz.appendChild(plikInfo);
	}
	plikWyslijPokaz.style.display = "block";
	wyslijPlikButton.style.display = "block";
});

let czyZastapicPlik = null;

async function wyslijPliki(files) {
	const promises = [];
	const PlikiDoZamiany = [];

	for (let i = 0; i < files.length; i++) {
		const file = files[i];

		if (wyslanePliki.includes(file.name)) {
			if (czyZastapicPlik === null) {
				czyZastapicPlik = await pokazPodpowiedzZastapienia(file.name);
			}

			if (!czyZastapicPlik) {
				continue;
			}
			PlikiDoZamiany.push(file.name);
		}

		const formData = new FormData();
		formData.append('file', file);

		const promise = fetch(wyslijUrl, {
			method: 'POST',
			body: formData
		});

		promises.push(promise);
	}

	try {
		await Promise.all(promises);
		pokazPowiadomienie('Pliki zostały wysłane! Odświeżymy stronę!');
		if (PlikiDoZamiany.length > 0) {
			pokazPowiadomienie(`Zastąpione pliki: ${PlikiDoZamiany.join(", ")}`);
		}
		setTimeout(function() {
			window.location.reload();
		}, 2000);
	} catch (error) {
		console.error(error);
		pokazPowiadomienie('Wystąpił błąd. Pliki nie zostały wysłane.');
	}
}

async function usunPlik(nazwaPliku) {
	pokazOknoPotwierdzenia(`Czy na pewno chcesz usunąć plik "${nazwaPliku}"?`, async (confirmed) => {
		if (confirmed) {
			try {
				const response = await fetch(`${usunUrl}/${nazwaPliku}`, {
					method: 'DELETE'
				});

				if (!response.ok) {
					throw new Error(response.statusText);
				}

				pokazPowiadomienie('Plik został usunięty!');
				setTimeout(function() {
					window.location.reload();
				}, 2000);
			} catch (error) {
				console.error(error);
				pokazPowiadomienie('Wystąpił błąd. Plik nie został usunięty.');
			}
		}
	});
}

function pokazPowiadomienie(powiadomienie) {
	const DivPowiadomienie = document.getElementById("divPowiadomienie");
	DivPowiadomienie.innerHTML = `<div class="alert alert-info">${powiadomienie}</div>`;
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
		pokazPowiadomienie('Nie zaznaczono żadnego pliku!');
	}
});

const form = document.getElementById('wysylaniePlikowForm');
const plikInput = document.getElementById('plikInput');

form.addEventListener('submit', function(event) {
	event.preventDefault();
	const files = plikInput.files;

	if (files.length > 0) {
		wyslijPliki(files);
	} else {
		pokazPowiadomienie('Nie wybrano żadnych plików!');
	}
}

);
function pokazOknoPotwierdzenia(powiadomienie, callback) {
	const PokazOknoPotwierdzenia = document.getElementById("potwierdzeniePowiadomienie");
	PokazOknoPotwierdzenia.textContent = powiadomienie;

	const PotwierdzUsuniecie = document.getElementById("potwierdzUsuniecie");
	PotwierdzUsuniecie.addEventListener("click", () => {
		$('#oknoPotwierdzenia').modal('hide');
		callback(true);
	});

	$('#oknoPotwierdzenia').modal('show');
}
async function pokazPodpowiedzZastapienia(nazwaPliku) {
	return new Promise((resolve) => {
		const IstniejePlikPowiadomienie = document.getElementById("istniejePlikPowiadomienie");
		IstniejePlikPowiadomienie.textContent = `Plik "${nazwaPliku}" jest już na dysku.`;

		const AnulujIstniejePlik = document.getElementById("anulujIstniejePlik");
		AnulujIstniejePlik.addEventListener("click", () => {
			$('#zamianaModal').modal('hide');
			resolve(false);
		});

		$('#zamianaModal').modal('show');
	});
}

//Podglad pliku

let czyPodgladWlaczony = false;


function pokazPodglad() {
	const zaznaczonePliki = Array.from(document.querySelectorAll('input[name="plik"]:checked')).map(function(checkbox) {
		return checkbox.value;
	});

	if (zaznaczonePliki.length === 1) {
		const podgladUrl = zaznaczonePliki[0];
		const rozszerzenie = podgladUrl.slice(-3).toLowerCase();

		axios.get(podgladUrl, { responseType: 'blob' })
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
					pokazPowiadomienie('Nieobsługiwany plik.');
				}

				if (zawartoscPliku) {
					lightboxZawartosc.appendChild(zawartoscPliku);

					LightboxDiv.style.display = 'flex';
				}
			})
			.catch(error => {
				console.error(error);
				pokazPowiadomienie('Wystąpił błąd podczas pobierania pliku.');
			});
	} else {
		pokazPowiadomienie('Proszę zaznaczyć jeden plik do podglądu.');
	}

	czyPodgladWlaczony = !czyPodgladWlaczony;

	document.addEventListener("click", function(event) {
		const LightboxDiv = document.getElementById('lightboxDiv');
		const czyPodgladWlaczony = LightboxDiv.style.display === 'flex';

		if (czyPodgladWlaczony && !event.target.closest("#lightboxZawartosc")) {
			const podgladButton = document.getElementById('podglad');
			const zaznaczonyCheckbox = document.querySelector('input[name="plik"]:checked');

			LightboxDiv.style.display = 'none';
			podgladButton.textContent = 'Podgląd';

			if (zaznaczonyCheckbox) {
				zaznaczonyCheckbox.checked = false;
			}
		}
	});
}

//Podkatalog

function FetchFiles() { }

function ukryjPowiadomienieBledne() { }

function pokazPowiadomienieBledne(powiadomienie) { }

$(document).ready(function() {
	$('#podkatalogForm').submit(function(event) {
		event.preventDefault();

		var value = $('#podkatalogInput').val();

		if (value) {
			$.ajax({
				url: '/katalog',
				type: 'POST',
				data: { pod_folder: value, pod_folderUsun: null },
				success: function(response) {
					FetchFiles();
					ukryjPowiadomienieBledne();
				},
				error: function(error) {
					pokazPowiadomienieBledne("Wystąpił błąd podczas wysyłania danych: " + error);
				},
				complete: function() {
					location.reload();
				}
			});
		}
	});

	$('#podkatalogCofnijButton').click(function() {
		$('#podkatalogInput').val('');
		$('#podkatalogUsunInput').val('')
		$.ajax({
			url: '/katalog',
			type: 'POST',
			data: { pod_folder: null },
			success: function(response) {
				FetchFiles();
				ukryjPowiadomienieBledne();
			},
			error: function(error) {
				pokazPowiadomienieBledne("Wystąpił błąd podczas wysyłania danych: " + error);
			},
			complete: function() {
				location.reload();
			}
		});
	});
});

//Wysuwany formularz do podkatalogu  

const PodktalogButton = document.getElementById("podktalogButton");
const PodkatalogDiv = document.getElementById("podkatalogDiv");
PodktalogButton.addEventListener("click", () => {
	if (PodkatalogDiv.style.display === "none") {
		PodkatalogDiv.style.display = "block";
	} else {
		PodkatalogDiv.style.display = "none";
	}
});

//Odnosniki podkatalogi
fetch(podkatalogHiperlaczeUrl)
	.then(response => response.json())
	.then(data => {
		const elementListy = document.getElementById('podkatalogHiperlaczeLista');
		const liNadrzedny = document.createElement('li');
		const buttonNadrzedny = document.createElement('button');
		buttonNadrzedny.classList.add('btn', 'btn-primary', 'hiperlaczaPodkatalogiDomowy');
		buttonNadrzedny.textContent = 'Katalog domowy';
		buttonNadrzedny.addEventListener('click', function() {
			const nazwaPliku = '';
			wyslijDoKontrolera(nazwaPliku);
		});
		liNadrzedny.appendChild(buttonNadrzedny);
		elementListy.insertBefore(liNadrzedny, elementListy.firstChild);
		data.forEach(odnosnikPodkatalog => {
			if (!odnosnikPodkatalog.name.includes('.')) {
				const liPodkatalog = document.createElement('li');
				const button = document.createElement('button');
				button.classList.add('btn', 'btn-primary', 'hiperlaczaPodkatalogi');

				button.textContent = `Podkatalog: ${odnosnikPodkatalog.name}`;
				button.addEventListener('click', function() {
					const nazwaPliku = odnosnikPodkatalog.name;
					wyslijDoKontrolera(nazwaPliku);
				});

				liPodkatalog.appendChild(button);
				elementListy.appendChild(liPodkatalog);
			}
		});
	})
	.catch(error => console.error('Error:', error));

function wyslijDoKontrolera(nazwaPliku) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', '/katalog', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				location.reload();
			} else {
			}
		}
	};
	const params = `pod_folder=${encodeURIComponent(nazwaPliku)}&pod_folderUsun=`;

	xhr.send(params);

}

$(document).ready(function() {
	$('#podkatalogUsunForm').submit(function(event) {
		event.preventDefault();

		var value = $('#podkatalogUsunInput').val();

		if (value) {
			$.ajax({
				url: '/katalog',
				type: 'POST',
				data: {
					pod_folderUsun: value, pod_folder: null
				},
				success: function(response) {

				},
				error: function(error) {
				},
				complete: function() {
					window.location.href = '/katalog';
				}
			});
		}
	});
});

//Wysuwany formularz do usuwania katalogow  
const przycisk = document.getElementById('usunWysunForm');
const usunWysunDiv = document.getElementById('usunWysunDiv');

przycisk.addEventListener('click', function() {
	if (usunWysunDiv.style.display === 'none' || usunWysunDiv.style.display === '') {
		usunWysunDiv.style.display = 'block';
	} else {
		usunWysunDiv.style.display = 'none';
	}
});

//Sidebar podkatalogi    
document.addEventListener('DOMContentLoaded', function() {
	const podkatalogSidebar = document.getElementById('podkatalogSidebar');
	const katalogSidebarZamknij = document.getElementById('katalogSidebarZamknij');
	const sidebar = document.querySelector('.sidebarKatalog');

	podkatalogSidebar.addEventListener('click', function() {
		sidebar.style.left = sidebar.style.left === '0px' ? '-250px' : '0';
	});

	katalogSidebarZamknij.addEventListener('click', function() {
		sidebar.style.left = '-250px';
	});

	document.addEventListener('click', function(event) {
		if (event.target !== podkatalogSidebar && event.target !== sidebar && event.target !== katalogSidebarZamknij) {
			sidebar.style.left = '-250px';
		}
	});

	sidebar.addEventListener('click', function(event) {
		event.stopPropagation();
	});
});