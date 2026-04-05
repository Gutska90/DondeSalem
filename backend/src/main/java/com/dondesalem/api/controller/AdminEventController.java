package com.dondesalem.api.controller;

import com.dondesalem.api.dto.cms.EventDto;
import com.dondesalem.api.dto.cms.EventRequest;
import com.dondesalem.api.service.AdminEventService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/events")
@PreAuthorize("hasRole('ADMIN')")
public class AdminEventController {

  private final AdminEventService adminEventService;

  public AdminEventController(AdminEventService adminEventService) {
    this.adminEventService = adminEventService;
  }

  @GetMapping
  public List<EventDto> list() {
    return adminEventService.findAll();
  }

  @GetMapping("/{id}")
  public EventDto get(@PathVariable Long id) {
    return adminEventService.findById(id);
  }

  @PostMapping
  public EventDto create(@Valid @RequestBody EventRequest request) {
    return adminEventService.create(request);
  }

  @PutMapping("/{id}")
  public EventDto update(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
    return adminEventService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    adminEventService.delete(id);
  }
}
