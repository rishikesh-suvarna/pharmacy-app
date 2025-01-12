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

func setupMedicineRouter() *gin.Engine {
	r := gin.Default()
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&models.Medicine{})
	RegisterMedicineRoutes(r, db)
	return r
}

func TestGetMedicines(t *testing.T) {
	r := setupMedicineRouter()

	req, _ := http.NewRequest("GET", "/api/medicines", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "[]", w.Body.String())
}

func TestCreateMedicine(t *testing.T) {
	r := setupMedicineRouter()

	medicine := models.Medicine{Name: "Test Medicine", Price: 10.0, Stock: 100}
	jsonValue, _ := json.Marshal(medicine)
	req, _ := http.NewRequest("POST", "/api/medicines", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
	var createdMedicine models.Medicine
	json.Unmarshal(w.Body.Bytes(), &createdMedicine)
	assert.Equal(t, "Test Medicine", createdMedicine.Name)
}

func TestGetMedicineByID(t *testing.T) {
	r := setupMedicineRouter()

	// Create a medicine first
	medicine := models.Medicine{Name: "Test Medicine", Price: 10.0, Stock: 100}
	jsonValue, _ := json.Marshal(medicine)
	req, _ := http.NewRequest("POST", "/api/medicines", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var createdMedicine models.Medicine
	json.Unmarshal(w.Body.Bytes(), &createdMedicine)

	// Get the created medicine by ID
	req, _ = http.NewRequest("GET", "/api/medicines/"+fmt.Sprint(createdMedicine.ID), nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var fetchedMedicine models.Medicine
	json.Unmarshal(w.Body.Bytes(), &fetchedMedicine)
	assert.Equal(t, "Test Medicine", fetchedMedicine.Name)
}
