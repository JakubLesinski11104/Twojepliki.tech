const form = document.getElementById("my-form");

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	const fileId = document.getElementById("file-id").value;
	const url = `http://localhost:8080/pliki/${fileId}`;
	//const url = `http://141.148.241.107:8080/pliki/${fileId}`;

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
