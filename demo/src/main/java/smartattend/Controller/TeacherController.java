package smartattend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smartattend.Entity.Teacher;
import smartattend.Repository.TeacherRepository;

import java.util.List;

@RestController
@RequestMapping("/teacher")
public class TeacherController {
    @Autowired
    private TeacherRepository teacherRepository;

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

        Teacher savedTeacher = teacherRepository.save(teacher);
        return ResponseEntity.ok(savedTeacher);
    }

    @GetMapping("/all")
    public List<Teacher> GetallTeachers(){
        return teacherRepository.findAll();
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
}
