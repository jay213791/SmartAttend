package smartattend.Controller;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.web.servlet.MockMvc;
import smartattend.Entity.Teacher;
import smartattend.Repository.TeacherRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TeacherController.class)
class TeacherControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TeacherRepository teacherRepository;

    @MockBean
    private JavaMailSender mailSender;

    @Test
    void forgotPassword_sendsOtpForExistingEmail() throws Exception {
        String email = "teacher@example.com";
        Teacher teacher = new Teacher();
        teacher.setEmail(email);

        when(teacherRepository.findByEmail(email)).thenReturn(teacher);

        mockMvc.perform(post("/teacher/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string("OTP sent"));

        ArgumentCaptor<Teacher> teacherCaptor = ArgumentCaptor.forClass(Teacher.class);
        verify(teacherRepository).save(teacherCaptor.capture());
        Teacher savedTeacher = teacherCaptor.getValue();

        assertThat(savedTeacher.getResetOtp()).isNotNull();
        assertThat(savedTeacher.getOtpExpiry()).isNotNull();

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void forgotPassword_returnsBadRequestForUnknownEmail() throws Exception {
        String email = "unknown@example.com";

        when(teacherRepository.findByEmail(email)).thenReturn(null);

        mockMvc.perform(post("/teacher/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Email not found"));

        verify(teacherRepository, never()).save(any(Teacher.class));
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }
}

