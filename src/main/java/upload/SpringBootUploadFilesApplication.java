package upload;

import javax.annotation.Resource;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import upload.usluga.UsługaPrzechowywaniaPlikow;

@SpringBootApplication
public class SpringBootUploadFilesApplication implements CommandLineRunner {
	@Resource
	UsługaPrzechowywaniaPlikow storageService;

	public static void main(String[] args) {
		SpringApplication.run(SpringBootUploadFilesApplication.class, args);
	}

	@Override
	public void run(String... arg) throws Exception {

	}
}
