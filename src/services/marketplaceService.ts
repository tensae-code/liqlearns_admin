import { supabase } from '../lib/supabase';

export type PaymentMethod = 'aura_points' | 'ethiopian_birr';
export type ProductCategory = 'ebook' | 'video' | 'audio' | 'flashcards' | 'worksheet' | 'guide' | 'notes' | 'other';
export type ProductStatus = 'draft' | 'active' | 'inactive' | 'sold_out';

export interface MarketplaceProduct {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: ProductCategory;
  price: number;
  paymentMethod: PaymentMethod;
  status: ProductStatus;
  inventoryCount: number;
  downloadsAllowed: boolean;
  printable: boolean;
  shareable: boolean;
  accessExpiryDays: number;
  fileUrl: string | null;
  previewImageUrl: string | null;
  ratingAverage: number;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
  sellerName?: string;
  sellerEmail?: string;
}

export interface ProductPurchase {
  id: string;
  buyerId: string;
  productId: string;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  transactionId: string | null;
  accessExpiresAt: string | null;
  purchasedAt: string;
  isActive: boolean;
  productTitle?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  reviewerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  reviewerName?: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: MarketplaceProduct;
}

export interface AuthorProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  totalProducts: number;
  totalSales: number;
  averageRating: number;
}

class MarketplaceService {
  // Get all active products with seller information
  async getActiveProducts(filters?: {
    category?: ProductCategory;
    paymentMethod?: PaymentMethod;
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
  }): Promise<MarketplaceProduct[]> {
    try {
      let query = supabase
        .from('marketplace_products')
        .select(`
          *,
          seller:user_profiles!seller_id(full_name, email)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters?.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(product => ({
        id: product.id,
        sellerId: product.seller_id,
        title: product.title,
        description: product.description,
        category: product.category,
        price: parseFloat(product.price),
        paymentMethod: product.payment_method,
        status: product.status,
        inventoryCount: product.inventory_count,
        downloadsAllowed: product.downloads_allowed,
        printable: product.printable,
        shareable: product.shareable,
        accessExpiryDays: product.access_expiry_days,
        fileUrl: product.file_url,
        previewImageUrl: product.preview_image_url,
        ratingAverage: parseFloat(product.rating_average),
        totalSales: product.total_sales,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        sellerName: product.seller?.full_name,
        sellerEmail: product.seller?.email
      }));
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw new Error(error.message || 'Failed to load products');
    }
  }

  // Get product details with reviews
  async getProductDetails(productId: string): Promise<{
    product: MarketplaceProduct;
    reviews: ProductReview[];
  }> {
    try {
      const { data: productData, error: productError } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          seller:user_profiles!seller_id(full_name, email)
        `)
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('product_reviews')
        .select(`
          *,
          reviewer:user_profiles!reviewer_id(full_name)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      const product: MarketplaceProduct = {
        id: productData.id,
        sellerId: productData.seller_id,
        title: productData.title,
        description: productData.description,
        category: productData.category,
        price: parseFloat(productData.price),
        paymentMethod: productData.payment_method,
        status: productData.status,
        inventoryCount: productData.inventory_count,
        downloadsAllowed: productData.downloads_allowed,
        printable: productData.printable,
        shareable: productData.shareable,
        accessExpiryDays: productData.access_expiry_days,
        fileUrl: productData.file_url,
        previewImageUrl: productData.preview_image_url,
        ratingAverage: parseFloat(productData.rating_average),
        totalSales: productData.total_sales,
        createdAt: productData.created_at,
        updatedAt: productData.updated_at,
        sellerName: productData.seller?.full_name,
        sellerEmail: productData.seller?.email
      };

      const reviews: ProductReview[] = (reviewsData || []).map(review => ({
        id: review.id,
        productId: review.product_id,
        reviewerId: review.reviewer_id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        updatedAt: review.updated_at,
        reviewerName: review.reviewer?.full_name
      }));

      return { product, reviews };
    } catch (error: any) {
      console.error('Error fetching product details:', error);
      throw new Error(error.message || 'Failed to load product details');
    }
  }

  // Purchase a product
  async purchaseProduct(productId: string, paymentMethod: PaymentMethod): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get product price
      const { data: product, error: productError } = await supabase
        .from('marketplace_products')
        .select('price, inventory_count, access_expiry_days')
        .eq('id', productId)
        .single();

      if (productError) throw productError;
      if (product.inventory_count <= 0) throw new Error('Product out of stock');

      // Calculate expiry date
      const accessExpiresAt = product.access_expiry_days > 0
        ? new Date(Date.now() + product.access_expiry_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('marketplace_purchases')
        .insert({
          buyer_id: user.id,
          product_id: productId,
          payment_method: paymentMethod,
          amount_paid: product.price,
          access_expires_at: accessExpiresAt,
          transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });

      if (purchaseError) throw purchaseError;
    } catch (error: any) {
      console.error('Error purchasing product:', error);
      throw new Error(error.message || 'Failed to purchase product');
    }
  }

  // Get user's purchases
  async getUserPurchases(userId: string): Promise<ProductPurchase[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_purchases')
        .select(`
          *,
          product:marketplace_products!product_id(title)
        `)
        .eq('buyer_id', userId)
        .order('purchased_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(purchase => ({
        id: purchase.id,
        buyerId: purchase.buyer_id,
        productId: purchase.product_id,
        paymentMethod: purchase.payment_method,
        amountPaid: parseFloat(purchase.amount_paid),
        transactionId: purchase.transaction_id,
        accessExpiresAt: purchase.access_expires_at,
        purchasedAt: purchase.purchased_at,
        isActive: purchase.is_active,
        productTitle: purchase.product?.title
      }));
    } catch (error: any) {
      console.error('Error fetching purchases:', error);
      throw new Error(error.message || 'Failed to load purchases');
    }
  }

  // Create product listing
  async createProduct(productData: Omit<MarketplaceProduct, 'id' | 'sellerId' | 'ratingAverage' | 'totalSales' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('marketplace_products')
        .insert({
          seller_id: user.id,
          title: productData.title,
          description: productData.description,
          category: productData.category,
          price: productData.price,
          payment_method: productData.paymentMethod,
          status: productData.status,
          inventory_count: productData.inventoryCount,
          downloads_allowed: productData.downloadsAllowed,
          printable: productData.printable,
          shareable: productData.shareable,
          access_expiry_days: productData.accessExpiryDays,
          file_url: productData.fileUrl,
          preview_image_url: productData.previewImageUrl
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      console.error('Error creating product:', error);
      throw new Error(error.message || 'Failed to create product');
    }
  }

  // Add review
  async addReview(productId: string, rating: number, comment: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          reviewer_id: user.id,
          rating,
          comment
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error adding review:', error);
      throw new Error(error.message || 'Failed to add review');
    }
  }

  // Add item to cart
  async addToCart(productId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if already in cart
      const { data: existing } = await supabase
        .from('shopping_cart')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existing) {
        throw new Error('Item already in cart');
      }

      const { error } = await supabase
        .from('shopping_cart')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity: 1
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      throw new Error(error.message || 'Failed to add to cart');
    }
  }

  // Get user's cart items
  async getCartItems(userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from('shopping_cart')
        .select(`
          *,
          product:marketplace_products!product_id(
            *,
            seller:user_profiles!seller_id(full_name, email)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        productId: item.product_id,
        quantity: item.quantity,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        product: item.product ? {
          id: item.product.id,
          sellerId: item.product.seller_id,
          title: item.product.title,
          description: item.product.description,
          category: item.product.category,
          price: parseFloat(item.product.price),
          paymentMethod: item.product.payment_method,
          status: item.product.status,
          inventoryCount: item.product.inventory_count,
          downloadsAllowed: item.product.downloads_allowed,
          printable: item.product.printable,
          shareable: item.product.shareable,
          accessExpiryDays: item.product.access_expiry_days,
          fileUrl: item.product.file_url,
          previewImageUrl: item.product.preview_image_url,
          ratingAverage: parseFloat(item.product.rating_average),
          totalSales: item.product.total_sales,
          createdAt: item.product.created_at,
          updatedAt: item.product.updated_at,
          sellerName: item.product.seller?.full_name,
          sellerEmail: item.product.seller?.email
        } : undefined
      }));
    } catch (error: any) {
      console.error('Error fetching cart items:', error);
      throw new Error(error.message || 'Failed to load cart');
    }
  }

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      throw new Error(error.message || 'Failed to remove from cart');
    }
  }

  // Get author profile
  async getAuthorProfile(authorId: string): Promise<AuthorProfile> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, avatar_url, banner_url, bio')
        .eq('id', authorId)
        .single();

      if (profileError) throw profileError;

      // Get author's products count and stats
      const { data: products, error: productsError } = await supabase
        .from('marketplace_products')
        .select('id, total_sales, rating_average')
        .eq('seller_id', authorId)
        .eq('status', 'active');

      if (productsError) throw productsError;

      const totalProducts = products?.length || 0;
      const totalSales = products?.reduce((sum, p) => sum + p.total_sales, 0) || 0;
      const averageRating = totalProducts > 0 
        ? products.reduce((sum, p) => sum + parseFloat(p.rating_average), 0) / totalProducts 
        : 0;

      return {
        id: profile.id,
        fullName: profile.full_name || 'Unknown Author',
        email: profile.email,
        avatarUrl: profile.avatar_url,
        bannerUrl: profile.banner_url,
        bio: profile.bio,
        totalProducts,
        totalSales,
        averageRating
      };
    } catch (error: any) {
      console.error('Error fetching author profile:', error);
      throw new Error(error.message || 'Failed to load author profile');
    }
  }

  // Get author's products
  async getAuthorProducts(authorId: string): Promise<MarketplaceProduct[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          seller:user_profiles!seller_id(full_name, email)
        `)
        .eq('seller_id', authorId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(product => ({
        id: product.id,
        sellerId: product.seller_id,
        title: product.title,
        description: product.description,
        category: product.category,
        price: parseFloat(product.price),
        paymentMethod: product.payment_method,
        status: product.status,
        inventoryCount: product.inventory_count,
        downloadsAllowed: product.downloads_allowed,
        printable: product.printable,
        shareable: product.shareable,
        accessExpiryDays: product.access_expiry_days,
        fileUrl: product.file_url,
        previewImageUrl: product.preview_image_url,
        ratingAverage: parseFloat(product.rating_average),
        totalSales: product.total_sales,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        sellerName: product.seller?.full_name,
        sellerEmail: product.seller?.email
      }));
    } catch (error: any) {
      console.error('Error fetching author products:', error);
      throw new Error(error.message || 'Failed to load author products');
    }
  }
}

export const marketplaceService = new MarketplaceService();