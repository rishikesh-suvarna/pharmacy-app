package routes

import (
	"net/http"

	"pharmacy-app-server/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterInquiryRoutes(r *gin.Engine, db *gorm.DB) {
	api := r.Group("/api")
	{
		inquiries := api.Group("/inquiries")
		{
			inquiries.GET("", func(c *gin.Context) {
				var inquiries []models.Inquiry
				if err := db.Find(&inquiries).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				c.JSON(http.StatusOK, inquiries)
			})

			inquiries.POST("", func(c *gin.Context) {
				var inquiry models.Inquiry
				if err := c.ShouldBindJSON(&inquiry); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
					return
				}
				if err := db.Create(&inquiry).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				c.JSON(http.StatusOK, inquiry)
			})

			inquiries.GET("/:id", func(c *gin.Context) {
				var inquiry models.Inquiry
				if err := db.First(&inquiry, c.Param("id")).Error; err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": "Inquiry not found"})
					return
				}
				c.JSON(http.StatusOK, inquiry)
			})

			inquiries.PUT("/:id", func(c *gin.Context) {
				var inquiry models.Inquiry
				if err := db.First(&inquiry, c.Param("id")).Error; err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": "Inquiry not found"})
					return
				}
				if err := c.ShouldBindJSON(&inquiry); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
					return
				}
				if err := db.Save(&inquiry).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				c.JSON(http.StatusOK, inquiry)
			})

			inquiries.DELETE("/:id", func(c *gin.Context) {
				if err := db.Delete(&models.Inquiry{}, c.Param("id")).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				c.JSON(http.StatusOK, gin.H{"message": "Inquiry deleted"})
			})

		}
	}
}
