package smartattend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private smartattend.Repository.AdminRepository adminRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addAdmin(@RequestBody smartattend.Entity.Admin admin){
        if (adminRepository.existsByEmail(admin.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body("Email already exist");
        }
        smartattend.Entity.Admin savedAdmin = adminRepository.save(admin);
        return ResponseEntity.ok(savedAdmin);
    }

    @GetMapping("/all")
    public List<smartattend.Entity.Admin> GetAllAdmins() {
        return adminRepository.findAll();
    }

    @DeleteMapping("/delete/{id}")
    public String deleteAdmin(@PathVariable int id){
        adminRepository.deleteById(id);
        return "Student with ID " + id + " deleted successfully.";
    }
}
