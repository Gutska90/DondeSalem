package com.dondesalem.api.controller;

import com.dondesalem.api.dto.contact.ContactRequest;
import com.dondesalem.api.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

  private final ContactService contactService;

  public ContactController(ContactService contactService) {
    this.contactService = contactService;
  }

  @PostMapping
  public void submit(@Valid @RequestBody ContactRequest request) {
    contactService.submit(request);
  }
}
