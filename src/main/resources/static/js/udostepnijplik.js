const url = "https://localhost:443/pliki";
//const url = "https://twojepliki.tech:443/pliki";

const udostepnijUrl = "https://localhost:443/udostepnijplik";
//const udostepnijUrl = "https://twojepliki.tech:443/udostepnijplik";

let wyslanePliki = [];

$(document).ready(function() {
    $('#formularz_udostepnij').submit(function(event) {
        event.preventDefault();

        var udostepnij = $('#udostepnij_input').val();
var nowaNazwaPlikuvar = nazwaPliku;

        if (email && udostepnij) {
            $.ajax({
                url: '/udostepnij',
                type: 'POST',
                data: {udostepnij: udostepnij, nowaNazwaPliku: nowaNazwaPlikuvar },
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
	const container = document.getElementById("PlikiDoUdostepnienia");

	data.forEach((plik) => {
		if (plik.name === "Twoja_notatka.txt" || !plik.name.includes('.')) {
			return;
		}
		const card = document.createElement("div");
		card.className = "col-md-4 ";
		card.innerHTML = `
                        <div class="card-body mb-4">
                        ${!plik.url.endsWith('/') && (plik.url.includes('.') || plik.url.endsWith('/')) ? `
                         <p class="card-text">${plik.name}</p>
              <div class="d-flex justify-content-between align-items-center">
                  <button class="btn btn-primary btn-block" onclick="udostepnijPlik('${plik.url}', '${plik.name}')">Udostępnij</button>
              </div>`: ``}
				</div>
			</div>
       `;
		container.appendChild(card);
		wyslanePliki.push(plik.name);
	});
}

fetchData();

/*Linux
async function fetchData() {
	const response = await fetch(url);
	const data = await response.json();
	const container = document.getElementById("PlikiDoUdostepnienia");

	data.forEach((plik) => {
		if (plik.name === "Twoja_notatka.txt") {
		return;
	}
    
	const fileNameParts = plik.name.split('.');
	const fileExtension = fileNameParts.length > 1 ? fileNameParts[fileNameParts.length - 1] : '';

	const card = document.createElement("div");
	card.className = "col-md-4 ";

	card.innerHTML = `
		<div class="card-body mb-4">
			${fileExtension !== '' ? `
				<p class="card-text">${plik.name}</p>
				<div class="d-flex justify-content-between align-items-center">
					<button class="btn btn-primary btn-block" onclick="udostepnijPlik('${plik.url}', '${plik.name}')">Udostępnij</button>
				</div>` : ``}
		</div>
	</div>`;

	container.appendChild(card);
	wyslanePliki.push(plik.name);
});
}

fetchData();
*/

function udostepnijPlik(url, nazwaPliku) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const obecnaData = new Date().toISOString().slice(0, 10);
            const obecnyCzas = getObecnyCzas();
            const nowaNazwaPliku = "UDOSTEPNIONE dnia " + obecnaData + " o godzinie " + obecnyCzas + " " + nazwaPliku;
var nowaNazwaPlikuvar = "UDOSTEPNIONE dnia " + obecnaData + " o godzinie " + obecnyCzas + " " + nazwaPliku;

            var udostepnij = $('#udostepnij_input').val();
            var email = $('#email_input').val();
            $.ajax({
                url: 'udostepnij', 
                type: 'POST',
                data: { nowaNazwaPliku: nowaNazwaPlikuvar, udostepnij: udostepnij},
                success: function(response) {
                   
                },
                error: function(error) {
                   
                }
            });

            const nowyPlik = new FormData();
            nowyPlik.append('file', blob, nowaNazwaPliku);

            fetch(udostepnijUrl, {
                method: 'POST',
                body: nowyPlik
            })
                .then(response => {
                    if (response.ok) {
                        showPowiadomnienie("Plik został udostępniony!");
                    } else {
                        throw new Error(response.statusText);
                    }
                })
                .catch(error => {
                    console.error(error);
                    showPowiadomnienie("Wystąpił błąd. Plik nie został udostępniony.");
                });
        })
        .catch(error => {
            console.error(error);
            showPowiadomnienie("Wystąpił błąd. Plik nie został pobrany.");
        });
}

function getObecnyCzas() {
	const data = new Date();
	const godzina = data.getHours();
	const minuta = data.getMinutes();
	const sekunda = data.getSeconds();
	const czas = `${padZero(godzina)}.${padZero(minuta)}.${padZero(sekunda)}`;
	return czas;
}

function padZero(number) {
	return number.toString().padStart(2, "0");
}

function showPowiadomnienie(powiadomnienie) {
	const powiadomnienieDiv = document.getElementById("powiadomnienieDiv");
	powiadomnienieDiv.innerHTML = `<div class="alert alert-info">${powiadomnienie}</div>`;
}