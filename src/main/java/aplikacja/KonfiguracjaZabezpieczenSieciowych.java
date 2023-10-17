package aplikacja;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import aplikacja.logowanie.UslugaDaneUzytkownika;

@Configuration
public class KonfiguracjaZabezpieczenSieciowych {

	@Bean
	public UserDetailsService userDetailsService() {
		
		return new UslugaDaneUzytkownika();
	
	}

	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		
		return new BCryptPasswordEncoder();
	
	}

	@Bean
	public DaoAuthenticationProvider authenticationProvider() {
		
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
		
		authProvider.setUserDetailsService(userDetailsService());
		
		authProvider.setPasswordEncoder(passwordEncoder());

		return authProvider;
	
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
		
		return authenticationConfiguration.getAuthenticationManager();
	
	
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

		 http.authenticationProvider(authenticationProvider())
	       .authorizeRequests()

				.requestMatchers("/js/**", "/css/**").permitAll()

				.requestMatchers("/pliki").authenticated()

				.requestMatchers("/wyslij").authenticated()

				.requestMatchers("/pliki/").authenticated()

				.requestMatchers("/katalog").authenticated()

				.requestMatchers("/udostepnijplik").authenticated()

				.requestMatchers("/udostepnij").authenticated()
				
				.requestMatchers("/Panel_Administatora").authenticated()

				.requestMatchers("/plikiAdmin").authenticated()
				
				.requestMatchers("/wyslijAdmin").authenticated()
				
				.anyRequest().permitAll()

				.and()
				.formLogin()
				.loginPage("/login")
				.usernameParameter("email")
				.passwordParameter("haslo")
				.defaultSuccessUrl("/").permitAll()

				.and()
				.logout()
				.logoutUrl("/wyloguj")
				.logoutSuccessUrl("/").permitAll();

		http.csrf().disable();
		http.cors().disable();

		return http.build();
	
	}

}