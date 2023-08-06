package upload.kontroler;

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
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.multipart.MultipartFile;

import upload.logowanie.RepozytoriumLogowania;
import upload.logowanie.Uzytkownik;
import upload.usluga.UsługaPrzechowywaniaPlikow;

@Controller
@CrossOrigin("https://localhost:443")
//Linux
//@CrossOrigin("https://141.148.241.107:443")
//@CrossOrigin("https://wspoldzielenieplikow.me:443")
//@CrossOrigin("https://twojepliki.tech:443")
public class KontrolerLogowania implements UsługaPrzechowywaniaPlikow {

	@Autowired

	private RepozytoriumLogowania loginRepo;

	@GetMapping("/")

	public String StronaLogowania() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.isAuthenticated()) {
			return "redirect:/glowna";
		}
		return "index";

	}

	@GetMapping("/glowna")

	public String StronaGlowna() {

		

		return "glowna";

	}
	
	@GetMapping("/rejestracja")

	public String Rejestracja(Model model) {
		
		model.addAttribute("uzytkownik", new Uzytkownik());

		return "rejestracja";

	}


	@PostMapping("/proces_rejestracji")

	public String procesRejestracji(@ModelAttribute("uzytkownik") Uzytkownik uzytkownik, Model model) {

		if (uzytkownik.getEmail() == null || uzytkownik.getEmail().isEmpty() || !uzytkownik.getEmail().contains("@")
				|| uzytkownik.getEmail().length() < 6) {
			model.addAttribute("komunikat_email",
					"Wprowadzony email musi zawierac minimum 6 znaków i musi zawierać @!");
			return "rejestracja";
		}
		if (uzytkownik.getUsername() == null || uzytkownik.getUsername().isEmpty()
				|| !uzytkownik.getUsername().matches("^[a-zA-Z0-9]).{6,}$")) {
			model.addAttribute("komunikat_username",
					"Nazwa uzytkownika musi zawierać mimimum 6 znaków i nie moze zawierać znaków specjalnych!");
			return "rejestracja";
		}

		if (uzytkownik.getHaslo() == null || uzytkownik.getHaslo().isEmpty() || uzytkownik.getHaslo().length() < 6
				|| !uzytkownik.getHaslo().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9!@#$%^&*]).{6,}$")) {
			model.addAttribute("komunikat_haslo",
					"Hasło musi zawierać co najmniej jedną małą literę, jedną dużą literę, oraz znak specjalny lub cyfrę.");
			return "rejestracja";
		}

		if (uzytkownik.getImie() == null || uzytkownik.getImie().isEmpty() || uzytkownik.getImie().length() < 2) {
			model.addAttribute("komunikat_imie", "Pole imię jest wymagane!");
			return "rejestracja";
		}

		if (uzytkownik.getNazwisko() == null || uzytkownik.getNazwisko().isEmpty()
				|| uzytkownik.getNazwisko().length() < 2) {
			model.addAttribute("komunikat_nazwisko", "Pole nazwisko jest wymagane!");

			return "rejestracja";
		}
		
		BCryptPasswordEncoder EnkoderHasla = new BCryptPasswordEncoder();

		String ZakodowaneHaslo = EnkoderHasla.encode(uzytkownik.getHaslo());

		uzytkownik.setHaslo(ZakodowaneHaslo);

		loginRepo.save(uzytkownik);

		return "pomyslna_rejestracja";

	}
	
	
	@GetMapping("/Panel_Administatora")

	public String Panel_Administatora(Model model) {
		
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String nazwa = auth.getName();

        if (!"admin".equals(nazwa)) {
            return "redirect:/";
        }
		
		List<Uzytkownik> listaUzytkownik = loginRepo.findAll();

		model.addAttribute("listaUzytkownik", listaUzytkownik);

		return "Panel_Administatora";
	}
	
	private String plikAdmin;

	@PostMapping("/Panel_Administatora")
	@ResponseBody
	public String Panel_Administatora(@RequestParam("adminpliki") String adminpliki) {
		plikAdmin = adminpliki;

		return "Panel_Administatora";
	}

	public Path getPlikiDlaAdmina() {
		var plik_Admin = Paths.get("Wyslane_pliki", plikAdmin);

		return plik_Admin;

	}

	@GetMapping("/login")

	public String login() {

		return "index";

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
	
	
	@GetMapping("/katalog")
	public String katalog() {
		

		return "katalog";

	}
	
	private String podfolder;
	@PostMapping("/katalog")
	@ResponseBody
	public String katalogPost(@RequestParam("pod_folder") String pod_folder) {
		
		podfolder = pod_folder;

		return "katalog";

	}
	
	

	@GetMapping("/regulamin")
	public String regulamin() {

		return "regulamin";

	}

	@GetMapping("/udostepnij")
	public String udostepnijplik() {

		return "udostepnij";

	}

	private String udostepnijplik;

	@PostMapping("/udostepnij")
	@ResponseBody
	public String udostepnijplik(@RequestParam("udostepnij") String udostepnij) {
		udostepnijplik = udostepnij;
		
		
		return "udostepnij";
	}

	public Path getUdostepnijUzytkownika() {
		var udostepnij_folder = Paths.get("Wyslane_pliki", udostepnijplik);

		return udostepnij_folder;

	}
	
	public Path getFolderUzytkownika() {

		Authentication auth = SecurityContextHolder.getContext().getAuthentication();

		String username = auth.getName();
		
		if(podfolder != null) {
			var username_folder = Paths.get("Wyslane_pliki", username, podfolder);
			try {

				Files.createDirectories(username_folder);

			} catch (IOException e) {

				throw new RuntimeException("Nie utworzono folderu");

			}
			return username_folder;
		}
		
			var username_folder = Paths.get("Wyslane_pliki", username);
			try {

				Files.createDirectories(username_folder);

			} catch (IOException e) {

				throw new RuntimeException("Nie utworzono folderu");

			}

		return username_folder;
		

	}

	@GetMapping("/error")
	public String error(HttpServletRequest request) {

		String Strona_error = "error";

		Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

		if (status != null) {
			Integer statusCode = Integer.valueOf(status.toString());

			if (statusCode == HttpStatus.NOT_FOUND.value()) {
				Strona_error = "error/404";

			} else if (statusCode == HttpStatus.INTERNAL_SERVER_ERROR.value()) {

				Strona_error = "error/500";

			}
		}
		return Strona_error;
	}

	public String sciezkaError() {
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

	@Override

	public void zapiszudostepnij(MultipartFile file) {

		var username_folder = getUdostepnijUzytkownika();
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
	public Resource wyslijudostepnij(String filename) {
		var username_folder = getUdostepnijUzytkownika();
		try {

			Path file = username_folder.resolve(filename);

			Resource resource = new UrlResource(file.toUri());

			if (resource.exists() || resource.isReadable()) {

				return resource;

			} else {

				throw new RuntimeException("Nie udalo sie udostepnic pliku.");

			}

		} catch (MalformedURLException e) {

			throw new RuntimeException("Blad: " + e.getMessage());

		}
	}
	@Override
	public Stream<Path> wczytajAdmin() {

		var username_folder = getPlikiDlaAdmina();
		try {

			return Files.walk(username_folder, 1).filter(path -> !path.equals(username_folder))
					.map(username_folder::relativize);

		} catch (IOException e) {

			throw new RuntimeException("Nie udalo sie zaladowac plikow");

		}

	}
}