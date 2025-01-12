package models

import (
	"time"
)

type Inquiry struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Message   string    `json:"message"`
	Status    string    `json:"status" gorm:"default:pending"`
	UserID    uint      `json:"user_id"`
	ProductID uint      `json:"medicine_id"`
	User      User      `gorm:"foreignKey:UserID"`
	Medicine  Product   `gorm:"foreignKey:ProductID"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt time.Time `json:"deleted_at,omitempty"`
}
