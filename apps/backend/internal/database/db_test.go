package database

import (
	"os"
	"path/filepath"
	"testing"
)

func TestInitDB(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "yare-db-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "test_yare.db")
	InitDB(dbPath)

	if DB == nil {
		t.Fatal("Expected DB instance, got nil")
	}

	var count int
	err = DB.QueryRow("SELECT COUNT(*) FROM users WHERE username = 'admin'").Scan(&count)
	if err != nil {
		t.Fatalf("Failed to query admin user: %v", err)
	}

	if count != 1 {
		t.Errorf("Expected 1 seeded admin user, got %d", count)
	}
}
