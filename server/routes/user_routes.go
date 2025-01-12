package routes

import (
	"net/http"

	"pharmacy-app-server/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterUserRoutes(r *gin.Engine, db *gorm.DB) {
	api := r.Group("/api")
	{
		users := api.Group("/users")
		{
			users.POST("", func(c *gin.Context) {
				var user models.User
				if err := c.ShouldBindJSON(&user); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
					return
				}
				if err := db.Create(&user).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				c.JSON(http.StatusOK, user)
			})

			users.GET("", func(c *gin.Context) {
				var users []models.User
				if err := db.Find(&users).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				c.JSON(http.StatusOK, users)
			})

			users.GET("/:id", func(c *gin.Context) {
				var user models.User
				id := c.Param("id")
				if err := db.First(&user, id).Error; err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
					return
				}
				c.JSON(http.StatusOK, user)
			})

			users.PUT("/:id", func(c *gin.Context) {
				var user models.User
				id := c.Param("id")
				if err := db.First(&user, id).Error; err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
					return
				}
				if err := c.ShouldBindJSON(&user); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
					return
				}
				if err := db.Save(&user).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				c.JSON(http.StatusOK, user)
			})

			users.DELETE("/:id", func(c *gin.Context) {
				var user models.User
				id := c.Param("id")
				if err := db.First(&user, id).Error; err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
					return
				}
				if err := db.Delete(&user).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
			})
		}
	}
}
