package smartattend.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController

public class HomeController {
    // Public root endpoint
    @GetMapping("/")
    public String home() {
        return "SmartAttend backend is running!";
    }

    // Optional status endpoint
    @GetMapping("/status")
    public String status() {
        return "Backend is alive and reachable!";
    }
}
