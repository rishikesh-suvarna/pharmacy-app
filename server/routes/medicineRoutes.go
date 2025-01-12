package routes

import (
	"net/http"

	"pharmacy-app-server/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterMedicineRoutes(r *gin.Engine, db *gorm.DB) {
	medicineGroup := r.Group("/api/medicines")
	{
		medicineGroup.GET("/", func(c *gin.Context) {
			var medicines []models.Medicine
			if err := db.Find(&medicines).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch medicines"})
				return
			}
			c.JSON(http.StatusOK, medicines)
		})

		medicineGroup.POST("/", func(c *gin.Context) {
			var medicine models.Medicine
			if err := c.ShouldBindJSON(&medicine); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
				return
			}
			if err := db.Create(&medicine).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add medicine"})
				return
			}
			c.JSON(http.StatusCreated, medicine)
		})
	}
}
