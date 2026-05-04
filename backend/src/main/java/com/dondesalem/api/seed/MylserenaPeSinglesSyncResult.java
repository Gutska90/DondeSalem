package com.dondesalem.api.seed;

public record MylserenaPeSinglesSyncResult(
    int rowsInFile,
    int updated,
    int skippedMissingProduct,
    int skippedNotMylPeSlug,
    int singlesWithZeroStock) {}
