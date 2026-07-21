package database

import (
	"database/sql"
	"log"
	"time"

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

	// Configure SQLite PRAGMAs for high performance & concurrency (WAL mode)
	_, _ = DB.Exec(`PRAGMA journal_mode=WAL;`)
	_, _ = DB.Exec(`PRAGMA synchronous=NORMAL;`)
	_, _ = DB.Exec(`PRAGMA foreign_keys=ON;`)

	createTables()
	seedAdminUser()
}

func createTables() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			username TEXT UNIQUE,
			email TEXT,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL,
			two_factor_enabled INTEGER DEFAULT 0,
			must_change_password INTEGER DEFAULT 0,
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
		`CREATE TABLE IF NOT EXISTS proxy_hosts (
			id TEXT PRIMARY KEY,
			domain TEXT UNIQUE NOT NULL,
			target_url TEXT NOT NULL,
			ssl_enabled INTEGER DEFAULT 0,
			ssl_auto INTEGER DEFAULT 1,
			cert_path TEXT,
			key_path TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS cron_jobs (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			schedule TEXT NOT NULL,
			command TEXT NOT NULL,
			enabled INTEGER DEFAULT 1,
			last_run DATETIME,
			last_status TEXT DEFAULT 'pending',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS backups (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			backup_type TEXT NOT NULL,
			target_path TEXT NOT NULL,
			storage_type TEXT DEFAULT 'local',
			schedule TEXT DEFAULT 'manual',
			last_run DATETIME,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS alert_channels (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			channel_type TEXT NOT NULL,
			config_json TEXT NOT NULL,
			enabled INTEGER DEFAULT 1,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS alert_rules (
			id TEXT PRIMARY KEY,
			metric TEXT NOT NULL,
			condition TEXT NOT NULL,
			threshold REAL NOT NULL,
			channel_id TEXT NOT NULL,
			enabled INTEGER DEFAULT 1,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS totp_secrets (
			user_id TEXT PRIMARY KEY,
			secret TEXT NOT NULL,
			enabled INTEGER DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
	}

	for _, query := range queries {
		_, err := DB.Exec(query)
		if err != nil {
			log.Fatalf("Failed to create table: %v", err)
		}
	}

	// Migration: Add column if missing in existing databases
	_, _ = DB.Exec("ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 0")
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

	_, err = DB.Exec(`INSERT INTO users (id, username, email, password_hash, role, must_change_password) VALUES (?, ?, ?, ?, ?, ?)`,
		"usr_admin_default", "admin", "admin@yare.local", string(hash), "admin", 1)
	if err != nil {
		log.Printf("Failed to seed default admin user: %v", err)
	} else {
		log.Println("Default admin user created successfully (username: admin, password: admin123)")
	}
}

func RecordAuditLog(username, action, ip, details string) {
	if DB == nil {
		return
	}
	id := "audit_" + time.Now().Format("20060102150405") + "_" + username
	_, err := DB.Exec(`INSERT INTO audit_logs (id, username, action, ip_address, details) VALUES (?, ?, ?, ?, ?)`,
		id, username, action, ip, details)
	if err != nil {
		log.Printf("Failed to record audit log: %v", err)
	}
}

