package smartattend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import smartattend.*;
import smartattend.Entity.Attendance;
import smartattend.Repository.AttendanceRepository;
import smartattend.Entity.ClassEntity;
import smartattend.Repository.ClassRepository;
import smartattend.Repository.StudentRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ClassRepository classRepository;


    @PostMapping("/add")
    public Attendance addAttendance(@RequestParam int studentId,
                                    @RequestParam int classId,
                                    @RequestParam String status) {
        Attendance attendance = new Attendance();


        // Fetch student name
        Optional<smartattend.Entity.Student> student = studentRepository.findById(studentId);
        if (student.isEmpty()) {
            throw new RuntimeException("Student not found with ID: " + studentId);
        }
        attendance.setStudentName(student.get().getName());

        // Fetch class name
        Optional<ClassEntity> classEntity = classRepository.findById(classId);
        if (classEntity.isEmpty()) {
            throw new RuntimeException("Class not found with ID: " + classId);
        }
        attendance.setClassName(classEntity.get().getClassName());

        // Set date and time automatically
        attendance.setDate(LocalDate.now());
        attendance.setTime(LocalTime.now());

        // Set status
        attendance.setStatus(status);

        return attendanceRepository.save(attendance);
    }

    @GetMapping("/all")
    public List<Attendance> getAllAttendance(){
        return attendanceRepository.findAll();
    }

    @DeleteMapping("/delete/{id}")
    public String deleteAttendance(@PathVariable int id) {
        attendanceRepository.deleteById(id);
        return "Attendance with ID " + id + " deleted successfully.";
    }
}
