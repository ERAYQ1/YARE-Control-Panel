package v1

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"yare-backend/internal/auth"
	"yare-backend/internal/database"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type Login2FARequest struct {
	TempToken string `json:"tempToken" binding:"required"`
	Code      string `json:"code" binding:"required"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required"`
}

type AuthController struct {
	JWTSecret string
}

func NewAuthController(secret string) *AuthController {
	return &AuthController{JWTSecret: secret}
}

func (ac *AuthController) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	var userID, username, email, passwordHash, role string
	var twoFactorEnabled, mustChangePassword int

	err := database.DB.QueryRow(`
		SELECT id, username, email, password_hash, role, two_factor_enabled, COALESCE(must_change_password, 0)
		FROM users WHERE username = ?`, req.Username).Scan(
		&userID, &username, &email, &passwordHash, &role, &twoFactorEnabled, &mustChangePassword,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	forcePasswordChange := mustChangePassword == 1 || (username == "admin" && req.Password == "admin123")

	// Check if 2FA (TOTP) is enabled for this user
	if twoFactorEnabled == 1 {
		tempToken, err := auth.GenerateTemp2FAToken(ac.JWTSecret, userID, username, role)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize 2FA session"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"requires2FA":        true,
			"tempToken":          tempToken,
			"mustChangePassword": forcePasswordChange,
		})
		return
	}

	token, refreshToken, err := auth.GenerateTokens(ac.JWTSecret, userID, username, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate authentication tokens"})
		return
	}

	// Update last login
	database.DB.Exec("UPDATE users SET last_login = ? WHERE id = ?", time.Now(), userID)
	database.RecordAuditLog(username, "USER_LOGIN", c.ClientIP(), "Logged in successfully")

	c.JSON(http.StatusOK, gin.H{
		"token":              token,
		"refreshToken":       refreshToken,
		"mustChangePassword": forcePasswordChange,
		"user": gin.H{
			"id":                 userID,
			"username":           username,
			"email":              email,
			"role":               role,
			"twoFactorEnabled":   twoFactorEnabled == 1,
			"mustChangePassword": forcePasswordChange,
		},
	})
}

func (ac *AuthController) Login2FA(c *gin.Context) {
	var req Login2FARequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Temporary token and 2FA code required"})
		return
	}

	claims, err := auth.ValidateTemp2FAToken(ac.JWTSecret, req.TempToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired 2FA session token"})
		return
	}

	var secret string
	err = database.DB.QueryRow("SELECT secret FROM totp_secrets WHERE user_id = ? AND enabled = 1", claims.UserID).Scan(&secret)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "2FA is not enabled for this account"})
		return
	}

	if !auth.ValidateTOTPCode(secret, req.Code) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid 2FA verification code"})
		return
	}

	var email, passwordHash string
	var mustChangePassword int
	_ = database.DB.QueryRow("SELECT email, password_hash, COALESCE(must_change_password, 0) FROM users WHERE id = ?", claims.UserID).Scan(&email, &passwordHash, &mustChangePassword)

	token, refreshToken, err := auth.GenerateTokens(ac.JWTSecret, claims.UserID, claims.Username, claims.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate authentication tokens"})
		return
	}

	database.DB.Exec("UPDATE users SET last_login = ? WHERE id = ?", time.Now(), claims.UserID)
	database.RecordAuditLog(claims.Username, "USER_LOGIN_2FA", c.ClientIP(), "Completed 2FA authentication")

	forcePasswordChange := mustChangePassword == 1

	c.JSON(http.StatusOK, gin.H{
		"token":              token,
		"refreshToken":       refreshToken,
		"mustChangePassword": forcePasswordChange,
		"user": gin.H{
			"id":                 claims.UserID,
			"username":           claims.Username,
			"email":              email,
			"role":               claims.Role,
			"twoFactorEnabled":   true,
			"mustChangePassword": forcePasswordChange,
		},
	})
}

func (ac *AuthController) ChangePassword(c *gin.Context) {
	userID, _ := c.Get("userId")
	username, _ := c.Get("username")

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Current and new password required"})
		return
	}

	if len(req.NewPassword) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "New password must be at least 8 characters long"})
		return
	}

	var currentHash string
	err := database.DB.QueryRow("SELECT password_hash FROM users WHERE id = ?", userID).Scan(&currentHash)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(req.CurrentPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect current password"})
		return
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash new password"})
		return
	}

	_, err = database.DB.Exec("UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?", string(newHash), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	database.RecordAuditLog(fmt.Sprint(username), "CHANGE_PASSWORD", c.ClientIP(), "Changed password successfully")

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}

