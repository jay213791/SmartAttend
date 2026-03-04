package smartattend;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable()) // disable CSRF for JS fetch
                .cors(cors -> {})             // enable CORS
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/body/login.html",
                                "/body/registration.html",
                                "/style/**",
                                "/assets/**",
                                "/script/**",
                                "/js/**",
                                "/teacher/login",
                                "/teacher/forgot-password",
                                "/teacher/verify-otp",
                                "/teacher/reset-password"
                        ).permitAll()
                        .requestMatchers(
                                "/teacher/dashboard/**",
                                "/students/my-students",
                                "/students/count/my-students",
                                "/students/add"
                        ).hasRole("TEACHER")

                        .requestMatchers(
                                "/teacher/approve/**",
                                "/teacher/delete/**"
                        ).hasRole("ADMIN")

                        .anyRequest().permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/body/login.html")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                );

        return http.build();
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Allow both your local dev frontend and Railway deployment frontend
        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost:5500", // local dev
                "https://smartattend-production-c29f.up.railway.app"
        ));

        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


}