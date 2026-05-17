package com.dondesalem.api.dto.auth;

import java.util.List;

/** Códigos de un solo uso; solo se muestran al generarlos. */
public record TotpRecoveryCodesResponse(List<String> recoveryCodes) {}
