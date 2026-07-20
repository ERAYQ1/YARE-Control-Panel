package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// SecurityHeadersMiddleware adds OWASP security headers to all HTTP responses.
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' ws: wss:;")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		c.Next()
	}
}

type rateLimiter struct {
	mu       sync.Mutex
	requests map[string][]time.Time
}

// RateLimitMiddleware enforces maximum requests per window per IP address for the applied handler.
func RateLimitMiddleware(maxReqs int, window time.Duration) gin.HandlerFunc {
	limiter := &rateLimiter{
		requests: make(map[string][]time.Time),
	}

	return func(c *gin.Context) {
		ip := c.ClientIP()

		limiter.mu.Lock()
		now := time.Now()
		cutoff := now.Add(-window)

		// Filter old requests
		reqs := limiter.requests[ip]
		var valid []time.Time
		for _, t := range reqs {
			if t.After(cutoff) {
				valid = append(valid, t)
			}
		}

		if len(valid) >= maxReqs {
			limiter.mu.Unlock()
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "Rate limit exceeded. Too many requests.",
				"retryIn": "60s",
			})
			c.Abort()
			return
		}

		valid = append(valid, now)
		limiter.requests[ip] = valid
		limiter.mu.Unlock()

		c.Next()
	}
}
