package models

import (
	"time"

	"gorm.io/gorm"
)

type Inquiry struct {
	gorm.Model
	Message    string    `json:"message"`
	Status     string    `json:"status" gorm:"default:pending"`
	UserID     uint      `json:"user_id"`
	MedicineID uint      `json:"medicine_id"`
	User       User      `gorm:"foreignKey:UserID"`
	Medicine   Medicine  `gorm:"foreignKey:MedicineID"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
