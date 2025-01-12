package routes

import (
	"net/http"

	"pharmacy-app-server/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterMedicineRoutes(r *gin.Engine, db *gorm.DB) {
	api := r.Group("/api")
	{
		medicines := api.Group("/medicines")
		{
			medicines.GET("", func(c *gin.Context) {
				var medicines []models.Medicine
				if err := db.Find(&medicines).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch medicines"})
					return
				}
				c.JSON(http.StatusOK, medicines)
			})

			medicines.POST("", func(c *gin.Context) {
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
			medicines.GET("/:id", func(c *gin.Context) {
				id := c.Param("id")
				var medicine models.Medicine
				if err := db.First(&medicine, id).Error; err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": "Medicine not found"})
					return
				}
				c.JSON(http.StatusOK, medicine)
			})

			medicines.PUT("/:id", func(c *gin.Context) {
				id := c.Param("id")
				var medicine models.Medicine
				if err := db.First(&medicine, id).Error; err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": "Medicine not found"})
					return
				}
				if err := c.ShouldBindJSON(&medicine); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
					return
				}
				if err := db.Save(&medicine).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update medicine"})
					return
				}
				c.JSON(http.StatusOK, medicine)
			})

			medicines.DELETE("/:id", func(c *gin.Context) {
				id := c.Param("id")
				if err := db.Delete(&models.Medicine{}, id).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete medicine"})
					return
				}
				c.JSON(http.StatusOK, gin.H{"message": "Medicine deleted"})
			})
		}
	}
}
