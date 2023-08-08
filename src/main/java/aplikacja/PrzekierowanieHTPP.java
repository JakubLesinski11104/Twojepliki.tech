package aplikacja;

import org.apache.catalina.Context;
import org.apache.catalina.connector.Connector;
import org.apache.coyote.http11.Http11NioProtocol;
import org.apache.tomcat.util.descriptor.web.SecurityCollection;
import org.apache.tomcat.util.descriptor.web.SecurityConstraint;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PrzekierowanieHTPP {
	@Bean
public TomcatServletWebServerFactory PrzekierowanieHTPPS() {
		return new TomcatServletWebServerFactory() {
	@Override
	protected void postProcessContext(Context context) {
		SecurityConstraint ograniczenie_bezpieczenstwa = new SecurityConstraint();
		ograniczenie_bezpieczenstwa.setUserConstraint("CONFIDENTAL");
		SecurityCollection collection = new SecurityCollection();
		collection.addPattern("/*");
		ograniczenie_bezpieczenstwa.addCollection(collection);
		context.addConstraint(ograniczenie_bezpieczenstwa);
	}
		
	{
		getAdditionalTomcatConnectors().add(0,przekierowanie());
	}
};
	}
		private Connector przekierowanie() {
			return new Connector(Http11NioProtocol.class.getName()) {{
				setScheme("http");
				setPort(80);
				setSecure(false);
				setRedirectPort(443);
			}
		};
}}