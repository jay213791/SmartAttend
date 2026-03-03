package smartattend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import smartattend.Entity.Student;
import smartattend.Entity.Teacher;
import smartattend.Repository.StudentRepository;
import smartattend.Repository.TeacherRepository;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/teacher")
public class TeacherController {
    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/add")
    public ResponseEntity<?> addTeacher(@RequestBody Teacher teacher) {
        // if null status will be pending so need pa i approve ng admin
        if (teacher.getStatus() == null || teacher.getStatus().isEmpty()) {
            teacher.setStatus("pending");
        }

        // this check if yung email is already exists
        if (teacherRepository.existsByEmail(teacher.getEmail())){
            return ResponseEntity
                    .badRequest()
                    .body("Email already exist");
        }

        teacher.setPassword(
                passwordEncoder.encode(teacher.getPassword())
        );

        Teacher savedTeacher = teacherRepository.save(teacher);
        return ResponseEntity.ok(savedTeacher);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginTeacher(@RequestBody Teacher loginRequest,  HttpServletRequest request) {
        Teacher teacher = teacherRepository.findByEmail(loginRequest.getEmail());

        if (teacher == null) {
            return ResponseEntity.badRequest().body("Email not found");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), teacher.getPassword())) {
            return ResponseEntity.badRequest().body("Wrong password");
        }

        if (!teacher.getStatus().equals("approved")) {
            return ResponseEntity.badRequest().body("Account not yet approved");
        }

        // --- SET SPRING SECURITY AUTH PARA ACCESS NG MGA CONTROLLER ---
        Authentication auth = new UsernamePasswordAuthenticationToken(
                teacher.getEmail(),
                teacher.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_TEACHER"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        HttpSession session = request.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());

        return ResponseEntity.ok(teacher);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Teacher teacher = teacherRepository.findByEmail(email);

        if(teacher == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Email not found");
        }

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        teacher.setResetOtp(otp);
        teacher.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        teacherRepository.save(teacher);

        sendEmail(email, otp);

        return ResponseEntity.ok("OTP sent");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        Teacher teacher = teacherRepository.findByEmail(email);

        if (teacher == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Invalid request");
        }

        if (teacher.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity
                    .badRequest()
                    .body("OTP expired");
        }

        if (!teacher.getResetOtp().equals(otp)) {
            return ResponseEntity
                    .badRequest()
                    .body("Invalid OTP");
        }

        return  ResponseEntity.ok("OTP verified");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("password");

        Teacher teacher = teacherRepository.findByEmail(email);

        if (teacher == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Invalid request");
        }

        teacher.setPassword(
                passwordEncoder.encode(newPassword)
        );

        teacher.setResetOtp(null);
        teacher.setOtpExpiry(null);

        teacherRepository.save(teacher);

        return ResponseEntity.ok("Password updated");
    }

    @GetMapping("/students/my-students")
    public List<Student> getMyStudents(Authentication authentication) {
        String teacherEmail = authentication.getName();
        return studentRepository.findByTeacherEmail(teacherEmail);
    }

    @GetMapping("/all")
    public List<Teacher> GetallTeachers(){
        return teacherRepository.findAll();
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email){
        if (teacherRepository.existsByEmail(email)){
            return ResponseEntity
                    .badRequest()
                    .body("Email already exist");
        }
        return ResponseEntity.ok("Email available");
    }

    @DeleteMapping("/delete/{id}")
    public String deleteTeacher(@PathVariable int id){
        teacherRepository.deleteById(id);
        return "Teacher with ID " + id + " has been deleted";
    }

    //approval control
    @PutMapping("/approve/{id}")
    public Teacher approveTeacher(@PathVariable int id){
        Teacher teacher = teacherRepository.findById(id).orElseThrow(() -> new RuntimeException("Teacher not found"));
        teacher.setStatus("approved");
        return teacherRepository.save(teacher);
    }

    private void sendEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Password Reset OTP");
        message.setText("Your OTP is: " + otp + ". It will expire in 5 minutes.");
        message.setFrom("smart.attend22526@gmail.com");
        mailSender.send(message);
    }
}
