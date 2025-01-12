package models

import (
	"time"

	"gorm.io/gorm"
)

type Medicine struct {
	gorm.Model
	Name        string    `json:"name"`
	Category    string    `json:"category"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Stock       int       `json:"stock"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
