package aplikacja.kontroler;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Stream;

import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import aplikacja.logowanie.RepozytoriumLogowania;
import aplikacja.logowanie.SzczegolyUzytkownika;
import aplikacja.logowanie.Uzytkownik;
import aplikacja.usluga.UsługaPrzechowywaniaPlikow;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;


@Controller
@CrossOrigin("https://localhost:443")
//Linux
//@CrossOrigin("https://twojepliki.tech:443")

public class KontrolerPodstron implements UsługaPrzechowywaniaPlikow {

	
	@Autowired
	
	private RepozytoriumLogowania loginRepo;
	
	@Autowired
	
	private JavaMailSender NadawcaEmail;

	@GetMapping("/Panel_Administatora")

	public String Panel_Administatora(Model model, HttpServletRequest request) {

		model.addAttribute("username", request.getUserPrincipal().getName());

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

	public String Panel_Administatora(@RequestParam String adminpliki) {

		plikAdmin = adminpliki;

		return "Panel_Administatora";

	}

	public Path getPlikiDlaAdmina() {

		var plik_Admin = Paths.get("Wyslane_pliki", plikAdmin);

		return plik_Admin;

	}

	@GetMapping("/kontakt")

	public String kontakt() {

		return "kontakt";

	}

	@GetMapping("/katalog")

	public String katalog(Model model, HttpServletRequest request) {
		
		String username_folder = getUsernameFolder(request);

		model.addAttribute("username_folder", username_folder);

		SzczegolyUzytkownika uzytkownikSzczegoly = (SzczegolyUzytkownika) SecurityContextHolder.getContext().getAuthentication()
				.getPrincipal();

		if (uzytkownikSzczegoly instanceof SzczegolyUzytkownika) {

			SzczegolyUzytkownika szczegolyUzytkownika = (SzczegolyUzytkownika) uzytkownikSzczegoly;

			model.addAttribute("ImieNazwisko", szczegolyUzytkownika.getImieNazwisko());
			
			model.addAttribute("username", szczegolyUzytkownika.getUsername());
		}

		return "katalog";
	}

	private String podfolder_przechodzenie;
	
	private String podfolderUsun;

	@PostMapping("/katalog")
	
	@ResponseBody

	public String katalogPost(@RequestParam String pod_folder, HttpServletRequest request, @RequestParam String pod_folderUsun) {

		request.getSession().setAttribute("podfolder", pod_folder);

		podfolder_przechodzenie = pod_folder;
		
		if (pod_folderUsun == null || pod_folderUsun.isEmpty()) {

			return "katalog";

		}

		podfolderUsun = pod_folderUsun;

		return "success";

	}

	private String getUsernameFolder(HttpServletRequest request) {

		String username = "Katalog domowy";

		String podfolder = (String) request.getSession().getAttribute("podfolder");

		if (podfolder != null && !podfolder.isEmpty()) {

			return podfolder;

		} else {

			return username;

		}

	}

	@GetMapping("/regulamin")

	public String regulamin() {

		return "regulamin";

	}

	@GetMapping("/udostepnij")

	public String udostepnijplik(Model model, HttpServletRequest request) {
		
		SzczegolyUzytkownika uzytkownikSzczegoly = (SzczegolyUzytkownika) SecurityContextHolder.getContext().getAuthentication()
				.getPrincipal();
		
		if (uzytkownikSzczegoly instanceof SzczegolyUzytkownika) {

			SzczegolyUzytkownika szczegolyUzytkownika = (SzczegolyUzytkownika) uzytkownikSzczegoly;

			model.addAttribute("ImieNazwisko", szczegolyUzytkownika.getImieNazwisko());
			
			model.addAttribute("username", szczegolyUzytkownika.getUsername());
		}
		return "udostepnij";

	}

	private String udostepnijplik;

	@PostMapping("/udostepnij")
	
	@ResponseBody

	public String udostepnijplik(Model model, HttpServletRequest request, @RequestParam String udostepnij,@RequestParam String nowaNazwaPliku) {
		 String username = null;
	
		 if (udostepnij == null || udostepnij.isEmpty()) {
		        return "katalog";
		    }
		SzczegolyUzytkownika uzytkownikSzczegoly = (SzczegolyUzytkownika) SecurityContextHolder.getContext().getAuthentication()
				.getPrincipal();

		if (uzytkownikSzczegoly instanceof SzczegolyUzytkownika) {

			SzczegolyUzytkownika szczegolyUzytkownika = (SzczegolyUzytkownika) uzytkownikSzczegoly;

			model.addAttribute("ImieNazwisko", szczegolyUzytkownika.getImieNazwisko());
			
			model.addAttribute("username", szczegolyUzytkownika.getUsername());
			
	        username = szczegolyUzytkownika.getUsername();

		}
		
		udostepnijplik = udostepnij;
		
		try {
			
	        Uzytkownik uzytkownik = loginRepo.znajdzPoUsername(udostepnij);
	        
	        if (uzytkownik == null || uzytkownik.getEmail() == null || uzytkownik.getEmail().isEmpty()) {
	        	
	            return "błąd";
	            
	        }
      
	        String adresUzytkownika = uzytkownik.getEmail();
			
			String adresWychodzacy = "obsluga@twojepliki.tech";
			
			String nazwaNadawcy = "Udostępniono dla Ciebie plik w serwisie twojepliki.tech";
						
			String tematEmaila = "Udostępniono nowy plik!";
			
			String trescEmaila = """
					<center>
<div class="window__content" style="padding: 15px 20px; background: #f4f5f5;">

<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;"> </p>
<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;">Witaj, <b>[[email]]</b></p>
<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;"> </p>
<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;">Uzytkownik <b>[[username]]</b> właśnie udostępnił dla Ciebie plik o nazwie: <b>[[nowaNazwaPliku]]</b></p>
<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;"> </p>
<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;">Znajdziesz go w swoim katalogu <b>Udostepnione</b>.</p>
<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;"> </p>

</p>

	<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;"><b>Dziękujemy za korzystanie z naszego serwisu!</b>

</p>
	<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;"><strong><span>Serwis</span></strong></p>
	<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;"><span><span>twojepliki.tech</span></span></p>
	<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;"> </p>
	
	<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;">
		Mail:
		<a href="mailto:kontakt@twojepliki.tech" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: #1a7676;">
			<span>kontakt@twojepliki.tech</span>
		</a>
	</p>
	<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;"> </p>
	<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;">
		<a href="https://twojepliki.tech/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="text-decoration: none; color: #1a7676;">
			<span>https://twojepliki.tech/</span>
		</a>
	</p>
	<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;"> </p>
	<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;">
		<img class="logo" src="https://i.postimg.cc/mgJtb0hD/icons8-disk-32.png" alt="LOGO" style="max-width: 150px; height: auto;">
	</p>
	<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;"> </p>
	<p style="font-size: 10pt; font-family: Verdana, sans-serif, serif, EmojiFont; margin: 0; line-height: 1.3; color: #333333;">
		<strong><span>Twojepliki.tech</span></strong>
	</p>
	
	

</div>            
</center>
					
				
					""";

			MimeMessage wiadomoscEmail = NadawcaEmail.createMimeMessage();
			
			MimeMessageHelper helperMime = new MimeMessageHelper(wiadomoscEmail);

			helperMime.setFrom(adresWychodzacy, nazwaNadawcy);
			
			helperMime.setTo(adresUzytkownika);
			
			helperMime.setSubject(tematEmaila);

			trescEmaila = trescEmaila.replace("[[email]]", uzytkownik.getEmail());
			
			trescEmaila = trescEmaila.replace("[[username]]", username);
			
			trescEmaila = trescEmaila.replace("[[nowaNazwaPliku]]", nowaNazwaPliku);

			helperMime.setText(trescEmaila, true);

			NadawcaEmail.send(wiadomoscEmail);

	        return "udostepnij";
	        
	    } catch (Exception e) {
	    	
	        e.printStackTrace();
	        
	        return "error";
	        
	    }
		
	}

	public Path getUdostepnijUzytkownika() {

		var udostepnij_folder = Paths.get("Wyslane_pliki", udostepnijplik, "/Udostepnione");

		return udostepnij_folder;

	}

	public Path getFolderUzytkownika() {

		Authentication auth = SecurityContextHolder.getContext().getAuthentication();

		String username = auth.getName();

		if (podfolderUsun != null) {

			var username_folderUsun = Paths.get("Wyslane_pliki", username, podfolderUsun);

			File usernameFolderUsun = username_folderUsun.toFile();

			try {

				FileUtils.deleteDirectory(usernameFolderUsun);
			} catch (IOException e) {

			}
		}

		if (podfolder_przechodzenie != null) {

			var username_folder = Paths.get("Wyslane_pliki", username, podfolder_przechodzenie);

			var Udostepnioneusername_folder = Paths.get("Wyslane_pliki", username, "/Udostepnione");

			try {

				Files.createDirectories(username_folder);

				Files.createDirectories(Udostepnioneusername_folder);

			} catch (IOException e) {

				throw new RuntimeException("Nie utworzono folderu");

			}

			return username_folder;
		}

		var username_folder = Paths.get("Wyslane_pliki", username);

		var Udostepnioneusername_folder = Paths.get("Wyslane_pliki", username, "/Udostepnione");

		try {

			Files.createDirectories(username_folder);

			Files.createDirectories(Udostepnioneusername_folder);

		} catch (IOException e) {

			throw new RuntimeException("Nie utworzono folderu");

		}

		return username_folder;

	}

	@GetMapping("/błąd")

	public String błąd(HttpServletRequest request) {

		String Strona_błąd = "błąd";

		Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

		if (status != null) {

			Integer statusCode = Integer.valueOf(status.toString());

			if (statusCode == HttpStatus.NOT_FOUND.value()) {

				Strona_błąd = "błąd/404";

			} else if (statusCode == HttpStatus.INTERNAL_SERVER_ERROR.value()) {

				Strona_błąd = "błąd/500";

			}
		}

		return Strona_błąd;

	}

	public String sciezkaBłąd() {

		return "/błąd";

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
	
	@Override

	public boolean usunAdmin(String filename) {

		var username_folder = getPlikiDlaAdmina();

		try {

			Path file = username_folder.resolve(filename);

			return Files.deleteIfExists(file);

		} catch (IOException e) {

			throw new RuntimeException("Blad: " + e.getMessage());

		}

	}
	
	@Override

	public Resource wyslijAdmin(String filename) {

		var username_folder = getPlikiDlaAdmina();

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

	public void zapiszAdmin(MultipartFile file) {

		var username_folder = getPlikiDlaAdmina();

		try {

			Files.copy(file.getInputStream(), username_folder.resolve(file.getOriginalFilename()));

		} catch (Exception e) {

			if (e instanceof FileAlreadyExistsException) {

				throw new RuntimeException("Taki plik już istnieje");

			}

			throw new RuntimeException(e.getMessage());

		}

	}
}