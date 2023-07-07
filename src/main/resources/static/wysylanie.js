const form = document.getElementById("wysylanie");

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	const formData = new FormData(form);
	//const url = "http://localhost:9000/wyslij";
	const url = "https://localhost:443/wyslij";
	//const url = "http://141.148.241.107:9000/wyslij";
	//const url = "https://141.148.241.107:443/wyslij";

	try {
		const response = await fetch(url, {
			method: "POST",
			body: formData
		});

		if (!response.ok) {
			throw new Error(response.statusText);
		}

		alert("Plik został wysłany!");
	} catch (error) {
		console.error(error);
		alert("Wystąpił błąd. Plik nie został wysłany.");
	}
});