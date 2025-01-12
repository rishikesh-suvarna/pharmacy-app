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

func setupProductRouter() *gin.Engine {
	r := gin.Default()
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&models.Product{})
	RegisterProductRoutes(r, db)
	return r
}

func TestGetProducts(t *testing.T) {
	r := setupProductRouter()

	req, _ := http.NewRequest("GET", "/api/products", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "[]", w.Body.String())
}

func TestCreateProduct(t *testing.T) {
	r := setupProductRouter()

	product := models.Product{Name: "Test Product", Price: 10.0, Stock: 100}
	jsonValue, _ := json.Marshal(product)
	req, _ := http.NewRequest("POST", "/api/products", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
	var createdProduct models.Product
	json.Unmarshal(w.Body.Bytes(), &createdProduct)
	assert.Equal(t, "Test Product", createdProduct.Name)
}

func TestGetProductByID(t *testing.T) {
	r := setupProductRouter()

	// Create a product first
	product := models.Product{Name: "Test Product", Price: 10.0, Stock: 100}
	jsonValue, _ := json.Marshal(product)
	req, _ := http.NewRequest("POST", "/api/products", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var createdProduct models.Product
	json.Unmarshal(w.Body.Bytes(), &createdProduct)

	// Get the created product by ID
	req, _ = http.NewRequest("GET", "/api/products/"+fmt.Sprint(createdProduct.ID), nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var fetchedProduct models.Product
	json.Unmarshal(w.Body.Bytes(), &fetchedProduct)
	assert.Equal(t, "Test Product", fetchedProduct.Name)
}
