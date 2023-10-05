package aplikacja.logowanie;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

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

	@Column(name = "kod_weryfikacyjny", length = 64)
	private String kod_weryfikacyjny;

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

	public String getKodWeryfikacyjny() {
		return kod_weryfikacyjny;
	}

	public void setKodWeryfikacyjny(String kod_weyrfikacyjny) {
		this.kod_weryfikacyjny = kod_weyrfikacyjny;
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
