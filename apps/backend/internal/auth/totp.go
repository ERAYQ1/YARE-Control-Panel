package auth

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha1"
	"encoding/binary"
	"fmt"
	"math"
	"net/url"
	"strings"
	"time"
)

const base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

// GenerateTOTPSecret creates a secure, random 16-byte Base32 encoded secret key
func GenerateTOTPSecret() (string, error) {
	bytes := make([]byte, 10)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return encodeBase32(bytes), nil
}

// GenerateTOTPURI creates standard otpauth:// URI for QR codes (Google Authenticator, Authy, etc.)
func GenerateTOTPURI(secret, username, issuer string) string {
	if issuer == "" {
		issuer = "YARE OS"
	}
	label := fmt.Sprintf("%s:%s", issuer, username)
	return fmt.Sprintf("otpauth://totp/%s?secret=%s&issuer=%s",
		url.PathEscape(label), secret, url.QueryEscape(issuer))
}

// ValidateTOTPCode validates a 6-digit TOTP code against the secret (allowing 30s clock drift: t-1, t, t+1)
func ValidateTOTPCode(secret, code string) bool {
	code = strings.TrimSpace(code)
	if len(code) != 6 {
		return false
	}

	secret = strings.ToUpper(strings.TrimSpace(secret))
	secretBytes, err := decodeBase32(secret)
	if err != nil || len(secretBytes) == 0 {
		return false
	}

	currentTime := time.Now().Unix()
	timeStep := int64(30)
	currentCounter := currentTime / timeStep

	// Check previous step, current step, and next step to accommodate clock skew
	for i := int64(-1); i <= 1; i++ {
		counter := currentCounter + i
		expectedCode := generateOTP(secretBytes, counter)
		if expectedCode == code {
			return true
		}
	}

	return false
}

func generateOTP(secret []byte, counter int64) string {
	buf := make([]byte, 8)
	binary.BigEndian.PutUint64(buf, uint64(counter))

	mac := hmac.New(sha1.New, secret)
	mac.Write(buf)
	hash := mac.Sum(nil)

	offset := hash[len(hash)-1] & 0x0f
	binaryVal := (int32(hash[offset]&0x7f) << 24) |
		(int32(hash[offset+1]&0xff) << 16) |
		(int32(hash[offset+2]&0xff) << 8) |
		(int32(hash[offset+3] & 0xff))

	otp := int(binaryVal) % int(math.Pow10(6))
	return fmt.Sprintf("%06d", otp)
}

func encodeBase32(src []byte) string {
	var result strings.Builder
	var val uint64
	var valLen int

	for _, b := range src {
		val = (val << 8) | uint64(b)
		valLen += 8
		for valLen >= 5 {
			valLen -= 5
			idx := (val >> valLen) & 0x1F
			result.WriteByte(base32Alphabet[idx])
		}
	}

	if valLen > 0 {
		idx := (val << (5 - valLen)) & 0x1F
		result.WriteByte(base32Alphabet[idx])
	}

	return result.String()
}

func decodeBase32(src string) ([]byte, error) {
	src = strings.ToUpper(strings.TrimRight(src, "="))
	var result []byte
	var val uint64
	var valLen int

	for i := 0; i < len(src); i++ {
		c := src[i]
		idx := strings.IndexByte(base32Alphabet, c)
		if idx < 0 {
			return nil, fmt.Errorf("invalid base32 character: %c", c)
		}
		val = (val << 5) | uint64(idx)
		valLen += 5
		if valLen >= 8 {
			valLen -= 8
			result = append(result, byte(val>>valLen))
		}
	}

	return result, nil
}
