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

func setupInquiryRouter() *gin.Engine {
	r := gin.Default()
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&models.Inquiry{})
	RegisterInquiryRoutes(r, db)
	return r
}

func TestGetInquiries(t *testing.T) {
	r := setupInquiryRouter()

	req, _ := http.NewRequest("GET", "/api/inquiries", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "[]", w.Body.String())
}

func TestCreateInquiry(t *testing.T) {
	r := setupInquiryRouter()

	inquiry := models.Inquiry{Message: "Test Inquiry", UserID: 1, MedicineID: 1}
	jsonValue, _ := json.Marshal(inquiry)
	req, _ := http.NewRequest("POST", "/api/inquiries", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var createdInquiry models.Inquiry
	json.Unmarshal(w.Body.Bytes(), &createdInquiry)
	assert.Equal(t, "Test Inquiry", createdInquiry.Message)
}

func TestGetInquiryByID(t *testing.T) {
	r := setupInquiryRouter()

	// Create an inquiry first
	inquiry := models.Inquiry{Message: "Test Inquiry", UserID: 1, MedicineID: 1}
	jsonValue, _ := json.Marshal(inquiry)
	req, _ := http.NewRequest("POST", "/api/inquiries", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var createdInquiry models.Inquiry
	json.Unmarshal(w.Body.Bytes(), &createdInquiry)

	// Get the created inquiry by ID
	req, _ = http.NewRequest("GET", "/api/inquiries/"+fmt.Sprint(createdInquiry.ID), nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var fetchedInquiry models.Inquiry
	json.Unmarshal(w.Body.Bytes(), &fetchedInquiry)
	assert.Equal(t, "Test Inquiry", fetchedInquiry.Message)
}
