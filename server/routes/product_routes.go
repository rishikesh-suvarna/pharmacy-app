package routes

import (
	"net/http"

	"pharmacy-app-server/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterProductRoutes(r *gin.Engine, db *gorm.DB) {
	api := r.Group("/api")
	{
		products := api.Group("/products")
		{
			products.GET("", func(c *gin.Context) {
				var products []models.Product
				if err := db.Find(&products).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
					return
				}
				c.JSON(http.StatusOK, products)
			})

			products.POST("", func(c *gin.Context) {
				var product models.Product
				if err := c.ShouldBindJSON(&product); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
					return
				}
				if err := db.Create(&product).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add product"})
					return
				}
				c.JSON(http.StatusCreated, product)
			})
			products.GET("/:id", func(c *gin.Context) {
				id := c.Param("id")
				var product models.Product
				if err := db.First(&product, id).Error; err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
					return
				}
				c.JSON(http.StatusOK, product)
			})

			products.PUT("/:id", func(c *gin.Context) {
				id := c.Param("id")
				var product models.Product
				if err := db.First(&product, id).Error; err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
					return
				}
				if err := c.ShouldBindJSON(&product); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
					return
				}
				if err := db.Save(&product).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
					return
				}
				c.JSON(http.StatusOK, product)
			})

			products.DELETE("/:id", func(c *gin.Context) {
				id := c.Param("id")
				if err := db.Delete(&models.Product{}, id).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
					return
				}
				c.JSON(http.StatusOK, gin.H{"message": "Product deleted"})
			})
		}
	}
}
