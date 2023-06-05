package upload.logowanie;



import java.io.IOException;

import java.net.MalformedURLException;

import java.net.URI;

import java.nio.file.FileAlreadyExistsException;

import java.nio.file.Files;

import java.nio.file.Path;

import java.nio.file.Paths;

import java.util.List;

import java.util.stream.Stream;



import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.core.io.Resource;

import org.springframework.core.io.UrlResource;

import org.springframework.security.authentication.AnonymousAuthenticationToken;

import org.springframework.security.core.Authentication;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.stereotype.Controller;

import org.springframework.ui.Model;

import org.springframework.util.FileSystemUtils;

import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.ModelAttribute;

import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.SessionAttributes;

import org.springframework.web.multipart.MultipartFile;



import upload.service.FilesStorageService;



@Controller


public class AppController implements FilesStorageService {



	@Autowired

	private UserRepository userRepo;



	@GetMapping("/")

	public String viewHomePage() {

		
		
		

		
		return "index";

	}
	
	

	
	@GetMapping("/glowna")

	public String HomePage() {

		var username_folder = getUserFolder();

		System.out.println(username_folder);

		try {



			Files.createDirectories(username_folder);

		} catch (IOException e) {

			throw new RuntimeException("Could not initialize folder for upload!");

		}
		
		
		
		
		return "glowna";

	}
	
	public Path getUserFolder() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();

		String username = auth.getName();

		System.out.println(username);



		var username_folder = Paths.get("wysylane_pliki/", username);
		
		return username_folder;
		
	}
	
	
	//private String username_folder;
	//private Path root = Paths.get("uploads");


	@GetMapping("/rejestracja")

	public String showRegistrationForm(Model model) {

		model.addAttribute("user", new User());



		return "rejestracja";

	}



	@PostMapping("/proces_rejestracji")

	public String processRegister(User user) {

		BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

		String encodedPassword = passwordEncoder.encode(user.getPassword());

		user.setPassword(encodedPassword);



		userRepo.save(user);



		return "pomyslna_rejestracja";

	}



	@GetMapping("/Panel_Administatora")

	public String listUsers(Model model) {

		List<User> listUsers = userRepo.findAll();

		model.addAttribute("listUsers", listUsers);



		return "Panel_Administatora";

	}



	@GetMapping("/login")

	public String viewLoginPage() {



		
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
	

//	@Override

//	public void init() {



//		try {



//			Files.createDirectories(root);

//		} catch (IOException e) {

//			throw new RuntimeException("Could not initialize folder for upload!");

//		}

//	}

	@Override

	public void save(MultipartFile file) {
		var username_folder = getUserFolder();
		try {

			Files.copy(file.getInputStream(), username_folder.resolve(file.getOriginalFilename()));

		} catch (Exception e) {

			if (e instanceof FileAlreadyExistsException) {

				throw new RuntimeException("A file of that name already exists.");

			}



			throw new RuntimeException(e.getMessage());

		}

	}



	@Override

	public Resource load(String filename) {
		var username_folder = getUserFolder();
		try {

			Path file = username_folder.resolve(filename);

			Resource resource = new UrlResource(file.toUri());



			if (resource.exists() || resource.isReadable()) {

				return resource;

			} else {

				throw new RuntimeException("Could not read the file!");

			}

		} catch (MalformedURLException e) {

			throw new RuntimeException("Error: " + e.getMessage());

		}

	}



	@Override

	public boolean delete(String filename) {
		var username_folder = getUserFolder();
		try {

			Path file = username_folder.resolve(filename);

			return Files.deleteIfExists(file);

		} catch (IOException e) {

			throw new RuntimeException("Error: " + e.getMessage());

		}

	}



	@Override

	public void deleteAll() {
		var username_folder = getUserFolder();

		FileSystemUtils.deleteRecursively(username_folder.toFile());

	}



	@Override

	public Stream<Path> loadAll() {
		var username_folder = getUserFolder();
		try {

			return Files.walk(username_folder, 1).filter(path -> !path.equals(username_folder)).map(username_folder::relativize);

		} catch (IOException e) {

			throw new RuntimeException("Could not load the files!");

		}

	}
}

