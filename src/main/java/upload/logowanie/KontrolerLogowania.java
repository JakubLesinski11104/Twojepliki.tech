package upload.logowanie;

import java.io.IOException;

import java.net.MalformedURLException;

import java.nio.file.FileAlreadyExistsException;

import java.nio.file.Files;

import java.nio.file.Path;

import java.nio.file.Paths;

import java.util.List;

import java.util.stream.Stream;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.core.io.Resource;

import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.stereotype.Controller;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.multipart.MultipartFile;

import upload.usluga.UsługaPrzechowywaniaPlikow;

@Controller
//@CrossOrigin("http://localhost:9000")
@CrossOrigin("https://localhost:443")
//Linux
//@CrossOrigin("https://141.148.241.107:9000")
//@CrossOrigin("https://141.148.241.107:443")
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

	@GetMapping("/kontakt")
	public String kontakt() {

		return "kontakt";

	}

	@GetMapping("/kontakt/JL")
	public String kontakt_JL() {

		return "JL";

	}

	@GetMapping("/kontakt/JP")
	public String kontakt_JP() {

		return "JP";

	}

	@GetMapping("/lis_wys_us")
	public String lis_wys_us() {

		return "lis_wys_us";

	}

	@GetMapping("/error")
	public String handleError(HttpServletRequest request) {

		String errorPage = "error";

		Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

		if (status != null) {
			Integer statusCode = Integer.valueOf(status.toString());

			if (statusCode == HttpStatus.NOT_FOUND.value()) {
				errorPage = "error/404";

			} else if (statusCode == HttpStatus.FORBIDDEN.value()) {
				errorPage = "error/403";

			} else if (statusCode == HttpStatus.INTERNAL_SERVER_ERROR.value()) {

				errorPage = "error/500";

			}
		}
		return errorPage;
	}

	public String getErrorPath() {
		return "/error";
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
