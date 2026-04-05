package com.dondesalem.api.controller;

import com.dondesalem.api.dto.contact.ContactMessageDetailDto;
import com.dondesalem.api.dto.contact.ContactMessageDto;
import com.dondesalem.api.service.ContactService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/contact-messages")
@PreAuthorize("hasRole('ADMIN')")
public class AdminContactController {

  private final ContactService contactService;

  public AdminContactController(ContactService contactService) {
    this.contactService = contactService;
  }

  @GetMapping
  public List<ContactMessageDto> list() {
    return contactService.listAll();
  }

  @GetMapping("/{id}")
  public ContactMessageDetailDto get(@PathVariable Long id) {
    return contactService.getById(id);
  }

  public record ReadBody(boolean read) {}

  @PatchMapping("/{id}/read")
  public ContactMessageDetailDto setRead(@PathVariable Long id, @RequestBody ReadBody body) {
    return contactService.setRead(id, body.read());
  }
}
