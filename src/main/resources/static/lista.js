const url = "http://localhost:8080/files"; // adres URL API
		
		async function fetchData() {
			const response = await fetch(url);
			const data = await response.json();
			const table = document.getElementById("data");
			
			data.forEach((customer) => {
				const row = document.createElement("tr");
				row.innerHTML = `
					<td>${customer.name}</td>
					<td><a href="${customer.url}">Pobierz</td>
					<td>
					

					${customer.url}

					
					
					
					</td>
					
				`;
				table.appendChild(row);
			});
		}
		
		fetchData();
		
		function copyToClipboard() {
  var copyText = document.getElementById("myText");
  copyText.select();
  document.execCommand("copy");
  alert("Text copied to clipboard");}