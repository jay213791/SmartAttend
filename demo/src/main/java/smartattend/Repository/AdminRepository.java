package smartattend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import smartattend.Entity.Admin;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer>{
    boolean existsByEmail(String email);
}
