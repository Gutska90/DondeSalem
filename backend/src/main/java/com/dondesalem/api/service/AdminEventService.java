package com.dondesalem.api.service;

import com.dondesalem.api.domain.Event;
import com.dondesalem.api.dto.cms.EventDto;
import com.dondesalem.api.dto.cms.EventRequest;
import com.dondesalem.api.exception.ApiException;
import com.dondesalem.api.repository.EventRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminEventService {

  private final EventRepository eventRepository;

  public AdminEventService(EventRepository eventRepository) {
    this.eventRepository = eventRepository;
  }

  @Transactional(readOnly = true)
  public List<EventDto> findAll() {
    return eventRepository.findAll(Sort.by(Sort.Direction.DESC, "startsAt")).stream()
        .map(AdminEventService::toDto)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public EventDto findById(Long id) {
    Event e =
        eventRepository
            .findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Evento no encontrado"));
    return toDto(e);
  }

  @Transactional
  public EventDto create(EventRequest req) {
    validateWindow(req);
    Event e = new Event();
    apply(e, req);
    return toDto(eventRepository.save(e));
  }

  @Transactional
  public EventDto update(Long id, EventRequest req) {
    validateWindow(req);
    Event e =
        eventRepository
            .findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Evento no encontrado"));
    apply(e, req);
    return toDto(eventRepository.save(e));
  }

  @Transactional
  public void delete(Long id) {
    if (!eventRepository.existsById(id)) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Evento no encontrado");
    }
    eventRepository.deleteById(id);
  }

  private static void validateWindow(EventRequest req) {
    if (!req.endsAt().isAfter(req.startsAt())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "La fecha de fin debe ser posterior al inicio");
    }
  }

  private static void apply(Event e, EventRequest req) {
    e.setTitle(req.title().trim());
    e.setDescription(req.description());
    e.setImageUrl(
        req.imageUrl() != null && !req.imageUrl().isBlank() ? req.imageUrl().trim() : null);
    e.setStartsAt(req.startsAt());
    e.setEndsAt(req.endsAt());
    e.setCapacity(req.capacity());
    e.setEntryFee(req.entryFee());
    e.setExternalUrl(
        req.externalUrl() != null && !req.externalUrl().isBlank() ? req.externalUrl().trim() : null);
    e.setFeaturedOnHome(req.featuredOnHome());
    e.setActive(req.active());
  }

  private static EventDto toDto(Event e) {
    return new EventDto(
        e.getId(),
        e.getTitle(),
        e.getDescription(),
        e.getImageUrl(),
        e.getStartsAt(),
        e.getEndsAt(),
        e.getCapacity(),
        e.getEntryFee(),
        e.getExternalUrl(),
        e.getFeaturedOnHome(),
        e.getActive());
  }
}
