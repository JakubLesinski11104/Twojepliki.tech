
		const form = document.getElementById("my-form");
		
		form.addEventListener("submit", async (event) => {
			event.preventDefault();
			
			const formData = new FormData(form);
			const url = "http://localhost:8080/upload";
			
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
