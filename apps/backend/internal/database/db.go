package database

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
	"golang.org/x/crypto/bcrypt"
)

var DB *sql.DB

func InitDB(dbPath string) {
	var err error
	DB, err = sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Failed to connect to SQLite database: %v", err)
	}

	createTables()
	seedAdminUser()
}

func createTables() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			username TEXT UNIQUE NOT RESTRICT,
			email TEXT,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL,
			two_factor_enabled INTEGER DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			last_login DATETIME
		);`,
		`CREATE TABLE IF NOT EXISTS audit_logs (
			id TEXT PRIMARY KEY,
			username TEXT,
			action TEXT,
			ip_address TEXT,
			details TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS ssh_keys (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			fingerprint TEXT NOT NULL,
			public_key TEXT NOT NULL,
			added_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS plugins (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			version TEXT NOT NULL,
			description TEXT,
			author TEXT,
			is_enabled INTEGER DEFAULT 1
		);`,
	}

	for _, query := range queries {
		_, err := DB.Exec(query)
		if err != nil {
			log.Fatalf("Failed to create table: %v", err)
		}
	}
}

func seedAdminUser() {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM users WHERE username = 'admin'").Scan(&count)
	if err != nil || count > 0 {
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Failed to hash admin password: %v", err)
		return
	}

	_, err = DB.Exec(`INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
		"usr_admin_default", "admin", "admin@yare.local", string(hash), "admin")
	if err != nil {
		log.Printf("Failed to seed default admin user: %v", err)
	} else {
		log.Println("Default admin user created successfully (username: admin, password: admin123)")
	}
}
