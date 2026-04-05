package com.dondesalem.api.controller;

import com.dondesalem.api.dto.catalog.TagDto;
import com.dondesalem.api.domain.Tag;
import com.dondesalem.api.repository.TagRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/tags")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTagController {

  private final TagRepository tagRepository;

  public AdminTagController(TagRepository tagRepository) {
    this.tagRepository = tagRepository;
  }

  @GetMapping
  @Transactional(readOnly = true)
  public List<TagDto> list() {
    return tagRepository.findAll(Sort.by("name")).stream()
        .map(t -> new TagDto(t.getId(), t.getName(), t.getSlug()))
        .collect(Collectors.toList());
  }
}
