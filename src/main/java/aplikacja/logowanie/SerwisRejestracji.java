package aplikacja.logowanie;

import java.io.UnsupportedEncodingException;
import java.util.List;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import net.bytebuddy.utility.RandomString;

@Service
public class SerwisRejestracji {

	@Autowired
	private RepozytoriumLogowania repozytorium;
	
	@Autowired
	private PasswordEncoder KoderHasla;
	
	@Autowired
	private JavaMailSender NadawcaEmail;
	
	public List<Uzytkownik> lista() {
		return repozytorium.findAll();
	}
	
	public void rejestracja(Uzytkownik uzytkownik, String siteURL) 
			throws UnsupportedEncodingException, MessagingException {
		String zakodowane_haslo = KoderHasla.encode(uzytkownik.getHaslo());
		uzytkownik.setHaslo(zakodowane_haslo);
		
		String losowy_kod = RandomString.make(64);
		uzytkownik.setKodWeyfikacyjny(losowy_kod);
		uzytkownik.setEnabled(false);
		
		repozytorium.save(uzytkownik);
		
		wyslijEmailWeryfikacyjny(uzytkownik, siteURL);
	}
	
	private void wyslijEmailWeryfikacyjny(Uzytkownik uzytkownik, String URL) 
			throws MessagingException, UnsupportedEncodingException {
		
		String adresUzytkownika = uzytkownik.getEmail();
		String adresWychodzacy = "rejestracja@twojepliki.tech";
		String nazwaNadawcy = "Rejestracja konta w serwisie twojepliki.tech";
		String tematEmaila = "Prosimy o weryfikację rejestracji konta";
		String trescEmaila = "Pan/Pani [[name]],<br>"
				+ "<br>"
				+ "Dziękujemy za zarejestowanie w naszym serwisie!<br>"
				+ "Kliknij poniższy link, aby zweryfikować swoją rejestrację:<br>"
				+ "<h3><a href=\"[[URL]]\" target=\"_self\">WERYFIKUJ</a></h3>"
				+ "<br>"
				+ "Jeżeli to nie ty się rejestrowałeś/rejestrowałaś to nie klikaj w link i skontaktuj się z: kontakt@twojepliki.tech <br>"
				+ "Twojepliki.tech";
		
		MimeMessage wiadomoscEmail = NadawcaEmail.createMimeMessage();
		MimeMessageHelper helperMime = new MimeMessageHelper(wiadomoscEmail);
		
		helperMime.setFrom(adresWychodzacy, nazwaNadawcy);
		helperMime.setTo(adresUzytkownika);
		helperMime.setSubject(tematEmaila);
		
		trescEmaila = trescEmaila.replace("[[name]]", uzytkownik.getPelneDane());
		String weryfikacjaURL = URL + "/weryfikacja?kod=" + uzytkownik.getKodWeyfikacyjny();
		
		trescEmaila = trescEmaila.replace("[[URL]]", weryfikacjaURL);
		
		helperMime.setText(trescEmaila, true);
		
		NadawcaEmail.send(wiadomoscEmail);
		
	}
	
	public boolean weryfikacja(String kod_weyfikacyjny) {
		Uzytkownik uzytkownik = repozytorium.znajdzPoKodzieWeryfikacyjnym(kod_weyfikacyjny);
		
		if (uzytkownik == null || uzytkownik.isEnabled()) {
			return false;
		} else {
			uzytkownik.setKodWeyfikacyjny(null);
			uzytkownik.setEnabled(true);
			repozytorium.save(uzytkownik);
			
			return true;
		}
		
	}
	
}
