package aplikacja.logowanie;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public class UslugaDaneUzytkownika implements UserDetailsService {

	@Autowired
	private RepozytoriumLogowania loginRepo;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		Uzytkownik user = loginRepo.znajdzPoEmail(email);
		if (user == null) {
			throw new UsernameNotFoundException("Nie znaleziono uzytkownika");
		}
		return new SzczegolyUzytkownika(user);
	}

}
