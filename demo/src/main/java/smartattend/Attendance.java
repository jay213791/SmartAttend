package smartattend;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Data
@Table(name = "ATTENDANCE")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "STUDENT_NAME")
    private String studentName;

    @Column(name = "CLASS_NAME")
    private String className;

    @Column(name = "DATE")
    private LocalDate date;

    @Column(name = "TIME")
    private LocalTime time;

    @Column(name = "STATUS")
    private String status;
}
