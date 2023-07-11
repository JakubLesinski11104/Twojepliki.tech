const url = "https://localhost:443/pliki";
    const uploadUrl = "https://localhost:443/wyslij";
    const deleteUrl = "https://localhost:443/pliki";
    let wyslanePliki = [];

    async function fetchData() {
      const response = await fetch(url);
      const data = await response.json();
      const tableBody = document.querySelector("table#data tbody");

      data.forEach((customer) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${customer.name}</td>
          <td><a href="${customer.url}">Pobierz</a></td>
          <td><input type="checkbox" name="plik" value="${customer.url}"></td>
          <td><button onclick="usunPlik('${customer.name}')">Usuń</button></td>
        `;
        tableBody.appendChild(row);
        wyslanePliki.push(customer.name);
      });
    }

    function pobierzPlik(url) {
      const elementA = document.createElement('a');
      elementA.href = url;
      elementA.download = url.split('/').pop();
      elementA.click();
    }

    function pobierzZip(urls) {
      const zip = new JSZip();
      const count = urls.length;
      let downloaded = 0;

      function checkComplete() {
        if (downloaded === count) {
          zip.generateAsync({ type: 'blob' }).then(function (content) {
            const elementA = document.createElement('a');
            elementA.href = URL.createObjectURL(content);
            elementA.download = 'pobrane_pliki.zip';
            elementA.click();
          });
        }
      }

      urls.forEach(function (url) {
        fetch(url)
          .then(function (response) {
            return response.blob();
          })
          .then(function (blob) {
            const fileName = url.split('/').pop();
            zip.file(fileName, blob);

            downloaded++;
            checkComplete();
          });
      });
    }

    async function wyslijPliki(files) {
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (wyslanePliki.includes(file.name)) {
          const shouldReplace = confirm(`Plik "${file.name}" już istnieje w API. Czy chcesz go zastąpić?`);
          if (!shouldReplace) {
            continue; // Pomijamy plik
          }
        }

        const formData = new FormData();
        formData.append('file', file);

        const promise = fetch(uploadUrl, {
          method: 'POST',
          body: formData
        });

        promises.push(promise);
      }

      try {
        await Promise.all(promises);
        alert('Pliki zostały wysłane!');
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert('Wystąpił błąd. Pliki nie zostały wysłane.');
      }
    }

    async function usunPlik(nazwaPliku) {
      const shouldDelete = confirm(`Czy na pewno chcesz usunąć plik "${nazwaPliku}"?`);
      if (shouldDelete) {
        try {
          const response = await fetch(`${deleteUrl}/${nazwaPliku}`, {
            method: 'DELETE'
          });

          if (!response.ok) {
            throw new Error(response.statusText);
          }

          alert('Plik został usunięty!');
          window.location.reload();
        } catch (error) {
          console.error(error);
          alert('Wystąpił błąd. Plik nie został usunięty.');
        }
      }
    }

    fetchData();

    const przyciskPobierz = document.getElementById('pobierz');
    przyciskPobierz.addEventListener('click', function () {
      const zaznaczonePliki = Array.from(document.querySelectorAll('input[name="plik"]:checked')).map(function (checkbox) {
        return checkbox.value;
      });

      if (zaznaczonePliki.length === 1) {
        pobierzPlik(zaznaczonePliki[0]);
      } else if (zaznaczonePliki.length > 1) {
        pobierzZip(zaznaczonePliki);
      } else {
        alert('Nie zaznaczono żadnego pliku!');
      }
    });

    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const files = fileInput.files;

      if (files.length > 0) {
        wyslijPliki(files);
      } else {
        alert('Nie wybrano żadnych plików!');
      }
    });