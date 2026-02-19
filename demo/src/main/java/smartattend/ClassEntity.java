package smartattend;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "CLASS")
public class ClassEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "CLASS_NAME")
    private String className;

    @Column(name = "SUBJECT")
    private String subject;

    @Column(name = "TEACHER_ID")
    private int teacherId;

    @Column(name = "SCHEDULE")
    private String schedule;
}
