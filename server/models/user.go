package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name      string    `json:"name"`
	Email     string    `json:"email" gorm:"unique"`
	Role      string    `json:"role" gorm:"default:user"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
