-- Migration: Fix Invalid Product Categories
-- Purpose: Update any products with invalid category value 'books' to 'ebook'
-- Date: 2026-01-04
-- Author: System

-- Update any products with 'books' category to 'ebook'
UPDATE marketplace_products
SET category = 'ebook'::product_category
WHERE category::text = 'books';

-- Add comment for documentation
COMMENT ON TABLE marketplace_products IS 'Marketplace products table - valid categories: ebook, video, audio, flashcards, worksheet, guide, notes, other';