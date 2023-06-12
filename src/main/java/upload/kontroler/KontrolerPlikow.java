package upload.kontroler;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;

import upload.model.PlikInfo;
import upload.odpowiedz.KomunikatOdpowiedzi;
import upload.usluga.UsługaPrzechowywaniaPlikow;

@Controller
@CrossOrigin("http://localhost:8080")
public class KontrolerPlikow {

	@Autowired
	UsługaPrzechowywaniaPlikow usługa_przechowywania;

	@PostMapping("/wyslij")
	public ResponseEntity<KomunikatOdpowiedzi> wyslijPlik(@RequestParam("file") MultipartFile file) {
		String message = "";

		try {
			usługa_przechowywania.zapisz(file);

			message = "Wrzucono plik: " + file.getOriginalFilename();
			return ResponseEntity.status(HttpStatus.OK).body(new KomunikatOdpowiedzi(message));
		} catch (Exception e) {
			message = "Nie wrzucono pliku: " + file.getOriginalFilename() + ". Error: " + e.getMessage();
			return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(new KomunikatOdpowiedzi(message));
		}
	}

	@GetMapping("/pliki")
	public ResponseEntity<List<PlikInfo>> getListaPlikow() {
		List<PlikInfo> fileInfos = usługa_przechowywania.wczytaj().map(path -> {
			String filename = path.getFileName().toString();
			String url = MvcUriComponentsBuilder
					.fromMethodName(KontrolerPlikow.class, "getPlik", path.getFileName().toString()).build().toString();

			return new PlikInfo(filename, url);
		}).collect(Collectors.toList());

		return ResponseEntity.status(HttpStatus.OK).body(fileInfos);
	}

	@GetMapping("/pliki/{filename:.+}")
	public ResponseEntity<Resource> getPlik(@PathVariable String filename) {
		Resource file = usługa_przechowywania.wyslij(filename);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
				.body(file);
	}

	@DeleteMapping("/pliki/{filename:.+}")
	public ResponseEntity<KomunikatOdpowiedzi> usunPlik(@PathVariable String filename) {
		String message = "";

		try {
			boolean isttnieje = usługa_przechowywania.usun(filename);

			if (isttnieje) {
				message = "Usunieto plik: " + filename;
				return ResponseEntity.status(HttpStatus.OK).body(new KomunikatOdpowiedzi(message));
			}

			message = "Plik nie istnieje";
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new KomunikatOdpowiedzi(message));
		} catch (Exception e) {
			message = "Nie mozna usunac: " + filename + ". Error: " + e.getMessage();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new KomunikatOdpowiedzi(message));
		}
	}
}
