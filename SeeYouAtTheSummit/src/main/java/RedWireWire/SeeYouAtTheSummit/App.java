package RedWireWire.SeeYouAtTheSummit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;


@SpringBootApplication
@EnableWebSocket
public class App implements WebSocketConfigurer{
	 public static void main(String[] args) {
		 System.setProperty("tomcat.util.http.parser.HttpParser.requestTargetAllow", "{}");
		 SpringApplication.run(App.class, args);
	 }
	 
	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		registry.addHandler(createPlayerController(), "/websocket")
			.setAllowedOrigins("*");
	}
	
	@Bean
	public PlayerController createPlayerController() {
		return new PlayerController();
	}
}

