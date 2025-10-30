package com.example.bigwork.support;

import java.io.Serial;
import java.io.Serializable;

public class SessionUser implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private final Long id;
    private final String username;
    private final String displayName;
    private final String role;
    private final String email;

    public SessionUser(Long id, String username, String displayName, String role, String email) {
        this.id = id;
        this.username = username;
        this.displayName = displayName;
        this.role = role;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getRole() {
        return role;
    }

    public String getEmail() {
        return email;
    }
}
