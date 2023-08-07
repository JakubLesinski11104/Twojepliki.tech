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

async function getFileFromApi() {
	try {
		const response = await fetch(NotatnikgetFileUrl);

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

function displayFileContent(fileContent) {
	const noteTextArea = document.getElementById('noteTextArea');
	noteTextArea.value = fileContent || '';
}

async function handleSaveButtonClick() {
	const noteTextArea = document.getElementById('noteTextArea');
	const fileContent = noteTextArea.value;

	try {
		hideSidebar();
		const sidebar = document.getElementById('sidebar');
		sidebar.addEventListener('transitionend', async function onTransitionEnd() {
		sidebar.removeEventListener('transitionend', onTransitionEnd);
			await deleteFileFromApi();
			await saveNoteToServer(fileContent);
			setTimeout(() => {
				window.location.reload();
			}, 750);
		});
	} catch (error) {
		alert('Wystąpił błąd podczas zapisywania notatki.');
	}
}

async function initializeApp() {
	try {
		const fileContent = await getFileFromApi();
		if (fileContent === null) {
			await saveNoteToServer('');
			window.location.reload();
		} else {
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

initializeApp();

const toggleSidebarButton = document.getElementById('toggleSidebarButton');
toggleSidebarButton.addEventListener('click', function() {
	this.classList.add('hidden');
});