package aplikacja.usluga;

import java.nio.file.Path;
import java.util.stream.Stream;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface UsługaPrzechowywaniaPlikow {

	public void zapisz(MultipartFile file);

	public Resource wyslij(String filename);

	public boolean usun(String filename);

	public Stream<Path> wczytaj();
	
	public void zapiszudostepnij(MultipartFile file);
	
	public Resource wyslijudostepnij(String filename);

	public Stream<Path> wczytajAdmin();

}
