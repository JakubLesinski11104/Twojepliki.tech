package aplikacja.logowanie;

import java.io.UnsupportedEncodingException;
import java.util.List;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

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
		
		uzytkownik.setKodWeryfikacyjny(losowy_kod);
		
		uzytkownik.setEnabled(false);

		repozytorium.save(uzytkownik);

		wyslijEmailWeryfikacyjny(uzytkownik, siteURL);
	}

	private void wyslijEmailWeryfikacyjny(Uzytkownik uzytkownik, String URL)
			throws MessagingException, UnsupportedEncodingException {

		String adresUzytkownika = uzytkownik.getEmail();
		
		String adresWychodzacy = "obsluga@twojepliki.tech";
		
		String nazwaNadawcy = "Rejestracja konta w serwisie twojepliki.tech";
		
		String tematEmaila = "Prosimy o weryfikację rejestracji konta";
		
		String trescEmaila = """
				<p>Witaj <b>[[email]]</b>!</p>
				<p>Dziękujemy za zarejestowanie w serwisie Twojepliki.tech!</p>
				<p>Kliknij poniższy link, aby zweryfikować swoje konto:</p>
				<h3><a href="[[URL]]" target="_self">WERYFIKUJ</a></h3>	
				<p>Jeśli nie rejestrowałeś/aś się w naszym serwisie, zignoruj ten e-mail.</p>
				<p>Dziękujemy za korzystanie z naszego serwisu!</p>
				<p><b>Serwis Twojepliki.tech!</b></p>\
				""";

		MimeMessage wiadomoscEmail = NadawcaEmail.createMimeMessage();
		
		MimeMessageHelper helperMime = new MimeMessageHelper(wiadomoscEmail);

		helperMime.setFrom(adresWychodzacy, nazwaNadawcy);
		
		helperMime.setTo(adresUzytkownika);
		
		helperMime.setSubject(tematEmaila);

		trescEmaila = trescEmaila.replace("[[email]]", uzytkownik.getEmail());
		String weryfikacjaURL = URL + "/weryfikacja?kod=" + uzytkownik.getKodWeryfikacyjny();

		trescEmaila = trescEmaila.replace("[[URL]]", weryfikacjaURL);

		helperMime.setText(trescEmaila, true);

		NadawcaEmail.send(wiadomoscEmail);

	}

	public boolean weryfikacja(String kod_weryfikacyjny) {
		
		Uzytkownik uzytkownik = repozytorium.znajdzPoKodzieWeryfikacyjnym(kod_weryfikacyjny);

		if (uzytkownik == null || uzytkownik.isEnabled()) {
			
			return false;
			
		} else {
			
			uzytkownik.setKodWeryfikacyjny(null);
			
			uzytkownik.setEnabled(true);
			
			repozytorium.save(uzytkownik);

			return true;
		}
}
	
	public void generujTokenResetowania(Uzytkownik uzytkownik, String siteURL)
	        throws UnsupportedEncodingException, MessagingException {
		
	    String token = RandomString.make(64);
	    
	    uzytkownik.setResetToken(token);
	    
	    repozytorium.save(uzytkownik);
	    
	    wyslijEmailResetowania(uzytkownik, siteURL);
	    
	}

	private void wyslijEmailResetowania(Uzytkownik uzytkownik, String siteURL)
	        throws UnsupportedEncodingException, MessagingException {
		
		String doAdresu = uzytkownik.getEmail();
		
        String temat = "Prośba o zresetowanie hasła";
        
        String linkResetowania = siteURL + "/reset_hasla?token=" + uzytkownik.getResetToken();
        
        String email = uzytkownik.getEmail();
            
        String tresc = "<p>Witaj, <b>" + email +"</b>!</p>"
                + "<p>Otrzymaliśmy prośbę o zresetowanie Twojego hasła w serwisie Twojepliki.tech. </p>"        
                + "<p>Kliknij poniżej, aby zresetować hasło:</p>"
                + "<p><a href=\"" + linkResetowania + "\" target=\"_self\"><b>RESETUJ MOJE HASŁO</b></a></p>"          
                + "<p>Jeśli nie wysyłałeś/aś prośby o resetowanie hasła, zignoruj ten e-mail.</p>"
                +"<p>Dziękujemy za korzystanie z naszego serwisu!</p>"
                +"<p><b>Serwis Twojepliki.tech!</b></p>";
        
        
        MimeMessage wiadomosc = NadawcaEmail.createMimeMessage();
        
        MimeMessageHelper helper = new MimeMessageHelper(wiadomosc);
        
        helper.setFrom(new InternetAddress("obsluga@twojepliki.tech", "Reset hasła w serwisie twojepliki.tech"));
        
        helper.setTo(doAdresu);
        
        helper.setSubject(temat);
        
        helper.setText(tresc, true);
        
        NadawcaEmail.send(wiadomosc);
        
	}

	public boolean resetujHaslo(String token, String noweHaslo) {
		
	    Uzytkownik uzytkownik = repozytorium.znajdzPoTokenieResetowania(token);
	    
	    if (uzytkownik == null) {
	    	
	        return false;
	        
	    }
	    
	    String zakodowaneHaslo = KoderHasla.encode(noweHaslo);
	    
	    uzytkownik.setHaslo(zakodowaneHaslo);
	    
	    uzytkownik.setResetToken(null);
	    
	    repozytorium.save(uzytkownik);
	    
	    return true;
	    
	}
	
}
