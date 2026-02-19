package smartattend;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "STUDENT")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private int id;

    @Column(name = "student_number", length = 50, unique = true)
    private String studentNumber;

    @Column(name = "SEX")
    private String sex;

    @Column(name = "NAME")
    private String name;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "QR_CODE")
    private String qrCode;
}
