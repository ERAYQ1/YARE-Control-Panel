package auth

import (
	"testing"
)

func TestGenerateAndValidateToken(t *testing.T) {
	secret := "test_jwt_secret_key_32_bytes_long!!"
	userID := "usr_123"
	username := "testadmin"
	role := "admin"

	token, refreshToken, err := GenerateTokens(secret, userID, username, role)
	if err != nil {
		t.Fatalf("Failed to generate tokens: %v", err)
	}

	if token == "" || refreshToken == "" {
		t.Fatal("Expected non-empty access token and refresh token")
	}

	claims, err := ValidateToken(secret, token)
	if err != nil {
		t.Fatalf("Failed to validate token: %v", err)
	}

	if claims.UserID != userID || claims.Username != username || claims.Role != role {
		t.Errorf("Claims mismatch: got %v, expected UserID=%s Username=%s Role=%s", claims, userID, username, role)
	}
}

func TestValidateInvalidToken(t *testing.T) {
	secret := "test_jwt_secret_key_32_bytes_long!!"
	_, err := ValidateToken(secret, "invalid.token.string")
	if err == nil {
		t.Error("Expected error when validating invalid token, got nil")
	}
}
