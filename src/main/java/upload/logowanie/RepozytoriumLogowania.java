package upload.logowanie;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


public interface RepozytoriumLogowania extends JpaRepository<Uzytkownik, Long> {
	@Query("SELECT u FROM Uzytkownik u WHERE u.email = ?1")
	public Uzytkownik znajdzPoEmail(String email);
	
	@Query("SELECT u FROM Uzytkownik u WHERE u.kod_weyfikacyjny = ?1")
	public Uzytkownik znajdzPoKodzieWeryfikacyjnym(String code);
}
