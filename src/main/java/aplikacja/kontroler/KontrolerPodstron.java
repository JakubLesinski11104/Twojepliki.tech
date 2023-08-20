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
import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;

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
import aplikacja.logowanie.Uzytkownik;
import aplikacja.usluga.UsługaPrzechowywaniaPlikow;

@Controller
@CrossOrigin("https://localhost:443")
//Linux
//@CrossOrigin("https://twojepliki.tech:443")
public class KontrolerPodstron implements UsługaPrzechowywaniaPlikow {

	@Autowired

	private RepozytoriumLogowania loginRepo;
	
	
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
	
	@GetMapping("/usuwanie")
	public String usuwanie() {
		
		return "usuwanie";
	}

	private String podfolderUsun;
	
	@PostMapping("/usuwanie")
	@ResponseBody
	public String usuwaniePost(@RequestParam("pod_folderUsun") String pod_folderUsun) {
		
		podfolderUsun = pod_folderUsun;
		
		return "usuwanie";
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
		var udostepnij_folder = Paths.get("Wyslane_pliki", udostepnijplik, "/Udostępnione");
		return udostepnij_folder;
	}
	
	public Path getFolderUzytkownika() {

		Authentication auth = SecurityContextHolder.getContext().getAuthentication();

		String username = auth.getName();
		
		if(podfolderUsun != null) {
			var username_folderUsun = Paths.get("Wyslane_pliki", username, podfolderUsun);
			File usernameFolderUsun = username_folderUsun.toFile();
			
			try {
			    FileUtils.deleteDirectory(usernameFolderUsun);
			} catch (IOException e) {
			}
		}
		
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
			var Udostepnioneusername_folder = Paths.get("Wyslane_pliki", username, "/Udostępnione");
			try {

				Files.createDirectories(username_folder);
				Files.createDirectories(Udostepnioneusername_folder);

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