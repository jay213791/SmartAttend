package smartattend.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Data
@Table(name = "TEACHER")
  public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private int id;

    @Column(name = "NAME", length = 100)
    private String name;

    @Column(name = "EMAIL", length = 100, unique = true)
    private String email;

    @Column(name = "PASSWORD", length = 255)
    private String password;

    @Column(name = "STATUS", length = 20)
    private String status;

    @Column(name = "CREATED_AT")
    private LocalDate createdAt;

    @Column(name = "RESETOTP", length = 20)
    private String resetOtp;

    @Column(name = "OTP_EXPIRY")
    private LocalDateTime otpExpiry;

    @PrePersist
    public void onCreate() {
    this.createdAt = LocalDate.now();
    }
}

