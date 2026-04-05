package com.dondesalem.api.security;

import com.dondesalem.api.domain.Role;
import java.io.Serializable;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public record AuthUser(Long id, String email, Role role) implements UserDetails, Serializable {

  @Override
  public java.util.Collection<org.springframework.security.core.GrantedAuthority> getAuthorities() {
    return java.util.List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
  }

  @Override
  public String getPassword() {
    return null;
  }

  @Override
  public String getUsername() {
    return email;
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }
}
