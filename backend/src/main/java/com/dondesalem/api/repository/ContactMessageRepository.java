package com.dondesalem.api.repository;

import com.dondesalem.api.domain.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

  long countByReadFlag(boolean read);
}
