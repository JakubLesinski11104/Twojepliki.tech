package upload.logowanie;

import java.io.IOException;

import java.net.MalformedURLException;

import java.nio.file.FileAlreadyExistsException;

import java.nio.file.Files;

import java.nio.file.Path;

import java.nio.file.Paths;

import java.util.List;

import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.core.io.Resource;

import org.springframework.core.io.UrlResource;

import org.springframework.security.core.Authentication;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.stereotype.Controller;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.multipart.MultipartFile;

import upload.usluga.UsługaPrzechowywaniaPlikow;

@Controller
@CrossOrigin("http://localhost:8080")
public class KontrolerLogowania implements UsługaPrzechowywaniaPlikow {

	@Autowired

	private RepozytoriumLogowania loginRepo;

	@GetMapping("/")

	public String StronaLogowania() {

		return "index";

	}

	@GetMapping("/glowna")

	public String StronaGlowna() {

		var username_folder = getFolderUzytkownika();

		try {

			Files.createDirectories(username_folder);

		} catch (IOException e) {

			throw new RuntimeException("Nie utworzono folderu");

		}

		return "glowna";

	}

	public Path getFolderUzytkownika() {

		Authentication auth = SecurityContextHolder.getContext().getAuthentication();

		String username = auth.getName();

		var username_folder = Paths.get("wysylane_pliki/", username);

		return username_folder;

	}

	@GetMapping("/rejestracja")

	public String Rejestracja(Model model) {

		model.addAttribute("uzytkownik", new Uzytkownik());

		return "rejestracja";

	}

	@PostMapping("/proces_rejestracji")

	public String ProcesRejestracji(Uzytkownik uzytkownik) {

		BCryptPasswordEncoder EnkoderHasla = new BCryptPasswordEncoder();

		String ZakodowaneHaslo = EnkoderHasla.encode(uzytkownik.getHaslo());

		uzytkownik.setHaslo(ZakodowaneHaslo);

		loginRepo.save(uzytkownik);

		return "pomyslna_rejestracja";

	}

	@GetMapping("/Panel_Administatora")

	public String ListaUzytkownikow(Model model) {

		List<Uzytkownik> listaUzytkownik = loginRepo.findAll();

		model.addAttribute("listaUzytkownik", listaUzytkownik);

		return "Panel_Administatora";

	}

	@GetMapping("/login")

	public String login() {

		return "index";

	}

	@GetMapping("/wysylanie")
	public String wysylanie() {

		return "wysylanie";

	}

	@GetMapping("/lista")
	public String lista() {

		return "lista";

	}

	@GetMapping("/usuwanie")
	public String usuwanie() {

		return "usuwanie";

	}

	@GetMapping("/error")

	public String blad() {

		return "error";

	}

	@Override

	public void zapisz(MultipartFile file) {

		var username_folder = getFolderUzytkownika();
		try {

			Files.copy(file.getInputStream(), username_folder.resolve(file.getOriginalFilename()));

		} catch (Exception e) {

			if (e instanceof FileAlreadyExistsException) {

				throw new RuntimeException("Taki plik już istnieje");

			}

			throw new RuntimeException(e.getMessage());

		}

	}

	@Override

	public Resource wyslij(String filename) {

		var username_folder = getFolderUzytkownika();
		try {

			Path file = username_folder.resolve(filename);

			Resource resource = new UrlResource(file.toUri());

			if (resource.exists() || resource.isReadable()) {

				return resource;

			} else {

				throw new RuntimeException("Nie udalo sie wrzucic pliku.");

			}

		} catch (MalformedURLException e) {

			throw new RuntimeException("Blad: " + e.getMessage());

		}

	}

	@Override

	public boolean usun(String filename) {

		var username_folder = getFolderUzytkownika();
		try {

			Path file = username_folder.resolve(filename);

			return Files.deleteIfExists(file);

		} catch (IOException e) {

			throw new RuntimeException("Blad: " + e.getMessage());

		}

	}

	@Override

	public Stream<Path> wczytaj() {

		var username_folder = getFolderUzytkownika();
		try {

			return Files.walk(username_folder, 1).filter(path -> !path.equals(username_folder))
					.map(username_folder::relativize);

		} catch (IOException e) {

			throw new RuntimeException("Nie udalo sie zaladowac plikow");

		}

	}
}
