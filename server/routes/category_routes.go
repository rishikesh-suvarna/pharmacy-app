package routes

import (
	"net/http"

	"pharmacy-app-server/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterCategoryRoutes(r *gin.Engine, db *gorm.DB) {
	api := r.Group("/api")
	{
		categories := api.Group("/categories")
		{
			categories.GET("", func(c *gin.Context) {
				var categories []models.Category
				if err := db.Find(&categories).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				c.JSON(http.StatusOK, categories)
			})

			categories.POST("", func(c *gin.Context) {
				var category models.Category
				if err := c.ShouldBindJSON(&category); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
					return
				}
				if err := db.Create(&category).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				c.JSON(http.StatusOK, category)
			})

			categories.GET("/:id", func(c *gin.Context) {
				var category models.Category
				if err := db.First(&category, c.Param("id")).Error; err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
					return
				}
				c.JSON(http.StatusOK, category)
			})

			categories.PUT("/:id", func(c *gin.Context) {
				var category models.Category
				if err := db.First(&category, c.Param("id")).Error; err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
					return
				}
				if err := c.ShouldBindJSON(&category); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
					return
				}
				if err := db.Save(&category).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				c.JSON(http.StatusOK, category)
			})

			categories.DELETE("/:id", func(c *gin.Context) {
				if err := db.Delete(&models.Category{}, c.Param("id")).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				c.JSON(http.StatusOK, gin.H{"message": "Category deleted"})
			})
		}
	}
}
