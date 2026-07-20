package v1

import (
	"database/sql"
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
	var twoFactorEnabled int

	err := database.DB.QueryRow(`
		SELECT id, username, email, password_hash, role, two_factor_enabled 
		FROM users WHERE username = ?`, req.Username).Scan(
		&userID, &username, &email, &passwordHash, &role, &twoFactorEnabled,
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

	token, refreshToken, err := auth.GenerateTokens(ac.JWTSecret, userID, username, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate authentication tokens"})
		return
	}

	// Update last login
	database.DB.Exec("UPDATE users SET last_login = ? WHERE id = ?", time.Now(), userID)

	c.JSON(http.StatusOK, gin.H{
		"token":        token,
		"refreshToken": refreshToken,
		"user": gin.H{
			"id":               userID,
			"username":         username,
			"email":            email,
			"role":             role,
			"twoFactorEnabled": twoFactorEnabled == 1,
		},
	})
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
	var twoFactor int

	err := database.DB.QueryRow("SELECT id, username, email, role, two_factor_enabled FROM users WHERE id = ?", userID).Scan(
		&id, &username, &email, &role, &twoFactor,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":               id,
		"username":         username,
		"email":            email,
		"role":             role,
		"twoFactorEnabled": twoFactor == 1,
	})
}
