package com.dondesalem.api.repository;

import com.dondesalem.api.domain.Event;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {

  List<Event> findByActiveTrueAndStartsAtAfterOrderByStartsAtAsc(Instant from);

  List<Event> findTop3ByFeaturedOnHomeTrueAndActiveTrueAndStartsAtAfterOrderByStartsAtAsc(
      Instant from);
}
