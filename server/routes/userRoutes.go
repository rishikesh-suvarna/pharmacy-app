package routes

import (
	"net/http"

	"pharmacy-app-server/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterUserRoutes(r *gin.Engine, db *gorm.DB) {
	userGroup := r.Group("/api/users")
	{
		userGroup.POST("/inquiries", func(c *gin.Context) {
			var inquiry models.Inquiry
			if err := c.ShouldBindJSON(&inquiry); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
				return
			}
			if err := db.Create(&inquiry).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit inquiry"})
				return
			}
			c.JSON(http.StatusCreated, inquiry)
		})
	}
}
