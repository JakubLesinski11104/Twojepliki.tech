package aplikacja.kontroler;

import java.io.UnsupportedEncodingException;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import aplikacja.logowanie.RepozytoriumLogowania;
import aplikacja.logowanie.SerwisRejestracji;
import aplikacja.logowanie.Uzytkownik;


@Controller
@CrossOrigin("https://localhost:443")
//Linux
//@CrossOrigin("https://twojepliki.tech:443")
public class KontrolerLogowania {

	@Autowired

	private SerwisRejestracji Serwis_Logowania;

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

	public String procesRejestracji(@ModelAttribute("uzytkownik") Uzytkownik uzytkownik, Model model, HttpServletRequest request) throws UnsupportedEncodingException, MessagingException {

		if (uzytkownik.getEmail() == null || uzytkownik.getEmail().isEmpty() || !uzytkownik.getEmail().contains("@")
				|| uzytkownik.getEmail().length() < 6) {
			model.addAttribute("komunikat_email",
					"Wprowadzony email musi zawierac minimum 6 znaków i musi zawierać @!");
			return "rejestracja";
		}
		if (uzytkownik.getUsername() == null || uzytkownik.getUsername().isEmpty()
				|| !uzytkownik.getUsername().matches("^[a-zA-Z0-9]+$")) {
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
		
		Serwis_Logowania.rejestracja(uzytkownik, getURL(request));	

		return "pomyslna_rejestracja";

	}
	
	@GetMapping("/login")

	public String login() {

		return "index";

	}
	
	private String getURL(HttpServletRequest request) {
		String URL = request.getRequestURL().toString();
		return URL.replace(request.getServletPath(), "");
	}	
	
	@GetMapping("/weryfikacja")
	public String weryfikacjaUzytkownika(@Param("kod") String kod) {
		if (Serwis_Logowania.weryfikacja(kod)) {
			return "poprawna_weyfikacja";
		} else {
			return "niepoprawna_weyfikacja";
		}
	}
}