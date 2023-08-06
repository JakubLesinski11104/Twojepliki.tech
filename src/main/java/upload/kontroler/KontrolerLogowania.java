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
public class KontrolerLogowania {

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
	
	@GetMapping("/login")

	public String login() {

		return "index";

	}
}