package upload.logowanie;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "Uzytkownik")
public class Uzytkownik {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 40)
	private String email;

	@Column(name = "username", nullable = false, unique = true, length = 20)
	private String username;

	@Column(nullable = false, length = 100)
	private String haslo;

	@Column(name = "imie", nullable = false, length = 15)
	private String imie;

	@Column(name = "nazwisko", nullable = false, length = 20)
	private String nazwisko;
	
	@Column(name = "kod_weyfikacyjny", length = 64)
	private String kod_weyfikacyjny;

	private boolean enabled;
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getHaslo() {
		return haslo;
	}

	public void setHaslo(String haslo) {
		this.haslo = haslo;
	}

	public String getImie() {
		return imie;
	}

	public void setImie(String imie) {
		this.imie = imie;
	}

	public String getNazwisko() {
		return nazwisko;
	}

	public void setNazwisko(String nazwisko) {
		this.nazwisko = nazwisko;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}
	
	public String getKodWeyfikacyjny() {
		return kod_weyfikacyjny;
	}

	public void setKodWeyfikacyjny(String kod_weyfikacyjny) {
		this.kod_weyfikacyjny = kod_weyfikacyjny;
	}
	
	public String getPelneDane() {
		return this.imie + " " + this.nazwisko;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}
}
