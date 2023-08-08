package aplikacja.logowanie;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class SzczegolyUzytkownika implements UserDetails {

	private Uzytkownik uzytkownik;

	public SzczegolyUzytkownika(Uzytkownik uzytkownik) {
		this.uzytkownik = uzytkownik;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return null;
	}

	@Override
	public String getPassword() {
		return uzytkownik.getHaslo();
	}

	@Override
	public String getUsername() {
		return uzytkownik.getUsername();
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return uzytkownik.isEnabled();
	}

	public String getImieNazwisko() {
		return uzytkownik.getImie() + " " + uzytkownik.getNazwisko();
	}

}
