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

func setupRouter() *gin.Engine {
	r := gin.Default()
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&models.Category{})
	RegisterCategoryRoutes(r, db)
	return r
}

func TestGetCategories(t *testing.T) {
	r := setupRouter()

	req, _ := http.NewRequest("GET", "/api/categories", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "[]", w.Body.String())
}

func TestCreateCategory(t *testing.T) {
	r := setupRouter()

	category := models.Category{Name: "Test Category"}
	jsonValue, _ := json.Marshal(category)
	req, _ := http.NewRequest("POST", "/api/categories", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var createdCategory models.Category
	json.Unmarshal(w.Body.Bytes(), &createdCategory)
	assert.Equal(t, "Test Category", createdCategory.Name)
}

func TestGetCategoryByID(t *testing.T) {
	r := setupRouter()

	// Create a category first
	category := models.Category{Name: "Test Category"}
	jsonValue, _ := json.Marshal(category)
	req, _ := http.NewRequest("POST", "/api/categories", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var createdCategory models.Category
	json.Unmarshal(w.Body.Bytes(), &createdCategory)

	// Get the created category by ID
	req, _ = http.NewRequest("GET", "/api/categories/"+fmt.Sprint(createdCategory.ID), nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var fetchedCategory models.Category
	json.Unmarshal(w.Body.Bytes(), &fetchedCategory)
	assert.Equal(t, "Test Category", fetchedCategory.Name)
}
