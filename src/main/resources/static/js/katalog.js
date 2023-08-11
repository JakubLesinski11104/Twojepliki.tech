const plikiurl = "https://localhost:443/pliki";
//const plikiurl = "https://twojepliki.tech:443/pliki";

const wyslijUrl = "https://localhost:443/wyslij";
//const wyslijUrl = "https://twojepliki.tech:443/wyslij";

const usunUrl = "https://localhost:443/pliki";
//const usunUrl = "https://twojepliki.tech:443/pliki";

let wyslanePliki = [];

async function fetchData() {
	const response = await fetch(plikiurl);
	const data = await response.json();
	const container = document.getElementById("listaPlikow");

	data.forEach((plik) => {
		if (plik.name === "Twoja_notatka.txt") {
			return;
		}

		const card = document.createElement("div");
		card.className = "col-md-4 ";
		card.innerHTML = `
			<div class="card-body mb-4">
				${!plik.url.endsWith('/') && (plik.url.includes('.') || plik.url.endsWith('/')) ? `
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
						<button id="podglad" class="btn-sm btn-outline-secondary btn-pobierz" onclick="pokazPodglad()">Podgląd</button>
					</div>` : `
					<div class="container text-center">
					<p style="text-align: center; font-size: 18px; margin: 0;">Katalog: <b>${plik.name}</b></p>
					<div class="btn-group"></div>  
					</div>
					`}
				</div>
			</div>
		`;
		container.appendChild(card);
		wyslanePliki.push(plik.name);
	});
}

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
    const LightboxDiv = document.getElementById('lightboxDiv');
    const podgladButton = document.getElementById('podglad');
    const zamknijButton = document.getElementById('zamknij-btn');

    if (czyPodgladWlaczony) {
        LightboxDiv.style.display = 'none';
        podgladButton.textContent = 'Podgląd';
   	
   const zaznaczonyCheckbox = document.querySelector('input[name="plik"]:checked');
        if (zaznaczonyCheckbox) {
            zaznaczonyCheckbox.checked = false;
        }
    } else {
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

                    LightboxDiv.innerHTML = '';

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
                    } else if (rozszerzenie === 'pdf' || rozszerzenie === 'doc' || rozszerzenie === 'ppt' || rozszerzenie === 'xls'  || rozszerzenie === 'xml' || rozszerzenie === 'odt' || rozszerzenie === 'zip' || rozszerzenie === 'rar'|| rozszerzenie === 'exe') {
                        pokazPowiadomienie('Nieobsługiwany plik.');
                    } else {
                        zawartoscPliku = document.createElement('iframe');
                        zawartoscPliku.src = plikUrl;
                        zawartoscPliku.style.width = '800px';
                        zawartoscPliku.style.height = '600px';
                    }

                    if (zawartoscPliku) {
                        LightboxDiv.appendChild(zawartoscPliku);
                        LightboxDiv.style.display = 'block';
                        podgladButton.textContent = 'Zamknij podgląd';
                    }
                })
                .catch(error => {
                    console.error(error);
                    pokazPowiadomienie('Wystąpił błąd podczas pobierania pliku.');
                });
        } else {
            pokazPowiadomienie('Proszę zaznaczyć jeden plik do podglądu.');
        }
    }

    czyPodgladWlaczony = !czyPodgladWlaczony;
}

//Podkatalog

 function FetchFiles() {}

    function ukryjPowiadomienieBledne() {}

    function pokazPowiadomienieBledne(powiadomienie) {}

    $(document).ready(function () {
        $('#podkatalogForm').submit(function (event) {
            event.preventDefault();

            var value = $('#podkatalogInput').val();

            if (value) {
                $.ajax({
                    url: '/katalog',
                    type: 'POST',
                    data: { pod_folder: value },
                    success: function (response) {
                        FetchFiles();
                        ukryjPowiadomienieBledne();
                    },
                    error: function (error) {
                        pokazPowiadomienieBledne("Wystąpił błąd podczas wysyłania danych: " + error);
                    },
                    complete: function () {
                        location.reload();
                    }
                });
            }
        });
 
        $('#podkatalogCofnijButton').click(function () {
            $('#podkatalogInput').val('');
            $.ajax({
                url: '/katalog',
                type: 'POST',
                data: { pod_folder: null },
                success: function (response) {
                    FetchFiles();
                    ukryjPowiadomienieBledne();
                },
                error: function (error) {
                    pokazPowiadomienieBledne("Wystąpił błąd podczas wysyłania danych: " + error);
                },
                complete: function () {
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