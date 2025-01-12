package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"pharmacy-app-server/models"
	"pharmacy-app-server/routes"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL not set")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = db.AutoMigrate(&models.User{}, &models.Category{}, &models.Medicine{}, &models.Inquiry{})
	if err != nil {
		log.Fatal("failed to migrate database")
	}

	r := gin.Default()

	routes.RegisterMedicineRoutes(r, db)
	routes.RegisterUserRoutes(r, db)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	r.Run(":" + port)
}
