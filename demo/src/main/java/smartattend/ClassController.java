package smartattend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/class")
public class ClassController {

    @Autowired
    private ClassRepository classRepository;

    @PostMapping("/add")
    public ClassEntity addClass(@RequestBody ClassEntity classEntity) {
        return classRepository.save(classEntity);
    }

    @GetMapping("/all")
    public List<ClassEntity> GetAllClasses(){
        return classRepository.findAll();
    }

    @DeleteMapping("/delete/{id}")
    public String deleteClass(@PathVariable int id) {
        classRepository.deleteById(id);
        return "Class with ID " + id + " deleted successfully.";
    }
}
