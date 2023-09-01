const NotatnikURL = 'https://localhost:443';
//const NotatnikURL = 'https://twojepliki.tech:443';
const NotatnikURLPlik = `${NotatnikURL}/pliki/Twoja_notatka.txt`;
const NotatnikURLUsuniecie = `${NotatnikURL}/pliki/Twoja_notatka.txt`;
const NotatnikURLWyslij = `${NotatnikURL}/wyslij`;

const cofnijSidebarPrzycisk = document.getElementById('cofnijSidebarPrzycisk');
cofnijSidebarPrzycisk.addEventListener('click', function() {
	const sidebar = document.getElementById('sidebar');
	sidebar.classList.remove('show');
	cofnijSidebarPrzycisk.classList.add('hidden');
	sidebarNotatnikPrzycisk.classList.remove('hidden');
});

function pokazSidebar() {
	const sidebar = document.getElementById('sidebar');
	sidebar.classList.toggle('show');
}

function ukryjSidebar() {
	const sidebar = document.getElementById('sidebar');
	sidebar.style.transition = 'all 0.5s';
	sidebar.style.right = '-300px';
}

async function getPlikZApi() {
	try {
		const response = await fetch(NotatnikURLPlik);

		if (response.status === 404) {
			return null;
		}

		if (!response.ok) {
			throw new Error('Błąd podczas pobierania pliku z API');
		}

		return response.text();
	} catch (error) {
		console.error('Wystąpił błąd podczas pobierania pliku z API:', error);
		return null;
	}
}

async function zapiszNotatke(fileContent) {
	try {
		const formData = new FormData();
		formData.append('file', new Blob([fileContent], { type: 'text/plain' }), 'Twoja_notatka.txt');

		const response = await fetch(NotatnikURLWyslij, {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			throw new Error('Błąd podczas zapisywania notatki na serwerze');
		}

		return response.text();
	} catch (error) {
		console.error('Wystąpił błąd:', error);
		throw error;
	}
}

async function usunNotatke() {
	try {
		const response = await fetch(NotatnikURLUsuniecie, {
			method: 'DELETE'
		});

		if (!response.ok) {
			throw new Error('Błąd podczas usuwania pliku z API');
		}

		return response.text();
	} catch (error) {
		console.error('Wystąpił błąd:', error);
		throw error;
	}
}

function pokazNotatke(fileContent) {
	const notatkaTextArea = document.getElementById('notatkaTextArea');
	notatkaTextArea.value = fileContent || '';
}

async function zapisywanieNotatki() {
	const notatkaTextArea = document.getElementById('notatkaTextArea');
	const fileContent = notatkaTextArea.value;

	try {
		ukryjSidebar();
		const sidebar = document.getElementById('sidebar');
		sidebar.addEventListener('transitionend', async function onTransitionEnd() {
			sidebar.removeEventListener('transitionend', onTransitionEnd);
			await usunNotatke();
			await zapiszNotatke(fileContent);
			setTimeout(() => {
				window.location.reload();
			}, 750);
		});
	} catch (error) {
		alert('Wystąpił błąd podczas zapisywania notatki.');
	}
}

async function notatnik() {
	try {
		const fileContent = await getPlikZApi();
		if (fileContent === null) {
			await zapiszNotatke('');
			window.location.reload();
		} else {
			pokazNotatke(fileContent);
		}
	} catch (error) {
		console.error('Wystąpił błąd podczas inicjalizacji aplikacji:', error);
	}

	const zapiszNotatkePrzycisk = document.getElementById('zapiszNotatkePrzycisk');
	zapiszNotatkePrzycisk.addEventListener('click', zapisywanieNotatki);
	const sidebarNotatnikPrzycisk = document.getElementById('sidebarNotatnikPrzycisk');
	sidebarNotatnikPrzycisk.addEventListener('click', pokazSidebar);
}

notatnik();

const sidebarNotatnikPrzycisk = document.getElementById('sidebarNotatnikPrzycisk');
sidebarNotatnikPrzycisk.addEventListener('click', function() {
	this.classList.add('hidden');
});