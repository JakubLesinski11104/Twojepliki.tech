const button = document.getElementById("przycisk_usun");

button.addEventListener("click", async (event) => {
	event.preventDefault();

	const fileId = document.getElementById("file-id").value;
	//const url = `http://localhost:9000/pliki/${fileId}`;
	const url = `https://localhost:443/pliki/${fileId}`;
	//const url = `http://141.148.241.107:9000/pliki/${fileId}`;
	//const url = `https://141.148.241.107:443/pliki/${fileId}`;

	try {
		const response = await fetch(url, {
			method: "DELETE"
		});

		if (!response.ok) {
			throw new Error(response.statusText);
		}

		alert("Plik został usunięty!");
	} catch (error) {
		console.error(error);
		alert("Wystąpił błąd. Plik nie został usunięty.");
	}
});
