package upload.logowanie;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
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

	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth.authenticationProvider(authenticationProvider());
	}

	@Override

	protected void configure(HttpSecurity http) throws Exception {
		
		http.authorizeRequests()
		
				.antMatchers("/js/**", "/css/**").permitAll()

				.antMatchers("/lis_wys_us").authenticated()

				.antMatchers("/Panel_Administtora").authenticated()

				.antMatchers("/wysylanie").authenticated().

				antMatchers("/lista").authenticated()

				.antMatchers("/usuwanie").authenticated()

				.antMatchers("/pliki").authenticated()

				.antMatchers("/wyslij").authenticated()

				.antMatchers("/pliki/").authenticated()

				.antMatchers("/glowna").authenticated()

				.anyRequest().permitAll()

				.and().formLogin().loginPage("/login").usernameParameter("email").defaultSuccessUrl("/glowna")
				.permitAll().and().logout().logoutSuccessUrl("/").permitAll();

		http.csrf().disable();
		http.cors().disable();
		

	}

}
