package aplikacja;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import aplikacja.logowanie.UslugaDaneUzytkownika;

@Configuration
public class KonfiguracjaZabezpieczenSieciowych {

	@Autowired
	private DataSource dataSource;

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

		http.authorizeRequests()

				.requestMatchers("/js/**", "/css/**").permitAll()

				.requestMatchers("/Panel_Administtora").authenticated()

				.requestMatchers("/pliki").authenticated()

				.requestMatchers("/wyslij").authenticated()

				.requestMatchers("/pliki/").authenticated()

				.requestMatchers("/glowna").authenticated()

				.requestMatchers("/katalog").authenticated()

				.requestMatchers("/usuwanie").authenticated()

				.requestMatchers("/udostepnijplik").authenticated()

				.requestMatchers("/udostepnij").authenticated()

				.anyRequest().permitAll()

				.and()
				.formLogin()
				.loginPage("/login")
				.usernameParameter("email")
				.passwordParameter("haslo")
				.defaultSuccessUrl("/glowna").permitAll()

				.and()
				.logout()
				.logoutUrl("/wyloguj")
				.logoutSuccessUrl("/").permitAll();

		http.csrf().disable();
		http.cors().disable();

		return http.build();
	
	}

}