func (ac *AuthController) Setup2FA(c *gin.Context) {
	userID, _ := c.Get("userId")
	username, _ := c.Get("username")

	secret, err := auth.GenerateTOTPSecret()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate TOTP secret"})
		return
	}

	otpURI := auth.GenerateTOTPURI(secret, fmt.Sprint(username), "YARE OS")

	_, err = database.DB.Exec(`
		INSERT INTO totp_secrets (user_id, secret, enabled) VALUES (?, ?, 0)
		ON CONFLICT(user_id) DO UPDATE SET secret = excluded.secret, enabled = 0`,
		userID, secret,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save TOTP secret"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"secret": secret,
		"otpuri": otpURI,
	})
}

func (ac *AuthController) Verify2FA(c *gin.Context) {
	userID, _ := c.Get("userId")
	username, _ := c.Get("username")

	var req struct {
		Code string `json:"code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "2FA code required"})
		return
	}

	var secret string
	err := database.DB.QueryRow("SELECT secret FROM totp_secrets WHERE user_id = ?", userID).Scan(&secret)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "2FA setup has not been initiated"})
		return
	}

	if !auth.ValidateTOTPCode(secret, req.Code) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 2FA code. Please check your authenticator app and try again."})
		return
	}

	database.DB.Exec("UPDATE totp_secrets SET enabled = 1 WHERE user_id = ?", userID)
	database.DB.Exec("UPDATE users SET two_factor_enabled = 1 WHERE id = ?", userID)

	database.RecordAuditLog(fmt.Sprint(username), "ENABLE_2FA", c.ClientIP(), "Enabled 2FA TOTP authentication")

	c.JSON(http.StatusOK, gin.H{"message": "2FA enabled successfully!"})
}

func (ac *AuthController) Disable2FA(c *gin.Context) {
	userID, _ := c.Get("userId")
	username, _ := c.Get("username")

	var req struct {
		Password string `json:"password" binding:"required"`
		Code     string `json:"code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password and 2FA code required"})
		return
	}

	var passwordHash string
	err := database.DB.QueryRow("SELECT password_hash FROM users WHERE id = ?", userID).Scan(&passwordHash)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password"})
		return
	}

	var secret string
	err = database.DB.QueryRow("SELECT secret FROM totp_secrets WHERE user_id = ? AND enabled = 1", userID).Scan(&secret)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "2FA is not enabled"})
		return
	}

	if !auth.ValidateTOTPCode(secret, req.Code) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 2FA code"})
		return
	}

	database.DB.Exec("UPDATE totp_secrets SET enabled = 0 WHERE user_id = ?", userID)
	database.DB.Exec("UPDATE users SET two_factor_enabled = 0 WHERE id = ?", userID)

	database.RecordAuditLog(fmt.Sprint(username), "DISABLE_2FA", c.ClientIP(), "Disabled 2FA TOTP authentication")

	c.JSON(http.StatusOK, gin.H{"message": "2FA disabled successfully"})
}

func (ac *AuthController) Refresh(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refreshToken" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token required"})
		return
	}

	claims, err := auth.ValidateToken(ac.JWTSecret, req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired refresh token"})
		return
	}

	token, refreshToken, err := auth.GenerateTokens(ac.JWTSecret, claims.UserID, claims.Username, claims.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to refresh token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":        token,
		"refreshToken": refreshToken,
	})
}

func (ac *AuthController) Me(c *gin.Context) {
	userID, _ := c.Get("userId")
	var id, username, email, role string
	var twoFactor, mustChange int

	err := database.DB.QueryRow("SELECT id, username, email, role, two_factor_enabled, COALESCE(must_change_password, 0) FROM users WHERE id = ?", userID).Scan(
		&id, &username, &email, &role, &twoFactor, &mustChange,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":                 id,
		"username":           username,
		"email":              email,
		"role":               role,
		"twoFactorEnabled":   twoFactor == 1,
		"mustChangePassword": mustChange == 1,
	})
}
