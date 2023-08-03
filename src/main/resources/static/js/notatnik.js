const NotatnikapiBaseUrl = 'https://localhost:443';
//const NotatnikapiBaseUrl = 'https://twojepliki.tech:443';
const NotatnikgetFileUrl = `${NotatnikapiBaseUrl}/pliki/Twoja notatka.txt`;
const NotatnikdeleteFileUrl = `${NotatnikapiBaseUrl}/pliki/Twoja notatka.txt`;
const NotatnikuploadUrl = `${NotatnikapiBaseUrl}/wyslij`;

const backButton = document.getElementById('backButton');
backButton.addEventListener('click', function() {
	const sidebar = document.getElementById('sidebar');
	sidebar.classList.remove('show');
	backButton.classList.add('hidden');
	toggleSidebarButton.classList.remove('hidden');
});

function toggleSidebar() {
	const sidebar = document.getElementById('sidebar');
	sidebar.classList.toggle('show');
}

function hideSidebar() {
	const sidebar = document.getElementById('sidebar');
	sidebar.style.transition = 'all 0.5s';
	sidebar.style.right = '-300px';
}
// Funkcja do pobrania zawartości pliku z API
async function getFileFromApi() {
	try {
		const response = await fetch(NotatnikgetFileUrl);

		if (response.status === 404) {
			return null; // Plik nie istnieje w API
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


// Funkcja do zapisania notatki na serwerze za pomocą API "https://localhost:443/wyslij"
async function saveNoteToServer(fileContent) {
	try {
		const formData = new FormData();
		formData.append('file', new Blob([fileContent], { type: 'text/plain' }), 'Twoja notatka.txt');

		const response = await fetch(NotatnikuploadUrl, {
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

// Funkcja do usuwania pliku z API
async function deleteFileFromApi() {
	try {
		const response = await fetch(NotatnikdeleteFileUrl, {
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

// Funkcja do wyświetlenia zawartości pliku w polu tekstowym
function displayFileContent(fileContent) {
	const noteTextArea = document.getElementById('noteTextArea');
	noteTextArea.value = fileContent || ''; // Jeżeli plik nie istnieje, wartość pola tekstowego będzie pusta
}

// Funkcja do obsługi przycisku "Zapisz"
async function handleSaveButtonClick() {
	const noteTextArea = document.getElementById('noteTextArea');
	const fileContent = noteTextArea.value;

	try {
		// Ukrywamy notatnik z animacją
		hideSidebar();

		// Oczekujemy na zakończenie animacji i dopiero wtedy zapisujemy notatkę i odświeżamy stronę
		const sidebar = document.getElementById('sidebar');
		sidebar.addEventListener('transitionend', async function onTransitionEnd() {
			// Usuwamy nasłuchiwanie eventu, aby uniknąć wielokrotnego wywołania tej funkcji
			sidebar.removeEventListener('transitionend', onTransitionEnd);

			// Najpierw usuwamy poprzednią notatkę
			await deleteFileFromApi();

			// Następnie zapisujemy nową notatkę na serwerze
			await saveNoteToServer(fileContent);

			// Odświeżamy stronę, aby wyświetlić zaktualizowaną zawartość notatki
			setTimeout(() => {
				window.location.reload();
			}, 750);
		});
	} catch (error) {
		alert('Wystąpił błąd podczas zapisywania notatki.');
	}
}

// Główna funkcja, która uruchamia całą aplikację
async function initializeApp() {
	try {
		// Pobieramy zawartość pliku z API
		const fileContent = await getFileFromApi();

		if (fileContent === null) {
			// Jeżeli nie udało się pobrać zawartości notatki, wysyłamy puste pole (pusty plik Twoja notatka.txt) do API
			await saveNoteToServer('');
			window.location.reload();
		} else {
			// Wyświetlamy zawartość notatki na stronie
			displayFileContent(fileContent);
		}
	} catch (error) {
		console.error('Wystąpił błąd podczas inicjalizacji aplikacji:', error);
	}

	const saveButton = document.getElementById('saveButton');
	saveButton.addEventListener('click', handleSaveButtonClick);
	const toggleSidebarButton = document.getElementById('toggleSidebarButton');
	toggleSidebarButton.addEventListener('click', toggleSidebar);
}
// Wywołanie głównej funkcji po załadowaniu strony
initializeApp();
const toggleSidebarButton = document.getElementById('toggleSidebarButton');
toggleSidebarButton.addEventListener('click', function() {
	this.classList.add('hidden');
});