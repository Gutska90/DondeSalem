package com.dondesalem.api.service;

import com.dondesalem.api.domain.ContactMessage;
import com.dondesalem.api.dto.contact.ContactMessageDetailDto;
import com.dondesalem.api.dto.contact.ContactMessageDto;
import com.dondesalem.api.dto.contact.ContactRequest;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.repository.ContactMessageRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContactService {

  private final ContactMessageRepository contactMessageRepository;

  public ContactService(ContactMessageRepository contactMessageRepository) {
    this.contactMessageRepository = contactMessageRepository;
  }

  @Transactional
  public void submit(ContactRequest req) {
    ContactMessage m = new ContactMessage();
    m.setName(req.name().trim());
    m.setEmail(req.email().trim().toLowerCase());
    m.setPhone(req.phone() != null ? req.phone().trim() : null);
    m.setSubject(req.subject().trim());
    m.setBody(req.body().trim());
    m.setReadFlag(false);
    contactMessageRepository.save(m);
  }

  @Transactional(readOnly = true)
  public List<ContactMessageDto> listAll() {
    return contactMessageRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
        .map(
            m ->
                new ContactMessageDto(
                    m.getId(), m.getName(), m.getEmail(), m.getSubject(), m.getReadFlag(), m.getCreatedAt()))
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public ContactMessageDetailDto getById(Long id) {
    ContactMessage m =
        contactMessageRepository
            .findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Mensaje no encontrado"));
    return new ContactMessageDetailDto(
        m.getId(),
        m.getName(),
        m.getEmail(),
        m.getPhone(),
        m.getSubject(),
        m.getBody(),
        Boolean.TRUE.equals(m.getReadFlag()),
        m.getCreatedAt());
  }

  @Transactional
  public ContactMessageDetailDto setRead(Long id, boolean read) {
    ContactMessage m =
        contactMessageRepository
            .findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Mensaje no encontrado"));
    m.setReadFlag(read);
    contactMessageRepository.save(m);
    return getById(id);
  }
}
