package routes

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"pharmacy-app-server/models"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupUserRouter() *gin.Engine {
	r := gin.Default()
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&models.User{})
	RegisterUserRoutes(r, db)
	return r
}

func TestGetUsers(t *testing.T) {
	r := setupUserRouter()

	req, _ := http.NewRequest("GET", "/api/users", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "[]", w.Body.String())
}

func TestCreateUser(t *testing.T) {
	r := setupUserRouter()

	user := models.User{Name: "Test User", Email: "test@example.com"}
	jsonValue, _ := json.Marshal(user)
	req, _ := http.NewRequest("POST", "/api/users", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var createdUser models.User
	json.Unmarshal(w.Body.Bytes(), &createdUser)
	assert.Equal(t, "Test User", createdUser.Name)
}

func TestGetUserByID(t *testing.T) {
	r := setupUserRouter()

	// Create a user first
	user := models.User{Name: "Test User", Email: "test@example.com"}
	jsonValue, _ := json.Marshal(user)
	req, _ := http.NewRequest("POST", "/api/users", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var createdUser models.User
	json.Unmarshal(w.Body.Bytes(), &createdUser)

	// Get the created user by ID
	req, _ = http.NewRequest("GET", "/api/users/"+fmt.Sprint(createdUser.ID), nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var fetchedUser models.User
	json.Unmarshal(w.Body.Bytes(), &fetchedUser)
	assert.Equal(t, "Test User", fetchedUser.Name)
}
