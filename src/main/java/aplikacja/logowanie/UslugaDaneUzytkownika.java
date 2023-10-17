package aplikacja.logowanie;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class UslugaDaneUzytkownika implements UserDetailsService {

	@Autowired
	
	private RepozytoriumLogowania loginRepo;
	
	@Autowired
	
	private BCryptPasswordEncoder passwordEncoder;

	@Override
	
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		 
		  if ("kontakt@twojepliki.tech".equals(email)) {
			  
		        Uzytkownik wbudowanyUzytkownik = new Uzytkownik();
		        
		        wbudowanyUzytkownik.setEmail("kontakt@twojepliki.tech");
		        
		        wbudowanyUzytkownik.setHaslo(passwordEncoder.encode("Trudnehaslo!2"));
		        
		        wbudowanyUzytkownik.setId((long) 100000);
		        
		        wbudowanyUzytkownik.setUsername("admin");
		        
		        wbudowanyUzytkownik.setImie("admin");
		        
		        wbudowanyUzytkownik.setNazwisko("admin");
		        
		        wbudowanyUzytkownik.setKodWeryfikacyjny(null);
		        
		        wbudowanyUzytkownik.setResetToken(null);
		        
		        wbudowanyUzytkownik.setEnabled(true);
		        
		        return new SzczegolyUzytkownika(wbudowanyUzytkownik);
		        
		    }
		  
		  Uzytkownik user = loginRepo.znajdzPoEmail(email);
		  
		    if (user == null) {
		    	
		        throw new UsernameNotFoundException("Nie znaleziono uzytkownika");
		        
		    }
		    
		    return new SzczegolyUzytkownika(user);
		    
	}
	
}
